"use client";

import { useEffect, useRef } from "react";

// Why: 海报风的"环境层"——网格 + 卫星轨道 + 鼠标模糊遮罩。
// 卫星动画从 SVG SMIL(CPU) 改为 CSS transform + transform-origin(GPU 合成)，
// 彻底消除滚动卡顿主因。
export function PosterBackground() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    let rafId = 0;
    let px = 0;
    let py = 0;
    let scrollPct = 0;
    let scrollTimer = 0;
    // Why: 每 2 帧才真正更新一次 CSS 变量(~30fps 跟随)，把 blur 采样 + mask
    // 重算的频率减半；指针跟随的视觉延迟肉眼几乎不可察。
    let frameParity = 0;

    const flush = () => {
      // How: 奇数帧直接跳过并重排下一帧，仅偶数帧写入样式。
      frameParity ^= 1;
      if (frameParity === 1) {
        rafId = requestAnimationFrame(flush);
        return;
      }
      rafId = 0;
      el.style.setProperty("--bg-px", `${px}px`);
      el.style.setProperty("--bg-py", `${py}px`);
      el.style.setProperty("--bg-scroll", String(scrollPct));
    };

    const schedule = () => {
      if (rafId) return;
      rafId = requestAnimationFrame(flush);
    };

    const onPointer = (event: PointerEvent) => {
      px = event.clientX;
      py = event.clientY;
      schedule();
    };

    // Why: 滚动时关闭模糊 + 暂停动画，停止满 180ms 后恢复。
    const onScroll = () => {
      const maxY =
        document.documentElement.scrollHeight - window.innerHeight;
      scrollPct = maxY > 0 ? (window.scrollY / maxY) * 100 : 0;
      schedule();

      el.setAttribute("data-scrolling", "true");
      if (scrollTimer) window.clearTimeout(scrollTimer);
      scrollTimer = window.setTimeout(() => {
        el.removeAttribute("data-scrolling");
      }, 180);
    };

    window.addEventListener("pointermove", onPointer, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      if (scrollTimer) window.clearTimeout(scrollTimer);
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("scroll", onScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden
        motion-reduce:!opacity-10"
      style={{ contain: "layout paint style" }}
    >
      {/* 两层网格(已在 globals.css 用 transform 动画，GPU 合成) */}
      <div className="absolute inset-0">
        <div className="blueprint-grid blueprint-grid-small opacity-20" />
        <div className="blueprint-grid blueprint-grid-large opacity-30" />
      </div>

      {/* 左下角卫星轨道系统。卫星运动改为 CSS transform + transform-origin
          (圆心 0,200)，pure GPU，不再用 SMIL animateMotion。 */}
      <svg
        viewBox="0 0 200 200"
        className="absolute -bottom-16 -left-16 h-[50vw] w-[50vw]
          text-poster-line opacity-50"
        style={{ transform: "scale(calc(1 + var(--bg-scroll, 0) * 0.003))" }}
      >
        <defs>
          {/* Why: 卫星形状只定义一次，复用两次。 */}
          <g id="satellite">
            <rect x="-3" y="-2.2" width="6" height="4.4" fill="none" />
            <rect x="-7.6" y="-1.6" width="3.6" height="3.2" fill="none" />
            <rect x="4" y="-1.6" width="3.6" height="3.2" fill="none" />
            <line x1="0" y1="-2.2" x2="0" y2="-5.2" />
            <circle cx="0" cy="-5.8" r="1" fill="none" />
          </g>
        </defs>

        <circle cx="0" cy="200" r="60" fill="none" stroke="currentColor"
          strokeWidth="0.9" strokeDasharray="3 5" />
        <circle cx="0" cy="200" r="105" fill="none" stroke="currentColor"
          strokeWidth="0.9" strokeDasharray="3 6" />
        <circle cx="0" cy="200" r="150" fill="none"
          stroke="var(--color-poster-ice)" strokeWidth="0.7"
          strokeDasharray="2 7" opacity="0.5" />
        <circle cx="0" cy="200" r="26" fill="none" stroke="currentColor"
          strokeWidth="1.6" />
        <circle cx="0" cy="200" r="13" fill="var(--color-poster-ice)"
          opacity="0.5" />

        {/* How: g 包住卫星，translate(x,y) 把卫星放在轨道上(r=105, 初始角 0°)；
            animation: orbit105 16s 旋转一圈；transform-origin 锚在圆心 (0,200)。
            此为 CSS transform 动画 = GPU 合成。 */}
        <g className="orbit-satellite-105">
          <g stroke="var(--color-poster-ice)" strokeWidth="1.2"
            transform="translate(105, 200)">
            <use href="#satellite" />
          </g>
        </g>

        {/* 外轨道 r=150，26s 一圈，线条色 */}
        <g className="orbit-satellite-150">
          <g stroke="currentColor" strokeWidth="1.1"
            transform="translate(150, 200)">
            <use href="#satellite" />
          </g>
        </g>
      </svg>

      {/* 右上小卫星(纯 CSS 浮动动画，不碰 SMIL) */}
      <svg
        viewBox="0 0 100 100"
        className="animate-float-fast absolute right-10 top-1/4 h-36 w-36
          text-poster-ice opacity-30"
      >
        <path d="M6 66 A 48 48 0 0 1 94 34" fill="none" stroke="currentColor"
          strokeWidth="0.6" strokeDasharray="3 4" />
        <g transform="translate(50 50) rotate(18)" stroke="currentColor"
          strokeWidth="0.9" fill="none">
          <rect x="-6" y="-4" width="12" height="8" />
          <rect x="-15" y="-3" width="7" height="6" />
          <rect x="8" y="-3" width="7" height="6" />
          <line x1="-8" y1="0" x2="-15" y2="0" />
          <line x1="6" y1="0" x2="8" y2="0" />
          <line x1="0" y1="-4" x2="0" y2="-9" />
          <circle cx="0" cy="-10" r="1.4" fill="currentColor" stroke="none" />
        </g>
        <circle cx="94" cy="34" r="1.6" fill="currentColor" />
      </svg>

      {/* 模糊遮罩层。滚动时 [data-scrolling] 关掉；非滚动时
          translate3d 强制 GPU 独立合成层；blur 降至 1.5px 大幅减少采样开销。
          contain 隔离本层绘制/布局，使其变化不影响外层回流。 */}
      <div
        className="blur-reveal-layer absolute inset-0"
        style={{
          backdropFilter: "blur(1.5px)",
          WebkitBackdropFilter: "blur(1.5px)",
          transform: "translate3d(0, 0, 0)",
          maskImage:
            "radial-gradient(circle 150px at var(--bg-px, 50%) " +
            "var(--bg-py, 50%), transparent, transparent 32%, black 72%)",
          WebkitMaskImage:
            "radial-gradient(circle 150px at var(--bg-px, 50%) " +
            "var(--bg-py, 50%), transparent, transparent 32%, black 72%)",
          contain: "layout paint style",
        }}
      />
    </div>
  );
}
