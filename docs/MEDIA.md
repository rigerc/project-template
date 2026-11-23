# Screenshots and video

`tool/media.sh [all|screenshots|video]` builds screenshots and a short tour video of the
site in `website/dist` and writes them to `build/media`. Run `tool/site.sh` first.

- It uses Playwright with a headless Chromium, installed on demand.
- Light and dark desktop screenshots, a mobile screenshot, and a `tour.webm` come out.
  If `ffmpeg` is installed it also writes `tour.mp4`.
- In CI, run the **Media** workflow from the Actions tab. It uploads `site-media` as an artifact.
- Edit `tool/media/capture.mjs` to capture the pages and flows your project cares about.
- For a CLI, edit `tool/media/demo.tape` and run it with
  [vhs](https://github.com/charmbracelet/vhs).

Copy the files you want to publish into `website/public/` and reference them from the docs.
