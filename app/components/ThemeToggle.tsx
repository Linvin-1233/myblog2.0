"use client";

import { useEffect, useState } from "react";

type Theme = "dark" | "light";

// Why: 复刻 example 的主题切换按钮(旋转刻度盘 + 状态标签)，但适配多页站点：
// 状态源自 <html data-theme>(由 ThemeScript 首帧写入)，切换时同步 DOM 与
// localStorage，保证跨页面持久一致。
export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("dark");
  const [mounted, setMounted] = useState(false);

  // How: 挂载后再读取真实 data-theme，避免用服务端默认值覆盖脚本已设的偏好。
  // 这是“同步到仅客户端可知的值”的正当场景，故显式豁免 set-state-in-effect。
  useEffect(() => {
    const current = document.documentElement.getAttribute("data-theme");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTheme(current === "light" ? "light" : "dark");
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
      className="flex items-center gap-2 border-2 border-poster-line
        bg-poster-panel/90 px-3 py-1.5 text-[10px] font-extrabold
        tracking-widest text-poster-ice transition-all duration-300
        hover:border-poster-ice hover:bg-poster-ice hover:text-poster-bg
        shadow-[3px_3px_0px_var(--poster-shadow)] active:translate-x-0.5
        active:translate-y-0.5 active:shadow-none group"
    >
      {/* Why: 复刻 example/App.vue 的组合切换图标——旋转虚线环(深色转快/浅色
          转慢) + 四向刻度 + 中心形状(深色方块并旋转、浅色菱形)。 */}
      <span className="relative flex h-5 w-5 shrink-0 items-center justify-center">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className="absolute inset-0 h-full w-full text-poster-line
            group-hover:text-poster-bg transition-colors duration-300"
          style={{
            animation: `spin ${isDark ? "4s" : "10s"} linear infinite`,
          }}
        >
          <circle
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeDasharray="4 3"
          />
        </svg>

        <svg
          viewBox="0 0 24 24"
          fill="none"
          className="absolute inset-0 h-full w-full opacity-60
            group-hover:opacity-100 transition-opacity"
        >
          <path
            d="M12 2v3M12 19v3M2 12h3M19 12h3"
            stroke="currentColor"
            strokeWidth="0.8"
          />
        </svg>

        <svg
          viewBox="0 0 10 10"
          fill="none"
          className={`h-2.5 w-2.5 transition-transform duration-500 ${
            isDark ? "rotate-90" : ""
          }`}
        >
          {isDark ? (
            <rect
              x="1.5"
              y="1.5"
              width="7"
              height="7"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="animate-pulse"
            />
          ) : (
            <polygon
              points="5,0 10,5 5,10 0,5"
              fill="currentColor"
              className="origin-center scale-75 animate-ping"
            />
          )}
        </svg>
      </span>
      <span className="border-l border-poster-line/40 pl-2">
        {mounted ? (isDark ? "DARK_&" : "LIGHT_&") : "····"}
      </span>
    </button>
  );
}
