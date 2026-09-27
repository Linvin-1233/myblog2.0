"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

// Why: 路由切换用两块各占半屏的纯色场：左半 --poster-ice、右半 --poster-deep，
// 从两侧擦进来盖住整屏。盖住之后不按定时器展开——而是等新页面的加载态
// (loading.tsx 根节点的 [data-route-loading]) 消失、且盖屏动画跑完，才擦出去。
// 这样慢路由不会先露半截、再闪一下；快路由也至少盖够一帧动画。
const MIN_COVER = 420;
const MAX_COVER = 6000;
const LOADING_SELECTOR = "[data-route-loading]";

export function RouteSwapTransition() {
  const pathname = usePathname();
  const firstRender = useRef(true);
  const rafRef = useRef<number | null>(null);
  const safetyRef = useRef<number | null>(null);
  const [active, setActive] = useState(false);

  const clearTimers = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (safetyRef.current !== null) {
      window.clearTimeout(safetyRef.current);
      safetyRef.current = null;
    }
  }, []);

  // 盖上，并起一个兜底定时器：万一加载态永远不出现/不消失，也不至于一直盖着。
  const cover = useCallback(() => {
    clearTimers();
    setActive(true);
    safetyRef.current = window.setTimeout(() => {
      safetyRef.current = null;
      setActive(false);
    }, MAX_COVER);
  }, [clearTimers]);

  const waitForReady = useCallback(() => {
    clearTimers();
    const started = performance.now();
    let sawLoading = false;

    const tick = () => {
      rafRef.current = null;
      const loading = document.querySelector(LOADING_SELECTOR) !== null;
      if (loading) sawLoading = true;
      const elapsed = performance.now() - started;
      // 见过加载态 → 等它消失；没见过 → 给 220ms 确认(防加载态晚一帧挂上)。
      const settled = sawLoading ? !loading : elapsed >= 220;
      if ((elapsed >= MIN_COVER && settled) || elapsed >= MAX_COVER) {
        setActive(false);
        return;
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  }, [clearTimers]);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    // 路由已提交：确保盖住，然后等新页面的加载态结束才展开。
    cover();
    waitForReady();
  }, [pathname, cover, waitForReady]);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      const target = event.target;
      const link = target instanceof Element ? target.closest("a") : null;
      if (!link || link.target === "_blank" || link.hasAttribute("download")) {
        return;
      }

      const url = new URL(link.href, window.location.href);
      if (url.origin === window.location.origin && url.pathname !== pathname) {
        // 点下去就先盖上，反馈立即；等 pathname effect 再接管展开时机。
        cover();
      }
    };

    document.addEventListener("click", onClick, true);
    return () => {
      document.removeEventListener("click", onClick, true);
      clearTimers();
    };
  }, [pathname, cover, clearTimers]);

  return (
    <div
      aria-hidden="true"
      className={`route-swap${active ? " route-swap-active" : ""}`}
    >
      <span className="route-swap-block" />
      <span className="route-swap-block" />
    </div>
  );
}
