# myblog2.0

[English](./README.md) | [简体中文](./README.zh-CN.md)

A markdown-driven static blog with a "blueprint / tech-poster" visual style.
Built with **Next.js 16 (App Router) + React 19 + TypeScript + Tailwind v4**,
deployed on Vercel. Blog pages are statically prerendered at build time; the
Gitalk OAuth proxy lives as a lightweight Serverless Function.

## Features

- **Markdown posts** — drop a `.md` file in `posts/`, rebuild, done.
- **Poster/blueprint UI** — animated grid + satellite-orbit background, dark/light
  theme with no flash, JetBrains Mono for latin + system sans-serif for CJK.
- **Full pages** — home, post list (client pagination), post detail, tags, tag
  filter, yearly archive, about, and a fuzzy **search** page (Fuse.js).
- **SEO** — per-page metadata, Open Graph / Twitter cards, `BlogPosting` JSON-LD,
  `sitemap.xml`, `robots.txt`, and an RSS `feed.xml`.
- **Comments** — optional Gitalk (GitHub-Issues based), toggled from config.
- **Image optimization** — images in `posts/images/` are compressed with `sharp`
  at build time.
- **Single config file** — `config.yml` holds site info, social links, about text,
  copyright, and Gitalk settings.

## Requirements

- Node.js 20+
- npm

## Getting started

```bash
npm install
npm run dev      # http://localhost:3000
```

Preview the static export:

```bash
npm run build    # emits out/
npx serve out    # serve over HTTP (do NOT open out/index.html via file://)
```

> The export uses absolute asset paths and `trailingSlash: true`, so it must be
> served by an HTTP server, not opened directly from the filesystem.

## Commands

| Command | Description |
| --- | --- |
| `npm run dev` | Optimize images, then start the dev server. |
| `npm run build` | Optimize images, then static-export to `out/`. |
| `npm run lint` | Run ESLint (flat config). |

There is no typecheck script (`tsc` runs with `noEmit`) and no test setup.

## Writing a post

Create `posts/my-post.md`. The filename is the URL slug
(`my-post.md` -> `/posts/my-post/`).

```markdown
---
title: 文章标题
description: 用于列表与 SEO 的一句话摘要
date: 2026-03-01
updated: 2026-03-05      # optional
tags: [标签一, 标签二]    # array or "a, b" string
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

At build time `scripts/optimize-images.mjs` compresses each image (keeping its
original format/extension) into `public/post-images/`, and the renderer rewrites
`images/...` to `/post-images/...`. The `public/post-images/` folder is generated
and gitignored.

## Configuration (`config.yml`)

All site-wide content lives in `config.yml` at the repo root — no code changes
needed:

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
gitalk:
  enable: false
  repo: ""
  owner: ""
  admin: [""]
```

`clientID` / `clientSecret` come from environment variables (see `.env.example`),
not `config.yml`, so they stay out of git.

### Comments (Gitalk)

To enable comments:

1. Create a GitHub repository to store the comment issues.
2. Create a GitHub OAuth App (callback URL = your site domain).
3. Copy `.env.example` to `.env.local` and set
   `NEXT_PUBLIC_GITALK_CLIENT_ID` / `NEXT_PUBLIC_GITALK_CLIENT_SECRET`.
   On Vercel, add the same variables in Project Settings.
4. In `config.yml` set `repo` / `owner` / `admin` and `enable: true`.
   Set `proxy: true` to route the OAuth token exchange through the site's own
   `/api/gitalk` endpoint (better reachability from mainland China).

> Gitalk still ships `clientSecret` to the browser by design — env vars only keep
> it out of your git history, not out of the served site. Use an OAuth App scoped
> only to this purpose.

## Deployment

Hosted on **Vercel** via native Git integration (no GitHub Action):

1. Import the repo on Vercel — the Next.js preset is auto-detected.
2. Add environment variables `NEXT_PUBLIC_SITE_URL`, and if using Gitalk the two
   `NEXT_PUBLIC_GITALK_*` variables.
3. Push to the main branch; Vercel builds and deploys automatically.
   Blog pages are statically prerendered; `/api/gitalk` runs as a Serverless
   Function when the comment widget needs to exchange an OAuth token.

`vercel.json` only pins `framework: nextjs`.

## Project structure

```
app/            Routes + components (App Router)
  components/   Poster UI, theme, sidebar, search, comments
  posts/[slug]/ Post detail (generateStaticParams + metadata + JSON-LD)
lib/            siteConfig (config.yml loader), posts, markdown, format
posts/          Markdown posts (+ posts/images/ for assets)
scripts/        optimize-images.mjs (build-time image compression)
config.yml      Site-wide configuration
```

## Tech stack

Next.js 16 · React 19 · TypeScript · Tailwind CSS v4 · marked + highlight.js ·
gray-matter · js-yaml · Fuse.js · sharp · Gitalk
