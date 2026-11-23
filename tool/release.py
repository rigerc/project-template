#!/usr/bin/env python3
"""Prepare and validate releases from VERSION and CHANGELOG.md."""
import argparse
from datetime import date
import json
from pathlib import Path
import re
import subprocess

ROOT = Path(__file__).resolve().parents[1]
VERSION = r"(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)"


def git(*args):
    return subprocess.check_output(["git", *args], text=True, cwd=ROOT).strip()


def parse(version):
    match = re.fullmatch(VERSION, version)
    if not match:
        raise SystemExit(f"'{version}' is not a version like 1.2.3.")
    return tuple(int(part) for part in match.groups())


def read_version(root=ROOT):
    version = (root / "VERSION").read_text().strip()
    parse(version)
    return version


def section(changelog, heading):
    pattern = rf"^## {re.escape(heading)}(?:[^\S\n]+-[^\n]*)?[^\S\n]*\n(.*?)(?=^## |\Z)"
    match = re.search(pattern, changelog, re.M | re.S)
    return match[1].strip() if match else None


def prepare(root, version, today):
    current = read_version(root)
    if parse(version) <= parse(current):
        raise SystemExit(f"{version} must be newer than {current}.")
    path = root / "CHANGELOG.md"
    changelog = path.read_text()
    if not section(changelog, "Unreleased"):
        raise SystemExit("Write the release notes under '## Unreleased' first.")
    if section(changelog, version) is not None:
        raise SystemExit(f"CHANGELOG.md already has an entry for {version}.")
    heading = re.search(r"^## Unreleased[^\S\n]*$", changelog, re.M)
    path.write_text(
        changelog[: heading.start()]
        + f"## Unreleased\n\n## {version} - {today}"
        + changelog[heading.end() :]
    )
    (root / "VERSION").write_text(f"{version}\n")


def check(root, tag=None, output=None):
    version = read_version(root)
    changelog = (root / "CHANGELOG.md").read_text()
    notes = section(changelog, version)
    if tag is None:
        if notes is None and section(changelog, "Unreleased") is None:
            raise SystemExit(f"CHANGELOG.md needs a '## {version}' or '## Unreleased' entry.")
        return None
    if tag != f"v{version}":
        raise SystemExit(f"Tag {tag} does not match VERSION {version}.")
    revision = git("rev-parse", "HEAD")
    if git("rev-parse", f"refs/tags/{tag}^{{commit}}") != revision:
        raise SystemExit(f"Tag {tag} does not point at the checked-out commit.")
    if not notes:
        raise SystemExit(f"Add a nonempty '## {version}' entry to CHANGELOG.md.")
    project = json.loads((root / "project.json").read_text())
    output.mkdir(parents=True, exist_ok=True)
    (output / "RELEASE_NOTES.md").write_text(notes + "\n")
    metadata = {"tag": tag, "version": version, "name": project["name"], "commit": revision}
    (output / "release.json").write_text(json.dumps(metadata, indent=2) + "\n")
    return metadata


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    commands = parser.add_subparsers(dest="command", required=True)
    prepare_parser = commands.add_parser("prepare", help="Stamp CHANGELOG.md and bump VERSION")
    prepare_parser.add_argument("version")
    check_parser = commands.add_parser("check", help="Validate VERSION and CHANGELOG.md")
    check_parser.add_argument("--tag", help="Require a release for this tag and write its notes")
    check_parser.add_argument("--output", default="dist/release")
    args = parser.parse_args()

    if args.command == "prepare":
        prepare(ROOT, args.version, date.today().isoformat())
        print(f"Prepared {args.version}. Review, commit, then run: git tag v{args.version}")
        return
    metadata = check(ROOT, args.tag, Path(args.output))
    print(f"{metadata['tag']} at {metadata['commit']}" if metadata else f"VERSION {read_version()} is valid.")


if __name__ == "__main__":
    main()
