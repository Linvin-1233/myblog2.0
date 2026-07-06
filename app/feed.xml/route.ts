import { getAllPostMeta } from "@/lib/posts";
import { siteConfig } from "@/lib/siteConfig";

// Why: RSS 订阅是博客的标配。静态导出下 Route Handler 会在构建期渲染成
// 静态文件；force-static 明确声明其不依赖任何请求时数据，可安全预生成。
export const dynamic = "force-static";

// How: RSS 是 XML，标题/描述里的 & < > 等字符必须转义，否则订阅器解析失败。
function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function GET(): Response {
  const posts = getAllPostMeta();
  const items = posts
    .map((post) => {
      const link = `${siteConfig.url}/posts/${post.slug}/`;
      return `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${link}</link>
      <guid>${link}</guid>
      <pubDate>${new Date(post.date).toUTCString()}</pubDate>
      <description>${escapeXml(post.description)}</description>
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${escapeXml(siteConfig.title)}</title>
    <link>${siteConfig.url}/</link>
    <description>${escapeXml(siteConfig.description)}</description>
    <language>${siteConfig.locale}</language>
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
}
