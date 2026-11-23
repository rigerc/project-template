#!/usr/bin/env node
/**
 * Internal link check across a built static site.
 *
 * Fails on any local href/src that resolves to a file missing from `dist`. This
 * catches a moved page or a broken base path that a human spot-check misses.
 * External URLs are ignored — they are not deterministic in CI.
 */
import { existsSync, readFileSync } from 'node:fs';
import { readdir, readFile } from 'node:fs/promises';
import { extname, join, resolve } from 'node:path';

const dir = resolve(process.argv[2] || 'site/dist');
const baseArg = process.argv.find((a) => a.startsWith('--base='));
const base = normalizeBase(baseArg ? baseArg.slice('--base='.length) : (process.env.PUBLIC_SITE_URL || ''));

function normalizeBase(input) {
  if (!input) return '/';
  let path;
  try { path = input.startsWith('http') ? new URL(input).pathname : input; } catch { return '/'; }
  if (!path.startsWith('/')) path = `/${path}`;
  return path.endsWith('/') ? path : `${path}/`;
}

async function* walk(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) yield* walk(path);
    else if (extname(entry.name) === '.html') yield path;
  }
}

function refs(html) {
  const out = [];
  for (const re of [/\b(?:href|src|poster|data-src)="([^"]*)"/g, /\bsrcset="([^"]*)"/g]) {
    for (const m of html.matchAll(re)) {
      const raw = m[1];
      if (re.source.startsWith('\\bsrcset')) {
        for (const part of raw.split(',')) out.push(part.trim().split(/\s+/)[0]);
      } else out.push(raw);
    }
  }
  return out;
}

function resolves(urlPath) {
  const clean = urlPath.split('#')[0].split('?')[0];
  if (!clean || clean === '/') return existsSync(join(dir, 'index.html'));
  const rel = clean.replace(/^\//, '').replace(/\/$/, '');
  const candidates = [join(dir, rel), join(dir, rel, 'index.html'), join(dir, `${rel}.html`)];
  // Static hosts serve 404.html for unknown paths; allow explicit 404 refs.
  if (rel === '404' || rel.endsWith('/404')) return existsSync(join(dir, `${rel}.html`)) || existsSync(join(dir, rel, 'index.html'));
  return candidates.some((c) => existsSync(c));
}

const failures = [];
const seen = new Set();
for await (const file of walk(dir)) {
  const html = await readFile(file, 'utf8');
  for (const raw of refs(html)) {
    if (!raw || raw.startsWith('#') || raw.startsWith('mailto:') || raw.startsWith('tel:') || raw.startsWith('data:')) continue;
    if (/^(https?:)?\/\//.test(raw)) {
      // same-origin absolute URLs should resolve locally
      try {
        const u = new URL(raw, 'https://local.test');
        if (raw.startsWith('http')) {
          const site = process.env.PUBLIC_SITE_URL;
          if (!site || !raw.startsWith(site.replace(/\/$/, ''))) continue;
        }
        const p = u.pathname;
        if (base !== '/' && !p.startsWith(base)) { const k=`${file}\0${raw}\0o`; if(!seen.has(k)){seen.add(k); failures.push(`${file}: ${raw} (outside base)`);} continue; }
        if (!resolves(p.startsWith(base) ? '/' + p.slice(base.length) : p)) { const k=`${file}\0${raw}`; if(!seen.has(k)){seen.add(k); failures.push(`${file}: ${raw}`);} }
      } catch {}
      continue;
    }
    if (raw.startsWith('/')) {
      if (base !== '/' && !(raw === base.slice(0,-1) || raw.startsWith(base))) { const k=`${file}\0${raw}\0o`; if(!seen.has(k)){seen.add(k); failures.push(`${file}: ${raw} (outside base)`);} continue; }
      const local = base !== '/' && raw.startsWith(base) ? '/' + raw.slice(base.length) : raw;
      if (!resolves(local)) { const k=`${file}\0${raw}`; if(!seen.has(k)){seen.add(k); failures.push(`${file}: ${raw}`);} }
    }
  }
}

if (failures.length) {
  console.error(`linkcheck: ${failures.length} broken local reference(s)`);
  for (const f of failures.slice(0, 80)) console.error(`  ${f}`);
  process.exit(1);
}
console.log(`linkcheck: local references resolve in ${dir}`);
