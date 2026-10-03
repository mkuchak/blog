# kuch.dev

Personal site and blog of Marcos Kuchak. 100% static: plain HTML, CSS and JavaScript built
from markdown files by a small Python script (standard library only), deployed on Cloudflare Pages.

## Layout

```
site/
  site.config.json   feature flag: which version is the official one at kuch.dev
  versions/          landing pages (variant-a … variant-f) and blog pages (blog-e, blog-f)
  assets/            shared JS: content (EN/PT copy), prefs (theme/language), blog engine, switcher
  posts/             blog posts as markdown (see below)
  build.py           builds dist/
  dev.py             local preview with rebuild on change
archive/
  v1-nextjs-2024/    the previous Next.js site, kept as it was
  prototypes-2026-10/ the six landing prototypes and blogs as first built (run: python3 archive/prototypes-2026-10/serve.py)
```

## Run it

```bash
pnpm dev     # or: python3 site/dev.py   → http://localhost:4321
pnpm build   # or: python3 site/build.py → dist/
```

## Switch the official version (feature flag)

`site/site.config.json` → `"official": "e"`. Change it to `"f"`, commit and push to `main`;
Cloudflare Pages rebuilds and kuch.dev serves F. The official version must have a blog (E or F).

Every version stays reachable:

| URL | What |
|---|---|
| `kuch.dev/` | official version (E) |
| `kuch.dev/?v=f` or `?version=f` | version F (works on `/blog/` and post pages too) |
| `kuch.dev/?v=a` … `?v=d` | the other versions |
| `kuch.dev/v/<x>/` | direct path the `?v=` parameter redirects to |

Only the official version is indexed by search engines; `/v/*` pages are `noindex`.

## Posts

One file per post in `site/posts/<slug>.md`. The file name is the URL: `kuch.dev/blog/<slug>/`.

```markdown
---
topic: "AI Agents"
title: "Confidence gates: letting agents act alone without losing sleep"
description: "One or two sentences for the list and link previews."
cover: "https://… or /assets/… image"
date: 2026-10-03
tags: ["Agents", "LLM"]
draft: false
---

Markdown body (GitHub-flavored: tables, code fences, <details>, …).
```

- `draft: true` lists the post under "Coming up" without publishing it (no body needed, no date needed).
- `site/posts/<slug>.pt.md` is the optional Portuguese version; without it, Portuguese readers get
  the English post with a short notice.
- Published posts need a `date`. The build generates `posts/index.json`, `feed.xml` and `sitemap.xml`.

Old Next.js URLs (`/post/<slug>`, `/posts`, `/tags/<tag>`, `/about`) redirect to the new ones (`dist/_redirects`).

## Deploy

Cloudflare Pages project `kuch-dev`, connected to this repository:
build command `python3 site/build.py`, output directory `dist`, production branch `main`.
Every push to `main` deploys.
