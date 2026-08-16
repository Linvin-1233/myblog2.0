"use client";

import { useEffect, useState } from "react";

type Theme = "dark" | "light";

// Why: 主题切换按钮(v3 系统风)——"MODE" 旋钮：像素切角 + 旋转刻度盘，
// 中心是手绘太阳/月亮图标，标签 MODE: DARK_& / LIGHT_&(系统口吻)。
// 状态源自 <html data-theme>(由 ThemeScript 首帧写入)，切换时同步 DOM 与
// localStorage，保证跨页面持久一致。
export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("dark");
  const [mounted, setMounted] = useState(false);

  // How: 挂载后从 localStorage 解析真实主题，并重新写回 <html data-theme>。
  // Why: 某些路由在 hydration 期间 data-theme 会被 React 抹掉，若只读不写就会
  // 读到空、回退默认深色(bug)。这里主动写回，保证各页刷新后主题一致。
  useEffect(() => {
    const stored = localStorage.getItem("theme-preference");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const resolved: Theme =
      stored === "light" || stored === "dark"
        ? stored
        : prefersDark
          ? "dark"
          : "light";
    document.documentElement.setAttribute("data-theme", resolved);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTheme(resolved);
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("theme-preference", next);
  };

  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label="切换深浅色主题"
      className="flex items-center gap-2 border border-poster-line bg-poster-panel
        px-3 py-1.5 text-[10px] font-extrabold tracking-widest text-poster-ice
        transition-colors hover:border-poster-ice hover:bg-poster-ice hover:text-poster-bg"
    >
      {/* 刻度盘：虚线环缓慢旋转 + 中心日/月 */}
      <span className="relative flex h-5 w-5 shrink-0 items-center justify-center">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className="absolute inset-0 h-full w-full text-current"
          style={{
            animation: `spin ${isDark ? "6s" : "14s"} linear infinite`,
          }}
        >
          <circle
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="1.1"
            strokeDasharray="4 3"
          />
        </svg>

        {isDark ? (
          /* 月亮 + 星 */
          <svg viewBox="0 0 24 24" fill="none" className="h-3 w-3">
            <path
              d="M15 4a8 8 0 1 0 5 14A9 9 0 0 1 15 4z"
              stroke="currentColor"
              strokeWidth="1.3"
            />
            <circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" />
            <circle cx="6" cy="7" r="0.7" fill="currentColor" />
          </svg>
        ) : (
          /* 太阳：圆 + 光线 */
          <svg viewBox="0 0 24 24" fill="none" className="h-3 w-3">
            <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.3" />
            <g stroke="currentColor" strokeWidth="1.1" strokeLinecap="round">
              <line x1="12" y1="2.5" x2="12" y2="5" />
              <line x1="12" y1="19" x2="12" y2="21.5" />
              <line x1="2.5" y1="12" x2="5" y2="12" />
              <line x1="19" y1="12" x2="21.5" y2="12" />
              <line x1="5.3" y1="5.3" x2="7" y2="7" />
              <line x1="17" y1="17" x2="18.7" y2="18.7" />
              <line x1="18.7" y1="5.3" x2="17" y2="7" />
              <line x1="7" y1="17" x2="5.3" y2="18.7" />
            </g>
          </svg>
        )}
      </span>
      <span className="hidden border-l border-poster-line pl-2 xl:inline">
        {mounted ? `MODE: ${isDark ? "DARK_&" : "LIGHT_&"}` : "····"}
      </span>
    </button>
  );
}
