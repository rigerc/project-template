#!/usr/bin/env node
/**
 * Fail a build whose output links to the wrong root.
 *
 * The landing site and the docs both live under a base path on a GitHub Pages
 * project site (`/repo/` and `/repo/docs/`). Astro rewrites the routes it owns,
 * but not every string this theme builds by hand: a nav href, a favicon path, a
 * URL inside a stylesheet. A missed one is a 404 that only appears after
 * deploy.
 *
 * Usage:
 *   node tool/basecheck.mjs [dir] [--base https://owner.github.io/repo/]
 *
 * `--base` defaults to `PUBLIC_SITE_URL`, then to `siteUrl` in `project.json`.
 * With no base at all — a domain-root deploy — there is nothing to check.
 */
import { readFileSync } from 'node:fs';
import { readdir, readFile } from 'node:fs/promises';
import { extname, join, resolve } from 'node:path';

const TEXT_EXTENSIONS = new Set([
  '.html', '.css', '.js', '.mjs', '.json', '.xml', '.txt', '.webmanifest', '.svg',
]);

function parseArgs(argv) {
  const options = { dir: 'site/dist', base: undefined };
  const positional = [];
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--base') options.base = argv[++i];
    else if (arg.startsWith('--base=')) options.base = arg.slice('--base='.length);
    else positional.push(arg);
  }
  if (positional[0]) options.dir = positional[0];
  return options;
}

function normalizeBase(input) {
  if (!input) return '/';
  let path;
  try {
    path = input.startsWith('http') ? new URL(input).pathname : input;
  } catch {
    return '/';
  }
  if (!path.startsWith('/')) path = `/${path}`;
  return path.endsWith('/') ? path : `${path}/`;
}

function baseFromProject(root) {
  try {
    return JSON.parse(readFileSync(join(root, 'project.json'), 'utf8')).siteUrl || '';
  } catch {
    return '';
  }
}

async function* walk(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) yield* walk(path);
    else if (TEXT_EXTENSIONS.has(extname(entry.name))) yield path;
  }
}

/** Root-absolute references in one file, with duplicates removed. */
function references(text) {
  const found = new Set();
  const add = (value) => {
    const trimmed = value.trim();
    if (trimmed.startsWith('/')) found.add(trimmed);
  };

  for (const match of text.matchAll(/\b(?:href|src|poster|action|data-src|data-href|content)="([^"]*)"/g)) {
    add(match[1]);
  }
  for (const match of text.matchAll(/\bsrcset="([^"]*)"/g)) {
    for (const part of match[1].split(',')) add(part.trim().split(/\s+/)[0]);
  }
  for (const match of text.matchAll(/url\(\s*(['"]?)([^'")]+)\1\s*\)/g)) {
    add(match[2]);
  }
  if (!text.includes('<')) {
    // JSON and manifests: `"src": "/pwa-192x192.png"`.
    for (const match of text.matchAll(/"(\/[^"]*)"/g)) add(match[1]);
  }
  return found;
}

function allowed(url, base) {
  if (url.startsWith('//')) return true;
  if (base === '/') return true;
  const withoutSlash = base.slice(0, -1);
  return url === withoutSlash || url.startsWith(base);
}

const options = parseArgs(process.argv.slice(2));
const dir = resolve(options.dir);
const base = normalizeBase(
  options.base ?? process.env.PUBLIC_SITE_URL ?? baseFromProject(resolve(dir, '..', '..')),
);

if (base === '/') {
  console.log('basecheck: no base path, nothing to check.');
  process.exit(0);
}

const failures = [];
for await (const file of walk(dir)) {
  const text = await readFile(file, 'utf8');
  for (const url of references(text)) {
    if (!allowed(url, base)) failures.push(`${file}: ${url}`);
  }
}

if (failures.length) {
  console.error(`basecheck: ${failures.length} reference(s) miss the base path ${base}`);
  for (const failure of failures.slice(0, 50)) console.error(`  ${failure}`);
  if (failures.length > 50) console.error(`  … ${failures.length - 50} more`);
  process.exit(1);
}

console.log(`basecheck: every root-absolute reference carries ${base}`);
