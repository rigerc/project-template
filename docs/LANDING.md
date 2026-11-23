# Landing site (Astro Rocket)

The project home that ships with this template. Every project that bootstraps the template gets a
landing page in `site/`, built on [Astro Rocket](https://github.com/hansmartensdev/Astro-Rocket) 2.7.0
(MIT) and deployed alongside the Starlight docs under one GitHub Pages project site.

It is **not** a marketing page for the template. Nothing in it describes the template, and nothing in it
should need editing by hand after a project is bootstrapped: the name, description, repository and links
all come from `project.json`.

## Decisions

| Question | Decision |
| --- | --- |
| Ships with | The template. A bootstrapped copy builds a correct, neutral project home with no edits. |
| Purpose | The public face of *the adopting project*: what it is, what it looks like, what changed. |
| Identity | `project.json` only. No landing-specific name, no copy that names the template. |
| Hosting | GitHub Pages project site: landing at `/repo/`, docs at `/repo/docs/`. |
| Docs URL | Same origin, from `PUBLIC_SITE_URL=https://OWNER.github.io/REPO/docs/`; Starlight derives `base` from it, so the docs need no code change. |
| Upstream | Vendored copy of the `2.7.0` tag. No submodule, no subtree. Edits confined to config plus the documented patch list. |
| Routes | `/` is the only project page. No `/projects` index, no blog, no about, no services, no contact, no API routes. |
| Changelog | Last five releases on the landing site, full history on the docs site. `CHANGELOG.md` stays the only source. |
| Screenshots | Captured from the docs site by `tool/media.sh`, plus any supplied hero shots. Promoted into `site/src/assets/showcase/`. |
| Base paths | Patch the theme's central helpers once, then assert no unprefixed root links survive a build. |
| Theme chrome | Keep 3-state dark mode. Remove colour selector, cursor trail, Pagefind search, i18n. |
| CI | Lighthouse budget on the one page, link check across both trees, base-path and branding asserts. |

## What ships

Landing (`site/dist/`, served at `/repo/`):

```
/repo/                    one project: hero, gallery, facts, stack, CTA to the docs
/repo/changelog/          last five releases, link to the full history
/repo/404.html            also serves docs 404s, because Pages has one 404 page
/repo/robots.txt
/repo/sitemap-index.xml
```

Docs (`website/dist/`, copied to `site/dist/docs/`, served at `/repo/docs/`): unchanged Starlight pages,
including the full changelog.

Deployable paths that will not exist: `/repo/projects`, `/repo/blog`, `/repo/about`, `/repo/services`,
`/repo/contact`, `/repo/api/*`, `/repo/rss.xml`, `/repo/pagefind`.

## Ships with the template

This is the part that differs from an ordinary site build, and the reason several phases exist.

**Nothing is filled in by hand.** `site/src/config/project.ts` reads `../../../project.json` and feeds
`branding.ts`, `site.config.ts` and `landing.ts`. `tool/bootstrap.py` already rewrites `project.json` and
needs no change; a bootstrapped copy therefore renders the new name, description and repository without a
single edit under `site/`.

**Nothing names the template.** The theme arrives with its own demo copy — "Astro Rocket", its author's
name and links, sample posts and projects. All of it goes. User-facing strings live in two places only:
`site/src/config/landing.ts` (hero, section headings, CTA text) and `site/src/i18n/en.json` (UI strings).
The hero says what the project is, using `project.json` values, not a hardcoded claim.

**Two asserts keep it honest**, both in `tool/site.sh` and CI:

- `tool/basecheck.mjs` — no root-absolute URL may miss `/repo/`.
- `tool/brandcheck.mjs` — the built landing HTML may contain neither the template placeholders
  (`Project Template`, `example/project-template`) nor the theme's upstream branding (`Astro Rocket`,
  `astrorocket.dev`, `hansmartens`). A stray demo heading fails the build.

`tool/selftest.sh` gains the matching positive check: after bootstrapping a copy as *Sample Product*, it
asserts `site/dist/index.html` contains "Sample Product" — the same check it already makes against the
docs page.

## File map

```
site/                                  vendored Astro Rocket, self-contained
├── astro.config.mjs                   base/site wiring, integrations pruned
├── src/config/project.ts              reads ../../../project.json — the identity source
├── src/config/branding.ts             SITE_NAME, THEME_COLOR from project.ts
├── src/config/site.config.ts          name, description, url, author, socials, toggles
├── src/config/nav.config.ts           one nav item: Docs
├── src/config/landing.ts              new: every sentence the landing page says
├── src/lib/base.ts                    withBase() — the single base-path helper
├── src/content/projects/product.mdx   the only project entry
├── src/content/pages/changelog.mdx    generated, do not edit by hand
├── src/content/stack/*.mdx            Astro, Tailwind, TypeScript, Playwright
├── src/assets/showcase/*.png          promoted captures
└── UPSTREAM.md                        tag, commit, upgrade steps, patch list
tool/basecheck.mjs                     no root-absolute URL may miss /repo/
tool/brandcheck.mjs                    no template placeholders or upstream branding in the output
tool/media/capture.mjs                 gains --dist/--base/--out for a second site
tool/site.sh                           builds docs, builds landing, merges, asserts
```

Removed from the vendored copy: `src/pages/{about,services,contact,components}.astro`, `src/pages/blog/`,
`src/pages/projects/`, `src/pages/api/`, `src/pages/rss.xml.ts`, `src/pages/[locale]/`,
`src/content/{blog,authors,faqs}`, `src/i18n/nl.json`, and the theme's own `Dockerfile`, `compose.yml`,
`netlify.toml`, `vercel.json`, `wrangler.toml`, `AGENTS.md`, `.github/`.

`src/content/pages/` and `src/content/stack/` stay — the first carries the changelog, the second renders
"built with" on the project page.

## Base-path work

The theme assumes a root domain. `base: '/repo/'` is set in `site/astro.config.mjs`, and every absolute
path must go through `withBase()`.

| Area | Files | Notes |
| --- | --- | --- |
| Config | `astro.config.mjs` | `site` and `base` from `PUBLIC_SITE_URL`; drop the Vercel adapter, the Pagefind hook and its dependency |
| Paths | `src/config/site-url.ts`, `src/config/site.config.ts` | `ogImage`, favicon and logo paths base-prefixed |
| Links | `src/config/nav.config.ts`, `src/components/layout/*` | `localizedPath` is i18n-only; nav, footer, logo and CTA use `withBase()` |
| SEO | `src/components/seo/SEO.astro`, `JsonLd.astro`, `Breadcrumbs.astro` | canonical, `og:url`, `og:image`, breadcrumb URLs |
| Generated files | `src/pages/robots.txt.ts`, `manifest.webmanifest.ts`, `llms.txt.ts` | sitemap URL, `start_url`/`scope`, or delete `llms.txt` |
| Build hooks | `faviconAssets`, `ogCards` | they write into `dist/` already; only the HTML references need the prefix |
| Images | `src/lib/gallery.ts`, `src/lib/projects.ts` | Astro's `image()` output is base-prefixed; verify one gallery slide in the built HTML |
| Sitemap | `@astrojs/sitemap` | confirm emitted URLs carry `/repo/`; if not, fix in config, not in output |

`tool/basecheck.mjs` scans `site/dist/**/*.html` (and `*.css` for `url(/`) and fails on any root-absolute
reference that does not start with the base, allowing `//`, `http(s):`, `mailto:`, `tel:` and `#`.

## Build and deploy

One artifact, one Pages deployment.

```bash
export PUBLIC_SITE_URL="https://OWNER.github.io/REPO/"
docs="${PUBLIC_SITE_URL%/}/docs/"

(cd website && npm ci && PUBLIC_SITE_URL="$docs" npm run build)
(cd site && corepack pnpm install --frozen-lockfile && SITE_URL="${PUBLIC_SITE_URL%/}" PUBLIC_DOCS_URL="$docs" pnpm build)

rm -rf site/dist/docs && cp -a website/dist site/dist/docs
node tool/basecheck.mjs site/dist
node tool/brandcheck.mjs site/dist
```

`tool/site.sh` wraps exactly this and then asserts that `site/dist/index.html`,
`site/dist/changelog/index.html`, `site/dist/docs/index.html` and
`site/dist/docs/changelog/index.html` are non-empty. `.github/workflows/website.yml` uploads `site/dist/`
as the Pages artifact instead of `website/dist/`; the preview artifact gets both trees.

The docs build is the only place `PUBLIC_SITE_URL` carries `/docs/` — that is how Starlight learns its
`base`, and it is why `website/astro.config.mjs` needs no edit.

## Content pipeline

**Project page.** `src/content/projects/product.mdx` is the only entry and uses the theme's own schema:
`gallery` for the screenshots, `icon`, `tags`, `meta` for the facts line, `order: 1`, `locale: en`. The
`gallery` slides use `image()` imports from `src/assets/showcase/`, so files must be committed — Astro
cannot process images from `build/media/` at deploy time. `tool/media.sh promote` copies the chosen
captures in. Its title and description interpolate `project.json` values through the frontmatter loader
during Phase 4, so a renamed project does not leave a stale headline behind.

**Neutral copy.** `src/config/landing.ts` holds the hero heading, subheading, section labels and CTA text
as a typed object, most of it functions of `project.json` (`name`, `description`). A downstream project
that wants different words edits one file; nothing else on the page contains prose.

**Changelog.** Extend `website/scripts/sync-changelog.mjs` to write a second file. It already strips the
`# Title` line; the extension keeps `## Unreleased` when present, takes the first five `##` sections, and
emits frontmatter (`title`, `description`, `updatedAt`, `locale: en`) plus a closing link to
`/docs/changelog/`. Deterministic output, so CI diffs stay meaningful and the docs page remains the full
history.

**Stack.** Four seed entries (Astro, Tailwind CSS, TypeScript, Playwright) rendered as the "built with"
strip. They describe the toolchain, not the template, so they survive a rename unchanged.

**Toggles.** `newsletter.enabled: false` (the Resend routes are deleted), comments off, `cursorTrail: false`,
colour selector removed from the header, `articleFeatures` removed with the blog.

## Upstream policy

`site/UPSTREAM.md` records the tag, the commit SHA, the exact command used to vendor it, and the patch list
above as `diff -ru` targets. Upgrading is a deliberate PR: re-vendor into a scratch directory, diff against
`site/`, re-apply each patch, run `pnpm validate`, `tool/basecheck.mjs` and `tool/brandcheck.mjs`, update
the SHA. No automatic version bumps for `/site`.

Attribution is part of the licence: keep `site/LICENSE` (Astro Rocket, MIT) and add `site/NOTICE.md` naming
Hans Martens and the theme's own upstream, Velocity by Southwell Media. `NOTICE.md` is a repository file,
not a page — the branding check keeps it out of the built HTML while the licence stays intact.

## Tooling and CI changes

| File | Change |
| --- | --- |
| `tool/site.sh` | Build both trees, merge, assert markers, run `basecheck` and `brandcheck` |
| `tool/basecheck.mjs` | New; root-absolute URL check |
| `tool/brandcheck.mjs` | New; no template placeholders or upstream branding in the output |
| `tool/media/capture.mjs` | Accept dist directory, base and output directory; capture landing at `/repo/` |
| `tool/media.sh` | `promote` mode: copy captures into `site/src/assets/showcase/` |
| `tool/selftest.sh` | Build the landing site; assert the bootstrapped name appears at `/` |
| `.github/workflows/website.yml` | Add `site/**` to `paths`; two install steps (`npm` and `pnpm`); upload `site/dist/`; Lighthouse and link-check jobs |
| `.github/workflows/media.yml` | Capture both sites |
| `.github/dependabot.yml` | Add npm ecosystem for `/site` (Dependabot reads `pnpm-lock.yaml`) |
| `.gitignore` | `site/node_modules/`, `site/dist/`, `site/.astro/`, `site/.env`, `site/src/content/pages/changelog.mdx` |
| `website/scripts/sync-changelog.mjs` | Emit the landing changelog page as well |
| `README.md`, `docs/MEDIA.md` | Two sites, two commands, new capture paths |

`site/package.json` keeps `packageManager: pnpm@10.33.0` and `engines.node >= 22.23.4`; `site/.nvmrc` says
`24` to match `website/.nvmrc`. CI installs pnpm with a SHA-pinned `pnpm/action-setup`, consistent with the
rest of the repo, and caches `site/pnpm-lock.yaml` separately from the npm cache.

## Phases

| # | Work | Exit criteria | Size |
| --- | --- | --- | --- |
| 0 | Confirm Pages settings, repo slug, and that no custom domain is in play | `PUBLIC_SITE_URL` value agreed and written in `docs/LANDING.md` | XS |
| 1 | Vendor the `2.7.0` tag into `site/`, strip standalone-repo files, write `UPSTREAM.md` | `pnpm install --frozen-lockfile && pnpm validate` passes untouched | S |
| 2 | Delete routes and collections listed above; prune deps; strip upstream demo content | `pnpm build` produces only `/`, `/changelog/` and 404; no upstream names in `src/` | M |
| 3 | Base paths: `withBase()`, config, SEO, generated files; add `tool/basecheck.mjs` | `basecheck` passes against a `/repo/` build; no unprefixed links | L |
| 4 | Content: `landing.ts`, project MDX from `project.json`, changelog sync extension, stack seeds, promoted screenshots | `/` renders name and description from `project.json`; `/changelog/` shows five releases and links to docs | M |
| 5 | Identity: `project.ts`, branding, nav, SEO, site config read `project.json` | Changing `project.json` changes both sites; no copied values | S |
| 6 | Template integration: `tool/site.sh`, `brandcheck`, workflows, Dependabot, gitignore, selftest, media | A bootstrapped copy builds a landing page naming the new project; CI green | M |
| 7 | Gates and docs: Lighthouse, link check, README, CHANGELOG entry, licence files | Acceptance list below is all true | S |

Phase 3 is the only genuinely uncertain one; everything else is mechanical once the vendored copy builds.

## Risks

| Risk | Mitigation |
| --- | --- |
| A missed base path ships a 404 | `tool/basecheck.mjs` fails the build |
| The landing page drifts into template marketing | `brandcheck` plus the rule that all prose lives in `landing.ts` |
| Upstream demo copy survives | Phase 2 strips it; `brandcheck` catches a relapse |
| Upstream drifts and the patch list rots | Tag-pinned copy, `UPSTREAM.md`, patches confined to config and deletions |
| Docs move breaks existing links | `base` comes from one variable; the link check runs across both trees |
| Screenshots go stale after a docs redesign | Release checklist step in `docs/RELEASING.md`; captures are reproducible |
| One 404 page for two sites | Landing 404 links to `/repo/docs/`; accepted, not worth a function |
| Lighthouse drops after base patching | Budget 95+ on the one page; measure in phase 7, not at the end |

## Acceptance

- `tool/site.sh` builds both trees, merges them and passes `basecheck` and `brandcheck` in one command.
- `site/dist/` serves the landing page at `/repo/` and the docs at `/repo/docs/` from a single artifact.
- A project bootstrapped with `tool/bootstrap.py --name "Sample Product"` renders "Sample Product" at `/`
  and contains no reference to the template or the theme's author.
- Every nav, footer, CTA and gallery link resolves; zero 404s in the link check.
- Lighthouse at `/repo/` is 95+ on all four categories.
- `CHANGELOG.md` remains the only changelog source; the docs page is the full history, the landing page the last five.
- `site/LICENSE` and `site/NOTICE.md` present; the theme's upstream credit is intact and out of the HTML.
- `tool/selftest.sh` passes on a freshly bootstrapped copy of the template.
- `site/UPSTREAM.md` names the exact commit, and `diff` against a fresh vendor shows only documented patches.

## Deferred

- **Custom domain.** Set `PUBLIC_SITE_URL=https://domain/`, change `base` to `/`, docs move to `/docs/`.
  One variable plus one config line; the patch list already routes everything through `withBase()`, which
  returns the path unchanged when `base` is `/`.
- **A template showcase.** If the template ever needs a page advertising itself or listing projects built
  on it, that is a separate site. This one belongs to the adopting project.
- **Blog, search, i18n, newsletter, comments, contact form.** Each needs either a server or content that
  does not exist yet.
