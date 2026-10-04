"""
Builds kuch.dev into dist/ as a static site (Python 3 standard library only).

    python3 site/build.py            # writes dist/
    python3 site/dev.py              # builds, serves dist/ on :4321, rebuilds on change
    node site/prerender.mjs          # optional: bakes the rendered HTML into every page (SEO)

Source layout (site/):
    site.config.json     feature flag: "official" picks the version served at "/" (a-f, default e)
    versions/            variant-<x>.html landing pages, blog-<x>.html blog pages (E and F)
    assets/              shared JS (content, prefs, switcher, blog engine)
    icons/               favicon.svg (source) and the rasters node site/icons/render.mjs makes from it
    posts/<slug>.md      posts with front matter; "draft: true" = announced as coming up, not published
    posts/<slug>.pt.md   optional Portuguese version

Output (dist/), for each language prefix ("" = English, "/pt-BR" = Portuguese):
    <lang>/                    official landing
    <lang>/blog/               blog index           <lang>/blog/<slug>/   one page per post
    <lang>/v/<x>/              every version (also reachable with ?v=<x> or ?version=<x> on any page)
    <lang>/404.html
    /posts/*  /assets/*  feed.xml  sitemap.xml  robots.txt  _redirects  _headers
    /favicon.svg  /favicon.ico  /apple-touch-icon.png  /icon-*.png  /site.webmanifest
"""

import hashlib
import html
import json
import os
import re
import shutil
import sys
from datetime import datetime, timezone
from email.utils import format_datetime
from xml.sax.saxutils import escape as xml_escape

SITE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.dirname(SITE)
DIST = os.path.join(REPO, "dist")
CONFIG = json.load(open(os.path.join(SITE, "site.config.json"), encoding="utf-8"))
OFFICIAL = CONFIG["official"].lower()
VERSIONS = CONFIG["versions"]
BLOG_FALLBACK = CONFIG.get("blogFallback", "e")
SITE_URL = CONFIG["siteUrl"].rstrip("/")
LANGS = CONFIG["languages"]  # {"en": {"prefix": "", "hreflang": "en"}, "pt": {...}}
ASSETS = ["content.js", "prefs.js", "switcher.js", "blog.js"]
ICONS = ["favicon.svg", "favicon.ico", "apple-touch-icon.png", "icon-192.png", "icon-512.png", "icon-maskable-512.png"]

if OFFICIAL not in VERSIONS:
    sys.exit(f'site.config.json: "official" must be one of {", ".join(VERSIONS)}')
if not VERSIONS.get(BLOG_FALLBACK, {}).get("blog"):
    sys.exit('site.config.json: "blogFallback" must be a version that has a blog page')


def blog_source(x):
    """Version whose blog page serves x's /blog/ (its own, or the fallback for A-D)."""
    return x if VERSIONS[x]["blog"] else BLOG_FALLBACK


# ---------- posts ----------

def parse_front_matter(text):
    text = text.replace("\r\n", "\n")
    m = re.match(r"^---\n(.*?)\n---\n?(.*)$", text, re.S)
    if not m:
        return {}, text
    meta = {}
    for line in m.group(1).split("\n"):
        if ":" not in line or line.lstrip().startswith("#"):
            continue
        key, raw = line.split(":", 1)
        raw = raw.strip()
        if raw.startswith("["):
            try:
                value = json.loads(raw)
            except ValueError:
                value = [v.strip().strip("'\"") for v in raw.strip("[]").split(",") if v.strip()]
        elif len(raw) >= 2 and raw[0] == raw[-1] and raw[0] in "'\"":
            value = raw[1:-1]
        elif raw in ("true", "false"):
            value = raw == "true"
        else:
            value = re.sub(r"\s+#.*$", "", raw)
        meta[key.strip()] = value
    return meta, m.group(2)


def count_words(body):
    body = re.sub(r"```.*?```", " ", body, flags=re.S)
    body = re.sub(r"<[^>]+>", " ", body)
    return len(re.findall(r"\w+", body))


def load_posts():
    posts_dir = os.path.join(SITE, "posts")
    published, drafts = [], []
    for f in sorted(os.listdir(posts_dir)):
        if not f.endswith(".md") or f.endswith(".pt.md"):
            continue
        slug = f[:-3]
        meta, body = parse_front_matter(open(os.path.join(posts_dir, f), encoding="utf-8").read())
        entry = {
            "slug": slug,
            "title": meta.get("title", slug),
            "description": meta.get("description", ""),
            "topic": meta.get("topic", ""),
            "cover": meta.get("cover", ""),
            "date": str(meta.get("date", "")),
            "updated": str(meta.get("updated", "")) or None,
            "tags": meta.get("tags", []) or [],
            "readingMinutes": max(1, round(count_words(body) / 220)),
            "langs": ["en"],
            "i18n": {},
        }
        pt_path = os.path.join(posts_dir, slug + ".pt.md")
        if os.path.exists(pt_path):
            pmeta, pbody = parse_front_matter(open(pt_path, encoding="utf-8").read())
            entry["i18n"]["pt"] = {k: pmeta[k] for k in ("title", "description", "topic", "tags") if k in pmeta}
            if count_words(pbody):
                entry["langs"].append("pt")
                entry["i18n"]["pt"]["readingMinutes"] = max(1, round(count_words(pbody) / 220))
        if meta.get("draft") is True:
            drafts.append(entry)
        else:
            if not entry["date"]:
                sys.exit(f"posts/{f}: published posts need a date (or set draft: true)")
            published.append(entry)
    published.sort(key=lambda e: e["date"], reverse=True)
    return published, drafts


def drafts_by_lang(drafts):
    out = {}
    for lang in LANGS:
        items = []
        for d in drafts:
            tr = d["i18n"].get(lang, {}) if lang != "en" else {}
            items.append({
                "slug": d["slug"],
                "title": tr.get("title", d["title"]),
                "topic": tr.get("topic", d["topic"]),
                "tags": tr.get("tags", d["tags"]),
                "published": False,
            })
        out[lang] = items
    return out


def localized(post, lang):
    tr = post["i18n"].get(lang, {}) if lang != "en" else {}
    return {k: tr.get(k, post[k]) for k in ("title", "description", "topic")}


# ---------- html ----------

def asset_version():
    h = hashlib.sha1()
    for name in ASSETS:
        h.update(open(os.path.join(SITE, "assets", name), "rb").read())
    return h.hexdigest()[:10]


# Runs first on every page. Resolves ?v= / ?version= and the visitor's language in one redirect.
ROUTER = """<script>
(function () {
  var cfg = %(cfg)s, page = %(page)s;
  var q = new URLSearchParams(location.search), store = {};
  try { store.lang = localStorage.getItem("kuch:lang"); } catch (e) {}
  // Version: ?v=f, ?version=F, ?version=version-f
  var v = (q.get("v") || q.get("version") || "").toLowerCase().replace(/^version[\\s_-]*/, "");
  if (!cfg.versions[v]) v = page.version;
  // Language: the URL decides, except on English pages for visitors whose browser (or saved choice) is Portuguese.
  var lang = page.lang, asked = q.get("lang");
  if (asked === "pt" || asked === "en") { lang = asked; try { localStorage.setItem("kuch:lang", asked); } catch (e) {} }
  else if (page.lang === "en") {
    // First language in the browser's list that the site supports (pt-BR, pt-PT, pt → Portuguese; en-* → English).
    var list = (navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language || ""]);
    var nav = "";
    for (var i = 0; i < list.length && !nav; i++) { var m = /^(pt|en)\\b/i.exec(list[i] || ""); if (m) nav = m[1].toLowerCase(); }
    if (store.lang === "pt" || (!store.lang && nav === "pt")) lang = "pt";
  }
  if (v === page.version && lang === page.lang && !q.has("v") && !q.has("version") && !asked) return;
  var base = cfg.langs[lang] + (v === cfg.official ? "/" : "/v/" + v + "/");
  var path = base;
  if (page.kind === "blog" || page.kind === "post") path = base + "blog/" + (page.slug ? page.slug + "/" : "");
  ["v", "version", "lang"].forEach(function (k) { q.delete(k); });
  if (path === location.pathname && !location.search) return;
  var qs = q.toString();
  location.replace(path + (qs ? "?" + qs : "") + location.hash);
})();
</script>"""


def head_meta(meta, kind, indexable, lang, alternates, slug=None):
    tags = [
        f'<link rel="canonical" href="{html.escape(meta["canonical"])}" />',
        f'<meta name="description" content="{html.escape(meta["description"])}" />',
        '<meta property="og:site_name" content="kuch.dev" />',
        f'<meta property="og:locale" content="{"pt_BR" if lang == "pt" else "en_US"}" />',
        f'<meta property="og:type" content="{"article" if kind == "post" else "website"}" />',
        f'<meta property="og:title" content="{html.escape(meta["title"])}" />',
        f'<meta property="og:description" content="{html.escape(meta["description"])}" />',
        f'<meta property="og:url" content="{html.escape(meta["canonical"])}" />',
        f'<meta property="og:image" content="{html.escape(meta["image"])}" />',
        '<meta name="twitter:card" content="summary_large_image" />',
        '<meta name="twitter:creator" content="@marcoskuchak" />',
        f'<link rel="alternate" type="application/rss+xml" title="Marcos Kuchak · Field notes" href="{SITE_URL}/feed.xml" />',
        '<link rel="icon" href="/favicon.ico" sizes="32x32" />',
        '<link rel="icon" href="/favicon.svg" type="image/svg+xml" />',
        '<link rel="apple-touch-icon" href="/apple-touch-icon.png" />',
        '<link rel="manifest" href="/site.webmanifest" />',
    ]
    for hl, href in alternates:
        tags.append(f'<link rel="alternate" hreflang="{hl}" href="{html.escape(href)}" />')
    if not indexable:
        tags.append('<meta name="robots" content="noindex" />')
    if slug:
        tags.append(f'<meta name="kuch-post" content="{html.escape(slug)}" />')
    return "\n    ".join(tags)


def transform(src, x, base, kind, lang, drafts, ver, meta, page_version, slug=None, force_post=None, indexable=False, alternates=()):
    """Turn a prototype page into a deployable page living under `base`."""
    s = src
    landing_home = base  # the landing this page belongs to
    for name in ASSETS:
        s = s.replace(f'src="{name}"', f'src="/assets/{name}?v={ver}"')
    s = s.replace(f"variant-{x}.html", landing_home).replace(f"blog-{x}.html", base + "blog/")
    s = re.sub(r'\s*<meta name="description"[^>]*>', "", s)
    s = re.sub(r"<html lang=\"[^\"]*\"", f'<html lang="{LANGS[lang]["hreflang"]}"', s, count=1)
    s = re.sub(r"<title>.*?</title>", f"<title>{html.escape(meta['title'])}</title>", s, count=1, flags=re.S)
    site = {"root": "/", "pretty": True, "production": True, "version": page_version, "official": OFFICIAL, "lang": lang}
    if force_post:
        site["forcePost"] = force_post
    cfg = {
        "official": OFFICIAL,
        "versions": {k: 1 for k in VERSIONS},
        "langs": {k: v["prefix"] for k, v in LANGS.items()},
    }
    page = {"kind": kind, "slug": slug, "version": page_version, "lang": lang}
    inject = [
        ROUTER % {"cfg": json.dumps(cfg), "page": json.dumps(page)},
        head_meta(meta, kind, indexable, lang, alternates, slug=slug),
        f"<script>window.KUCH_SITE = {json.dumps(site)};</script>",
    ]
    s = re.sub(r"(<meta charset=\"utf-8\"\s*/?>)", lambda m: m.group(1) + "\n    " + "\n    ".join(inject), s, count=1)
    drafts_js = (
        "<script>window.KUCH_DRAFTS_ALL = " + json.dumps(drafts, ensure_ascii=False)
        + '; window.KUCH_DRAFTS = window.KUCH_DRAFTS_ALL[(window.KUCH && KUCH.lang) || "en"];</script>'
    )
    s = s.replace(f'<script src="/assets/content.js?v={ver}"></script>',
                  f'<script src="/assets/content.js?v={ver}"></script>\n    {drafts_js}', 1)
    return s


def write(path, text):
    full = os.path.join(DIST, path.lstrip("/"))
    os.makedirs(os.path.dirname(full), exist_ok=True)
    with open(full, "w", encoding="utf-8") as fh:
        fh.write(text)


# ---------- feeds ----------

def rss(posts):
    items = []
    for p in posts:
        dt = datetime.fromisoformat(p["date"]).replace(tzinfo=timezone.utc)
        link = f"{SITE_URL}/blog/{p['slug']}/"
        cats = "".join(f"<category>{xml_escape(t)}</category>" for t in p["tags"])
        items.append(
            f"<item><title>{xml_escape(p['title'])}</title><link>{link}</link><guid>{link}</guid>"
            f"<pubDate>{format_datetime(dt)}</pubDate><description>{xml_escape(p['description'])}</description>{cats}</item>"
        )
    return (
        '<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0"><channel>'
        f"<title>Marcos Kuchak · Field notes</title><link>{SITE_URL}/blog/</link>"
        "<description>Notes on AI agents, LLM systems and full-stack engineering.</description>"
        + "".join(items) + "</channel></rss>\n"
    )


def sitemap(entries):
    def alt_links(alts):
        return "".join(f'<xhtml:link rel="alternate" hreflang="{hl}" href="{xml_escape(h)}"/>' for hl, h in alts)
    body = "".join(
        f"<url><loc>{xml_escape(u)}</loc>{f'<lastmod>{d}</lastmod>' if d else ''}{alt_links(a)}</url>"
        for u, d, a in entries
    )
    return (
        '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" '
        'xmlns:xhtml="http://www.w3.org/1999/xhtml">' + body + "</urlset>\n"
    )


REDIRECTS = """# Old Next.js URLs
/posts /blog/ 301
/posts/ /blog/ 301
/post/:slug /blog/:slug/ 301
/tags/:tag /blog/?tag=:tag 301
/about / 301
/about/ / 301
"""

HEADERS = """/assets/*
  Cache-Control: public, max-age=31536000, immutable
/posts/*
  Cache-Control: public, max-age=300
/*.md
  Content-Type: text/markdown; charset=utf-8
/site.webmanifest
  Content-Type: application/manifest+json
"""


# ---------- build ----------

def build():
    published, drafts = load_posts()
    drafts_l = drafts_by_lang(drafts)
    ver = asset_version()
    if os.path.exists(DIST):
        shutil.rmtree(DIST)
    os.makedirs(os.path.join(DIST, "assets"))
    for name in ASSETS:
        shutil.copy(os.path.join(SITE, "assets", name), os.path.join(DIST, "assets", name))
    os.makedirs(os.path.join(DIST, "posts"))
    for p in published:
        for suffix in [".md"] + ([".pt.md"] if "pt" in p["langs"] else []):
            shutil.copy(os.path.join(SITE, "posts", p["slug"] + suffix), os.path.join(DIST, "posts", p["slug"] + suffix))
    write("posts/index.json", json.dumps(published, ensure_ascii=False, indent=2) + "\n")
    write("feed.xml", rss(published))
    write("robots.txt", f"User-agent: *\nAllow: /\nDisallow: /v/\nDisallow: /pt-BR/v/\nSitemap: {SITE_URL}/sitemap.xml\n")
    write("_redirects", REDIRECTS)
    write("_headers", HEADERS)
    for name in ICONS:
        shutil.copy(os.path.join(SITE, "icons", name), os.path.join(DIST, name))
    write("site.webmanifest", json.dumps({
        "name": "Marcos Kuchak",
        "short_name": "Kuchak.",
        "start_url": "/",
        "display": "browser",
        "background_color": "#ffffff",
        "theme_color": "#1b202b",
        "icons": [
            {"src": "/icon-192.png", "sizes": "192x192", "type": "image/png"},
            {"src": "/icon-512.png", "sizes": "512x512", "type": "image/png"},
            {"src": "/icon-maskable-512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable"},
        ],
    }, indent=2) + "\n")

    def read(name):
        return open(os.path.join(SITE, "versions", name), encoding="utf-8").read()

    def url(lang, rest):
        return SITE_URL + LANGS[lang]["prefix"] + rest

    def alternates(rest, langs=None):
        langs = langs or list(LANGS)
        alts = [(LANGS[l]["hreflang"], url(l, rest)) for l in langs]
        return alts + [("x-default", url("en", rest))]

    sitemap_entries = []
    newest = published[0]["date"] if published else None

    for lang, L in LANGS.items():
        T = CONFIG["meta"][lang]
        prefix = L["prefix"]

        def emit(x, version_base, official):
            base = prefix + version_base
            rest_home = version_base
            indexable = official
            home_meta = {"title": T["title"], "description": T["description"], "canonical": url(lang, "/"), "image": CONFIG["image"]}
            write(base + "index.html", transform(read(f"variant-{x}.html"), x, base, "landing", lang, drafts_l, ver, home_meta,
                                                x, indexable=indexable, alternates=alternates(rest_home) if official else ()))
            bx = blog_source(x)
            tpl = read(f"blog-{bx}.html")
            # A blog borrowed from another version links "home" to this version's landing.
            if bx != x:
                tpl = tpl.replace(f"variant-{bx}.html", base)
            blog_meta = {"title": T["blogTitle"], "description": T["blogDescription"], "canonical": url(lang, "/blog/"), "image": CONFIG["image"]}
            write(base + "blog/index.html", transform(tpl, bx, base, "blog", lang, drafts_l, ver, blog_meta, x,
                                                      indexable=indexable, alternates=alternates("/blog/") if official else ()))
            for p in published:
                loc = localized(p, lang)
                translated = lang == "en" or lang in p["langs"]
                canonical = url(lang if translated else "en", f"/blog/{p['slug']}/")
                meta = {"title": f"{loc['title']} · Marcos Kuchak", "description": loc["description"], "canonical": canonical,
                        "image": p["cover"] or CONFIG["image"]}
                langs = p["langs"]
                write(f"{base}blog/{p['slug']}/index.html",
                      transform(tpl, bx, base, "post", lang, drafts_l, ver, meta, x, slug=p["slug"],
                                indexable=official and translated,
                                alternates=alternates(f"/blog/{p['slug']}/", langs) if official and translated else ()))
            if official:
                nf = dict(blog_meta, title=T["notFound"])
                write(f"{prefix}/404.html", transform(tpl, bx, base, "404", lang, drafts_l, ver, nf, x, force_post="__not-found__"))
                sitemap_entries.append((url(lang, "/"), None, alternates("/")))
                sitemap_entries.append((url(lang, "/blog/"), newest, alternates("/blog/")))
                for p in published:
                    if lang == "en" or lang in p["langs"]:
                        sitemap_entries.append((url(lang, f"/blog/{p['slug']}/"), p.get("updated") or p["date"],
                                                alternates(f"/blog/{p['slug']}/", p["langs"])))

        emit(OFFICIAL, "/", True)
        for x in VERSIONS:
            emit(x, f"/v/{x}/", False)

    write("sitemap.xml", sitemap(sitemap_entries))
    return published, drafts


if __name__ == "__main__":
    published, drafts = build()
    print(f"dist/ built: official={OFFICIAL}, {len(published)} posts, {len(drafts)} drafts, "
          f"{len(VERSIONS)} versions, languages={','.join(LANGS)}", file=sys.stderr)
