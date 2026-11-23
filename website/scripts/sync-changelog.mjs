// Publish CHANGELOG.md as a page on both sites, so neither drifts from the repo.
//
// The docs site gets the full history. The landing site gets the five most
// recent sections, because its changelog page is a summary that links to the
// docs for the rest — one source, two renderings.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

const source = readFileSync(new URL("../../CHANGELOG.md", import.meta.url), "utf8");
const body = source.replace(/^# .*\n+/, "");

const docsTarget = new URL("../src/content/docs/changelog.md", import.meta.url);
mkdirSync(new URL(".", docsTarget), { recursive: true });
writeFileSync(docsTarget, `---\ntitle: Changelog\ndescription: What changed in each release.\n---\n\n${body}`);

// Split on level-2 headings so "## Unreleased" counts as a section like any
// release. Leading whitespace before the first heading is dropped.
const sections = body
  .split(/^## /m)
  .map((section) => section.trim())
  .filter(Boolean)
  .map((section) => `## ${section}`);

const landing = sections.slice(0, 5).join("\n\n");
const landingTarget = new URL("../../site/src/content/pages/changelog.md", import.meta.url);
mkdirSync(new URL(".", landingTarget), { recursive: true });
writeFileSync(
  landingTarget,
  `---\ntitle: Changelog\ndescription: The most recent releases.\nlocale: en\n---\n\n${landing}\n`,
);
