"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { padIndex } from "@/lib/format";
import { navItems } from "./nav";
import { ThemeToggle } from "./ThemeToggle";

// Why: 站点导航不再是一条带边框的粘性顶栏，而是正文版心内部的第一行：
// 纯文本链接、无背景无分割线，滚动时随页面一起走，header/body/footer 融为一体。
export function SiteHeader({ siteName }: { siteName: string }) {
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

  const isActive = (href: string) => pathname.startsWith(href);

  const [word, suffix] = siteName.split("_");
  const main = word || siteName;
  const tail = suffix ? `_${suffix}` : "";

  return (
    <>
      <header className="shell relative z-40 flex h-20 items-center justify-between gap-6 md:h-24">
        <Link
          href="/"
          aria-label={siteName}
          className="group flex shrink-0 items-center gap-2.5"
        >
          <span
            className="grid h-6 w-6 place-items-center bg-poster-title font-display
              text-[12px] leading-none text-poster-bg transition-colors
              group-hover:bg-poster-ice"
          >
            {main.slice(0, 1).toUpperCase()}
          </span>
          <span className="flex items-baseline">
            <span className="type-display text-xl uppercase text-poster-title">
              {main}
            </span>
            <span className="type-condensed text-xl text-poster-ice">{tail}</span>
          </span>
        </Link>

        <nav className="hidden items-baseline gap-8 lg:flex">
          {navItems.map((item, index) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`hard-hover flex items-baseline gap-1.5 font-mono
                  text-[10px] uppercase tracking-[0.2em] transition-colors ${
                  active
                    ? "text-poster-ice"
                    : "text-poster-text-muted hover:text-poster-title"
                }`}
              >
                <span className="text-[9px] opacity-70">
                  {padIndex(index + 1)}
                </span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-4">
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-expanded={open}
            aria-controls="mobile-nav"
            className="border-2 border-poster-title px-3 py-2 font-mono text-[9px]
              uppercase tracking-[0.2em] text-poster-title lg:hidden"
          >
            [ MENU ]
          </button>
        </div>
      </header>

      {/* Why: 移动端面板是 header 的兄弟节点，整屏覆盖，不依赖任何顶栏高度。 */}
      <div
        id="mobile-nav"
        aria-hidden={!open}
        className={`fixed inset-0 z-50 flex flex-col bg-poster-bg
          transition-[opacity,transform] duration-200 lg:hidden ${
          open
            ? "pointer-events-auto translate-y-0 opacity-100"
            : "pointer-events-none -translate-y-3 opacity-0"
        }`}
      >
        <div className="shell flex h-20 shrink-0 items-center justify-between">
          <span className="flex items-baseline">
            <span className="type-display text-xl uppercase text-poster-title">
              {main}
            </span>
            <span className="type-condensed text-xl text-poster-ice">{tail}</span>
          </span>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="border-2 border-poster-title px-3 py-2 font-mono text-[9px]
              uppercase tracking-[0.2em] text-poster-title"
          >
            [ X ]
          </button>
        </div>

        <nav className="shell flex-1 overflow-y-auto py-6">
          {navItems.map((item, index) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="group flex items-baseline gap-4 py-5"
              >
                <span
                  className={`font-mono text-[10px] ${
                    active ? "text-poster-ice" : "text-poster-text-muted"
                  }`}
                >
                  {padIndex(index + 1)}
                </span>
                <span
                  className={`type-condensed text-4xl uppercase transition-colors ${
                    active
                      ? "text-poster-ice"
                      : "text-poster-title group-hover:text-poster-ice"
                  }`}
                >
                  {item.label}
                </span>
                <span className="ml-auto font-mono text-xs text-poster-ice">→</span>
              </Link>
            );
          })}
        </nav>

        <div
          className="shell flex items-center justify-between py-6 font-mono
            text-[9px] uppercase tracking-[0.24em] text-poster-text-muted"
        >
          <span>{siteName}</span>
          <ThemeToggle />
        </div>
      </div>
    </>
  );
}
