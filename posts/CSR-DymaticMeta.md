---
title: 如何在CSR下做到动态meta
description: 这几天忙着维护OpenST官网，把档案馆稿件动态meta给搞上了，个人觉得这是一个很好的解决方案遂记录
date: 2026-04-10
tags: [笔记, Web开发]
---

[](#1-什么是CSR，SPA？ "1. 什么是CSR，SPA？")1\. 什么是CSR，SPA？
==================================================

**CSR** = 客户端渲染，也就是将各种js所绘制的html在用户设备上进行渲染  
**SPA** = 单页应用

[](#2-部署的工具 "2. 部署的工具")2\. 部署的工具
================================

*   vercel api
*   vercel本身

由于CSR+SPA本身的限制，通过前端js修改meta是明显不现实的。Meta 主要用于被搜索引擎和社交媒体读取，从而生成分享卡片。  
在 SPA 架构中，虽然我们可以用 `document.title = item.name` 来改变浏览器标签页的文字，但**社交媒体爬虫（Discord, QQ, Twitter）** 是不会运行 JavaScript 的，它们只会请求一次 HTML，并在几百毫秒内读取 `<meta>` 后直接结束。  
它们眼中的页面永远是 index.html 里的那几行死代码。如果直接分享 `archive.html?sub-xxx`，卡片永远只会显示“OpenST 档案馆”这个统一的标题。

一般情况下，这种用SSR是最轻松的方式，但是OpenST并不是SSR，而是纯正的CSR，我们无法在爬虫请求 HTML 之前完成 meta 的动态注入。对于已有的纯 CSR 项目，引入 SSG / ISR 往往意味着：

*   需要改造路由结构
*   需要构建流程参与数据生成
*   甚至需要迁移到框架（如 Next.js）

因此在实际项目中，成本接近于重构。

那问题很明显：**如何在CSR+SPA的情况下做到动态meta？**

> 以下操作基于vercel，如果你的站点部署于其他pages，操作也应该大同小异。如果站点部署于本地/其他服务器则仅供参考

[](#2-1-构建后端 "2.1 构建后端")2.1 构建后端
--------------------------------

假设database.json是这样的格式

```json
{  
"id": "Tom自出盒细雪展示",  
"name": "【1.17+】Tom 自出盒细雪展示",  
"author": "Unknown",  
"tags": [  
"自出盒展示",  
"细雪展示",  
"1.17+"  
],  
"description": "### 🚀 机器概览n- 核心功能: 一个使用 CUD 实现自出盒的潜影盒展示，其自出盒逻辑具备一定参考价值。\n- 适用版本: Java blahblahblah",  
"preview": "archive/Tom自出盒细雪展示/preview.webp",  
"filename": "Tom自出盒细雪展示.litematic",  
"sub_id": "sub-1772643835289"  
}
```
在项目根目录下，创建api文件夹，构建后端 API (/api/share.js)  
![文件目录](images/CSR-DymaticMeta/CSR1.png)

js的名称随你定，逻辑如下
```js
// 核心逻辑简述  
const item = database.find(i => i.sub_id === queryId);  
const html = `
  <head>  
    <meta property="og:title" content="${item.name}">  
    <meta property="og:image" content="${item.preview}">  
  </head>  
  <body>  
    <script>location.replace("/archive.html?${item.id}");</script>  
  </body>`;  
```
上面的逻辑是：爬虫默认无法检测js，所以如果有真人访问会立刻跳转到档案馆内部，而爬虫则是只拿到了meta，不会跳转。

然后在前端将链接复制改成指向api
```js
const shareLink = `https://openstmc.com/api/share?${item.sub_id}`;
```

[](#结语 "结语")结语
==============

通过这套 “诱饵 + 转发” 的逻辑，我们达成了以下功能：

*   不需要搭建复杂的 SSR环境。
*   用户点开卡片，API 瞬间跳转回 SPA，自动打开对应详情弹窗。
*   这种方式可以看作是一种**最小化 SSR**：  
    仅在服务端生成 meta，而页面本身仍然完全由 CSR 驱动。

如果你对MC存储技术感兴趣，欢迎来到OpenST！QQ群号：440138916，官网：[https://openstmc.com](https://openstmc.com/)