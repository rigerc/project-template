"""Tests for the release and bootstrap tools. Run with: python3 -m unittest discover tool"""
import json
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest

sys.path.insert(0, str(Path(__file__).parent))
import release  # noqa: E402

CHANGELOG = "# Changelog\n\n## Unreleased\n\n- Added a thing.\n\n## 0.1.0 - 2026-01-01\n\n- First.\n"


def project(root, changelog=CHANGELOG, version="0.1.0"):
    (root / "VERSION").write_text(version + "\n")
    (root / "CHANGELOG.md").write_text(changelog)
    (root / "project.json").write_text(json.dumps({"name": "X"}))


class ReleaseTests(unittest.TestCase):
    def setUp(self):
        self.dir = tempfile.TemporaryDirectory()
        self.root = Path(self.dir.name)
        project(self.root)

    def tearDown(self):
        self.dir.cleanup()

    def test_prepare_stamps_changelog_and_version(self):
        release.prepare(self.root, "0.2.0", "2026-02-02")
        text = (self.root / "CHANGELOG.md").read_text()
        self.assertIn("## Unreleased\n\n## 0.2.0 - 2026-02-02\n\n- Added a thing.", text)
        self.assertEqual((self.root / "VERSION").read_text(), "0.2.0\n")
        self.assertEqual(release.section(text, "0.2.0"), "- Added a thing.")

    def test_prepare_rejects_older_version_and_empty_notes(self):
        with self.assertRaises(SystemExit):
            release.prepare(self.root, "0.1.0", "2026-02-02")
        (self.root / "CHANGELOG.md").write_text("# Changelog\n\n## Unreleased\n\n## 0.1.0\n\n- x\n")
        with self.assertRaises(SystemExit):
            release.prepare(self.root, "0.2.0", "2026-02-02")

    def test_check_accepts_unreleased_or_version_entry(self):
        release.check(self.root)
        (self.root / "CHANGELOG.md").write_text("# Changelog\n")
        with self.assertRaises(SystemExit):
            release.check(self.root)

    def test_version_must_be_plain_semver(self):
        with self.assertRaises(SystemExit):
            release.parse("1.2")
        self.assertEqual(release.parse("1.20.3"), (1, 20, 3))

    def test_tagged_check_requires_matching_tag_and_notes(self):
        git = lambda *a: subprocess.run(["git", *a], cwd=self.root, check=True, capture_output=True)
        git("init", "-q")
        git("-c", "user.name=t", "-c", "user.email=t@t", "commit", "-q", "--allow-empty", "-m", "x")
        git("tag", "v0.1.0")
        release.git = lambda *a: subprocess.check_output(["git", *a], text=True, cwd=self.root).strip()
        out = self.root / "dist"
        meta = release.check(self.root, "v0.1.0", out)
        self.assertEqual(meta["version"], "0.1.0")
        self.assertEqual((out / "RELEASE_NOTES.md").read_text(), "- First.\n")
        with self.assertRaises(SystemExit):
            release.check(self.root, "v0.2.0", out)


if __name__ == "__main__":
    unittest.main()
