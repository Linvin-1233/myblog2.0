import type { Metadata } from "next";
import Link from "next/link";
import { getAllTags } from "@/lib/posts";
import { SectionLabel } from "../components/SectionLabel";

export const metadata: Metadata = {
  title: "标签",
  description: "按标签浏览全部文章主题。",
  alternates: { canonical: "/tags" },
};

// Why: 标签总览页，展示全部标签及各自文章数，作为主题导航入口。
export default function TagsPage() {
  const tags = getAllTags();

  return (
    <section className="relative pt-8">
      <SectionLabel>[SEC // TAG_INDEX]</SectionLabel>
      <div className="mb-8 border-b border-poster-line pb-4">
        <span className="block text-[10px] tracking-widest text-poster-text-muted">
          {"// TOPIC_CLUSTERS"}
        </span>
        <h1 className="text-xl font-extrabold uppercase text-poster-title">
          标签
        </h1>
      </div>

      {tags.length === 0 ? (
        <p className="text-xs text-poster-text-muted">&gt; 暂无标签</p>
      ) : (
        <div className="flex flex-wrap gap-3">
          {tags.map(({ tag, slug, count }) => (
            <Link
              key={slug}
              href={`/tags/${encodeURIComponent(slug)}`}
              className="flex items-center gap-2 border-2 border-poster-line
                bg-poster-panel/40 px-3 py-1.5 text-xs font-bold uppercase
                tracking-wider text-poster-text-bright transition-all
                shadow-[3px_3px_0px_var(--poster-shadow)]
                hover:border-poster-ice hover:text-poster-ice"
            >
              #{tag}
              <span className="text-[10px] text-poster-ice">
                {count.toString().padStart(2, "0")}
              </span>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
