import Link from "next/link";
import type { PostMeta } from "@/lib/posts";
import { formatDate, padIndex } from "@/lib/format";

// Why: 记录行(Brutalism)——2px 硬分隔、左侧编号、压缩体大标题，
// hover 时整行反白(冰蓝底 + 暗字)，是最直接的粗野主义反馈。
// How: 每行按序号错开出场(最多 5 档)。行本身靠 margin 做水平错位，
// 与进入动效用的 transform 互不冲突。
export function PostRow({ post, index }: { post: PostMeta; index: number }) {
  const drift = index % 3 === 1 ? "md:ml-[4%]" : index % 3 === 2 ? "md:ml-[-2%]" : "";
  const delay = index % 5;

  return (
    <Link
      href={`/posts/${post.slug}`}
      data-reveal=""
      data-reveal-delay={delay > 0 ? String(delay) : undefined}
      suppressHydrationWarning
      className={`group relative grid grid-cols-[2rem_minmax(0,1fr)] gap-x-3
        border-b-2 border-poster-line px-2 py-7 transition-colors
        hover:bg-poster-ice md:grid-cols-[3rem_minmax(0,1fr)_12rem] md:gap-x-6
        md:px-4 md:py-8 ${drift}`}
    >
      <span
        className="pt-2 font-mono text-[10px] leading-none text-poster-ice/60
          transition-colors group-hover:text-poster-bg/70"
        style={{ transform: `rotate(${(index % 3) * 1.2 - 1.2}deg)` }}
      >
        {padIndex(index + 1)}
      </span>

      <span className="min-w-0">
        <span
          className="type-condensed block text-[1.5rem] uppercase
            text-poster-title transition-colors group-hover:text-poster-bg
            md:text-[clamp(2rem,3vw,3.5rem)]"
        >
          {post.title}
        </span>
        {post.description && (
          <span
            className="mt-1.5 line-clamp-2 block max-w-3xl text-xs
              leading-relaxed text-poster-text-muted transition-colors
              group-hover:text-poster-bg/75"
          >
            {post.description}
          </span>
        )}
        {post.tags.length > 0 && (
          <span
            className="mt-2 flex flex-wrap gap-x-3 gap-y-1 font-mono text-[9px]
              uppercase tracking-[0.18em] text-poster-text-muted
              transition-colors group-hover:text-poster-bg/75"
          >
            {post.tags.slice(0, 4).map((tag) => (
              <span key={tag}>#{tag}</span>
            ))}
          </span>
        )}
      </span>

      <span
        className="col-start-2 flex items-center gap-3 font-mono text-[10px]
          uppercase tracking-[0.16em] text-poster-text-muted transition-colors
          group-hover:text-poster-bg/75 md:col-start-3 md:flex-col
          md:items-end md:gap-1.5 md:pt-1.5"
      >
        <time dateTime={post.date}>{formatDate(post.date)}</time>
        <span className="text-poster-line group-hover:text-poster-bg/40 md:hidden">
          ·
        </span>
        <span>{padIndex(post.readingMinutes)} MIN</span>
        <span
          aria-hidden="true"
          className="-translate-x-1 font-mono text-xs text-poster-ice
            opacity-0 transition-all group-hover:translate-x-0
            group-hover:text-poster-bg group-hover:opacity-100"
        >
          →
        </span>
      </span>
    </Link>
  );
}
