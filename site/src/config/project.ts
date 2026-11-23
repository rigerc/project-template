/**
 * Project identity.
 *
 * `project.json` at the repository root is the single source of a project's
 * name, description, repository and site URL. The docs site already reads it
 * (`website/astro.config.mjs`); this module is how the landing site reads the
 * same file, so `tool/bootstrap.py` needs no knowledge of `site/` and a
 * bootstrapped copy is correct without edits.
 *
 * Read with `node:fs` rather than an import: `project.json` lives outside this
 * Astro project's root, and a bundler import from outside the root is exactly
 * the kind of thing that works in `astro build` and fails in `astro dev`.
 * Nothing under `src/components` that ships to the browser imports this file.
 */
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';

export interface Project {
  name: string;
  description: string;
  repo: string;
  license: string;
  author: string;
  siteUrl: string;
}

/**
 * Walk up from the working directory until `project.json` is found.
 *
 * Not `new URL('../../../project.json', import.meta.url)`: once Astro bundles
 * this module for prerendering, `import.meta.url` points at a chunk inside
 * `dist/.prerender/`, and the relative path resolves to nothing. The build
 * always runs with `site/` as its working directory, and the walk tolerates
 * being run from anywhere inside the repository.
 */
function findProjectFile(): string {
  let directory = resolve(process.cwd());
  for (let depth = 0; depth < 6; depth += 1) {
    const candidate = join(directory, 'project.json');
    if (existsSync(candidate)) return candidate;
    const parent = dirname(directory);
    if (parent === directory) break;
    directory = parent;
  }
  throw new Error(
    `project.json not found above ${process.cwd()}. It is the source of this site's name and description; run the build from the repository.`,
  );
}

export const project = JSON.parse(readFileSync(findProjectFile(), 'utf8')) as Project;

/** `https://github.com/owner/name`, from the `repo` field. */
export const repoUrl = `https://github.com/${project.repo}`;

/** Display name, falling back to something printable rather than empty. */
export const projectName = project.name.trim() || 'Untitled project';

/** One-line description, with a neutral fallback. */
export const projectDescription = project.description.trim() || `${projectName} — documentation and release notes.`;
