"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Fuse from "fuse.js";
import type { SearchDocument } from "@/lib/posts";
import { formatDate } from "@/lib/format";

// Why: 静态站点无服务端搜索，改为在浏览器内用 Fuse.js 做模糊匹配；标题权重最高，
// 依次是标签、简介、正文，让最相关的命中排在前面。
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
          className="w-full border-2 border-poster-line bg-poster-panel/40 py-3
            pl-8 pr-4 text-sm text-poster-text-bright outline-none transition-colors
            placeholder:text-poster-text-muted focus:border-poster-ice
            shadow-[4px_4px_0px_var(--poster-shadow)]"
        />
      </div>

      {query.trim() && (
        <div className="text-[11px] font-bold tracking-widest text-poster-text-muted">
          {"// "}
          {results.length.toString().padStart(2, "0")} MATCH
          {results.length === 1 ? "" : "ES"}
        </div>
      )}

      {query.trim() && results.length === 0 ? (
        <div
          className="border border-poster-line bg-poster-panel py-16 text-center
            text-xs tracking-widest text-poster-ice"
        >
          &gt; NO_MATCH // 未找到相关内容
        </div>
      ) : (
        <div className="space-y-4">
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
      className="group block border-2 border-poster-line bg-poster-panel/40 p-4
        transition-all shadow-[4px_4px_0px_var(--poster-shadow)]
        hover:border-poster-ice hover:bg-poster-panel"
    >
      <div className="flex items-baseline justify-between gap-4">
        <h3
          className="text-sm font-extrabold uppercase tracking-wide
            text-poster-title transition-colors group-hover:text-poster-ice"
        >
          {item.title}
        </h3>
        <time
          dateTime={item.date}
          className="shrink-0 text-[10px] font-bold text-poster-ice"
        >
          {formatDate(item.date)}
        </time>
      </div>
      <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-poster-text-bright">
        {buildPreview(item, matches)}
      </p>
      {item.tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1">
          {item.tags.map((tag) => (
            <span
              key={tag}
              className="border border-poster-line bg-poster-bg px-1.5 py-0.5
                text-[9px] uppercase text-poster-text"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </Link>
  );
}
