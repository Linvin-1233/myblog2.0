import Link from "next/link";
import type { PostMeta } from "@/lib/posts";
import { formatDate, padIndex } from "@/lib/format";

// Why: 文章卡片在列表页、标签页、首页最新区多处出现，做成纯展示组件
// (不含服务端专属逻辑)，因此也能被客户端分页列表安全复用。
export function PostCard({ post, index }: { post: PostMeta; index: number }) {
  return (
    <Link
      href={`/posts/${post.slug}`}
      className="group relative flex flex-col justify-between border-2
        border-poster-line bg-poster-panel/40 p-5 transition-all duration-300
        shadow-[4px_4px_0px_var(--poster-shadow)] hover:border-poster-ice
        hover:bg-poster-panel"
    >
      <div className="space-y-2">
        <div
          className="flex items-center justify-between text-[10px] font-bold
            text-poster-text-muted"
        >
          <span>SYS_REF // {padIndex(index)}</span>
          <span
            className="h-1.5 w-1.5 bg-poster-line transition-colors
              group-hover:bg-poster-ice"
          />
        </div>

        <h3
          className="text-md font-extrabold uppercase tracking-wide
            text-poster-title transition-colors group-hover:text-poster-ice"
        >
          {post.title}
        </h3>

        <p className="line-clamp-3 text-xs leading-relaxed text-poster-text-bright">
          {post.description}
        </p>
      </div>

      <div
        className="mt-4 flex items-center justify-between border-t
          border-poster-line/60 pt-3"
      >
        <div className="flex flex-wrap gap-1">
          {post.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="border border-poster-line bg-poster-bg px-1.5 py-0.5
                text-[9px] uppercase text-poster-text"
            >
              {tag}
            </span>
          ))}
        </div>
        <time
          dateTime={post.date}
          className="shrink-0 text-[10px] font-bold text-poster-ice"
        >
          {formatDate(post.date)}
        </time>
      </div>
    </Link>
  );
}
