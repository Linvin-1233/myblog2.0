"use client";

import { useCallback, useEffect, useState } from "react";

// Why: 点击文章正文中的图片时全屏展示原图 + alt 文案；适合静态导出的博客
// (无后端图片服务)，直接在客户端拦截点击即可。
// v3 系统风：预览图套故障青描边 + 扫描线蒙层，图注 "FIG // alt"。
export function ImageLightbox({ children }: { children: React.ReactNode }) {
  const [target, setTarget] = useState<{ src: string; alt: string } | null>(
    null,
  );
  // Why: 关闭时先播放退场动画再卸载；closing 期间保持渲染但套用退场类。
  const [closing, setClosing] = useState(false);

  // How: 因内容来自 dangerouslySetInnerHTML 的静态 HTML，用事件委派在容器
  // 上捕获所有 <img> 点击，而非给每张图挂 React 事件。
  const handleContainerClick = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      const img = (event.target as HTMLElement).closest("img");
      if (!img) return;
      event.preventDefault();
      setClosing(false);
      setTarget({ src: img.src, alt: img.alt || "" });
    },
    [],
  );

  // How: 触发退场动画，200ms 后真正卸载(与 CSS 动画时长一致)。
  const close = useCallback(() => {
    setClosing(true);
    window.setTimeout(() => {
      setTarget(null);
      setClosing(false);
    }, 200);
  }, []);

  // How: Esc 关闭，符合灯箱的无障碍操作直觉。
  useEffect(() => {
    if (!target) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [target, close]);

  // Why: 打开灯箱时禁止页面滚动，防止蒙层下方内容跟随滚轮移动。
  useEffect(() => {
    document.body.style.overflow = target ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [target]);

  return (
    <>
      <div onClick={handleContainerClick} role="presentation">
        {children}
      </div>

      {target && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={target.alt || "图片预览"}
          onClick={close}
          className={`fixed inset-0 z-50 flex flex-col items-center
            justify-center bg-black/80 p-4 backdrop-blur-sm ${
              closing
                ? "animate-[fadeOut_0.2s_ease-in_forwards]"
                : "animate-[fadeIn_0.2s_ease-out]"
            }`}
        >
          <div
            role="presentation"
            onClick={(event) => event.stopPropagation()}
            className={`flex max-h-[90vh] max-w-[90vw] flex-col items-center
              gap-3 ${
                closing
                  ? "animate-[lightboxOut_0.2s_ease-in_forwards]"
                  : "animate-[lightboxIn_0.25s_cubic-bezier(0.22,1,0.36,1)]"
              }`}
          >
            {/* 预览图片(冰蓝描边，无蒙层装饰) */}
            <div className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={target.src}
                alt={target.alt}
                className="max-h-[82vh] max-w-full border border-poster-ice
                  bg-poster-panel object-contain p-1
                  shadow-[0_0_40px_rgba(0,0,0,0.5)]"
              />
            </div>
            {target.alt && (
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-poster-ice">
                {`FIG // ${target.alt}`}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={close}
            aria-label="关闭预览"
            className="absolute right-4 top-4 border border-poster-line
              bg-poster-panel px-3 py-1.5 text-[11px] font-extrabold
              text-poster-ice transition-colors hover:border-poster-ice
              hover:bg-poster-ice hover:text-poster-bg"
          >
            [X]
          </button>
        </div>
      )}
    </>
  );
}
