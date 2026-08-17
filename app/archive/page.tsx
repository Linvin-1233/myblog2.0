import type { Metadata } from "next";
import Link from "next/link";
import { getPostsGroupedByYear } from "@/lib/posts";
import { formatDate } from "@/lib/format";

export const metadata: Metadata = {
  title: "归档",
  description: "按年份浏览全部文章的时间线归档。",
  alternates: { canonical: "/archive" },
};

// Why: 归档页(v7 编辑流)——年份 + 行式时间线，细线分隔，无面板。
export default function ArchivePage() {
  const groups = getPostsGroupedByYear();

  return (
    <div className="system-page system-subpage mx-auto w-full max-w-4xl px-4">
      <h1
        className="pt-10 text-3xl font-extrabold uppercase text-poster-title
          md:text-4xl"
      >
        归档
      </h1>
      <div className="mt-2 text-[10px] uppercase tracking-widest
        text-poster-text-muted">
        {"// TIMELINE"}
      </div>

      {groups.length === 0 ? (
        <p className="mt-8 text-xs text-poster-text-muted">暂无文章</p>
      ) : (
        <div className="mt-8 space-y-10">
          {groups.map(({ year, posts }) => (
            <div key={year} className="border-l border-poster-line bg-poster-panel/20
              p-4 md:p-6">
              <div className="text-4xl font-extrabold text-poster-ice/80">
                {year}
              </div>
              <div className="mt-3 border-t border-poster-line">
                {posts.map((post) => (
                  <Link
                    key={post.slug}
                    href={`/posts/${post.slug}`}
                    className="group grid grid-cols-[auto_1fr] items-baseline
                      gap-4 border-b border-poster-line px-2 py-4"
                  >
                    <time
                      dateTime={post.date}
                      className="text-[11px] font-bold
                        text-poster-text-muted"
                    >
                      {formatDate(post.date)}
                    </time>
                    <span
                      className="truncate text-sm font-extrabold uppercase
                        tracking-wide text-poster-title transition-colors
                        group-hover:text-poster-ice"
                    >
                      {post.title}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
