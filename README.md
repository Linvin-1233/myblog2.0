# myblog2.0

[English](./README.md) | [简体中文](./README.zh-CN.md)

A markdown-driven blog with a "blueprint / tech-poster" visual style. Built with
**Next.js 16 (App Router) + React 19 + TypeScript + Tailwind v4** and deployed on
Vercel. Content pages are statically prerendered at build time; a few Serverless
Functions (`/api/*`) power comments proxy, visitor geo and the author's live
location.

## Features

- **Markdown posts** — drop a `.md` file in `posts/`, rebuild, done.
- **Poster/blueprint UI** — animated blurred grid + satellite-orbit background,
  dark/light theme with no flash, JetBrains Mono for latin + system sans-serif
  for CJK.
- **Full pages** — home, post list (client pagination), post detail, tags, tag
  filter, yearly archive, about, a fuzzy **search** page (Fuse.js), and a **geo**
  page ("you & me": distance, timezones, device).
- **Sidebar navigation** — off-canvas drawer with active-route highlight.
- **Image lightbox** — click any in-post image to zoom, with its alt caption.
- **SEO** — per-page metadata, Open Graph / Twitter cards, `BlogPosting` JSON-LD,
  `sitemap.xml`, `robots.txt`, and an RSS `feed.xml`.
- **Comments** — optional Gitalk (GitHub-Issues based), with a China-friendly
  OAuth proxy (`/api/gitalk`).
- **Image optimization** — images in `posts/images/` are resized + compressed
  with `sharp` at build; width/height are injected to prevent layout shift.
- **Live author location (optional)** — an iOS Shortcut posts your phone GPS to
  `/api/location` (stored in Upstash Redis); the geo page shows it as `(LIVE)`.
- **Single config file** — `config.yml` holds site info, social links, about
  text, copyright, author location, and Gitalk settings.

## Requirements

- Node.js 20+
- npm

## Getting started

```bash
npm install
npm run dev        # http://localhost:3000
```

Preview a real production build locally (recommended before measuring perf —
`next dev` is much slower and not representative):

```bash
npm run build
npm start          # serves the optimized production build
```

## Commands

| Command | Description |
| --- | --- |
| `npm run dev` | Optimize images, then start the dev server. |
| `npm run build` | Optimize images, then build for production (`.next`). |
| `npm start` | Serve the production build. |
| `npm run lint` | Run ESLint (flat config). |

There is no typecheck script (`tsc` runs with `noEmit`) and no test setup.

## Writing a post

Create `posts/my-post.md`. The filename is the URL slug
(`my-post.md` -> `/posts/my-post/`).

```markdown
---
title: 文章标题
description: 用于列表与 SEO 的一句话摘要
date: 2026-03-01          # 建议加引号；不加会被 YAML 解析成 Date（已兼容）
updated: 2026-03-05       # optional
tags: [标签一, 标签二]     # array or "a, b" string
cover: /post-images/x.png # optional
draft: false             # true hides it in production builds
---

正文用 markdown 书写……
```

## Images

Put images in `posts/images/` (subfolders are fine) and reference them with the
`images/` prefix:

```markdown
![alt](images/photo.png)
```

At build time `scripts/optimize-images.mjs` resizes (max width 1600) and
compresses each image (keeping its original format/extension) into
`public/post-images/`, and writes a `manifest.json` of dimensions. The markdown
renderer rewrites `images/...` to `/post-images/...` and injects `width`/`height`
+ `loading="lazy"`. `public/post-images/` is generated and gitignored.

## Markdown support

CommonMark + GFM plus extensions (configured in `lib/markdown.ts`):

- GFM: tables, strikethrough, task lists, autolinks
- Fenced code with syntax highlighting (`highlight.js`)
- **Heading anchors** — auto `id` on headings (`marked-gfm-heading-id`)
- **Footnotes** (`marked-footnote`)
- **Math** — `$inline$` / `$$block$$` via KaTeX (`marked-katex-extension`)
- **Emoji shortcodes** — `:rocket:` → 🚀 (`marked-emoji` + `gemoji`)
- Raw HTML passes through (content is trusted; no runtime sanitization)

## Configuration (`config.yml`)

Site-wide content lives in `config.yml` at the repo root — no code changes needed:

```yaml
site:
  name: "LINVIN_1233"
  title: "LINVIN_1233 // 蓝图档案馆"
  description: "..."
  author: "Linvin"
  locale: "zh-CN"
  url: "https://blog.linvin.net"   # overridden by NEXT_PUBLIC_SITE_URL
  postsPerPage: 6
  latestCountOnHome: 4
copyright: "© {year} Linvin"
social:
  - label: "GITHUB_PROFILE"
    url: "https://github.com/Linvin-1233"
about: |
  你好！我是 Linvin……
location:                 # author base (geo page); timezone is always used
  city: "上海"
  country: "中国"
  lat: 31.2304
  lng: 121.4737
  timezone: "Asia/Shanghai"
gitalk:
  enable: false
  proxy: false
  repo: ""
  owner: ""
  admin: [""]
```

## Environment variables

Copy `.env.example` to `.env.local` (see that file for the full list):

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Canonical/OG/sitemap absolute URLs. |
| `NEXT_PUBLIC_GITALK_CLIENT_ID` / `_SECRET` | Gitalk OAuth app (client-side). |
| `KV_REST_API_URL` / `KV_REST_API_TOKEN` | Upstash Redis (auto-injected by Vercel) for live location. |
| `LOCATION_WRITE_SECRET` | Shared token the iOS Shortcut sends to write location. |

### Comments (Gitalk)

1. Create a GitHub repo to store the comment issues.
2. Create a GitHub OAuth App (callback URL = your site domain).
3. Set `NEXT_PUBLIC_GITALK_CLIENT_ID` / `NEXT_PUBLIC_GITALK_CLIENT_SECRET`
   (`.env.local` locally, Project Settings on Vercel).
4. In `config.yml` set `repo` / `owner` / `admin` and `enable: true`. Set
   `proxy: true` to route the OAuth token exchange through `/api/gitalk`
   (better reachability from mainland China).

> Gitalk ships `clientSecret` to the browser by design — env vars only keep it
> out of git, not out of the served site.

### Live author location (optional)

1. In Vercel, create an **Upstash Redis** store (injects `KV_REST_API_*`).
2. Add `LOCATION_WRITE_SECRET` (a random string) in Vercel env vars.
3. On your iPhone, build a **Shortcut**: Get Current Location → POST JSON
   `{"lat":…, "lng":…, "token":"<secret>"}` to
   `https://your-domain/api/location/`. Run it (manually or via automation).
4. The geo page reverse-geocodes the coords to city + timezone and shows `(LIVE)`.

## API routes (Serverless Functions)

| Route | Purpose |
| --- | --- |
| `GET /api/geo` | Visitor city/country/coords from Vercel edge headers. |
| `POST /api/gitalk` | Gitalk OAuth token-exchange proxy. |
| `GET/POST /api/location` | Read / write the author's live GPS location. |

## Deployment

Hosted on **Vercel** via native Git integration (no GitHub Action):

1. Import the repo — the Next.js preset is auto-detected.
2. Add the environment variables you need (at minimum `NEXT_PUBLIC_SITE_URL`).
3. Push to the main branch; Vercel builds and deploys. Content pages are
   statically prerendered; `/api/*` run as Serverless Functions on demand.

`vercel.json` only pins `framework: nextjs`. Do **not** set
`outputDirectory: out` — that bypasses the Next.js builder and breaks routing.

> To deploy to a plain static host instead, add `output: 'export'` back in
> `next.config.ts` — but the `/api/*` features (comments proxy, geo, live
> location) will not work without a server runtime.

## Project structure

```
app/            Routes + components (App Router)
  api/          geo · gitalk · location (Serverless Functions)
  components/   Poster UI, theme, sidebar, search, comments, lightbox, geo
  posts/[slug]/ Post detail (generateStaticParams + metadata + JSON-LD)
lib/            siteConfig (config.yml loader), posts, markdown, format
posts/          Markdown posts (+ posts/images/ for assets)
scripts/        optimize-images.mjs (build-time image pipeline)
config.yml      Site-wide configuration
```

## Tech stack

Next.js 16 · React 19 · TypeScript · Tailwind CSS v4 · marked (+ gfm-heading-id
/ footnote / katex / emoji) · highlight.js · KaTeX · gemoji · gray-matter ·
js-yaml · Fuse.js · tz-lookup · sharp · Gitalk · Upstash Redis
