#!/usr/bin/env bash
# Run the project's own checks. Add your stack here or provide a `make check`.
set -euo pipefail
cd "$(dirname "$0")/.."

if [[ -f Makefile ]] && grep -q '^check:' Makefile; then
  make check
elif [[ -f package.json ]]; then
  npm ci --no-audit --no-fund
  npm test --if-present
elif [[ -f Cargo.toml ]]; then
  cargo test --locked
elif [[ -f go.mod ]]; then
  go test ./...
elif [[ -f pyproject.toml ]]; then
  python3 -m pytest
else
  echo "No project checks found. Add a Makefile 'check' target or edit tool/verify.sh."
fi

python3 -I tool/release.py check
