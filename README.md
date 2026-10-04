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
  icons/             favicon.svg (the source) and the PNG/ICO files rendered from it
  build.py           builds dist/
  dev.py             local preview with rebuild on change
  prerender.mjs      bakes rendered HTML into dist/ for SEO (headless Chrome)
  check.py           validates dist/: both languages per post, canonical/hreflang, anchors, sitemap, feeds
archive/
  v1-nextjs-2024/    the previous Next.js site, kept as it was
  prototypes-2026-10/ the six landing prototypes and blogs as first built (run: python3 archive/prototypes-2026-10/serve.py)
  favicon-2026-10/   the ten favicon proposals (run: python3 -m http.server -d archive/favicon-2026-10 4322)
```

## Run it

```bash
npm install          # once (Node 24, see .nvmrc; playwright-core for the pre-render step)
npm run dev          # python3 site/dev.py → http://localhost:4321, rebuilds on change
npm run build        # build + pre-render + check into dist/ (needs Chrome; set CHROME_PATH if not found)
npm run build:fast   # build only, no pre-render
npm run check        # python3 site/check.py --strict: validates dist/ (what CI runs)
npm test             # node site/e2e.mjs: browser checks for theme and language preferences
```

## Versions and the feature flag

Six versions of the site live side by side: A (agent runtime), B (terminal OS), C (editorial),
D (observability), E (editorial + runtime) and F (runtime + editorial).

`site/site.config.json` → `"official": "e"` picks the one served at `kuch.dev/`. Any of `a`–`f` works.
E and F have their own blog; for A–D, `/blog/` uses the blog of `"blogFallback"` (E).
Change the flag, commit (`feat:` or `fix:`) and push to `main` to redeploy.

Every version stays reachable from any page:

| URL | What |
|---|---|
| `kuch.dev/` | official version (E) |
| `kuch.dev/?v=f`, `?version=F`, `?version=version-f` | version F (also on `/blog/` and post pages) |
| `kuch.dev/?v=a` … `?v=d` | the other versions |
| `kuch.dev/v/<x>/` | where the `?v=` parameter lands |

Only the official version is indexed by search engines; `/v/*` pages are `noindex`.

## Favicon

The "K." mark (proposal 01 in `archive/favicon-2026-10`). `site/icons/favicon.svg` is the source; after editing it,
run `node site/icons/render.mjs` to redraw `favicon.ico` (16/32/48), `apple-touch-icon.png` (180),
`icon-192.png`, `icon-512.png` and `icon-maskable-512.png`, and commit them. The build copies them to the site root
and writes `site.webmanifest`; every page links them.

## Theme

Light, dark or system, from the switch in the header. Until the visitor picks one, every version follows
the operating system (and switches live when the OS does). A pick is saved and wins from then on.

## Languages

English lives at `/`, Portuguese at `/pt-BR/`, with the same paths underneath
(`/pt-BR/blog/<slug>/`, `/pt-BR/?v=f`). Every page declares `hreflang` alternates (English is `x-default`).

- On an English page, a visitor is redirected to the `/pt-BR/` equivalent when the first supported language in their
  browser's list is Portuguese (`pt-BR`, `pt-PT`, `pt`). `es-ES, pt-BR` → Portuguese; `en-US, pt-BR` → English.
- The EN/PT switch in the header moves to the same page in the other language and remembers the choice,
  which then wins over the browser language. `?lang=en` / `?lang=pt` force a language once and remember it.
- A `/pt-BR/` link is never redirected, so shared links open as sent.

## Posts

One file per post in `site/posts/<slug>.md`. The file name is the URL: `kuch.dev/blog/<slug>/`.

```markdown
---
topic: "AI Agents"
title: "Confidence gates: letting agents act alone without losing sleep"
description: "One or two sentences for the list and link previews."
cover: "https://… image URL"
date: 2026-10-03
tags: ["Agents", "LLM"]
draft: false
---

Markdown body (GitHub-flavored: tables, code fences with a language or a file name, <details>, …).
```

- `draft: true` lists the post under "Coming up" without publishing it (no body or date needed).
- `site/posts/<slug>.pt.md` is the Portuguese version (same front matter, translated title, description, topic, tags;
  `cover` and `date` stay the same). Every published post needs one: `check.py --strict` (CI) fails without it.
  Drafts can stay title-only in both languages.
- In-page links use GitHub-style heading ids (`## Creating the X` → `#creating-the-x`, accents kept);
  the check fails when a `](#anchor)` has no matching heading.
- The build generates `posts/index.json`, `feed.xml` (RSS) and `sitemap.xml`, and pre-renders every indexable page
  so crawlers and link previews get the full text without JavaScript.

Old Next.js URLs (`/post/<slug>`, `/posts`, `/tags/<tag>`, `/about`) redirect to the new ones.

## Release and deploy

All workflows run on Node 24 (`.nvmrc`) with the Node 24 releases of every action.

`.github/workflows/ci.yml`, on pull requests and pushes to other branches: build, pre-render and
`check.py --strict` and the browser preference checks exactly like a deploy, plus a Conventional Commits
check on the PR's commits.

`.github/workflows/release-deploy.yml`, on every push to `main`:

1. **Release.** semantic-release reads the Conventional Commits since the last tag. `feat` → minor,
   `fix` / `perf` / `revert` → patch, `BREAKING CHANGE` → major. It tags `vX.Y.Z` and publishes a GitHub release
   with notes. Other types (`chore`, `docs`, `style`, `refactor`, `ci`, `test`) don't release.
2. **Deploy** when a release was cut, **or** when anything in `site/posts/` changed (any commit type),
   or when the workflow is run by hand (Actions → Release and deploy → Run workflow).
   It builds, pre-renders, runs `check.py --strict`, writes `dist/version.json` and pushes `dist/` to the
   `production` branch, then waits until `https://kuch.dev/version.json` reports the commit and smoke-tests
   every page and post in both languages.
3. Cloudflare Pages (project `kuch-dev`) serves the `production` branch as-is (no build step on Cloudflare).
   Roll back from the Cloudflare dashboard (Deployments → Rollback) or by reverting on `main`.
