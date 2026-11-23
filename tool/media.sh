#!/usr/bin/env bash
# Capture screenshots and a tour video of the built site into build/media.
# Usage: tool/media.sh [all|screenshots|video]
set -euo pipefail
cd "$(dirname "$0")/media"
npm ci --no-audit --no-fund
npx playwright install chromium
node capture.mjs "${1:-all}"
if command -v ffmpeg >/dev/null && [[ -f ../../build/media/tour.webm ]]; then
  ffmpeg -hide_banner -loglevel error -y -i ../../build/media/tour.webm \
    -c:v libx264 -crf 24 -pix_fmt yuv420p -movflags +faststart -an ../../build/media/tour.mp4
fi
