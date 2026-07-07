import type { MetadataRoute } from "next";
import { getAllPostMeta, getAllTags } from "@/lib/posts";
import { siteConfig } from "@/lib/siteConfig";

// How: sitemap 无请求时数据，显式声明为静态，让其在构建期一次性生成。
export const dynamic = "force-static";

// Why: sitemap 帮助爬虫发现全部可索引页面。静态导出会在构建期把此文件渲染成
// sitemap.xml。URL 统一带尾斜杠以匹配 trailingSlash:true 的真实产物路径。
function toUrl(pathSegment: string): string {
  const clean = pathSegment.replace(/^\/|\/$/g, "");
  return clean ? `${siteConfig.url}/${clean}/` : `${siteConfig.url}/`;
}

export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getAllPostMeta();
  const tags = getAllTags();

  const staticEntries: MetadataRoute.Sitemap = [
    { url: toUrl("/"), changeFrequency: "weekly", priority: 1 },
    { url: toUrl("/posts"), changeFrequency: "weekly", priority: 0.9 },
    { url: toUrl("/search"), changeFrequency: "monthly", priority: 0.4 },
    { url: toUrl("/tags"), changeFrequency: "monthly", priority: 0.5 },
    { url: toUrl("/archive"), changeFrequency: "monthly", priority: 0.5 },
    { url: toUrl("/geo"), changeFrequency: "yearly", priority: 0.3 },
    { url: toUrl("/about"), changeFrequency: "yearly", priority: 0.3 },
  ];

  const postEntries: MetadataRoute.Sitemap = posts.map((post) => ({
    url: toUrl(`/posts/${post.slug}`),
    lastModified: post.updated ?? post.date,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  const tagEntries: MetadataRoute.Sitemap = tags.map(({ tag }) => ({
    url: toUrl(`/tags/${encodeURIComponent(tag)}`),
    changeFrequency: "monthly",
    priority: 0.4,
  }));

  return [...staticEntries, ...postEntries, ...tagEntries];
}
