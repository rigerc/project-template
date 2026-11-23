/**
 * Base path handling.
 *
 * The site can be served from a subpath — a GitHub Pages project site lives at
 * `/repo/` — and the theme was written for a domain root. Every absolute path
 * it emits has to pass through `withBase()`.
 *
 * `withBase` is idempotent: a path that already carries the base is returned
 * unchanged, so a helper that receives an already-prefixed URL cannot produce
 * `/repo/repo/...`. `tool/basecheck.mjs` asserts the same property across the
 * built output.
 */

/** Astro's `BASE_URL`, without the trailing slash: `''` at the root, `/repo` otherwise. */
export const BASE_PATH = normalize(import.meta.env.BASE_URL ?? '/');

function normalize(base: string): string {
  if (!base || base === '/') return '';
  const trimmed = base.endsWith('/') ? base.slice(0, -1) : base;
  return trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
}

/** Prefix a site-absolute path with the base. Relative, external and anchor paths pass through. */
export function withBase(path: string): string {
  if (!BASE_PATH) return path;
  if (!path.startsWith('/') || path.startsWith('//')) return path;
  if (path === BASE_PATH || path.startsWith(`${BASE_PATH}/`)) return path;
  return path === '/' ? `${BASE_PATH}/` : `${BASE_PATH}${path}`;
}

/** Remove the base from a path, for code that reasons about routes rather than URLs. */
export function stripBase(path: string): string {
  if (!BASE_PATH || !path.startsWith(BASE_PATH)) return path;
  const rest = path.slice(BASE_PATH.length);
  return rest.length === 0 ? '/' : rest;
}
