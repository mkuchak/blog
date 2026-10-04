"""
Validates dist/ after `site/build.py` (and, when present, `site/prerender.mjs`). Standard library only.

    python3 site/check.py            # warnings for posts without a Portuguese translation
    python3 site/check.py --strict   # those warnings fail the check (CI)

Checks: every published post exists in every language with the right <html lang>, canonical,
hreflang alternates and post meta; every page links the favicon; pre-rendered snapshots carry the localized title and real text;
every version exists in every language; drafts have no pages; index.json, feed.xml and sitemap.xml
parse and agree with the posts; the files Cloudflare Pages needs are there.
"""

import html
import json
import os
import re
import sys
import xml.etree.ElementTree as ET

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import build  # noqa: E402

STRICT = "--strict" in sys.argv
DIST = build.DIST
errors, warnings = [], []


def fail(msg):
    errors.append(msg)


def read(rel):
    path = os.path.join(DIST, rel.lstrip("/"))
    if not os.path.exists(path):
        fail(f"missing {rel}")
        return None
    return open(path, encoding="utf-8").read()


def text_of(fragment):
    t = re.sub(r"<(script|style)[^>]*>.*?</\1>", " ", fragment, flags=re.S)
    return re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", " ", t))).strip()


def snapshot(page):
    m = re.search(r'<div id="kuch-ssr">(.*?)</div><script>document\.getElementById\("kuch-ssr"\)', page, re.S)
    return text_of(m.group(1)) if m else None


published, drafts = build.load_posts()
prerendered = False

# Shared files
for rel in ["index.html", "404.html", "pt-BR/404.html", "_redirects", "_headers", "robots.txt", "feed.xml", "sitemap.xml", "posts/index.json", "site.webmanifest"]:
    read(rel)
for name in build.ICONS:
    if not os.path.exists(os.path.join(DIST, name)):
        fail(f"missing /{name}")

# Every page links the favicon
for root, _, files in os.walk(DIST):
    for f in files:
        if f.endswith(".html") and 'href="/favicon.svg"' not in open(os.path.join(root, f), encoding="utf-8").read():
            fail(f"{os.path.relpath(os.path.join(root, f), DIST)}: missing favicon links")

# index.json agrees with the markdown
index = read("posts/index.json")
if index:
    slugs = [e["slug"] for e in json.loads(index)]
    if slugs != [p["slug"] for p in published]:
        fail("posts/index.json does not match site/posts")

for lang, L in build.LANGS.items():
    prefix = L["prefix"]
    hl = L["hreflang"]
    # Every version, landing and blog
    for x in build.VERSIONS:
        for rel in [f"{prefix}/v/{x}/index.html", f"{prefix}/v/{x}/blog/index.html"]:
            page = read(rel)
            if page and f'<html lang="{hl}"' not in page:
                fail(f'{rel}: expected <html lang="{hl}">')
            if page and '<meta name="robots" content="noindex"' not in page:
                fail(f"{rel}: version pages must be noindex")
    for rel in [f"{prefix}/index.html", f"{prefix}/blog/index.html"]:
        page = read(rel)
        if page and f'<html lang="{hl}"' not in page:
            fail(f'{rel}: expected <html lang="{hl}">')
        if page and 'hreflang="x-default"' not in page:
            fail(f"{rel}: missing hreflang alternates")

    for p in published:
        rel = f"{prefix}/blog/{p['slug']}/index.html"
        page = read(rel)
        if not page:
            continue
        translated = lang == "en" or lang in p["langs"]
        loc = build.localized(p, lang)
        want_canon = f'{build.SITE_URL}{prefix if translated else ""}/blog/{p["slug"]}/'
        if f'<link rel="canonical" href="{want_canon}"' not in page:
            fail(f"{rel}: canonical should be {want_canon}")
        if f'<meta name="kuch-post" content="{p["slug"]}"' not in page:
            fail(f"{rel}: missing kuch-post meta")
        if f'<html lang="{hl}"' not in page:
            fail(f'{rel}: expected <html lang="{hl}">')
        if translated and 'hreflang="x-default"' not in page:
            fail(f"{rel}: missing hreflang alternates")
        if not translated:
            (errors if STRICT else warnings).append(f"{p['slug']}: no {hl} translation (posts/{p['slug']}.{lang}.md)")
        snap = snapshot(page)
        if snap is not None:
            prerendered = True
            if html.unescape(loc["title"]) not in snap:
                fail(f"{rel}: pre-rendered snapshot lacks the {hl} title")
            words = len(snap.split())
            if words < p["readingMinutes"] * 120:
                fail(f"{rel}: pre-rendered snapshot looks empty ({words} words)")
            if lang == "pt" and translated and "só existe em inglês" in snap:
                fail(f"{rel}: translated post still shows the English-only notice")

    for d in drafts:
        if os.path.exists(os.path.join(DIST, f"{prefix}/blog/{d['slug']}/index.html".lstrip("/"))):
            fail(f"draft {d['slug']} must not have a page")

# In-page links in every post (both languages) point at a real heading. Ids follow blog.js slugify (GitHub style).
def heading_id(text):
    text = re.sub(r"\[([^\]]*)\]\([^)]*\)", r"\1", text).replace("`", "").replace("**", "").replace("*", "")
    return re.sub(r"\s", "-", re.sub(r"[^\w\s-]", "", text.lower()).strip())


for f in sorted(os.listdir(os.path.join(build.SITE, "posts"))):
    if not f.endswith(".md"):
        continue
    _, body = build.parse_front_matter(open(os.path.join(build.SITE, "posts", f), encoding="utf-8").read())
    prose = re.sub(r"```.*?```", "", body, flags=re.S)
    ids = {heading_id(h) for h in re.findall(r"^#{1,6}\s+(.+?)\s*#*$", prose, re.M)}
    for anchor in re.findall(r"\]\(#([^)]+)\)", prose):
        if anchor not in ids:
            fail(f"posts/{f}: link to #{anchor} has no matching heading")

# Feeds
for rel in ["feed.xml", "sitemap.xml"]:
    try:
        ET.parse(os.path.join(DIST, rel))
    except Exception as e:  # noqa: BLE001
        fail(f"{rel}: invalid XML ({e})")
sm = read("sitemap.xml") or ""
for lang, L in build.LANGS.items():
    for p in published:
        if lang == "en" or lang in p["langs"]:
            u = f'{build.SITE_URL}{L["prefix"]}/blog/{p["slug"]}/'
            if f"<loc>{u}</loc>" not in sm:
                fail(f"sitemap.xml: missing {u}")

for w in warnings:
    print(f"warning: {w}", file=sys.stderr)
for e in errors:
    print(f"error: {e}", file=sys.stderr)
print(
    f"check: {len(published)} posts × {len(build.LANGS)} languages, {len(build.VERSIONS)} versions, "
    f"pre-rendered={'yes' if prerendered else 'no'} → {'FAILED' if errors else 'ok'}",
    file=sys.stderr,
)
sys.exit(1 if errors else 0)
