# Agent notes

This project started from a generic template: a Starlight site in `website/`,
release tooling in `tool/`, and workflows in `.github/workflows/`.

## Commands

```bash
tool/verify.sh                       # project checks and release metadata
python3 -m unittest discover tool    # tests for the release and bootstrap tools
tool/site.sh                         # build the site into website/dist
tool/release.py prepare X.Y.Z        # stamp the changelog and bump VERSION
tool/media.sh                        # screenshots and video of the built site
```

## Conventions

- `project.json` is the single source of project identity. Read it; do not copy its values.
- Pin GitHub Actions to full commit SHAs with a version comment.
- Every release adds a `CHANGELOG.md` entry written in plain user-facing sentences.
- Never pass Markdown or non-code files to formatters.

## Lessons

Record agent mistakes in `AGENTS_LEARNING.md`. Append only; never rewrite past entries.
