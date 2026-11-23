# Upstream

This directory is a vendored, modified copy of [Astro Rocket](https://github.com/hansmartensdev/Astro-Rocket).

- **Upstream tag:** `v2.7.0`
- **Upstream commit:** `16181f80416d24f094e9a80524ec047b9e6f68a6`
- **Vendored on:** 2026-05-23
- **Command:**

```bash
git clone --depth 1 --branch v2.7.0 https://github.com/hansmartensdev/Astro-Rocket /tmp/astro-rocket
rsync -a --exclude .git --exclude .github \
  --exclude Dockerfile --exclude compose.yml --exclude .dockerignore \
  --exclude netlify.toml --exclude vercel.json --exclude wrangler.toml \
  --exclude nginx.conf --exclude AGENTS.md --exclude README.md \
  --exclude CHANGELOG.md --exclude SECURITY.md --exclude .nvmrc --exclude .gitignore \
  /tmp/astro-rocket/ site/
```

## Local patches

The copy is adapted to be template infrastructure for projects that adopt this
repository, not a standalone Astro Rocket site.

- **Identity/config:** `src/config/project.ts` reads `project.json`; `src/config/landing.ts` holds all landing copy; `branding.ts` and `site.config.ts` derive identity from `project.json`.
- **Base paths:** `PUBLIC_SITE_URL` drives Astro `site` and `base`; `src/lib/base.ts` provides idempotent `withBase/stripBase`; nav, SEO, manifest, robots, generated assets and OG paths are base-aware.
- **Routes/content:** removed blog, projects index, about, services, contact, API routes, RSS, LLMs, i18n locale routes, demo content. Kept one project page (`/`), `/changelog/`, and `/404`.
- **Features removed:** Pagefind, theme selector, language switcher, newsletter/comment wiring, cursor trail, adapter-specific deploy files.
- **Build hooks:** favicon and OG hooks import sharp/font modules statically; OG hook strips base before writing card files.
- **Checks:** `tool/basecheck.mjs`, `tool/brandcheck.mjs`, `tool/linkcheck.mjs`; `tool/site.sh` builds docs + landing and merges into one Pages artifact.
- **Content pipeline:** `website/scripts/sync-changelog.mjs` emits the landing changelog from `CHANGELOG.md`.

## Upgrading

1. Re-vendor the upstream tag into a scratch directory.
2. Diff against `site/` and re-apply the local patches above.
3. Run `cd site && pnpm validate`.
4. Run `PUBLIC_SITE_URL=https://example.github.io/repo/ tool/site.sh`.
5. Update this file with the new tag, commit SHA, date, and patch notes.
