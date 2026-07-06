"use client";

import { useState } from "react";
import type { PostMeta } from "@/lib/posts";
import { padIndex } from "@/lib/format";
import { PostCard } from "./PostCard";

// Why: 复刻 example 的客户端分页体验(上一页/页码/下一页)。因是客户端组件，
// Next 会在构建期把首屏(第 1 页 + 全部卡片链接)预渲染进 HTML，SEO 不受影响。
export function PostList({
  posts,
  perPage,
}: {
  posts: PostMeta[];
  perPage: number;
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(posts.length / perPage));
  const start = (currentPage - 1) * perPage;
  const pageItems = posts.slice(start, start + perPage);

  const goTo = (page: number) => {
    setCurrentPage(Math.min(Math.max(1, page), totalPages));
    // How: 翻页后回到顶部，避免停留在上一页底部造成阅读断层。
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (posts.length === 0) {
    return (
      <div
        className="border border-poster-line bg-poster-panel py-24 text-center
          text-xs tracking-widest text-poster-ice"
      >
        &gt; NO_PAYLOAD_FOUND // 暂无文章
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {pageItems.map((post, index) => (
          <PostCard key={post.slug} post={post} index={start + index + 1} />
        ))}
      </div>

      {totalPages > 1 && (
        <div
          className="flex items-center justify-between gap-2 border-t
            border-poster-line pt-4"
        >
          <button
            type="button"
            onClick={() => goTo(currentPage - 1)}
            disabled={currentPage === 1}
            className="border-2 border-poster-line bg-poster-panel px-3 py-2
              text-[11px] font-extrabold uppercase tracking-wider transition-colors
              disabled:cursor-not-allowed disabled:opacity-20
              enabled:hover:border-poster-ice enabled:hover:text-poster-title"
          >
            [◄ PREV]
          </button>

          <div className="flex flex-wrap justify-center gap-1.5">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                type="button"
                onClick={() => goTo(page)}
                className={
                  page === currentPage
                    ? "h-8 w-8 border border-poster-ice bg-poster-ice text-xs " +
                      "font-bold text-poster-bg"
                    : "h-8 w-8 border border-poster-line bg-poster-panel text-xs " +
                      "font-bold text-poster-text-muted transition-colors " +
                      "hover:border-poster-text"
                }
              >
                {padIndex(page)}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => goTo(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="border-2 border-poster-line bg-poster-panel px-3 py-2
              text-[11px] font-extrabold uppercase tracking-wider transition-colors
              disabled:cursor-not-allowed disabled:opacity-20
              enabled:hover:border-poster-ice enabled:hover:text-poster-title"
          >
            [NEXT ►]
          </button>
        </div>
      )}
    </div>
  );
}
