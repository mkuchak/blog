/**
 * Bakes the rendered HTML of the indexable pages into dist/ so crawlers and link previews
 * get the full text without running JavaScript.
 *
 *   node site/prerender.mjs            # after `python3 site/build.py`
 *   node site/prerender.mjs --all      # also the /v/<x>/ versions (noindex, so off by default)
 *
 * Browser: CHROME_PATH, else /usr/bin/google-chrome (GitHub runners), else Playwright's Chromium.
 *
 * Each page gets the snapshot of its rendered <body> right after <body>, inside #kuch-ssr.
 * Browsers with JavaScript hide it (CSS) and remove it while parsing, before any page script runs,
 * so the live page renders exactly as before; crawlers that don't run JavaScript read the snapshot.
 */
import { createServer } from "node:http";
import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { extname, join, relative, resolve, sep } from "node:path";
import { homedir } from "node:os";
import { chromium } from "playwright-core";

const DIST = resolve(import.meta.dirname, "..", "dist");
const ALL = process.argv.includes("--all");
const TYPES = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".json": "application/json", ".md": "text/markdown; charset=utf-8", ".xml": "application/xml", ".txt": "text/plain" };

function findChrome() {
  if (process.env.CHROME_PATH) return process.env.CHROME_PATH;
  if (existsSync("/usr/bin/google-chrome")) return "/usr/bin/google-chrome";
  const pw = join(homedir(), ".cache", "ms-playwright");
  if (existsSync(pw)) {
    const dir = readdirSync(pw).filter((d) => /^chromium-\d+$/.test(d)).sort().pop();
    if (dir) return join(pw, dir, "chrome-linux64", "chrome");
  }
  throw new Error("No Chrome found. Set CHROME_PATH.");
}

function pages() {
  const out = [];
  const walk = (dir) => {
    for (const name of readdirSync(dir)) {
      const full = join(dir, name);
      if (statSync(full).isDirectory()) walk(full);
      else if (name === "index.html" || name === "404.html") out.push(full);
    }
  };
  walk(DIST);
  return out
    .map((f) => "/" + relative(DIST, f).split(sep).join("/"))
    .filter((p) => ALL || !/^\/(pt-BR\/)?v\//.test(p));
}

function serve() {
  return new Promise((ok) => {
    const server = createServer((req, res) => {
      let p = decodeURIComponent(new URL(req.url, "http://x").pathname);
      let file = join(DIST, p);
      if (!file.startsWith(DIST)) return res.writeHead(403).end();
      if (existsSync(file) && statSync(file).isDirectory()) file = join(file, "index.html");
      if (!existsSync(file)) return res.writeHead(404).end();
      res.writeHead(200, { "content-type": TYPES[extname(file)] || "application/octet-stream" });
      res.end(readFileSync(file));
    });
    server.listen(0, "127.0.0.1", () => ok(server));
  });
}

const HIDE = '<style>html.kjs #kuch-ssr{display:none!important}</style><script>document.documentElement.classList.add("kjs")</script>';

async function main() {
  const server = await serve();
  const origin = `http://127.0.0.1:${server.address().port}`;
  const browser = await chromium.launch({ executablePath: findChrome(), args: ["--no-sandbox"] });
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, reducedMotion: "reduce", locale: "en-US" });
  const list = pages();
  let done = 0;
  for (const path of list) {
    const page = await context.newPage();
    const url = origin + path.replace(/index\.html$/, "");
    await page.goto(url, { waitUntil: "networkidle", timeout: 60000 });
    // Reveal anything that waits for scroll, then settle.
    await page.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += 600) { scrollTo(0, y); await new Promise((r) => setTimeout(r, 40)); }
      scrollTo(0, 0);
    });
    await page.waitForTimeout(400);
    const snapshot = await page.evaluate(() => {
      const body = document.body.cloneNode(true);
      body.querySelectorAll("script, noscript, canvas, iframe, dialog, template, [data-prototype-switcher], #kuch-ssr").forEach((el) => el.remove());
      // The snapshot is for reading: drop ids so it never clashes with the live page, keep classes for styling.
      body.querySelectorAll("[id]").forEach((el) => el.removeAttribute("id"));
      return body.innerHTML.replace(/\s{2,}/g, " ").trim();
    });
    await page.close();
    const file = join(DIST, path.slice(1));
    const html = readFileSync(file, "utf8");
    if (html.includes('id="kuch-ssr"')) continue;
    const out = html
      .replace(/<meta charset="utf-8"\s*\/?>/, (m) => `${m}\n    ${HIDE}`)
      .replace(/<body([^>]*)>/, (m) => `${m}\n<div id="kuch-ssr">${snapshot}</div><script>document.getElementById("kuch-ssr").remove()</script>`);
    writeFileSync(file, out);
    done++;
    process.stderr.write(`prerendered ${path} (${Math.round(snapshot.length / 1024)} KB)\n`);
  }
  await browser.close();
  server.close();
  process.stderr.write(`${done}/${list.length} pages prerendered\n`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
