# Screenshots and video

`tool/media.sh [all|screenshots|video]` builds screenshots and a short tour video of the
site in `website/dist` and writes them to `build/media`. Run `tool/site.sh` first.

- It uses Playwright with a headless Chromium, installed on demand.
- Light and dark desktop screenshots, a mobile screenshot, and a `tour.webm` come out.
  If `ffmpeg` is installed it also writes `tour.mp4`.
- In CI, run the **Media** workflow from the Actions tab. It uploads `site-media` as an artifact.
  The workflow installs `ffmpeg` with `apt-get` because it runs on an Ubuntu runner; nothing
  local depends on that.
- Local prerequisites: Node 24+ and the Chromium that `tool/media.sh` installs. `ffmpeg` is
  optional and only adds `tour.mp4`: `sudo pacman -S ffmpeg` on Arch,
  `sudo apt install ffmpeg` on Debian/Ubuntu, `brew install ffmpeg` on macOS.
  Playwright warns that Arch is not officially supported, then uses its bundled Chromium,
  which works.
- Edit `tool/media/capture.mjs` to capture the pages and flows your project cares about.
- For a CLI, edit `tool/media/demo.tape` and run it with
  [vhs](https://github.com/charmbracelet/vhs).

Copy the files you want to publish into `website/public/` and reference them from the docs.
