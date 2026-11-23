# Project Template

A language-agnostic starting point for a project that needs a documentation
site, CI, and an automated release flow. It contains no application code, so
it fits a library, CLI, service, or anything else.

## What you get

- **Site:** an [Astro Starlight](https://starlight.astro.build) documentation site in `website/`
  with search, dark mode, and a changelog page generated from `CHANGELOG.md`.
- **CI:** a `tool/verify.sh` dispatcher that runs your `make check`, `npm test`, `cargo test`,
  `go test`, or `pytest`, plus tests for the release tooling.
- **Releases:** `tool/release.py prepare` stamps the changelog; pushing a `vX.Y.Z` tag creates a
  GitHub release with notes from the changelog, optional artifacts, and optional build provenance.
- **Media:** `tool/media.sh` captures screenshots and a tour video of the site, locally or in CI.
- **Hygiene:** Dependabot, CodeQL, issue and pull request templates, a security policy,
  `.editorconfig`, and pinned action versions.

## Use it

1. Click **Use this template** on GitHub, or run `gh repo create OWNER/NAME --template rigerc/project-template`.
2. Run the one-time setup:

   ```bash
   tool/bootstrap.py --name "My Project" --repo OWNER/NAME \
     --description "What it does." --author "Your Name"
   ```

   This fills in `project.json`, the license holder, and a project README, and removes the
   template's own self-test files.
3. Write your code, then teach `tool/verify.sh` about your stack, or add a `Makefile` with a `check` target.
4. Enable GitHub Pages (Settings → Pages → Source: GitHub Actions) and set the `PAGES_ENABLED` variable to `true`.
5. Edit the pages in `website/src/content/docs`.

See [docs/RELEASING.md](docs/RELEASING.md) and [docs/MEDIA.md](docs/MEDIA.md).

## Template self-test

`tool/selftest.sh` bootstraps a copy of the template, fails on any leftover placeholder,
and builds the site. CI runs it only in the template repository.
