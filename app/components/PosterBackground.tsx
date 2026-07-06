"use client";

import { useEffect, useState } from "react";

// Why: 这是海报风的“环境层”——固定铺满视口的蓝图网格 + 漂浮几何 + 鼠标光圈，
// 复刻 example/App.vue 的沉浸氛围。做成独立组件让每个页面直接复用。
export function PosterBackground() {
  const [scrollPercent, setScrollPercent] = useState(0);
  const [spotlight, setSpotlight] = useState({ x: "50%", y: "50%" });

  useEffect(() => {
    // How: 用滚动百分比驱动装饰元素缓慢位移/旋转，制造视差；passive 监听
    // 避免阻塞滚动性能。
    const handleScroll = () => {
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight > 0) {
        setScrollPercent((window.scrollY / docHeight) * 100);
      }
    };
    const handlePointer = (event: PointerEvent) => {
      setSpotlight({ x: `${event.clientX}px`, y: `${event.clientY}px` });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("pointermove", handlePointer, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("pointermove", handlePointer);
    };
  }, []);

  // Why: 模糊层用遮罩“开洞”——指针处 alpha=0 不绘制该层(=不模糊=清晰)，
  // 四周 alpha=1 正常绘制(=backdrop 模糊)，从而实现“鼠标处取消模糊”。
  const blurRevealMask = `radial-gradient(circle 150px at ${spotlight.x} \
${spotlight.y}, transparent 0%, transparent 32%, black 72%)`;

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {/* Why: 两层网格叠加视差——小网格在后跑得快、大网格在前跑得慢。模糊统一
          交给下方的模糊遮罩层处理，这里保持清晰绘制。 */}
      <div className="absolute inset-0">
        <div className="blueprint-grid blueprint-grid-small absolute inset-0
          opacity-20" />
        <div className="blueprint-grid blueprint-grid-large absolute inset-0
          opacity-30" />
      </div>

      {/* Why: 左下角一颗星体，向外扩散的虚线圆环即卫星轨道；一颗卫星沿中间
          轨道掠过(animateMotion 沿完整圆路径循环，视口外部分被裁掉，形成
          "经过"的观感)。圆心锚在角上(0,200)，只露出朝视口的那段弧。 */}
      <svg
        viewBox="0 0 200 200"
        className="absolute -bottom-16 -left-16 h-[50vw] w-[50vw]
          text-poster-line opacity-50"
        style={{ transform: `scale(${1 + scrollPercent * 0.003})` }}
      >
        <circle
          cx="0"
          cy="200"
          r="60"
          fill="none"
          stroke="currentColor"
          strokeWidth="0.9"
          strokeDasharray="3 5"
        />
        <circle
          cx="0"
          cy="200"
          r="105"
          fill="none"
          stroke="currentColor"
          strokeWidth="0.9"
          strokeDasharray="3 6"
        />
        <circle
          cx="0"
          cy="200"
          r="150"
          fill="none"
          stroke="var(--color-poster-ice)"
          strokeWidth="0.7"
          strokeDasharray="2 7"
          opacity="0.5"
        />

        {/* 角上的中心星体 */}
        <circle
          cx="0"
          cy="200"
          r="26"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
        />
        <circle cx="0" cy="200" r="13" fill="var(--color-poster-ice)" opacity="0.5" />

        {/* 沿中间轨道(r=105)掠过的卫星，带太阳能帆板，rotate=auto 顺轨道朝向 */}
        <g
          stroke="var(--color-poster-ice)"
          strokeWidth="1.2"
          fill="none"
        >
          <rect x="-3" y="-2.2" width="6" height="4.4" />
          <rect x="-7.6" y="-1.6" width="3.6" height="3.2" />
          <rect x="4" y="-1.6" width="3.6" height="3.2" />
          <line x1="0" y1="-2.2" x2="0" y2="-5.2" />
          <circle
            cx="0"
            cy="-5.8"
            r="0.9"
            fill="var(--color-poster-ice)"
            stroke="none"
          />
          <animateMotion
            dur="16s"
            repeatCount="indefinite"
            rotate="auto"
            path="M 105 200 A 105 105 0 1 1 -105 200 A 105 105 0 1 1 105 200"
          />
        </g>

        {/* 沿最外轨道(r=150)掠过的第二颗卫星，用线条色、走得更慢 */}
        <g
          stroke="currentColor"
          strokeWidth="1.1"
          fill="none"
        >
          <rect x="-2.6" y="-1.9" width="5.2" height="3.8" />
          <rect x="-6.6" y="-1.4" width="3.2" height="2.8" />
          <rect x="3.4" y="-1.4" width="3.2" height="2.8" />
          <line x1="0" y1="-1.9" x2="0" y2="-4.6" />
          <circle cx="0" cy="-5.2" r="0.8" fill="currentColor" stroke="none" />
          <animateMotion
            dur="26s"
            repeatCount="indefinite"
            rotate="auto"
            path="M 150 200 A 150 150 0 1 1 -150 200 A 150 150 0 1 1 150 200"
          />
        </g>
      </svg>

      {/* Why: 小簇 = 一颗独立卫星 + 一段轨道弧，冰蓝点缀呼应主色。 */}
      <svg
        viewBox="0 0 100 100"
        className="animate-float-fast absolute right-10 top-1/4 h-36 w-36
          text-poster-ice opacity-30"
        style={{ transform: `translateY(${-scrollPercent * 0.4}px)` }}
      >
        <path
          d="M6 66 A 48 48 0 0 1 94 34"
          fill="none"
          stroke="currentColor"
          strokeWidth="0.6"
          strokeDasharray="3 4"
        />
        <g
          transform="translate(50 50) rotate(18)"
          stroke="currentColor"
          strokeWidth="0.9"
          fill="none"
        >
          <rect x="-6" y="-4" width="12" height="8" />
          <rect x="-15" y="-3" width="7" height="6" />
          <rect x="8" y="-3" width="7" height="6" />
          <line x1="-8" y1="0" x2="-15" y2="0" />
          <line x1="6" y1="0" x2="8" y2="0" />
          <line x1="0" y1="-4" x2="0" y2="-9" />
          <circle
            cx="0"
            cy="-10"
            r="1.4"
            fill="currentColor"
            stroke="none"
          />
        </g>
        <circle cx="94" cy="34" r="1.6" fill="currentColor" />
      </svg>

      {/* Why: 模糊遮罩层——覆盖全部装饰，用 backdrop-filter 模糊其后内容；
          遮罩在指针处开洞，使鼠标所到之处清晰、四周模糊。 */}
      <div
        className="absolute inset-0"
        style={{
          backdropFilter: "blur(2.5px)",
          WebkitBackdropFilter: "blur(2.5px)",
          maskImage: blurRevealMask,
          WebkitMaskImage: blurRevealMask,
        }}
      />
    </div>
  );
}
