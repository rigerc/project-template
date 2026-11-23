#!/usr/bin/env bash
# Build the documentation site into website/dist.
set -euo pipefail
cd "$(dirname "$0")/../website"
npm ci --no-audit --no-fund
npm run build
for file in index.html changelog/index.html privacy/index.html support/index.html pagefind/pagefind.js; do
  test -s "dist/$file"
done
