"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { padIndex } from "@/lib/format";

// Why: 导航从顶栏移入抽屉，顶栏更简洁；链接集中在侧边栏，配合海报风的
// “终端菜单”观感。
const navItems = [
  { href: "/search", label: "SEARCH" },
  { href: "/", label: "HOME" },
  { href: "/posts", label: "POSTS" },
  { href: "/tags", label: "TAGS" },
  { href: "/archive", label: "ARCHIVE" },
  { href: "/about", label: "ABOUT" },
];

export function Sidebar() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  // How: 遮罩/抽屉需经 portal 挂到 body，规避 header 的 backdrop-filter 成为
  // fixed 包含块的问题；仅在挂载后渲染 portal，避免服务端与首帧 hydration 不一致。
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  // How: 打开抽屉时锁定 body 滚动，关闭/卸载时复位，避免背景可滚动或残留锁定。
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // How: Esc 关闭抽屉，符合弹层的无障碍与操作直觉。
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Why: 首页需精确匹配，其余用前缀匹配，使子路由(如 /posts/slug)也高亮对应项。
  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  // Why: 遮罩铺满视口、点击即关(不模糊，仅轻微压暗)；抽屉常驻 DOM、用 translate
  // 滑入滑出。二者挂到 body 顶层，确保覆盖全屏、任意空白处点击都能关闭。
  const overlayAndDrawer = (
    <>
      <div
        onClick={() => setOpen(false)}
        className={`fixed inset-0 z-40 bg-black/40 transition-opacity
          duration-300 ${
            open ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
      />

      <aside
        className={`fixed left-0 top-0 z-50 flex h-screen w-64 flex-col
          border-r-2 border-poster-line bg-poster-panel transition-transform
          duration-300 ${open ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div
          className="flex items-center justify-between border-b border-poster-line
            px-5 py-4"
        >
          <span className="text-[10px] font-bold tracking-widest text-poster-ice">
            {"// NAVIGATION"}
          </span>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="关闭导航"
            className="text-[11px] font-extrabold text-poster-text-muted
              transition-colors hover:text-poster-ice"
          >
            [ X ]
          </button>
        </div>

        <nav className="flex flex-col gap-1 p-4">
          {navItems.map((item, index) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={`flex items-center gap-3 border px-3 py-2.5 text-xs
                font-bold uppercase tracking-widest transition-all ${
                  isActive(item.href)
                    ? "border-poster-ice bg-poster-ice/10 text-poster-ice"
                    : "border-transparent text-poster-text-bright " +
                      "hover:border-poster-line hover:text-poster-ice"
                }`}
            >
              <span className="text-[10px] text-poster-text-muted">
                {padIndex(index + 1)}
              </span>
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
    </>
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="打开导航"
        className="flex items-center gap-2 border-2 border-poster-line
          bg-poster-panel/90 px-2.5 py-1.5 text-[10px] font-extrabold
          tracking-widest text-poster-ice transition-all duration-300
          hover:border-poster-ice hover:bg-poster-ice hover:text-poster-bg
          shadow-[3px_3px_0px_var(--poster-shadow)] active:translate-x-0.5
          active:translate-y-0.5 active:shadow-none"
      >
        <svg viewBox="0 0 16 16" fill="none" className="h-3.5 w-3.5">
          <path
            d="M1 3h14M1 8h14M1 13h14"
            stroke="currentColor"
            strokeWidth="1.6"
          />
        </svg>
        <span className="hidden sm:inline">MENU</span>
      </button>

      {mounted ? createPortal(overlayAndDrawer, document.body) : null}
    </>
  );
}
