"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { navItems } from "./nav";
import { ThemeToggle } from "./ThemeToggle";

// Why: 站点导航不再是一条带边框的粘性顶栏，而是正文版心内部的第一行：
// 纯文本链接、无背景无分割线，滚动时随页面一起走，header/body/footer 融为一体。
export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <>
      <header className="device-mobile shell relative z-40 flex h-20 items-center justify-between gap-6 md:h-24">
        <div className="ml-auto flex items-center gap-4">
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-expanded={open}
            aria-controls="mobile-nav"
            className="border-2 border-poster-title px-3 py-2 font-mono text-[9px]
              uppercase tracking-[0.2em] text-poster-title"
          >
            [ MENU ]
          </button>
        </div>
      </header>

      {/* Why: 移动端面板是 header 的兄弟节点，整屏覆盖，不依赖任何顶栏高度。 */}
      <div
        id="mobile-nav"
        aria-hidden={!open}
        inert={!open}
        className={`device-mobile fixed inset-0 z-50 flex bg-poster-bg
          transition-[opacity,transform] duration-200 ${
          open
            ? "pointer-events-auto translate-y-0 opacity-100"
            : "pointer-events-none -translate-y-3 opacity-0"
        }`}
      >
        {/* Why 左侧装饰：一整条竖的斜纹色块，与首页色块内部那套斜纹同一语言；
            导航全部靠右，面板左缘就由这条纹理压住，不再放任何字标。 */}
        <div
          aria-hidden="true"
          className="hatch w-16 shrink-0 border-r-2 border-poster-line
            text-poster-ice opacity-70"
        />

        <div className="flex min-w-0 flex-1 flex-col">
          <div className="shell flex h-20 shrink-0 items-center justify-end pr-4">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="border-2 border-poster-title px-3 py-2 font-mono text-[9px]
                uppercase tracking-[0.2em] text-poster-title"
            >
              [ X ]
            </button>
          </div>

          <nav className="shell flex flex-1 flex-col justify-center gap-1 overflow-y-auto py-6">
            {navItems.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="group flex items-baseline justify-end gap-4 py-4"
                >
                  <span
                    className={`type-condensed text-4xl uppercase transition-colors ${
                      active
                        ? "text-poster-ice"
                        : "text-poster-title group-hover:text-poster-ice"
                    }`}
                  >
                    {item.label}
                  </span>
                  <span className="font-mono text-xs text-poster-ice">→</span>
                </Link>
              );
            })}
          </nav>

          <div className="shell flex items-center justify-end py-6">
            <ThemeToggle />
          </div>
        </div>
      </div>
    </>
  );
}
