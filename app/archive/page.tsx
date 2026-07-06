import type { Metadata } from "next";
import Link from "next/link";
import { getPostsGroupedByYear } from "@/lib/posts";
import { formatDate } from "@/lib/format";
import { SectionLabel } from "../components/SectionLabel";

export const metadata: Metadata = {
  title: "归档",
  description: "按年份浏览全部文章的时间线归档。",
  alternates: { canonical: "/archive" },
};

// Why: 归档页提供按年份的紧凑时间线视图，便于快速定位历史文章。
export default function ArchivePage() {
  const groups = getPostsGroupedByYear();

  return (
    <section className="relative pt-8">
      <SectionLabel>[SEC // TIMELINE_ARCHIVE]</SectionLabel>
      <div className="mb-8 border-b border-poster-line pb-4">
        <span className="block text-[10px] tracking-widest text-poster-text-muted">
          {"// CHRONOLOGICAL_LOG"}
        </span>
        <h1 className="text-xl font-extrabold uppercase text-poster-title">
          归档
        </h1>
      </div>

      {groups.length === 0 ? (
        <p className="text-xs text-poster-text-muted">&gt; 暂无文章</p>
      ) : (
        <div className="space-y-10">
          {groups.map(({ year, posts }) => (
            <div key={year} className="grid grid-cols-1 gap-4 md:grid-cols-12">
              <div className="md:col-span-2">
                <span
                  className="text-3xl font-extrabold text-poster-ice
                    opacity-80"
                >
                  {year}
                </span>
              </div>
              <ul
                className="space-y-3 border-l border-poster-line pl-6
                  md:col-span-10"
              >
                {posts.map((post) => (
                  <li
                    key={post.slug}
                    className="flex flex-col gap-1 sm:flex-row sm:items-baseline
                      sm:gap-4"
                  >
                    <time
                      dateTime={post.date}
                      className="shrink-0 text-[11px] font-bold
                        text-poster-text-muted"
                    >
                      {formatDate(post.date)}
                    </time>
                    <Link
                      href={`/posts/${post.slug}`}
                      className="text-sm font-bold text-poster-text-bright
                        transition-colors hover:text-poster-ice"
                    >
                      {post.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
