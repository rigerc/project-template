#!/usr/bin/env bash
# Build the documentation and landing sites.
#
# The docs (Starlight, `website/`) are published under `/docs/` and the landing
# site (Astro, `site/`) at the root of the same GitHub Pages project site. One
# artifact, one deployment: the docs build is copied into `site/dist/docs/`.
set -euo pipefail
cd "$(dirname "$0")/.."

repo_root="$PWD"
site_url="${PUBLIC_SITE_URL:-}"
if [[ -z "$site_url" ]]; then
  site_url=$(node -e "try{process.stdout.write(JSON.parse(require('fs').readFileSync('project.json','utf8')).siteUrl||'')}catch{}")
fi

docs_url="${site_url%/}/docs/"
if [[ -z "$site_url" ]]; then
  docs_url=""
fi

# Docs (npm) ---------------------------------------------------------------
(
  cd website
  npm ci --no-audit --no-fund
  PUBLIC_REPOSITORY="${PUBLIC_REPOSITORY:-$(node -e "process.stdout.write(JSON.parse(require('fs').readFileSync('../project.json','utf8')).repo||'')" )}" \
  PUBLIC_SITE_URL="$docs_url" \
  npm run build
)

for file in index.html changelog/index.html privacy/index.html support/index.html pagefind/pagefind.js; do
  test -s "website/dist/$file"
done

# Landing (pnpm) -----------------------------------------------------------
(
  cd site
  pnpm install --frozen-lockfile
  PUBLIC_SITE_URL="$site_url" \
  PUBLIC_DOCS_URL="$docs_url" \
  pnpm build
)

rm -rf site/dist/docs
cp -a website/dist site/dist/docs

for file in index.html changelog/index.html docs/index.html docs/changelog/index.html docs/pagefind/pagefind.js; do
  test -s "site/dist/$file"
done

node tool/basecheck.mjs site/dist --base "$site_url"
node tool/brandcheck.mjs site/dist --project project.json
node tool/linkcheck.mjs site/dist --base="$site_url"

echo "Built landing site and docs into site/dist/"
