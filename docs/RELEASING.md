# Releasing

Releases are driven by `VERSION` and `CHANGELOG.md`. Versions look like `1.2.3`.

## Cut a release

1. Add plain, user-facing sentences under `## Unreleased` in `CHANGELOG.md`.
2. Run `tool/release.py prepare 1.2.3`. It stamps the changelog and bumps `VERSION`.
3. Commit, open a pull request, and merge it.
4. Tag the merge commit and push the tag:

   ```bash
   git tag v1.2.3 && git push origin v1.2.3
   ```

The **Release** workflow checks that the tag matches `VERSION`, points at a
commit on the default branch, and has a changelog entry. It then creates a
GitHub release whose notes come from that entry.

To rehearse without publishing, run the workflow manually from the Actions tab
with **dry run** on.

## Attach build artifacts

Add an executable `tool/build_release.sh`. It receives the tag as `$1` and
should put the files to attach in `dist/release/`. Examples of what to run
there: a binary build, `npm pack`, `python -m build`, or `cargo package`.

## Settings

Set these under **Settings → Secrets and variables → Actions → Variables**.

| Variable | Effect |
|---|---|
| `RELEASE_PUBLISH` | `true` publishes the release immediately. Otherwise it is a draft for you to review. |
| `ATTEST_RELEASES` | `true` signs files in `dist/release/` with a GitHub build provenance attestation. |
| `PAGES_ENABLED` | `true` deploys the site to GitHub Pages from the default branch. |
| `PUBLIC_SITE_URL` | Overrides the site URL, for example when using a custom domain. |

For manual approval before publishing, create a **release** environment with
required reviewers. Registry publishing (npm, PyPI, crates.io) belongs in
`tool/build_release.sh` or a separate job; prefer trusted publishing over
long-lived tokens where the registry supports it.

## Verify an attested release

```bash
gh attestation verify path/to/file --repo OWNER/REPO
```
