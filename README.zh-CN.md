# myblog2.0

[English](./README.md) | [简体中文](./README.zh-CN.md)

一个由 markdown 驱动、采用「蓝图 / 技术海报」视觉风格的静态博客。基于
**Next.js 16（App Router）+ React 19 + TypeScript + Tailwind v4**，部署于
Vercel。博客页面在构建期静态预渲染；Gitalk OAuth 代理以轻量 Serverless
Function 运行。

## 功能特性

- **Markdown 写作**——往 `posts/` 丢一个 `.md`，重新构建即可发布。
- **海报 / 蓝图风格**——带动画的网格 + 卫星轨道背景，深浅主题无闪烁切换；
  英文用 JetBrains Mono、中文回退系统 sans-serif。
- **完整页面**——首页、文章列表（客户端分页）、文章详情、标签、标签筛选、
  年度归档、关于，以及基于 Fuse.js 的**模糊搜索**页。
- **完善 SEO**——逐页 metadata、Open Graph / Twitter 卡片、`BlogPosting`
  结构化数据（JSON-LD）、`sitemap.xml`、`robots.txt`、RSS `feed.xml`。
- **评论**——可选的 Gitalk（基于 GitHub Issues），由配置开关控制。
- **图片优化**——`posts/images/` 中的图片在构建期用 `sharp` 压缩。
- **单一配置文件**——`config.yml` 集中管理站点信息、社交链接、关于文案、
  版权与 Gitalk 设置。

## 环境要求

- Node.js 20+
- npm

## 快速开始

```bash
npm install
npm run dev      # http://localhost:3000
```

预览静态产物：

```bash
npm run build    # 生成 out/
npx serve out    # 用 HTTP 服务器打开（不要直接双击 out/index.html）
```

> 导出产物使用绝对资源路径且 `trailingSlash: true`，必须通过 HTTP 服务器访问，
> 直接以 `file://` 方式打开会导致样式/脚本加载失败（页面变成黑白）。

## 命令

| 命令 | 说明 |
| --- | --- |
| `npm run dev` | 先优化图片，再启动开发服务器。 |
| `npm run build` | 先优化图片，再静态导出到 `out/`。 |
| `npm run lint` | 运行 ESLint（flat config）。 |

没有单独的类型检查脚本（`tsc` 以 `noEmit` 运行），也没有测试配置。

## 写一篇文章

新建 `posts/my-post.md`，文件名即 URL slug（`my-post.md` -> `/posts/my-post/`）。

```markdown
---
title: 文章标题
description: 用于列表与 SEO 的一句话摘要
date: 2026-03-01
updated: 2026-03-05      # 可选
tags: [标签一, 标签二]    # 数组或 "a, b" 字符串均可
cover: /post-images/x.png # 可选
draft: false             # true 时仅在生产构建中隐藏
---

正文用 markdown 书写……
```

## 图片

把图片放进 `posts/images/`（子目录随意），在 markdown 里用 `images/` 前缀引用：

```markdown
![描述](images/photo.png)
```

构建时 `scripts/optimize-images.mjs` 会把每张图压缩（保持原格式/扩展名）输出到
`public/post-images/`，渲染阶段再把 `images/...` 重写为 `/post-images/...`。
`public/post-images/` 是生成目录，已加入 `.gitignore`。

## 配置（`config.yml`）

站点级内容全部集中在仓库根的 `config.yml`，改这里即可，无需动代码：

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
gitalk:
  enable: false
  repo: ""
  owner: ""
  admin: [""]
```

`clientID` / `clientSecret` 来自环境变量（见 `.env.example`），不写进 `config.yml`，
因此不会进入 git。

### 评论（Gitalk）

启用评论的步骤：

1. 建一个用于存放评论 Issue 的 GitHub 仓库。
2. 建一个 GitHub OAuth App（回调地址填站点域名）。
3. 复制 `.env.example` 为 `.env.local`，填入
   `NEXT_PUBLIC_GITALK_CLIENT_ID` / `NEXT_PUBLIC_GITALK_CLIENT_SECRET`；
   Vercel 上则在 Project Settings 里添加同名变量。
4. 在 `config.yml` 设置 `repo` / `owner` / `admin` 并将 `enable` 设为 `true`。
   设置 `proxy: true` 可将 OAuth token 交换通过本站 `/api/gitalk` 端点中转，
   改善国内网络访问。

> Gitalk 仍会把 `clientSecret` 发到浏览器（其固有机制）——环境变量只是让它不进
> git 历史，并不能让它不出现在已上线的站点里。请使用仅用于该用途的 OAuth App。

## 部署

通过 **Vercel** 原生 Git 集成托管（无需 GitHub Action）：

1. 在 Vercel 导入本仓库——会自动识别为 Next.js 预设。
2. 添加环境变量 `NEXT_PUBLIC_SITE_URL`。若用评论，把两个
   `NEXT_PUBLIC_GITALK_*` 变量也加在这里。
3. 推送到主分支，Vercel 自动构建部署。博客页面静态预渲染，`/api/gitalk` 在
   评论组件需换取 OAuth token 时作为 Serverless Function 运行。

`vercel.json` 只固定了 `framework: nextjs`。**不要**设置 `outputDirectory: out`，
否则会绕过 Next.js 构建器、破坏路由。

## 目录结构

```
app/            路由与组件（App Router）
  components/   海报 UI、主题、侧边栏、搜索、评论
  posts/[slug]/ 文章详情（generateStaticParams + metadata + JSON-LD）
lib/            siteConfig（读 config.yml）、posts、markdown、format
posts/          markdown 文章（+ posts/images/ 存放图片）
scripts/        optimize-images.mjs（构建期图片压缩）
config.yml      站点级配置
```

## 技术栈

Next.js 16 · React 19 · TypeScript · Tailwind CSS v4 · marked + highlight.js ·
gray-matter · js-yaml · Fuse.js · sharp · Gitalk
