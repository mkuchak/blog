/**
 * Renders the raster icons from favicon.svg (the source of truth). Run after editing the SVG and commit the output:
 *
 *   node site/icons/render.mjs
 *
 * Writes, next to this file: favicon.ico (16, 32, 48), apple-touch-icon.png (180, full bleed, iOS rounds it),
 * icon-192.png and icon-512.png (as is), icon-maskable-512.png (full bleed, mark inside the Android safe zone).
 * build.py copies everything in site/icons/ except this script to the root of dist/.
 * Browser: CHROME_PATH, else /usr/bin/google-chrome, else Playwright's Chromium.
 */
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { homedir } from "node:os";
import { chromium } from "playwright-core";

const DIR = import.meta.dirname;
const SVG = readFileSync(join(DIR, "favicon.svg"), "utf8").trim();

function findChrome() {
  if (process.env.CHROME_PATH) return process.env.CHROME_PATH;
  if (existsSync("/usr/bin/google-chrome")) return "/usr/bin/google-chrome";
  const pw = join(homedir(), ".cache", "ms-playwright");
  const dir = existsSync(pw) && readdirSync(pw).filter((d) => /^chromium-\d+$/.test(d)).sort().pop();
  if (dir) return join(pw, dir, "chrome-linux64", "chrome");
  throw new Error("No Chrome found. Set CHROME_PATH.");
}

// Square corners, background to the edge: the OS applies its own mask.
const fullBleed = SVG.replace(/ rx="[\d.]+"/, "");
// Maskable: the mark must fit the central 80% circle, so shrink it around the center.
const maskable = fullBleed.replace(/(<rect[^>]*\/>)(.*)<\/svg>$/s, '$1<g transform="translate(6.4 6.4) scale(.8)">$2</g></svg>');

const browser = await chromium.launch({ executablePath: findChrome(), args: ["--no-sandbox"] });
const page = await browser.newPage({ deviceScaleFactor: 1 });

async function png(svg, size) {
  await page.setViewportSize({ width: size, height: size });
  const src = "data:image/svg+xml," + encodeURIComponent(svg);
  await page.setContent(`<style>html,body{margin:0;background:transparent}img{display:block}</style><img src="${src}" width="${size}" height="${size}">`);
  await page.waitForFunction(() => document.images[0].complete);
  return page.screenshot({ omitBackground: true, clip: { x: 0, y: 0, width: size, height: size } });
}

// ICO with PNG entries (supported by every browser that still asks for /favicon.ico).
function ico(images) {
  const head = Buffer.alloc(6 + 16 * images.length);
  head.writeUInt16LE(0, 0);
  head.writeUInt16LE(1, 2);
  head.writeUInt16LE(images.length, 4);
  let offset = head.length;
  images.forEach(({ size, data }, i) => {
    const e = 6 + 16 * i;
    head.writeUInt8(size >= 256 ? 0 : size, e);
    head.writeUInt8(size >= 256 ? 0 : size, e + 1);
    head.writeUInt16LE(1, e + 4); // color planes
    head.writeUInt16LE(32, e + 6); // bits per pixel
    head.writeUInt32LE(data.length, e + 8);
    head.writeUInt32LE(offset, e + 12);
    offset += data.length;
  });
  return Buffer.concat([head, ...images.map((i) => i.data)]);
}

const small = [];
for (const size of [16, 32, 48]) small.push({ size, data: await png(SVG, size) }); // one page, so one at a time
const out = {
  "favicon.ico": ico(small),
  "apple-touch-icon.png": await png(fullBleed, 180),
  "icon-192.png": await png(SVG, 192),
  "icon-512.png": await png(SVG, 512),
  "icon-maskable-512.png": await png(maskable, 512),
};
for (const [name, data] of Object.entries(out)) {
  writeFileSync(join(DIR, name), data);
  process.stderr.write(`wrote site/icons/${name} (${data.length} bytes)\n`);
}
await browser.close();
