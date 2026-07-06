import type { ReactNode } from "react";

// Why: example 里每个板块顶部都有 “[SEC_01 // TITLE]” 这种嵌在边框上的
// 终端式标签，是海报风的标志性元素，抽成组件在各页面统一复用。
export function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <div
      className="absolute left-4 top-0 flex -translate-y-1/2 items-center gap-1.5
        bg-poster-bg px-2 text-[10px] font-bold text-poster-ice"
    >
      <span className="inline-block h-1.5 w-1.5 animate-pulse bg-poster-ice" />
      <span>{children}</span>
    </div>
  );
}
