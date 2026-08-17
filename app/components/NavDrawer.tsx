"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { padIndex } from "@/lib/format";
import { ThemeToggle } from "./ThemeToggle";

const navItems = [
  { href: "/", label: "HOME" },
  { href: "/posts", label: "POSTS" },
  { href: "/search", label: "SEARCH" },
  { href: "/tags", label: "TAGS" },
  { href: "/archive", label: "ARCHIVE" },
  { href: "/geo", label: "GEO" },
  { href: "/about", label: "ABOUT" },
];

export function NavDrawer({ siteName }: { siteName: string }) {
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
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="打开导航"
        aria-expanded={open}
        className="fixed bottom-4 right-4 z-50 grid h-10 w-10 place-items-center
          border border-poster-line bg-poster-bg/90 text-poster-ice
          transition-[transform,border-color] hover:border-poster-ice
          active:translate-x-px active:translate-y-px
          md:bottom-auto md:left-4 md:right-auto md:top-4 md:h-11 md:w-11"
      >
        <span className="grid w-5 gap-1" aria-hidden="true">
          <i className="h-px w-full bg-current" />
          <i className="h-px w-3 bg-current" />
          <i className="h-px w-4 translate-x-1 bg-current" />
        </span>
      </button>

      <button
        type="button"
        aria-label="关闭导航"
        onClick={() => setOpen(false)}
        className={`fixed inset-0 z-60 bg-black/65 backdrop-blur-sm transition-opacity
          duration-300 ${open ? "pointer-events-auto opacity-100" :
          "pointer-events-none opacity-0"}`}
      />

      <aside
        aria-hidden={!open}
        className={`fixed inset-y-0 left-0 z-70 flex w-[min(88vw,380px)]
          flex-col border-r border-poster-ice/50 bg-poster-bg px-6 pb-7 pt-6
          transition-[transform,box-shadow] duration-300 ease-out ${open
            ? "translate-x-0 shadow-[24px_0_80px_rgba(0,0,0,0.38)]"
            : "-translate-x-full shadow-none"}`}
      >
        <div className="flex items-start justify-between border-b border-poster-line pb-6">
          <div>
            <div className="text-[9px] tracking-[0.28em] text-poster-text-muted">
              NAVIGATION / SIGNAL MAP
            </div>
            <div className="mt-2 text-lg font-extrabold tracking-wider text-poster-title">
              {siteName.toUpperCase()}<span className="text-poster-ice">_</span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="border border-poster-line px-2 py-1 text-xs text-poster-ice
              hover:border-poster-ice"
          >
            ESC
          </button>
        </div>

        <nav className="mt-8 grid gap-1">
          {navItems.map((item, index) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={`group grid grid-cols-[32px_1fr_auto] items-center border-b
                px-2 py-4 text-xs tracking-[0.18em] transition-colors ${
                isActive(item.href)
                  ? "border-poster-ice bg-poster-ice/10 text-poster-ice"
                  : "border-poster-line text-poster-text-muted hover:text-poster-title"
              }`}
            >
              <span>{padIndex(index + 1)}</span>
              <span>{item.label}</span>
              <span className="translate-x-2 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100">
                →
              </span>
            </Link>
          ))}
        </nav>

        <div className="mt-auto border-t border-poster-line pt-5">
          <div className="mb-4 grid grid-cols-8 gap-1" aria-hidden="true">
            {Array.from({ length: 8 }, (_, index) => (
              <i
                key={index}
                className={`h-2 ${index < 5 ? "bg-poster-ice/50" : "bg-poster-line"}`}
              />
            ))}
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-[8px] tracking-[0.18em] text-poster-text-muted">
              CHANNEL / 07<br />CONNECTION STABLE
            </span>
            <ThemeToggle />
          </div>
        </div>
      </aside>
    </>
  );
}
