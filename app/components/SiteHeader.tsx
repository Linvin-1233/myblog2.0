import Link from "next/link";
import { Sidebar } from "./Sidebar";
import { ThemeToggle } from "./ThemeToggle";

// Why: 顶栏精简为「几何徽标 + Blog」，导航移入左侧抽屉(Sidebar)，主题切换在右。
export function SiteHeader() {
  return (
    <header
      className="sticky top-0 z-30 border-b border-poster-line
        bg-poster-bg/85 backdrop-blur-md"
    >
      <div
        className="mx-auto flex max-w-5xl items-center justify-between gap-4
          px-4 py-3 md:px-8"
      >
        <div className="flex items-center gap-3">
          <Sidebar />

          <Link
            href="/"
            className="flex items-center gap-2 text-poster-title
              transition-colors hover:text-poster-ice"
          >
            {/* Why: 同心菱形 + 中心点 + 四向刻度的几何徽标，呼应蓝图/坐标风格。 */}
            <svg
              viewBox="0 0 32 32"
              fill="none"
              className="h-6 w-6 text-poster-ice"
            >
              <polygon
                points="16,3 29,16 16,29 3,16"
                stroke="currentColor"
                strokeWidth="1.4"
              />
              <polygon
                points="16,9 23,16 16,23 9,16"
                stroke="currentColor"
                strokeWidth="1"
                opacity="0.6"
              />
              <circle cx="16" cy="16" r="2" fill="currentColor" />
              <path
                d="M16 0v3M16 29v3M0 16h3M29 16h3"
                stroke="currentColor"
                strokeWidth="1"
              />
            </svg>
            <span className="text-sm font-extrabold uppercase tracking-widest">
              Blog
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-2 md:gap-3">
          {/* Why: header 直接给出搜索入口(放大镜)，无需先展开侧边栏。 */}
          <Link
            href="/search"
            aria-label="搜索"
            className="flex items-center justify-center border-2 border-poster-line
              bg-poster-panel/90 p-2 text-poster-ice transition-all duration-300
              hover:border-poster-ice hover:bg-poster-ice hover:text-poster-bg
              shadow-[3px_3px_0px_var(--poster-shadow)] active:translate-x-0.5
              active:translate-y-0.5 active:shadow-none"
          >
            <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4">
              <circle
                cx="7"
                cy="7"
                r="5"
                stroke="currentColor"
                strokeWidth="1.6"
              />
              <line
                x1="10.6"
                y1="10.6"
                x2="15"
                y2="15"
                stroke="currentColor"
                strokeWidth="1.6"
              />
            </svg>
          </Link>

          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
