import Link from "next/link";
import type { PostMeta } from "@/lib/posts";
import { formatDate } from "@/lib/format";

// Why: 传输流行(v7 编辑流)——文章 = 一行式记录：日期 / 标题 / 标签，
// 细线分隔，hover 标题转冰蓝(纯色变化)。纯展示组件，
// 可被客户端 PostList 安全复用。
export function PostRow({ post }: { post: PostMeta }) {
  return (
    <Link
      href={`/posts/${post.slug}`}
      className="group relative grid grid-cols-[auto_1fr] items-baseline gap-3
        overflow-hidden border-b border-poster-line px-2 py-4 transition-[background-color,transform,box-shadow]
        duration-150 hover:translate-x-1 hover:bg-poster-ice/5
        hover:shadow-[inset_2px_0_var(--poster-ice)]
        md:grid-cols-[96px_1fr_auto] md:gap-4 md:pl-3 md:pr-12"
    >
      <time
        dateTime={post.date}
        className="text-[11px] font-bold text-poster-text-muted"
      >
        {formatDate(post.date)}
      </time>
      <span
        className="truncate text-sm font-extrabold uppercase tracking-wide
          text-poster-title transition-colors group-hover:text-poster-ice"
      >
        {post.title}
      </span>
      <span className="hidden gap-2 md:flex">
        {post.tags.slice(0, 3).map((tag) => (
          <span
            key={tag}
            className="text-[10px] uppercase text-poster-text-muted"
          >
            #{tag}
          </span>
        ))}
      </span>
      <span className="absolute right-3 translate-x-2 text-poster-ice opacity-0
        transition-all group-hover:translate-x-0 group-hover:opacity-100" aria-hidden="true">→</span>
    </Link>
  );
}
