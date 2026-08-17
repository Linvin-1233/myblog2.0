"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { SystemBackdrop } from "./SystemBackdrop";
import { GlitchField } from "./GlitchField";

// Why: 固定环境层模拟受干扰的卫星操作系统：网格是坐标基准，扫描线、数据瀑布
// 与随机像素块只在背景运动，主内容仍保持可读。滚动时暂停大面积动画。
export function PosterBackground() {
  const containerRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const isHome = pathname === "/";

  useEffect(() => {
    const el = containerRef.current;
    if (!el || !isHome) return;

    let rafId = 0;
    let scrollPct = 0;
    let scrollTimer = 0;

    const flush = () => {
      rafId = 0;
      el.style.setProperty("--bg-scroll", String(scrollPct));
    };

    // Why: 滚动时暂停网格动画(见 globals.css 的 [data-scrolling])，
    // 停止满 180ms 后恢复；同时用 rAF 节流更新视差缩放变量。
    const onScroll = () => {
      const maxY =
        document.documentElement.scrollHeight - window.innerHeight;
      scrollPct = maxY > 0 ? (window.scrollY / maxY) * 100 : 0;
      if (!rafId) rafId = requestAnimationFrame(flush);

      el.setAttribute("data-scrolling", "true");
      document.documentElement.setAttribute("data-scrolling", "true");
      if (scrollTimer) window.clearTimeout(scrollTimer);
      scrollTimer = window.setTimeout(() => {
        el.removeAttribute("data-scrolling");
        document.documentElement.removeAttribute("data-scrolling");
      }, 180);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      if (scrollTimer) window.clearTimeout(scrollTimer);
      document.documentElement.removeAttribute("data-scrolling");
      window.removeEventListener("scroll", onScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [isHome]);

  return (
    <div
      ref={containerRef}
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden
        motion-reduce:opacity-10!"
      style={{ contain: "layout paint style" }}
    >
      <div className="absolute inset-0">
        <div className="blueprint-grid blueprint-grid-small opacity-10" />
        <div className="blueprint-grid blueprint-grid-large opacity-15" />
      </div>
      <SystemBackdrop animated />
      <GlitchField strong={isHome} />
      {isHome && (
        <>
          <div className="system-scanlines absolute inset-0" />
          <div className="signal-tear signal-tear-a" />
          <div className="signal-tear signal-tear-b" />
          <div className="signal-tear signal-tear-c" />
          <div className="void-field" aria-hidden="true">
            <div className="black-hole-core" />
            <div className="black-hole-ring black-hole-ring-a" />
            <div className="black-hole-ring black-hole-ring-b" />
            <div className="black-hole-slice black-hole-slice-a" />
            <div className="black-hole-slice black-hole-slice-b" />
          </div>
          <div className="data-current data-current-a" aria-hidden="true">
            {Array.from({ length: 10 }, (_, index) => <i key={index} />)}
          </div>
          <div className="data-current data-current-b" aria-hidden="true">
            {Array.from({ length: 8 }, (_, index) => <i key={index} />)}
          </div>
        </>
      )}

    </div>
  );
}
