"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

// Why: 滚动进入 / 离出。所有 [data-reveal] 元素共用一个 IntersectionObserver，
// 这里只切 data-reveal-state，位移与过渡全在 CSS 里。
// Why 每个 [data-reveal] 元素都要带 suppressHydrationWarning：这个组件挂在
// layout，会先于页面那条 Suspense 边界水合，effect 在页面元素还没水合时就把
// data-reveal-state 写进 DOM，React 水合到页面时就会报属性不匹配。
// 新增带 [data-reveal] 的元素时别忘了一起加。
// How 双向：isIntersecting 为假时写回 out，所以上下滚动都有反向动效，
// 而不是"播一次就结束"。同一元素的状态只在真正变化时才写，避免抖动。
// Why 还要 MutationObserver：客户端路由时新页面常常先经过 loading 边界，
// 这个 effect 在 fallback 阶段就跑完了；等真实内容插入时已经错过扫描，
// 那些 [data-reveal] 会永远停在 opacity:0（只能刷新恢复）。MutationObserver
// 保证后插入的节点也会被观察，加载完成即自动入场。
export function ScrollReveal() {
  const pathname = usePathname();

  useEffect(() => {
    const seen = new WeakMap<Element, boolean>();

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const el = entry.target as HTMLElement;
          const next = entry.isIntersecting;
          if (seen.get(el) === next) continue;
          seen.set(el, next);
          el.setAttribute("data-reveal-state", next ? "in" : "out");
        }
      },
      // Why 上下都往外扩，且比之前更大：根区域 = [视口顶 -30%, 视口底 +25%]。
      //   进入更早：元素还在视口下方 25% 时就触发，等它真正露出来时动效
      //             已经跑完大半，看到的是"已经在动"而不是"刚开始动"。
      //   离出更晚：要等元素整体越过视口顶 30% 才判为离开，读着的行绝不会
      //             在视网膜里淡掉，往上滚回去也依然亮着。
      // 关键是不对称：上下都收(最初那版)会让元素还没走完就淡出；
      // 上下都扩、且扩得更大，才是"更早进、更晚出"。
      { rootMargin: "30% 0px 25% 0px" },
    );

    // observe 是幂等的：重复 observe 同一元素不会重复回调，所以可以整篇扫。
    const scan = () => {
      document.querySelectorAll<HTMLElement>("[data-reveal]").forEach((node) => {
        observer.observe(node);
      });
    };

    let frame = 0;
    const scheduleScan = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        scan();
      });
    };

    // How 双 rAF：先让"初始隐藏"那一帧真正画出来，再加状态，
    // 过渡才会跑——否则首屏元素会直接出现在终态、看不到动效。
    let second = 0;
    const first = requestAnimationFrame(() => {
      second = requestAnimationFrame(scan);
    });

    const mutation = new MutationObserver(scheduleScan);
    mutation.observe(document.body, { childList: true, subtree: true });

    // Why 安全网：初始态是"隐藏"，所以一旦观察器没能回调(脚本报错、
    // 组件没挂上、浏览器不支持)，内容就会永久留在透明状态——
    // 动效可以失效，内容不能消失。超时后无条件把还没定过状态的元素显示出来。
    const failsafe = window.setTimeout(() => {
      document.querySelectorAll<HTMLElement>("[data-reveal]").forEach((node) => {
        if (!node.hasAttribute("data-reveal-state")) {
          node.setAttribute("data-reveal-state", "in");
        }
      });
    }, 1500);

    return () => {
      cancelAnimationFrame(first);
      cancelAnimationFrame(second);
      if (frame) cancelAnimationFrame(frame);
      window.clearTimeout(failsafe);
      mutation.disconnect();
      observer.disconnect();
    };
  }, [pathname]);

  return null;
}
