/**
 * Links that point outside this site's own routes.
 *
 * The docs are a second Astro build (see `website/`) published under
 * `/docs/` on the same origin, so the landing site only needs their URL.
 * `PUBLIC_DOCS_URL` overrides it; the default is the same-origin path, which
 * `withBase()` turns into `/repo/docs/` on a GitHub Pages project site.
 */
import { withBase } from '@/lib/base';

const configured = (import.meta.env.PUBLIC_DOCS_URL ?? '').trim();

export const DOCS_ROOT = configured.length > 0 ? configured : '/docs/';

/** Build a URL inside the docs site. `docsUrl('changelog/')` → `/repo/docs/changelog/`. */
export function docsUrl(path = ''): string {
  const root = DOCS_ROOT.endsWith('/') ? DOCS_ROOT : `${DOCS_ROOT}/`;
  const suffix = path.replace(/^\/+/, '');
  const url = suffix ? `${root}${suffix}` : root;
  return /^(https?:)?\/\//.test(url) ? url : withBase(url);
}

export const docsLink = docsUrl();
export const docsChangelogLink = docsUrl('changelog/');
