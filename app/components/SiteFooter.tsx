import { renderCopyright } from "@/lib/siteConfig";

// Why: 页脚只保留 example 的“系统状态”终端条与版权(版权文案来自 config.yml)。
export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-poster-line">
      <div
        className="mx-auto flex max-w-5xl flex-col gap-3 px-4 py-8 text-[11px]
          text-poster-text-muted md:flex-row md:items-center
          md:justify-between md:px-8"
      >
        <div className="flex items-center gap-1.5">
          <span className="inline-block h-1 w-1 animate-pulse bg-emerald-500" />
          <span>SYS_STATUS: RENDER_PACKETS_STABLE</span>
        </div>

        <div>{renderCopyright(year)}</div>
      </div>
    </footer>
  );
}
