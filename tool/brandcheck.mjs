#!/usr/bin/env node
/**
 * Fail a build that still names the template or the theme it came from.
 *
 * This landing site ships *inside* the template, so its output goes to every
 * project that adopts it. A downstream copy that still says "Project Template"
 * or "Astro Rocket" in its footer is a copy that looks unfinished — and the
 * build succeeds either way, because those are just strings.
 *
 * The project's own identity is read from `project.json`. A placeholder is only
 * forbidden when it is *not* the identity this copy was given, which is why the
 * same check runs correctly both in the template repository and after
 * bootstrap.
 *
 * Usage:
 *   node tool/brandcheck.mjs [dir] [--project path/to/project.json]
 */
import { readFileSync } from 'node:fs';
import { readdir, readFile } from 'node:fs/promises';
import { extname, join, resolve } from 'node:path';

const TEXT_EXTENSIONS = new Set([
  '.html', '.css', '.js', '.mjs', '.json', '.xml', '.txt', '.webmanifest', '.svg',
]);

/** Names that belong to the template or the upstream theme, never to a project. */
const ALWAYS_FORBIDDEN = [
  'Astro Rocket',
  'astro-rocket',
  'hansmartens',
  'Hans Martens',
  'Southwell Media',
];

/** Placeholders `tool/bootstrap.py` is expected to have replaced. */
const PLACEHOLDERS = ['Project Template', 'example/project-template', 'Example Author'];

function parseArgs(argv) {
  const options = { dir: 'site/dist', project: 'project.json' };
  const positional = [];
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--project') options.project = argv[++i];
    else if (arg.startsWith('--project=')) options.project = arg.slice('--project='.length);
    else positional.push(arg);
  }
  if (positional[0]) options.dir = positional[0];
  return options;
}

async function* walk(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) yield* walk(path);
    else if (TEXT_EXTENSIONS.has(extname(entry.name))) yield path;
  }
}

const options = parseArgs(process.argv.slice(2));
const dir = resolve(options.dir);

let project = {};
try {
  project = JSON.parse(readFileSync(resolve(options.project), 'utf8'));
} catch (error) {
  console.error(`brandcheck: cannot read ${options.project}: ${error.message}`);
  process.exit(1);
}

const identity = [project.name, project.repo, project.author, project.siteUrl]
  .filter(Boolean)
  .join('\n')
  .toLowerCase();

// A placeholder that this copy has adopted as its own name is not a leftover.
const forbidden = [...ALWAYS_FORBIDDEN, ...PLACEHOLDERS].filter(
  (value) => !identity.includes(value.toLowerCase()),
);

const failures = [];
for await (const file of walk(dir)) {
  const text = (await readFile(file, 'utf8')).toLowerCase();
  for (const value of forbidden) {
    if (text.includes(value.toLowerCase())) failures.push(`${file}: "${value}"`);
  }
}

const indexFile = join(dir, 'index.html');
if (project.name) {
  const index = readFileSync(indexFile, 'utf8');
  if (!index.includes(project.name)) {
    failures.push(`${indexFile}: does not name the project ("${project.name}")`);
  }
}

if (failures.length) {
  console.error(`brandcheck: ${failures.length} branding problem(s) in ${dir}`);
  for (const failure of failures.slice(0, 50)) console.error(`  ${failure}`);
  if (failures.length > 50) console.error(`  … ${failures.length - 50} more`);
  process.exit(1);
}

console.log(`brandcheck: output names ${project.name} and no template or theme strings.`);
