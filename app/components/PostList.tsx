"use client";

import { useState } from "react";
import type { PostMeta } from "@/lib/posts";
import { padIndex } from "@/lib/format";
import { PostRow } from "./PostRow";

// Why: 客户端分页(v7 编辑流)：行式记录列表 + 页码/前后翻页。
// 因是客户端组件，Next 构建期把首屏 + 全部链接预渲染进 HTML，SEO 不受影响。
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
      <div className="py-16 text-center">
        <span className="text-xs tracking-widest text-poster-title">
          &gt; NO_SIGNAL
        </span>
        <span className="ml-2 text-xs text-poster-text-muted">暂无文章</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="border-t border-poster-line">
        {pageItems.map((post) => (
          <PostRow key={post.slug} post={post} />
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
            className="border border-poster-line bg-poster-panel px-3 py-2 text-[11px]
              font-extrabold uppercase tracking-wider text-poster-ice transition-colors
              hover:border-poster-ice hover:bg-poster-ice hover:text-poster-bg
              disabled:cursor-not-allowed disabled:opacity-20"
          >
            [◄ PREV]
          </button>

          <div className="flex flex-wrap justify-center gap-1.5">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                type="button"
                onClick={() => goTo(page)}
                aria-label={`第 ${page} 页`}
                className={
                  page === currentPage
                    ? "flex h-8 w-8 items-center justify-center border " +
                      "border-poster-ice bg-poster-ice text-xs font-bold " +
                      "text-poster-bg"
                    : "flex h-8 w-8 items-center justify-center border " +
                      "border-poster-line text-xs font-bold " +
                      "text-poster-text-muted transition-colors " +
                      "hover:border-poster-ice hover:text-poster-ice"
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
            className="border border-poster-line bg-poster-panel px-3 py-2 text-[11px]
              font-extrabold uppercase tracking-wider text-poster-ice transition-colors
              hover:border-poster-ice hover:bg-poster-ice hover:text-poster-bg
              disabled:cursor-not-allowed disabled:opacity-20"
          >
            [NEXT ►]
          </button>
        </div>
      )}
    </div>
  );
}
