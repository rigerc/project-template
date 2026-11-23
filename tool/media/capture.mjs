// Capture screenshots and a short tour video of the built static site.
import { chromium } from "playwright";
import { createServer } from "node:http";
import { createReadStream, existsSync, mkdirSync, readdirSync, renameSync, rmSync, statSync } from "node:fs";
import { extname, join, normalize, resolve } from "node:path";

const root = resolve(import.meta.dirname, "../..");
const args = process.argv.slice(2);
const mode = args.find((a) => ["all", "screenshots", "video"].includes(a)) ?? "all";
const distArg = args.find((a) => a.startsWith("--dist="))?.slice("--dist=".length);
const baseArg = args.find((a) => a.startsWith("--base="))?.slice("--base=".length);
const outArg = args.find((a) => a.startsWith("--out="))?.slice("--out=".length);

const dist = resolve(root, distArg || (existsSync(join(root, "site/dist/index.html")) ? "site/dist" : "website/dist"));
const out = resolve(root, outArg || "build/media");
const basePath = normalizeBase(baseArg || process.env.PUBLIC_SITE_URL || "/");

function normalizeBase(input) {
  let path = "/";
  try { path = input.startsWith("http") ? new URL(input).pathname : input; } catch {}
  if (!path.startsWith("/")) path = `/${path}`;
  if (!path.endsWith("/")) path = `${path}/`;
  return path;
}

if (!existsSync(join(dist, "index.html"))) {
  console.error(`Build the site first: tool/site.sh (missing ${dist}/index.html)`);
  process.exit(1);
}

const types = {
  ".html": "text/html", ".css": "text/css", ".js": "text/javascript", ".mjs": "text/javascript",
  ".svg": "image/svg+xml", ".json": "application/json", ".webp": "image/webp", ".png": "image/png",
  ".ico": "image/x-icon", ".xml": "application/xml", ".txt": "text/plain", ".webmanifest": "application/manifest+json",
};

const server = createServer((request, response) => {
  const url = new URL(request.url, "http://localhost");
  let pathname = decodeURIComponent(url.pathname);
  if (basePath !== "/" && pathname.startsWith(basePath)) pathname = `/${pathname.slice(basePath.length)}`;
  else if (basePath !== "/" && pathname === basePath.slice(0, -1)) pathname = "/";
  let file = normalize(join(dist, pathname));
  if (!file.startsWith(dist)) return response.writeHead(403).end();
  if (existsSync(file) && statSync(file).isDirectory()) file = join(file, "index.html");
  if (!existsSync(file)) return response.writeHead(404).end();
  response.writeHead(200, { "content-type": types[extname(file)] ?? "application/octet-stream" });
  createReadStream(file).pipe(response);
});
await new Promise((done) => server.listen(0, "127.0.0.1", done));
const base = `http://127.0.0.1:${server.address().port}${basePath}`;

rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });

const browser = await chromium.launch();
try {
  if (mode !== "video") {
    for (const scheme of ["light", "dark"]) {
      const context = await browser.newContext({ viewport: { width: 1280, height: 800 }, colorScheme: scheme });
      const page = await context.newPage();
      await page.goto(base, { waitUntil: "networkidle" });
      await page.screenshot({ path: join(out, `home-${scheme}.png`) });
      await context.close();
    }
    const mobile = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
    const page = await mobile.newPage();
    await page.goto(base, { waitUntil: "networkidle" });
    await page.screenshot({ path: join(out, "home-mobile.png") });
    await mobile.close();
  }
  if (mode !== "screenshots") {
    const context = await browser.newContext({
      viewport: { width: 1280, height: 720 },
      recordVideo: { dir: join(out, "video"), size: { width: 1280, height: 720 } },
    });
    const page = await context.newPage();
    for (const path of ["", "changelog/", "docs/"]) {
      await page.goto(`${base}${path}`, { waitUntil: "networkidle" });
      await page.mouse.wheel(0, 500);
      await page.waitForTimeout(350);
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
