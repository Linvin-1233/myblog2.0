import type { NextConfig } from "next";

// Why: 博客要交付到任意静态服务器(用户的自定义服务器)，而非 Node 运行时，
// 因此用 output:'export' 让 `next build` 产出纯 HTML/CSS/JS 的 `out/` 目录。
const nextConfig: NextConfig = {
  output: "export",

  // How: 静态导出下默认的图片优化器需要服务器，无法使用；
  // unoptimized 让 <Image> 直接输出原图，保持零后端依赖。
  images: {
    unoptimized: true,
  },

  // Why: 目标服务器多按目录寻址(/posts/ -> /posts/index.html)，
  // 尾斜杠能避免部署后链接 404，并让 sitemap/规范链接保持一致。
  trailingSlash: true,
};

export default nextConfig;
