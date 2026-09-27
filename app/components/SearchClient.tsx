"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Fuse from "fuse.js";
import type { SearchDocument } from "@/lib/posts";
import { formatDate, padIndex } from "@/lib/format";

// Why: 静态站点无服务端搜索，改为在浏览器内用 Fuse.js 做模糊匹配；标题权重最高，
// 依次是标签、简介、正文，让最相关的命中排在前面。
// Marathon 风：方角查询条 + "-N MATCHES" 计数 + 编号命中行。
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

  const trimmed = query.trim();

  return (
    <div className="space-y-6">
      {/* Why: 查询框本身就是这一页的主对象，所以它是实色场而不是描边输入框。 */}
      <label className="block-ice flex items-stretch">
        <span
          className="grid place-items-center border-r-2 border-current px-3
            font-mono text-[9px] uppercase tracking-[0.24em]"
        >
          QUERY
        </span>
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="搜索标题 / 简介 / 标签 / 正文…"
          autoFocus
          className="w-full bg-transparent px-4 py-4 font-tech text-base
            text-current outline-none placeholder:opacity-60"
        />
        <span
          aria-hidden="true"
          className="grid place-items-center px-3 font-mono text-xs"
        >
          <span className="blink">▍</span>
        </span>
      </label>

      <div
        className="flex items-center justify-between gap-3 font-mono text-[10px]
          uppercase tracking-[0.24em] text-poster-text-muted"
      >
        <span className="text-poster-ice">
          {trimmed
            ? `>> ${padIndex(results.length)} MATCH${results.length === 1 ? "" : "ES"}`
            : ">> AWAITING_INPUT"}
        </span>
        <span>INDEX {padIndex(documents.length)}</span>
      </div>

      {trimmed && results.length === 0 ? (
        <div className="slab py-16 text-center">
          <span className="font-mono text-xs tracking-[0.24em] text-poster-title">
            &gt; NO_MATCH
          </span>
          <span className="ml-2 text-xs text-poster-text-muted">
            未找到相关内容，换个关键词试试
          </span>
        </div>
      ) : (
        <div className="border-t border-poster-line">
          {results.map(({ item, matches }, index) => (
            <SearchResult
              key={item.slug}
              item={item}
              matches={matches}
              index={index}
            />
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
  index,
}: {
  item: SearchDocument;
  matches?: readonly FuseMatch[];
  index: number;
}) {
  return (
    <Link
      href={`/posts/${item.slug}`}
      className="group grid grid-cols-[2rem_minmax(0,1fr)] gap-x-3
        border-b-2 border-poster-line px-2 py-4 transition-colors
        hover:bg-poster-ice md:grid-cols-[3rem_minmax(0,1fr)_12rem]
        md:gap-x-6 md:px-4"
    >
      <span
        className="pt-1 font-mono text-[10px] text-poster-ice/60
          transition-colors group-hover:text-poster-bg/70"
      >
        {padIndex(index + 1)}
      </span>
      <span className="min-w-0">
        <span
          className="type-condensed block truncate text-xl uppercase
            text-poster-title transition-colors group-hover:text-poster-bg"
        >
          {item.title}
        </span>
        <span
          className="mt-1 block truncate text-xs text-poster-text-muted
            transition-colors group-hover:text-poster-bg/75"
        >
          {buildPreview(item, matches)}
        </span>
      </span>
      <span
        className="col-start-2 flex items-center gap-3 font-mono text-[10px]
          uppercase tracking-[0.16em] text-poster-text-muted transition-colors
          group-hover:text-poster-bg/75 md:col-start-3 md:justify-end"
      >
        <time dateTime={item.date}>{formatDate(item.date)}</time>
      </span>
    </Link>
  );
}
