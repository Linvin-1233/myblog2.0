import { chanceCode } from "@/lib/dada";
import { renderCopyright, siteConfig } from "@/lib/siteConfig";
import { Barcode } from "./Barcode";

// Why: 页脚只留一行校验文本。小号字标、简介、NAVIGATE / ELSEWHERE / FEED
// 三栏都已迁出——字标与简介删除，社交与 FEED 移进 About，NAVIGATE 变成
// 固定在视口左侧的竖排导航(SideNav)。页脚与正文仍共用同一张纸面。
export function StatusFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative mt-32">
      <div
        className="shell flex flex-wrap items-center justify-between gap-3 pb-10
          font-mono text-[9px] uppercase tracking-[0.24em] text-poster-text-muted"
      >
        <span>{renderCopyright(year)}</span>
        <span className="hidden md:block">
          <Barcode value={siteConfig.name} bars={22} className="opacity-60" />
        </span>
        <span className="hidden md:inline">
          {`CHANCE · ${chanceCode(siteConfig.name)}`}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="blink inline-block h-1.5 w-1.5 bg-poster-ice" />
          SIGNAL STABLE
        </span>
      </div>
    </footer>
  );
}
