import type { Metadata } from "next";
import Link from "next/link";
import { getAllPostMeta, getAllTags } from "@/lib/posts";
import { padIndex } from "@/lib/format";
import { PageHeader } from "../components/PageHeader";

export const metadata: Metadata = {
  title: "标签",
  description: "按标签浏览全部文章主题。",
  alternates: { canonical: "/tags" },
};

// Why: 标签总览——1px 网格切分的方角标签块，hover 整块反白。
export default function TagsPage() {
  const tags = getAllTags();

  return (
    <div className="shell pb-20">
      <PageHeader
        index="02"
        kicker="TAXONOMY // TOPICS"
        title="标签"
        meta={[
          { label: "TOPICS", value: padIndex(tags.length) },
          { label: "RECORDS", value: padIndex(getAllPostMeta().length) },
        ]}
      />

      {tags.length === 0 ? (
        <p className="mt-10 font-mono text-xs tracking-[0.2em] text-poster-text-muted">
          &gt; NO_TOPICS
        </p>
      ) : (
        <div
          className="mt-10 grid gap-[2px] bg-poster-title sm:grid-cols-2
            lg:grid-cols-3"
        >
          {tags.map(({ tag, slug, count }, index) => (
            <Link
              key={slug}
              href={`/tags/${encodeURIComponent(slug)}`}
              className="group flex items-baseline gap-3 bg-poster-bg px-5 py-6
                transition-colors hover:bg-poster-ice"
            >
              <span
                className="font-mono text-[10px] text-poster-ice/60
                  group-hover:text-poster-bg/60"
              >
                {padIndex(index + 1)}
              </span>
              <span
                className="type-condensed text-2xl uppercase text-poster-title
                  transition-colors group-hover:text-poster-bg"
              >
                #{tag}
              </span>
              <span
                className="ml-auto font-mono text-[10px] text-poster-text-muted
                  group-hover:text-poster-bg/70"
              >
                {padIndex(count)}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
