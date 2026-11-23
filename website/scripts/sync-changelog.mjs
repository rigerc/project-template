// Publish CHANGELOG.md as a docs page so the site never drifts from the repo.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

const source = readFileSync(new URL("../../CHANGELOG.md", import.meta.url), "utf8");
const body = source.replace(/^# .*\n+/, "");
const target = new URL("../src/content/docs/changelog.md", import.meta.url);
mkdirSync(new URL(".", target), { recursive: true });
writeFileSync(target, `---\ntitle: Changelog\ndescription: What changed in each release.\n---\n\n${body}`);
