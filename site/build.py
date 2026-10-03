"""
Builds kuch.dev into dist/ as a 100% static site (Python 3 standard library only).

    python3 site/build.py            # writes dist/
    python3 site/dev.py              # builds, serves dist/ on :4321, rebuilds on change

Source layout (site/):
    site.config.json     feature flag: "official" picks the version served at "/"
    versions/            variant-<x>.html landing pages, blog-<x>.html blog pages
    assets/              shared JS (content, prefs, switcher, blog engine)
    posts/<slug>.md      posts with front matter; "draft: true" = announced as coming up, not published
    posts/<slug>.pt.md   optional Portuguese version

Output (dist/):
    /                    official landing           /blog/            official blog
    /blog/<slug>/        official post (pre-rendered meta for search and link previews)
    /v/<x>/              every version, also reachable as /?v=<x>  (/v/<x>/blog/... when it has a blog)
    /posts/*             published markdown + index.json      /assets/*  shared JS
    feed.xml sitemap.xml robots.txt _redirects _headers 404.html
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
SITE_URL = CONFIG["siteUrl"].rstrip("/")
ASSETS = ["content.js", "prefs.js", "switcher.js", "blog.js"]

if OFFICIAL not in VERSIONS:
    sys.exit(f'site.config.json: "official" must be one of {", ".join(VERSIONS)}')
if not VERSIONS[OFFICIAL]["blog"]:
    with_blog = ", ".join(k for k, v in VERSIONS.items() if v["blog"])
    sys.exit(f'site.config.json: the official version needs a blog page (one of: {with_blog})')


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
            entry["langs"].append("pt")
            entry["i18n"]["pt"] = {k: pmeta[k] for k in ("title", "description", "topic", "tags") if k in pmeta}
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
    for lang in ("en", "pt"):
        items = []
        for d in drafts:
            tr = d["i18n"].get("pt", {}) if lang == "pt" else {}
            items.append({
                "slug": d["slug"],
                "title": tr.get("title", d["title"]),
                "topic": tr.get("topic", d["topic"]),
                "tags": tr.get("tags", d["tags"]),
                "published": False,
            })
        out[lang] = items
    return out


# ---------- html ----------

def asset_version():
    h = hashlib.sha1()
    for name in ASSETS:
        h.update(open(os.path.join(SITE, "assets", name), "rb").read())
    return h.hexdigest()[:10]


VERSION_SCRIPT = """<script>
/* ?v=<x> or ?version=<x> opens another version of the site (see site/site.config.json). */
(function () {
  var q = new URLSearchParams(location.search);
  var v = (q.get("v") || q.get("version") || "").toLowerCase().replace(/^version[\\s_-]*/, "");
  var all = %(versions)s, official = "%(official)s", page = %(page)s;
  if (!v || !all[v]) return;
  var base = v === official ? "/" : "/v/" + v + "/";
  var path = base;
  if (page.kind !== "landing" && all[v].blog) path = base + "blog/" + (page.slug ? page.slug + "/" : "");
  q.delete("v"); q.delete("version");
  if (path === location.pathname && !location.search.match(/[?&](v|version)=/)) return;
  var qs = q.toString();
  location.replace(path + (qs ? "?" + qs : "") + location.hash);
})();
</script>"""


def head_meta(title, description, url, image, kind, indexable, slug=None):
    tags = [
        f'<link rel="canonical" href="{html.escape(url)}" />',
        f'<meta name="description" content="{html.escape(description)}" />',
        f'<meta property="og:site_name" content="kuch.dev" />',
        f'<meta property="og:type" content="{"article" if kind == "post" else "website"}" />',
        f'<meta property="og:title" content="{html.escape(title)}" />',
        f'<meta property="og:description" content="{html.escape(description)}" />',
        f'<meta property="og:url" content="{html.escape(url)}" />',
        f'<meta property="og:image" content="{html.escape(image)}" />',
        '<meta name="twitter:card" content="summary_large_image" />',
        '<meta name="twitter:creator" content="@marcoskuchak" />',
        f'<link rel="alternate" type="application/rss+xml" title="Marcos Kuchak · Field notes" href="{SITE_URL}/feed.xml" />',
    ]
    if not indexable:
        tags.append('<meta name="robots" content="noindex" />')
    if slug:
        tags.append(f'<meta name="kuch-post" content="{html.escape(slug)}" />')
    return "\n    ".join(tags)


def transform(src, x, base, kind, drafts, ver, slug=None, meta=None, force_post=None):
    """Turn a prototype page into a deployable page living under `base`."""
    s = src
    official = base == "/"
    # Shared JS from /assets with cache busting.
    for name in ASSETS:
        s = s.replace(f'src="{name}"', f'src="/assets/{name}?v={ver}"')
    # Links to its own landing and blog.
    s = s.replace(f"variant-{x}.html", base).replace(f"blog-{x}.html", base + "blog/")
    # Remove meta the build owns.
    s = re.sub(r'\s*<meta name="description"[^>]*>', "", s)
    if meta:
        s = re.sub(r"<title>.*?</title>", f"<title>{html.escape(meta['title'])}</title>", s, count=1, flags=re.S)
    site = {"root": "/", "pretty": True, "production": True, "version": x, "official": OFFICIAL}
    if force_post:
        site["forcePost"] = force_post
    page = {"kind": kind, "slug": slug}
    versions = {k: {"blog": v["blog"]} for k, v in VERSIONS.items()}
    inject = [
        f"<script>window.KUCH_SITE = {json.dumps(site)};</script>",
        VERSION_SCRIPT % {"versions": json.dumps(versions), "official": OFFICIAL, "page": json.dumps(page)},
    ]
    if meta:
        inject.insert(0, head_meta(meta["title"], meta["description"], meta["url"], meta["image"], kind,
                                   indexable=official and kind != "404", slug=slug))
    s = re.sub(r"(<meta charset=\"utf-8\"\s*/?>)", lambda m: m.group(1) + "\n    " + "\n    ".join(inject), s, count=1)
    # Drafts announced as "coming up", localized at runtime.
    drafts_js = (
        "<script>window.KUCH_DRAFTS_ALL = " + json.dumps(drafts, ensure_ascii=False)
        + "; window.KUCH_DRAFTS = window.KUCH_DRAFTS_ALL[(window.KUCH && KUCH.lang) || \"en\"];</script>"
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


def sitemap(posts):
    urls = [(f"{SITE_URL}/", None), (f"{SITE_URL}/blog/", posts[0]["date"] if posts else None)]
    urls += [(f"{SITE_URL}/blog/{p['slug']}/", p.get("updated") or p["date"]) for p in posts]
    body = "".join(
        f"<url><loc>{u}</loc>{f'<lastmod>{d}</lastmod>' if d else ''}</url>" for u, d in urls
    )
    return f'<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">{body}</urlset>\n'


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
"""


# ---------- build ----------

def build():
    published, drafts = load_posts()
    drafts_l = drafts_by_lang(drafts)
    ver = asset_version()
    if os.path.exists(DIST):
        shutil.rmtree(DIST)
    os.makedirs(DIST)

    os.makedirs(os.path.join(DIST, "assets"))
    for name in ASSETS:
        shutil.copy(os.path.join(SITE, "assets", name), os.path.join(DIST, "assets", name))
    os.makedirs(os.path.join(DIST, "posts"), exist_ok=True)
    for p in published:
        for suffix in ([".md"] + ([".pt.md"] if "pt" in p["langs"] else [])):
            shutil.copy(os.path.join(SITE, "posts", p["slug"] + suffix), os.path.join(DIST, "posts", p["slug"] + suffix))
    write("posts/index.json", json.dumps(published, ensure_ascii=False, indent=2) + "\n")
    write("feed.xml", rss(published))
    write("sitemap.xml", sitemap(published))
    write("robots.txt", f"User-agent: *\nAllow: /\nDisallow: /v/\nSitemap: {SITE_URL}/sitemap.xml\n")
    write("_redirects", REDIRECTS)
    write("_headers", HEADERS)

    def read(name):
        return open(os.path.join(SITE, "versions", name), encoding="utf-8").read()

    def emit(x, base):
        official = base == "/"
        canon = SITE_URL + "/"
        landing_meta = {"title": CONFIG["title"], "description": CONFIG["description"], "url": canon, "image": CONFIG["image"]}
        write(base + "index.html", transform(read(f"variant-{x}.html"), x, base, "landing", drafts_l, ver, meta=landing_meta))
        if not VERSIONS[x]["blog"]:
            return
        tpl = read(f"blog-{x}.html")
        blog_meta = {
            "title": "Field notes · Marcos Kuchak",
            "description": "Long-form notes on AI agents, LLM systems and full-stack engineering.",
            "url": SITE_URL + "/blog/",
            "image": CONFIG["image"],
        }
        write(base + "blog/index.html", transform(tpl, x, base, "blog", drafts_l, ver, meta=blog_meta))
        for p in published:
            meta = {
                "title": f"{p['title']} · Marcos Kuchak",
                "description": p["description"],
                "url": f"{SITE_URL}/blog/{p['slug']}/",
                "image": p["cover"] or CONFIG["image"],
            }
            write(f"{base}blog/{p['slug']}/index.html", transform(tpl, x, base, "post", drafts_l, ver, slug=p["slug"], meta=meta))
        if official:
            nf = dict(blog_meta, title="Not found · Marcos Kuchak")
            write("404.html", transform(tpl, x, base, "404", drafts_l, ver, meta=nf, force_post="__not-found__"))

    emit(OFFICIAL, "/")
    for x in VERSIONS:
        emit(x, f"/v/{x}/")

    return published, drafts


if __name__ == "__main__":
    published, drafts = build()
    print(f"dist/ built: official={OFFICIAL}, {len(published)} posts, {len(drafts)} drafts, {len(VERSIONS)} versions", file=sys.stderr)
