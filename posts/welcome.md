---
title: 欢迎来到Linvin的新博客
description: 这个博客如何工作——从 markdown 到静态 HTML 的自动化流程。
date: 2026-07-06
tags: [公告, Web开发]
---

## 关于本站

这是一个用 **Next.js 静态导出** 构建的博客。每篇文章都是 `posts/` 目录下的一个
`.md` 文件，Vercel 原生 Git 集成托管在每次推送时自动把它们编译成静态 HTML。

## 怎么写一篇文章

1. 在 `posts/` 下新建 `my-post.md`
2. 顶部写好 frontmatter（`title` / `date` / `tags` 等）
3. 用 markdown 写正文
4. 推送到仓库，CI 会自动构建并部署

> 文件名会成为文章的 URL slug，例如 `hello-world.md` -> `/posts/hello-world`。

## 代码高亮

代码块会自动获得终端风格的语法高亮：

```ts
function greet(name: string): string {
  return `HELLO_${name.toUpperCase()}`;
}
```

尽情书写吧。

## 插入图片

把图片放进 `posts/images/`（子目录随意），在 markdown 里用 `images/` 前缀引用，
构建时会自动优化并输出到站点：

![示意图](images/demo.png)
