#!/usr/bin/env python3
"""Set the project identity in a fresh copy of the template."""
import argparse
from datetime import date
import json
from pathlib import Path
import re
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parents[1]
TEMPLATE_ONLY = (".github/workflows/template-check.yml", "tool/selftest.sh")
LICENSE_LINE = re.compile(r"^Copyright \(c\) \d{4} .*$", re.M)

README = """# {name}

{description}

## Develop

```bash
tool/verify.sh   # project checks and release metadata
tool/site.sh     # build the documentation site into website/dist
```

## Release

1. Write notes under `## Unreleased` in `CHANGELOG.md`.
2. Run `tool/release.py prepare X.Y.Z`, commit, and merge.
3. Tag the merge commit `vX.Y.Z` and push the tag.

See `docs/RELEASING.md` for secrets and optional steps.

Licensed under the {license} license.
"""


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--name", required=True)
    parser.add_argument("--repo", required=True, help="GitHub owner/name")
    parser.add_argument("--description")
    parser.add_argument("--author")
    parser.add_argument("--license", dest="license_id")
    parser.add_argument("--site-url")
    parser.add_argument("--keep-template-files", action="store_true")
    args = parser.parse_args()
    if not args.name.strip() or any(not char.isprintable() for char in args.name):
        parser.error("--name must be a nonempty, single-line display name")
    if not re.fullmatch(r"[\w.-]+/[\w.-]+", args.repo):
        parser.error("--repo must look like owner/name")
    if args.site_url and (urlparse(args.site_url).scheme != "https" or not urlparse(args.site_url).hostname):
        parser.error("--site-url must be an absolute HTTPS URL")

    config_path = ROOT / "project.json"
    config = json.loads(config_path.read_text())
    config.update(name=args.name.strip(), repo=args.repo)
    for key, value in (
        ("description", args.description),
        ("author", args.author),
        ("license", args.license_id),
        ("siteUrl", args.site_url),
    ):
        if value is not None:
            config[key] = value
    config_path.write_text(json.dumps(config, ensure_ascii=False, indent=2) + "\n")

    license_path = ROOT / "LICENSE"
    license_text = license_path.read_text()
    license_path.write_text(
        LICENSE_LINE.sub(f"Copyright (c) {date.today().year} {config['author']}", license_text, count=1)
    )
    (ROOT / "README.md").write_text(
        README.format(name=config["name"], description=config["description"], license=config["license"])
    )
    if not args.keep_template_files:
        for name in TEMPLATE_ONLY:
            (ROOT / name).unlink(missing_ok=True)
    print(f"Configured {config['name']} ({config['repo']}).")


if __name__ == "__main__":
    main()
