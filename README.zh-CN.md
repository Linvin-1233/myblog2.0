# myblog2.0

[English](./README.md) | [简体中文](./README.zh-CN.md)

一个由 markdown 驱动、采用「蓝图 / 技术海报」视觉风格的博客。基于
**Next.js 16（App Router）+ React 19 + TypeScript + Tailwind v4**，部署于
Vercel。内容页在构建期静态预渲染；少量 Serverless Function（`/api/*`）负责
评论代理、访客地理位置与作者实时位置。

## 功能特性

- **Markdown 写作**——往 `posts/` 丢一个 `.md`，重新构建即可发布。
- **海报 / 蓝图风格**——带动画的模糊网格 + 卫星轨道背景，深浅主题无闪烁切换；
  英文用 JetBrains Mono、中文回退系统 sans-serif。
- **完整页面**——首页、文章列表（客户端分页）、文章详情、标签、标签筛选、
  年度归档、关于、**模糊搜索**页（Fuse.js），以及**坐标**页（「你我之间」：
  直线距离、时区、设备）。
- **侧边栏导航**——抽屉式，带当前页高亮。
- **图片灯箱**——点击正文图片放大，并显示 alt 说明。
- **完善 SEO**——逐页 metadata、Open Graph / Twitter 卡片、`BlogPosting`
  JSON-LD、`sitemap.xml`、`robots.txt`、RSS `feed.xml`。
- **评论**——可选的 Gitalk（基于 GitHub Issues），带国内友好的 OAuth 代理
  （`/api/gitalk`）。
- **图片优化**——`posts/images/` 中的图片在构建期用 `sharp` 缩放 + 压缩，
  并注入 width/height 避免布局偏移。
- **作者实时位置（可选）**——iOS 快捷指令把手机 GPS POST 到 `/api/location`
  （存进 Upstash Redis），坐标页显示为 `(LIVE)`。
- **单一配置文件**——`config.yml` 管理站点信息、社交链接、关于文案、版权、
  作者所在地与 Gitalk 设置。

## 环境要求

- Node.js 20+
- npm

## 快速开始

```bash
npm install
npm run dev        # http://localhost:3000
```

本地预览真正的生产构建（测性能前建议这样做——`next dev` 慢得多、不具代表性）：

```bash
npm run build
npm start          # 提供优化后的生产构建
```

## 命令

| 命令 | 说明 |
| --- | --- |
| `npm run dev` | 先优化图片，再启动开发服务器。 |
| `npm run build` | 先优化图片，再构建生产版本（`.next`）。 |
| `npm start` | 提供生产构建。 |
| `npm run lint` | 运行 ESLint（flat config）。 |

没有单独的类型检查脚本（`tsc` 以 `noEmit` 运行），也没有测试配置。

## 写一篇文章

新建 `posts/my-post.md`，文件名即 URL slug（`my-post.md` -> `/posts/my-post/`）。

```markdown
---
title: 文章标题
description: 用于列表与 SEO 的一句话摘要
date: 2026-03-01          # 建议加引号；不加会被 YAML 解析成 Date（已兼容）
updated: 2026-03-05       # 可选
tags: [标签一, 标签二]     # 数组或 "a, b" 字符串均可
cover: /post-images/x.png # 可选
draft: false             # true 时仅在生产构建中隐藏
---

正文用 markdown 书写……
```

## 图片

把图片放进 `posts/images/`（子目录随意），用 `images/` 前缀引用：

```markdown
![描述](images/photo.png)
```

构建时 `scripts/optimize-images.mjs` 会缩放（最大宽度 1600）并压缩每张图
（保持原格式/扩展名）输出到 `public/post-images/`，同时写出尺寸清单
`manifest.json`。渲染阶段把 `images/...` 重写为 `/post-images/...`，并注入
`width`/`height` 与 `loading="lazy"`。`public/post-images/` 是生成目录，已
gitignore。

## Markdown 支持

CommonMark + GFM，外加扩展（在 `lib/markdown.ts` 配置）：

- GFM：表格、删除线、任务列表、自动链接
- 围栏代码块 + 语法高亮（`highlight.js`）
- **标题锚点**——标题自动生成 `id`（`marked-gfm-heading-id`）
- **脚注**（`marked-footnote`）
- **数学公式**——`$行内$` / `$$块级$$`，用 KaTeX（`marked-katex-extension`）
- **emoji 短码**——`:rocket:` → 🚀（`marked-emoji` + `gemoji`）
- 原始 HTML 透传（内容可信，不做运行时净化）

## 配置（`config.yml`）

站点级内容集中在仓库根的 `config.yml`，改这里即可，无需动代码：

```yaml
site:
  name: "LINVIN_1233"
  title: "LINVIN_1233 // 蓝图档案馆"
  description: "..."
  author: "Linvin"
  locale: "zh-CN"
  url: "https://blog.linvin.net"   # 会被 NEXT_PUBLIC_SITE_URL 覆盖
  postsPerPage: 6
  latestCountOnHome: 4
copyright: "© {year} Linvin"
social:
  - label: "GITHUB_PROFILE"
    url: "https://github.com/Linvin-1233"
about: |
  你好！我是 Linvin……
location:                 # 作者所在地（坐标页）；timezone 始终生效
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

## 环境变量

复制 `.env.example` 为 `.env.local`（完整列表见该文件）：

| 变量 | 用途 |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | canonical/OG/sitemap 的绝对链接。 |
| `NEXT_PUBLIC_GITALK_CLIENT_ID` / `_SECRET` | Gitalk OAuth 应用（前端使用）。 |
| `KV_REST_API_URL` / `KV_REST_API_TOKEN` | Upstash Redis（Vercel 自动注入），存实时位置。 |
| `LOCATION_WRITE_SECRET` | iOS 快捷指令写位置时携带的共享口令。 |

### 评论（Gitalk）

1. 建一个用于存放评论 Issue 的 GitHub 仓库。
2. 建一个 GitHub OAuth App（回调地址填站点域名）。
3. 设置 `NEXT_PUBLIC_GITALK_CLIENT_ID` / `NEXT_PUBLIC_GITALK_CLIENT_SECRET`
   （本地 `.env.local`，Vercel 在 Project Settings）。
4. 在 `config.yml` 设置 `repo` / `owner` / `admin` 并 `enable: true`。设
   `proxy: true` 可让 OAuth token 交换走 `/api/gitalk`，改善国内访问。

> Gitalk 会把 `clientSecret` 发到浏览器（其固有机制）——环境变量只是让它不进
> git，并不能让它不出现在已上线的站点里。

### 作者实时位置（可选）

1. 在 Vercel 创建 **Upstash Redis**（会注入 `KV_REST_API_*`）。
2. 在 Vercel 环境变量里加 `LOCATION_WRITE_SECRET`（一串随机字符串）。
3. iPhone 上建一个**快捷指令**：获取当前位置 → 以 JSON POST
   `{"lat":…, "lng":…, "token":"<口令>"}` 到
   `https://你的域名/api/location/`。手动或自动化运行。
4. 坐标页会把经纬度反查成城市 + 时区，并显示 `(LIVE)`。

## API 路由（Serverless Functions）

| 路由 | 用途 |
| --- | --- |
| `GET /api/geo` | 从 Vercel 边缘头取访客城市/国家/坐标。 |
| `POST /api/gitalk` | Gitalk OAuth token 交换代理。 |
| `GET/POST /api/location` | 读取 / 写入作者实时 GPS 位置。 |

## 部署

通过 **Vercel** 原生 Git 集成托管（无需 GitHub Action）：

1. 导入仓库——自动识别为 Next.js 预设。
2. 按需添加环境变量（至少 `NEXT_PUBLIC_SITE_URL`）。
3. 推送到主分支，Vercel 自动构建部署。内容页静态预渲染，`/api/*` 按需作为
   Serverless Function 运行。

`vercel.json` 只固定了 `framework: nextjs`。**不要**设置 `outputDirectory: out`，
否则会绕过 Next.js 构建器、破坏路由。

> 若想部署到纯静态服务器，在 `next.config.ts` 加回 `output: 'export'`——但
> `/api/*` 相关功能（评论代理、地理位置、实时位置）在无服务端运行时下将不可用。

## 目录结构

```
app/            路由与组件（App Router）
  api/          geo · gitalk · location（Serverless Functions）
  components/   海报 UI、主题、侧边栏、搜索、评论、灯箱、坐标
  posts/[slug]/ 文章详情（generateStaticParams + metadata + JSON-LD）
lib/            siteConfig（读 config.yml）、posts、markdown、format
posts/          markdown 文章（+ posts/images/ 存放图片）
scripts/        optimize-images.mjs（构建期图片流水线）
config.yml      站点级配置
```

## 技术栈

Next.js 16 · React 19 · TypeScript · Tailwind CSS v4 · marked（+ gfm-heading-id
/ footnote / katex / emoji）· highlight.js · KaTeX · gemoji · gray-matter ·
js-yaml · Fuse.js · tz-lookup · sharp · Gitalk · Upstash Redis
