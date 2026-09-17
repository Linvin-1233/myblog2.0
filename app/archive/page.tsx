import type { Metadata } from "next";
import Link from "next/link";
import { getPostsGroupedByYear } from "@/lib/posts";
import { formatDate, padIndex } from "@/lib/format";
import { PageHeader } from "../components/PageHeader";

export const metadata: Metadata = {
  title: "归档",
  description: "按年份浏览全部文章的时间线归档。",
  alternates: { canonical: "/archive" },
};

// Why: 归档页——年份巨型数字 + 编号时间线，每行等宽日期与压缩体标题。
export default function ArchivePage() {
  const groups = getPostsGroupedByYear();
  const total = groups.reduce((sum, group) => sum + group.posts.length, 0);

  return (
    <div className="shell pb-20">
      <PageHeader
        index="03"
        kicker="TIMELINE // BY YEAR"
        title="归档"
        meta={[
          { label: "RECORDS", value: padIndex(total) },
          { label: "YEARS", value: padIndex(groups.length) },
        ]}
      />

      {groups.length === 0 ? (
        <p className="mt-10 font-mono text-xs tracking-[0.2em] text-poster-text-muted">
          &gt; NO_RECORDS
        </p>
      ) : (
        <div className="mt-10 space-y-14">
          {groups.map(({ year, posts }) => (
            <section key={year}>
              <div className="flex items-end gap-4 border-b-2 border-poster-line pb-3">
                <span className="type-display text-5xl text-poster-ice md:text-6xl">
                  {year}
                </span>
                <span
                  className="mb-1 font-mono text-[10px] uppercase
                    tracking-[0.24em] text-poster-text-muted"
                >
                  {padIndex(posts.length)} RECORDS
                </span>
                <span
                  aria-hidden="true"
                  className="hatch mb-2 ml-auto hidden h-2 w-32
                    text-poster-ice/50 md:block"
                />
              </div>

              <div>
                {posts.map((post, index) => (
                  <Link
                    key={post.slug}
                    href={`/posts/${post.slug}`}
                    className="group grid grid-cols-[2rem_minmax(0,1fr)]
                      items-baseline gap-x-3 border-b-2 border-poster-line px-2
                      py-4 transition-colors hover:bg-poster-ice/5
                      md:grid-cols-[3rem_7rem_minmax(0,1fr)_auto] md:gap-x-6
                      md:px-4"
                  >
                    <span className="font-mono text-[10px] text-poster-ice/60">
                      {padIndex(index + 1)}
                    </span>
                    <time
                      dateTime={post.date}
                      className="hidden font-mono text-[10px] uppercase
                        tracking-[0.16em] text-poster-text-muted md:block"
                    >
                      {formatDate(post.date)}
                    </time>
                    <span
                      className="type-condensed truncate text-xl uppercase
                        text-poster-title transition-colors
                        group-hover:text-poster-ice"
                    >
                      {post.title}
                    </span>
                    <span
                      className="col-start-2 mt-1 font-mono text-[10px]
                        text-poster-text-muted md:col-start-4 md:mt-0
                        md:text-poster-ice/70"
                    >
                      {padIndex(post.readingMinutes)} MIN
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
