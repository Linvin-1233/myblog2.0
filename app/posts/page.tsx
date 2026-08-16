import type { Metadata } from "next";
import { getAllPostMeta } from "@/lib/posts";
import { siteConfig } from "@/lib/siteConfig";
import { PostList } from "../components/PostList";

export const metadata: Metadata = {
  title: "全部文章",
  description: `${siteConfig.name} 的全部文章归档与分页浏览。`,
  alternates: { canonical: "/posts" },
};

// Why: 文章总列表页(v7 编辑流)——标题 + 记录计数 + 行式分页列表。
export default function PostsPage() {
  const posts = getAllPostMeta();

  return (
    <div className="system-page system-subpage mx-auto w-full max-w-4xl px-4">
      <h1
        className="pt-10 text-3xl font-extrabold uppercase text-poster-title
          md:text-4xl"
      >
        全部文章
      </h1>
      <div className="mt-2 text-[10px] uppercase tracking-widest
        text-poster-text-muted">
        {"// "}
        {posts.length.toString().padStart(2, "0")} RECORDS
      </div>

      <div className="mt-8">
        <PostList posts={posts} perPage={siteConfig.postsPerPage} />
      </div>
    </div>
  );
}
