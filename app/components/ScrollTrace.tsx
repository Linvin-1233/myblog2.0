"use client";

import { useEffect, useRef, useState } from "react";

type Trace = { d: string; echo: string };

// Why: 一根直角引导线，随滚动沿页面往前走。路径是量出来的，不是写死的——
// 从容器右上往下走，左拐横穿"大色块区"和"最新文章区"之间的缝隙
// ([data-trace-gap] 元素的位置)，再往下一直走到容器底部。
// Why 带断裂与复制：信号线不该是干净的一条。路径被切成几段留出断口，
// 旁边再并一条错位的短复线，像扫描/抄录时掉帧。
// How: pathLength=1 让 dash 用 1 归一化，滚动进度直接映射到 dashoffset，
// 于是线一格一格画下去。父容器尺寸/缝隙位置变化时重算路径。
export function ScrollTrace() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [trace, setTrace] = useState<Trace | null>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const parent = wrap?.parentElement;
    if (!wrap || !parent) return;

    let frame = 0;
    const compute = () => {
      frame = 0;
      const rect = parent.getBoundingClientRect();
      const w = rect.width;
      const h = parent.offsetHeight;
      const gap = parent.querySelector<HTMLElement>("[data-trace-gap]");
      // Why 只在桌面设备渲染(见 wrapper 的 device-desktop)：窄屏上两条竖线
      // 会和内容抢位置、太挤。
      // Why 左竖线取 w*0.15(不小于 120)：避开左侧固定导航(0~110)，
      // 同时落在页首左轨(整栏色块)与正文之间那条空栏里，不压任何文字。
      const rightX = w - 48;
      const leftX = Math.max(120, w * 0.15);
      const gapY = gap ? gap.getBoundingClientRect().top - rect.top : h * 0.42;

      const b1 = gapY * 0.32;
      const b2 = gapY * 0.64;
      const bv = gapY + (h - gapY) * 0.38;
      const d = [
        `M ${rightX} 0 L ${rightX} ${b1}`,
        `M ${rightX} ${b1 + 24} L ${rightX} ${b2}`,
        `M ${rightX} ${b2 + 18} L ${rightX} ${gapY} L ${leftX + 260} ${gapY}`,
        `M ${leftX + 200} ${gapY} L ${leftX} ${gapY} L ${leftX} ${bv}`,
        `M ${leftX} ${bv + 30} L ${leftX} ${h}`,
      ].join(" ");
      // 复线：起点附近的一条平行短线 + 拐角处的一条错位横线。
      const echo = [
        `M ${rightX - 14} 36 L ${rightX - 14} ${Math.min(b1 * 0.9, 200)}`,
        `M ${rightX - 180} ${gapY - 16} L ${rightX - 430} ${gapY - 16}`,
      ].join(" ");

      setTrace({ d, echo });
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(compute);
    };

    compute();
    const ro = new ResizeObserver(schedule);
    ro.observe(parent);
    window.addEventListener("resize", schedule);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", schedule);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg || !trace) return;

    const paths = Array.from(
      svg.querySelectorAll<SVGPathElement>("[data-trace-draw]"),
    );

    let frame = 0;
    const update = () => {
      frame = 0;
      // Why 分母是 max + 半屏：线头平时落在视口中央(滚动位置 + 半屏)，
      // 到页面最底部时分子分母相等、fraction 正好 = 1，线一定画到底；
      // 之前用 head/total，滚到最底也只画到 (h−半屏)/total，永远差一截。
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const half = window.innerHeight * 0.5;
      const denom = max + half;
      const fraction =
        denom > 0 ? Math.min(1, Math.max(0, (window.scrollY + half) / denom)) : 0;
      paths.forEach((path) => {
        path.style.strokeDashoffset = String(1 - fraction);
      });
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [trace]);

  return (
    <div
      ref={wrapRef}
      aria-hidden="true"
      className="device-desktop pointer-events-none absolute inset-0 z-0 overflow-hidden text-poster-title"
    >
      <svg ref={svgRef} className="h-full w-full" fill="none" stroke="currentColor">
        <path
          data-trace-draw
          pathLength={1}
          strokeWidth={3}
          strokeLinecap="square"
          strokeLinejoin="miter"
          strokeDasharray={1}
          style={{ strokeDashoffset: 1 }}
          d={trace?.d ?? ""}
          vectorEffect="non-scaling-stroke"
        />
        <path
          data-trace-draw
          pathLength={1}
          d={trace?.echo ?? ""}
          strokeWidth={2}
          strokeLinecap="square"
          strokeDasharray={1}
          opacity={0.55}
          style={{ strokeDashoffset: 1 }}
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    </div>
  );
}
