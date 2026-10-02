import type { Metadata } from "next";
import Link from "next/link";
import {
  getAllTags,
  getPostsGroupedByYear,
  getSearchDocuments,
} from "@/lib/posts";
import { pageMetadata } from "@/lib/seo";
import { formatDate, padIndex } from "@/lib/format";
import { SearchClient } from "../components/SearchClient";
import { PageHeader } from "../components/PageHeader";

export const metadata: Metadata = pageMetadata({
  title: "全部文章",
  description: "搜索、标签与按年份归档的全部文章。",
  path: "/posts",
});

// Why: 分区抬头——用一块实色序号 + 发丝标签，把搜索/标签/时间线拆成三条脊柱。
function SectionHeading({ index, label }: { index: string; label: string }) {
  return (
    <div className="flex items-center gap-3 border-b-4 border-poster-line pb-3">
      <span
        className="border-2 border-poster-ice bg-poster-ice px-1.5 py-0.5
          font-mono text-[9px] uppercase tracking-[0.2em] text-poster-bg"
      >
        {index}
      </span>
      <span
        className="font-mono text-[10px] uppercase tracking-[0.24em]
          text-poster-text-muted"
      >
        {label}
      </span>
      <span
        aria-hidden="true"
        className="hatch ml-auto h-2 w-32 text-poster-ice/50"
      />
    </div>
  );
}

// Why: 文章页=单一集线器。搜索、标签、按年份时间线三段合一，
// 归档的年份巨型数字与编号时间线作为页面主体，标题改为「全部文章」。
export default function PostsPage() {
  const documents = getSearchDocuments();
  const tags = getAllTags();
  const groups = getPostsGroupedByYear();
  const total = groups.reduce((sum, group) => sum + group.posts.length, 0);
  const latest = groups[0]?.posts[0]?.date;

  return (
    <div className="shell pb-20">
      <PageHeader
        index="01"
        kicker="ARCHIVE // ALL RECORDS"
        title="全部文章"
        meta={[
          { label: "RECORDS", value: padIndex(total) },
          { label: "YEARS", value: padIndex(groups.length) },
          { label: "TOPICS", value: padIndex(tags.length) },
          { label: "LATEST", value: latest ? formatDate(latest) : "—" },
        ]}
      />

      <section className="mt-12">
        <SectionHeading index="01" label="SEARCH // FULL-TEXT" />
        <div className="mt-8">
          <SearchClient documents={documents} />
        </div>
      </section>

      <section className="mt-16">
        <SectionHeading index="02" label="TAXONOMY // TOPICS" />
        {tags.length === 0 ? (
          <p className="mt-8 font-mono text-xs tracking-[0.2em] text-poster-text-muted">
            &gt; NO_TOPICS
          </p>
        ) : (
          <div
            className="mt-8 flex snap-x gap-[2px] overflow-x-auto
              bg-poster-title [scrollbar-width:thin]"
          >
            {tags.map(({ tag, slug, count }, index) => (
              <Link
                key={slug}
                href={`/tags/${encodeURIComponent(slug)}`}
                className="group block-panel flex w-56 shrink-0 snap-start
                  items-baseline gap-3 overflow-hidden px-5 py-6
                  transition-colors hover:bg-poster-ice"
              >
                <span
                  className="font-mono text-[10px] text-poster-ice
                    group-hover:text-poster-bg/60"
                >
                  {padIndex(index + 1)}
                </span>
                <span
                  className="type-condensed min-w-0 flex-1 truncate text-2xl
                    uppercase text-poster-title transition-colors
                    group-hover:text-poster-bg"
                >
                  #{tag}
                </span>
                <span
                  className="shrink-0 font-mono text-[10px] text-poster-text-muted
                    group-hover:text-poster-bg/70"
                >
                  {padIndex(count)}
                </span>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="mt-16">
        <SectionHeading index="03" label="TIMELINE // BY YEAR" />
        {groups.length === 0 ? (
          <p className="mt-8 font-mono text-xs tracking-[0.2em] text-poster-text-muted">
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
      </section>
    </div>
  );
}
