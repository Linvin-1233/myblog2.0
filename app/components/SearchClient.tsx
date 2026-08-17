"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Fuse from "fuse.js";
import type { SearchDocument } from "@/lib/posts";
import { formatDate } from "@/lib/format";

// Why: 静态站点无服务端搜索，改为在浏览器内用 Fuse.js 做模糊匹配；标题权重最高，
// 依次是标签、简介、正文，让最相关的命中排在前面。
// v3 系统风：`> ` 提示符输入框、`>> N MATCHES` 计数、`> NO_MATCH` 空态。
const MAX_RESULTS = 20;
const CONTENT_PREVIEW_LENGTH = 140;

export function SearchClient({
  documents,
}: {
  documents: SearchDocument[];
}) {
  const [query, setQuery] = useState("");

  const fuse = useMemo(
    () =>
      new Fuse(documents, {
        includeMatches: true,
        // How: threshold 越大越宽松;ignoreLocation 让匹配不限位置，适合长正文。
        threshold: 0.4,
        ignoreLocation: true,
        minMatchCharLength: 2,
        keys: [
          { name: "title", weight: 0.45 },
          { name: "tags", weight: 0.25 },
          { name: "description", weight: 0.2 },
          { name: "content", weight: 0.1 },
        ],
      }),
    [documents],
  );

  const results = useMemo(() => {
    const trimmed = query.trim();
    if (!trimmed) return [];
    return fuse.search(trimmed).slice(0, MAX_RESULTS);
  }, [fuse, query]);

  return (
    <div className="space-y-6">
      <div className="relative">
        {/* 终端提示符 */}
        <span
          className="pointer-events-none absolute left-3 top-1/2
            -translate-y-1/2 text-poster-ice"
        >
          &gt;
        </span>
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="搜索标题 / 简介 / 标签 / 正文…"
          autoFocus
          className="w-full border-2 border-poster-line bg-poster-panel py-4
            pl-8 pr-4 text-base font-bold text-poster-text-bright outline-none
            transition-colors placeholder:text-poster-text-muted
            focus:border-poster-ice"
        />
      </div>

      {query.trim() && (
        <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-poster-ice">
          {`>> ${results.length.toString().padStart(2, "0")} MATCH${
            results.length === 1 ? "" : "ES"
          }`}
        </div>
      )}

      {query.trim() && results.length === 0 ? (
        <div className="py-16 text-center">
          <span className="text-xs tracking-widest text-poster-title">
            &gt; NO_MATCH
          </span>
          <span className="ml-2 text-xs text-poster-text-muted">
            未找到相关内容，换个关键词试试
          </span>
        </div>
      ) : (
        <div className="border-t border-poster-line">
          {results.map(({ item, matches }) => (
            <SearchResult key={item.slug} item={item} matches={matches} />
          ))}
        </div>
      )}
    </div>
  );
}

type FuseMatch = { key?: string; value?: string; indices: readonly [number, number][] };

// Why: 当命中在正文里时，截取匹配附近的片段做预览，让用户直观看到上下文；
// 否则退回展示简介。
function buildPreview(item: SearchDocument, matches?: readonly FuseMatch[]) {
  const contentMatch = matches?.find(
    (match) => match.key === "content" && match.value,
  );
  if (contentMatch?.value && contentMatch.indices.length > 0) {
    const [start] = contentMatch.indices[0];
    const from = Math.max(0, start - 40);
    const snippet = contentMatch.value
      .slice(from, from + CONTENT_PREVIEW_LENGTH)
      .trim();
    return `${from > 0 ? "…" : ""}${snippet}…`;
  }
  return item.description;
}

function SearchResult({
  item,
  matches,
}: {
  item: SearchDocument;
  matches?: readonly FuseMatch[];
}) {
  return (
    <Link
      href={`/posts/${item.slug}`}
      className="group grid grid-cols-[auto_1fr] items-baseline gap-3
        border-b border-poster-line py-3 md:grid-cols-[96px_1fr_auto]
        md:gap-4"
    >
      <time
        dateTime={item.date}
        className="text-[11px] font-bold text-poster-text-muted"
      >
        {formatDate(item.date)}
      </time>
      <span className="min-w-0">
        <span
          className="block truncate text-sm font-extrabold uppercase
            tracking-wide text-poster-title transition-colors
            group-hover:text-poster-ice"
        >
          {item.title}
        </span>
        <span className="mt-1 block truncate text-xs text-poster-text-muted">
          {buildPreview(item, matches)}
        </span>
      </span>
      <span className="hidden gap-2 md:flex">
        {item.tags.slice(0, 3).map((tag) => (
          <span
            key={tag}
            className="text-[10px] uppercase text-poster-text-muted"
          >
            #{tag}
          </span>
        ))}
      </span>
    </Link>
  );
}
