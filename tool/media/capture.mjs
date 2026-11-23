// Capture screenshots and a short tour video of the built site (website/dist).
import { chromium } from "playwright";
import { createServer } from "node:http";
import { createReadStream, existsSync, mkdirSync, readdirSync, renameSync, rmSync, statSync } from "node:fs";
import { extname, join, normalize, resolve } from "node:path";

const root = resolve(import.meta.dirname, "../..");
const dist = join(root, "website/dist");
const out = join(root, "build/media");
const mode = process.argv[2] ?? "all";
if (!["all", "screenshots", "video"].includes(mode)) {
  console.error("Usage: capture.mjs [all|screenshots|video]");
  process.exit(2);
}
if (!existsSync(join(dist, "index.html"))) {
  console.error("Build the site first: tool/site.sh");
  process.exit(1);
}

const types = { ".html": "text/html", ".css": "text/css", ".js": "text/javascript", ".svg": "image/svg+xml", ".json": "application/json", ".webp": "image/webp", ".png": "image/png" };
const server = createServer((request, response) => {
  const pathname = decodeURIComponent(new URL(request.url, "http://localhost").pathname);
  let file = normalize(join(dist, pathname));
  if (!file.startsWith(dist)) return response.writeHead(403).end();
  if (existsSync(file) && statSync(file).isDirectory()) file = join(file, "index.html");
  if (!existsSync(file)) return response.writeHead(404).end();
  response.writeHead(200, { "content-type": types[extname(file)] ?? "application/octet-stream" });
  createReadStream(file).pipe(response);
});
await new Promise((done) => server.listen(0, "127.0.0.1", done));
const base = `http://127.0.0.1:${server.address().port}/`;

rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });
const browser = await chromium.launch();
try {
  if (mode !== "video") {
    for (const scheme of ["light", "dark"]) {
      const context = await browser.newContext({ viewport: { width: 1280, height: 800 }, colorScheme: scheme });
      const page = await context.newPage();
      await page.goto(base);
      await page.screenshot({ path: join(out, `home-${scheme}.png`) });
      await context.close();
    }
    const mobile = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
    const page = await mobile.newPage();
    await page.goto(`${base}guides/getting-started/`);
    await page.screenshot({ path: join(out, "guide-mobile.png") });
    await mobile.close();
  }
  if (mode !== "screenshots") {
    const context = await browser.newContext({ viewport: { width: 1280, height: 720 }, recordVideo: { dir: join(out, "video"), size: { width: 1280, height: 720 } } });
    const page = await context.newPage();
    for (const path of ["", "guides/getting-started/", "changelog/"]) {
      await page.goto(`${base}${path}`);
      await page.mouse.wheel(0, 400);
      await page.waitForLoadState("networkidle");
    }
    await context.close();
    const [recorded] = readdirSync(join(out, "video"));
    renameSync(join(out, "video", recorded), join(out, "tour.webm"));
    rmSync(join(out, "video"), { recursive: true });
  }
} finally {
  await browser.close();
  server.close();
}
console.log(`Media written to ${out}`);
