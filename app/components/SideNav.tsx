"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { navItems } from "./nav";
import { ThemeToggle } from "./ThemeToggle";

// Why: 导航从页脚迁到视口左侧、垂直居中的固定竖排轨道——滚动时始终在场，
// 于是"现在在哪一页"变成常驻信息，而不是要滚到底才看得到。
// 轨道本身就是一条发丝线(border-l)，与全站的裸露网格同一套语言。
// Why 遇到页面列表就缩回左侧：引导线会在下方靠左一路向下穿过去，
// 两条线不该在同一个位置打架，所以列表一进视口，轨道就整体往左缩。
export function SideNav() {
  const pathname = usePathname();
  const [retracted, setRetracted] = useState(false);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  useEffect(() => {
    const marker = document.querySelector<HTMLElement>("[data-trace-list]");
    if (!marker) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setRetracted(false);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => setRetracted(entry.isIntersecting),
      { rootMargin: "0px 0px -25% 0px" },
    );
    observer.observe(marker);
    return () => observer.disconnect();
  }, [pathname]);

  return (
    <nav
      aria-label="站点导航"
      aria-hidden={retracted}
      inert={retracted}
      className={`device-desktop fixed left-0 top-1/2 z-40 flex -translate-y-1/2 flex-col gap-4
        border-l-2 border-poster-line pl-4 transition-[transform,opacity]
        duration-500 ${
        retracted
          ? "pointer-events-none -translate-x-[130%] opacity-0"
          : "pointer-events-auto translate-x-0 opacity-100"
      }`}
    >
      {navItems.map((item) => {
        const active = isActive(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={`hard-hover font-mono text-[10px] uppercase
              tracking-[0.2em] transition-colors ${
              active
                ? "text-poster-ice"
                : "text-poster-text-muted hover:text-poster-title"
            }`}
          >
            {item.label}
          </Link>
        );
      })}

      {/* 主题开关从顶栏搬到左侧轨道底部，和导航同一条竖线。 */}
      <div className="mt-2">
        <ThemeToggle />
      </div>
    </nav>
  );
}
