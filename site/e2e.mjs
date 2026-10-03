/**
 * Browser checks for visitor preferences, run against dist/ in headless Chrome.
 *
 *   node site/e2e.mjs        # after build (and pre-render); CI runs it before every deploy
 *
 * Theme: follows the OS until the visitor picks one, live; a saved pick wins.
 * Language: English pages move to /pt-BR/ when the first supported language in the browser
 * list is Portuguese; a saved pick wins; /pt-BR/ links are never redirected.
 */
import { createServer } from "node:http";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { extname, join, resolve } from "node:path";
import { homedir } from "node:os";
import { chromium } from "playwright-core";

const DIST = resolve(import.meta.dirname, "..", "dist");
const TYPES = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".json": "application/json", ".md": "text/markdown; charset=utf-8", ".xml": "application/xml" };
const POST = JSON.parse(readFileSync(join(DIST, "posts", "index.json"), "utf8"))[0].slug;

function findChrome() {
  if (process.env.CHROME_PATH) return process.env.CHROME_PATH;
  if (existsSync("/usr/bin/google-chrome")) return "/usr/bin/google-chrome";
  const pw = join(homedir(), ".cache", "ms-playwright");
  const dir = existsSync(pw) && readdirSync(pw).filter((d) => /^chromium-\d+$/.test(d)).sort().pop();
  if (dir) return join(pw, dir, "chrome-linux64", "chrome");
  throw new Error("No Chrome found. Set CHROME_PATH.");
}

const server = await new Promise((ok) => {
  const s = createServer((req, res) => {
    let file = join(DIST, decodeURIComponent(new URL(req.url, "http://x").pathname));
    if (existsSync(file) && statSync(file).isDirectory()) file = join(file, "index.html");
    if (!file.startsWith(DIST) || !existsSync(file)) return res.writeHead(404).end();
    res.writeHead(200, { "content-type": TYPES[extname(file)] || "application/octet-stream" }).end(readFileSync(file));
  });
  s.listen(0, "127.0.0.1", () => ok(s));
});
const base = `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch({ executablePath: findChrome(), args: ["--no-sandbox"] });
let failed = 0;

async function visit({ langs = ["en-US"], scheme = "light", path = "/", stored = {} }, after) {
  const ctx = await browser.newContext({ locale: langs[0], colorScheme: scheme });
  await ctx.addInitScript(([l, st]) => {
    Object.defineProperty(navigator, "languages", { get: () => l });
    if (!sessionStorage.getItem("seeded")) {
      for (const [k, v] of Object.entries(st)) localStorage.setItem(k, v);
      sessionStorage.setItem("seeded", "1");
    }
  }, [langs, stored]);
  const page = await ctx.newPage();
  await page.goto(base + path, { waitUntil: "networkidle" });
  if (after) await after(page);
  const s = await page.evaluate(() => ({
    path: location.pathname,
    lang: document.documentElement.lang,
    dark: document.documentElement.classList.contains("dark"),
    pref: document.documentElement.dataset.themePref,
  }));
  await ctx.close();
  return s;
}

async function expect(name, opts, want, after) {
  const got = await visit(opts, after);
  const bad = Object.entries(want).filter(([k, v]) => got[k] !== v);
  console.log(`${bad.length ? "✗" : "✓"} ${name}${bad.length ? `  expected ${JSON.stringify(want)} got ${JSON.stringify(got)}` : ""}`);
  failed += bad.length ? 1 : 0;
}

const flipToLight = async (page) => { await page.emulateMedia({ colorScheme: "light" }); await page.waitForTimeout(300); };

await expect("theme follows a dark OS", { scheme: "dark" }, { dark: true, pref: "system" });
await expect("theme follows a light OS", { scheme: "light" }, { dark: false, pref: "system" });
await expect("theme follows the OS live", { scheme: "dark" }, { dark: false }, flipToLight);
await expect("every version follows the OS (F)", { scheme: "light", path: "/v/f/" }, { dark: false, pref: "system" });
await expect("every version follows the OS (A)", { scheme: "dark", path: "/v/a/" }, { dark: true, pref: "system" });
await expect("a saved theme wins over the OS", { scheme: "dark", stored: { "kuch:theme": "light" } }, { dark: false, pref: "light" });
await expect("Portuguese browser → /pt-BR/", { langs: ["pt-BR"] }, { path: "/pt-BR/", lang: "pt-BR" });
await expect("first supported language wins (es, pt)", { langs: ["es-ES", "pt-BR"] }, { path: "/pt-BR/" });
await expect("European Portuguese → /pt-BR/", { langs: ["pt-PT", "en"] }, { path: "/pt-BR/" });
await expect("English before Portuguese stays English", { langs: ["en-US", "pt-BR"] }, { path: "/", lang: "en" });
await expect("unsupported language stays English", { langs: ["fr-FR"] }, { path: "/", lang: "en" });
await expect("a saved language wins over the browser", { langs: ["pt-BR"], stored: { "kuch:lang": "en" } }, { path: "/", lang: "en" });
await expect("Portuguese browser on a post", { langs: ["pt-BR"], path: `/blog/${POST}/` }, { path: `/pt-BR/blog/${POST}/`, lang: "pt-BR" });
await expect("/pt-BR/ links are never redirected", { langs: ["en-US"], path: "/pt-BR/blog/" }, { path: "/pt-BR/blog/", lang: "pt-BR" });
await expect("?v= keeps the detected language", { langs: ["pt-BR"], scheme: "dark", path: "/?v=f" }, { path: "/pt-BR/v/f/", dark: true });

await browser.close();
server.close();
if (failed) { console.error(`${failed} preference check(s) failed`); process.exit(1); }
console.log("preferences: ok");
