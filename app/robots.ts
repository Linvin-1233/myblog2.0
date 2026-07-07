import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/siteConfig";

// How: robots 无请求时数据，显式声明为静态，让其在构建期一次性生成。
export const dynamic = "force-static";

// Why: 明确允许全站抓取并指向 sitemap，是搜索引擎收录的基础配置。
// 静态导出会把此文件渲染成 robots.txt。
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: `${siteConfig.url}/sitemap.xml`,
    host: siteConfig.url,
  };
}
