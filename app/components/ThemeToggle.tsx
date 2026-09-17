"use client";

import { useEffect, useState } from "react";

type Theme = "dark" | "light";

// Why: 主题切换压缩成一枚状态灯按钮(系统风)——[ DARK ] / [ LIGHT ] + 指示块。
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
      className="group flex h-8 items-center gap-2 border-2 border-poster-line px-2.5
        font-mono text-[9px] uppercase tracking-[0.2em] text-poster-text-muted
        transition-colors hover:border-poster-ice hover:text-poster-ice"
    >
      <span
        aria-hidden="true"
        className={`h-1.5 w-1.5 ${isDark ? "bg-poster-ice" : "bg-poster-fault"}`}
      />
      <span aria-hidden="true" className="hidden sm:inline">
        {mounted ? (isDark ? "DARK" : "LIGHT") : "····"}
      </span>
      <span aria-hidden="true" className="text-poster-ice/60 group-hover:text-poster-ice">
        ◐
      </span>
    </button>
  );
}
