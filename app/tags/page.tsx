import type { Metadata } from "next";
import Link from "next/link";
import { getAllTags } from "@/lib/posts";

export const metadata: Metadata = {
  title: "标签",
  description: "按标签浏览全部文章主题。",
  alternates: { canonical: "/tags" },
};

// Why: 标签总览页(v7 编辑流)——标题 + 纯文本标签链接(带计数)，无面板。
export default function TagsPage() {
  const tags = getAllTags();

  return (
    <div className="system-page system-subpage mx-auto w-full max-w-4xl px-4">
      <h1
        className="pt-10 text-3xl font-extrabold uppercase text-poster-title
          md:text-4xl"
      >
        标签
      </h1>
      <div className="mt-2 text-[10px] uppercase tracking-widest
        text-poster-text-muted">
        {"// "}
        {tags.length.toString().padStart(2, "0")} TOPICS
      </div>

      {tags.length === 0 ? (
        <p className="mt-8 text-xs text-poster-text-muted">暂无标签</p>
      ) : (
        <div className="mt-8 flex flex-wrap gap-3 border-y border-poster-line
          bg-poster-panel/25 py-5">
          {tags.map(({ tag, slug, count }) => (
            <Link
              key={slug}
              href={`/tags/${encodeURIComponent(slug)}`}
              className="border-2 border-poster-line px-4 py-3 text-xs font-bold
                uppercase tracking-wider text-poster-text-bright transition-colors
                hover:border-poster-ice hover:bg-poster-ice hover:text-poster-bg"
            >
              #{tag}
              <span className="ml-1.5 text-[10px] text-poster-text-muted">
                {count.toString().padStart(2, "0")}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
