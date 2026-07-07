import type { NextConfig } from "next";

// Why: Vercel 原生 Git 集成下，去掉 output:'export' 让 Vercel 使用 Next.js
// 构建器：有 generateStaticParams 的页面自动静态预渲染，API 路由作为
// Serverless Function 运行(Gitalk 代理需要活端点)。部署到纯静态服务器时
// 再加回 output:'export'。
const nextConfig: NextConfig = {
  // Why: 不用 Vercel 默认的图片优化，保持零后端依赖的静态兼容性。
  images: {
    unoptimized: true,
  },

  // Why: 服务器多按目录寻址(/posts/ -> /posts/index.html)，保证 SEO 链接一致。
  trailingSlash: true,
};

export default nextConfig;
