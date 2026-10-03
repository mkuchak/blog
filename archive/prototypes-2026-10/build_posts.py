"""
PROTOTYPE, throwaway. Builds the blog index from static markdown files.

Posts live in posts/<slug>.md with YAML-ish front matter:

    ---
    topic: "Domain-Driven Design"
    title: "My post"
    description: "One or two sentences."
    cover: "https://... or posts/assets/<slug>/cover.png"
    date: 2024-02-08
    tags: ["TypeScript", "DDD"]
    draft: false          # optional, true hides the post
    ---

An optional Portuguese translation sits next to it as posts/<slug>.pt.md
(its front matter overrides title/description/topic for PT readers).

Outputs posts/index.json (newest first) and feed.xml (RSS). serve.py runs this
on every request, so locally you just drop a file and refresh. For a static
deploy, run `python3 build_posts.py` as the build command.
"""

import json
import os
import re
import sys
from datetime import datetime, timezone
from email.utils import format_datetime
from xml.sax.saxutils import escape

ROOT = os.path.dirname(os.path.abspath(__file__))
POSTS = os.path.join(ROOT, "posts")
SITE = "https://kuch.dev"
BLOG_PAGE = "blog-e.html"  # used for RSS links in the prototype


def parse_front_matter(text):
    text = text.replace("\r\n", "\n")
    m = re.match(r"^---\n(.*?)\n---\n?(.*)$", text, re.S)
    if not m:
        return {}, text
    meta = {}
    for line in m.group(1).split("\n"):
        if not line.strip() or line.lstrip().startswith("#") or ":" not in line:
            continue
        key, raw = line.split(":", 1)
        raw = re.sub(r"\s+#.*$", "", raw.strip()) if not raw.strip().startswith(("'", '"', "[")) else raw.strip()
        meta[key.strip()] = parse_value(raw)
    return meta, m.group(2)


def parse_value(raw):
    if raw.startswith("["):
        try:
            return json.loads(raw)
        except ValueError:
            return [v.strip().strip("'\"") for v in raw.strip("[]").split(",") if v.strip()]
    if len(raw) >= 2 and raw[0] == raw[-1] and raw[0] in "'\"":
        return raw[1:-1]
    if raw in ("true", "false"):
        return raw == "true"
    return raw


def words(body):
    body = re.sub(r"```.*?```", " ", body, flags=re.S)
    body = re.sub(r"<[^>]+>", " ", body)
    return len(re.findall(r"\w+", body))


def build():
    entries = []
    files = sorted(f for f in os.listdir(POSTS) if f.endswith(".md") and not f.endswith(".pt.md"))
    for f in files:
        slug = f[:-3]
        with open(os.path.join(POSTS, f), encoding="utf-8") as fh:
            meta, body = parse_front_matter(fh.read())
        if meta.get("draft") is True:
            continue
        entry = {
            "slug": slug,
            "title": meta.get("title", slug),
            "description": meta.get("description", ""),
            "topic": meta.get("topic", ""),
            "cover": meta.get("cover", ""),
            "date": str(meta.get("date", "")),
            "updated": str(meta.get("updated", "")) or None,
            "tags": meta.get("tags", []) or [],
            "readingMinutes": max(1, round(words(body) / 220)),
            "langs": ["en"],
            "i18n": {},
        }
        pt = os.path.join(POSTS, slug + ".pt.md")
        if os.path.exists(pt):
            with open(pt, encoding="utf-8") as fh:
                pmeta, pbody = parse_front_matter(fh.read())
            entry["langs"].append("pt")
            entry["i18n"]["pt"] = {
                k: pmeta[k] for k in ("title", "description", "topic", "tags") if k in pmeta
            }
            entry["i18n"]["pt"]["readingMinutes"] = max(1, round(words(pbody) / 220))
        entries.append(entry)
    entries.sort(key=lambda e: e["date"], reverse=True)
    return entries


def rss(entries):
    items = []
    for e in entries:
        try:
            dt = datetime.fromisoformat(e["date"]).replace(tzinfo=timezone.utc)
        except ValueError:
            dt = datetime.now(timezone.utc)
        link = f"{SITE}/{BLOG_PAGE}?post={e['slug']}"
        cats = "".join(f"<category>{escape(t)}</category>" for t in e["tags"])
        items.append(
            f"<item><title>{escape(e['title'])}</title><link>{link}</link><guid>{link}</guid>"
            f"<pubDate>{format_datetime(dt)}</pubDate><description>{escape(e['description'])}</description>{cats}</item>"
        )
    return (
        '<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0"><channel>'
        f"<title>Marcos Kuchak · Field notes</title><link>{SITE}</link>"
        "<description>Notes on AI agents, LLM systems and full-stack engineering.</description>"
        + "".join(items)
        + "</channel></rss>\n"
    )


def write():
    entries = build()
    index = json.dumps(entries, ensure_ascii=False, indent=2) + "\n"
    feed = rss(entries)
    with open(os.path.join(POSTS, "index.json"), "w", encoding="utf-8") as fh:
        fh.write(index)
    with open(os.path.join(ROOT, "feed.xml"), "w", encoding="utf-8") as fh:
        fh.write(feed)
    return index, feed


if __name__ == "__main__":
    index, _ = write()
    print(f"{len(json.loads(index))} posts → posts/index.json, feed.xml", file=sys.stderr)
