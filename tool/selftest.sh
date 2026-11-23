#!/usr/bin/env bash
# Prove the template works: bootstrap a copy, check for leftovers, build the site.
set -euo pipefail
cd "$(dirname "$0")/.."

work=$(mktemp -d)
trap 'rm -rf "$work"' EXIT
git ls-files -co --exclude-standard -z | xargs -0 cp --parents -t "$work"
cd "$work"

python3 -m unittest discover tool
python3 tool/bootstrap.py --name "Sample Product" --repo acme/sample-product \
  --description "Sample description." --author "Acme Inc." --site-url https://acme.github.io/sample-product/
test ! -e tool/selftest.sh
test ! -e .github/workflows/template-check.yml

leftovers=$(grep -rIlE 'Project Template|example/project-template|Example Author|rigerc/project-template' \
  --exclude-dir=node_modules --exclude-dir=dist --exclude-dir=.astro --exclude=package-lock.json . || true)
if [[ -n "$leftovers" ]]; then
  echo "Template placeholders remain in:" >&2
  echo "$leftovers" >&2
  exit 1
fi

tool/verify.sh
tool/site.sh
grep -q "Sample Product" website/dist/index.html
grep -q "https://github.com/acme/sample-product" website/dist/index.html
echo "Template self-test passed."
