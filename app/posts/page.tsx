import type { Metadata } from "next";
import { getAllPostMeta } from "@/lib/posts";
import { siteConfig } from "@/lib/siteConfig";
import { SectionLabel } from "../components/SectionLabel";
import { PostList } from "../components/PostList";

export const metadata: Metadata = {
  title: "全部文章",
  description: `${siteConfig.name} 的全部文章归档与分页浏览。`,
  alternates: { canonical: "/posts" },
};

// Why: 文章总列表页。数据在服务端读齐后交给客户端 PostList 做分页交互，
// 兼顾 SEO(全部链接进入 HTML)与 example 的翻页体验。
export default function PostsPage() {
  const posts = getAllPostMeta();

  return (
    <section className="relative pt-8">
      <SectionLabel>[SEC // PAYLOAD_MANIFEST]</SectionLabel>
      <div
        className="mb-8 flex items-end justify-between border-b border-poster-line
          pb-4"
      >
        <div>
          <span className="block text-[10px] tracking-widest text-poster-text-muted">
            {"// ENCRYPTED_ARCHIVE"}
          </span>
          <h1 className="text-xl font-extrabold uppercase text-poster-title">
            全部文章
          </h1>
        </div>
        <span className="text-xs font-bold text-poster-ice">
          TOTAL: {posts.length.toString().padStart(2, "0")}
        </span>
      </div>

      <PostList posts={posts} perPage={siteConfig.postsPerPage} />
    </section>
  );
}
