import { renderCopyright } from "@/lib/siteConfig";

// Why: 页脚作为一次传输的校验尾部，收束上方刻意错位的数据界面。
export function StatusFooter() {
  const year = new Date().getFullYear();

  return (
    <footer
      className="system-footer relative mx-auto w-full max-w-6xl px-4 pb-6 pt-16
        before:absolute before:left-4 before:top-12 before:h-8 before:w-1
        before:bg-poster-ice/40 after:absolute after:left-4 after:right-4
        after:top-12 after:h-px after:bg-poster-line"
    >
      <div
        className="flex flex-col gap-2 border-t border-poster-line pt-4
          text-[10px] tracking-widest text-poster-text-muted md:flex-row
          md:items-center md:justify-between"
      >
        <span className="flex items-center gap-1.5">
          <span className="blink inline-block h-1.5 w-1.5 bg-poster-ice" />
          SAT // ORBIT STABLE // CRC_OK
        </span>
        <span className="hidden text-poster-ice/70 md:inline">
          01010011 01011001 01010011
        </span>
        <span>{renderCopyright(year)}</span>
      </div>
    </footer>
  );
}
