"use client";

import { useState } from "react";
import type { PostMeta } from "@/lib/posts";
import { padIndex } from "@/lib/format";
import { PostRow } from "./PostRow";

// Why: 客户端分页(Marathon 记录表)：编号行列表 + 等宽分页条。
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
      <div className="slab py-16 text-center">
        <span className="font-mono text-xs tracking-[0.24em] text-poster-title">
          &gt; NO_SIGNAL
        </span>
        <span className="ml-2 text-xs text-poster-text-muted">暂无文章</span>
      </div>
    );
  }

  const firstIndex = start + 1;
  const lastIndex = Math.min(start + perPage, posts.length);

  return (
    <div>
      <div
        className="flex flex-wrap items-center justify-between gap-2 pb-3
          font-mono text-[10px] uppercase tracking-[0.24em]
          text-poster-text-muted"
      >
        <span>
          RECORDS {padIndex(firstIndex)}–{padIndex(lastIndex)} /{" "}
          {padIndex(posts.length)}
        </span>
        <span className="text-poster-ice">
          PAGE {padIndex(currentPage)} {"//"} {padIndex(totalPages)}
        </span>
      </div>

      <div className="border-t-2 border-poster-line">
        {pageItems.map((post, index) => (
          <PostRow key={post.slug} post={post} index={start + index} />
        ))}
      </div>

      {totalPages > 1 && (
        <div
          className="mt-6 flex flex-wrap items-center justify-between gap-3
            border-t-2 border-poster-line pt-5"
        >
          <button
            type="button"
            onClick={() => goTo(currentPage - 1)}
            disabled={currentPage === 1}
            className="border-2 border-poster-line px-3 py-2 font-mono text-[10px]
              uppercase tracking-[0.2em] text-poster-ice transition-colors
              hover:border-poster-ice hover:bg-poster-ice hover:text-poster-bg
              disabled:cursor-not-allowed disabled:opacity-25"
          >
            [ ◄ PREV ]
          </button>

          <div className="flex flex-wrap justify-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                type="button"
                onClick={() => goTo(page)}
                aria-label={`第 ${page} 页`}
                aria-current={page === currentPage ? "page" : undefined}
                className={
                  page === currentPage
                    ? "flex h-8 w-8 items-center justify-center border " +
                      "border-poster-ice bg-poster-ice font-mono text-[10px] " +
                      "font-bold text-poster-bg"
                    : "flex h-8 w-8 items-center justify-center border " +
                      "border-poster-line font-mono text-[10px] " +
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
            className="border-2 border-poster-line px-3 py-2 font-mono text-[10px]
              uppercase tracking-[0.2em] text-poster-ice transition-colors
              hover:border-poster-ice hover:bg-poster-ice hover:text-poster-bg
              disabled:cursor-not-allowed disabled:opacity-25"
          >
            [ NEXT ► ]
          </button>
        </div>
      )}
    </div>
  );
}
