"use client";

import { useEffect } from "react";

// Why: marked-gfm-heading-id 给标题加了 id，但没有可点击的锚点。这里在挂载后
// 给 .post-content 里每个带 id 的标题追加一个 # 链接：点击复制该标题的完整
// URL 到剪贴板并跳转，方便分享到具体章节。
export function HeadingAnchors() {
  useEffect(() => {
    const headings = document.querySelectorAll<HTMLElement>(
      ".post-content h1[id], .post-content h2[id], .post-content h3[id]," +
        ".post-content h4[id], .post-content h5[id], .post-content h6[id]",
    );

    const cleanups: (() => void)[] = [];

    headings.forEach((heading) => {
      if (heading.querySelector(".heading-anchor")) return;
      const anchor = document.createElement("a");
      anchor.className = "heading-anchor";
      anchor.href = `#${heading.id}`;
      anchor.textContent = "#";
      anchor.setAttribute("aria-label", "复制该标题链接");

      const onClick = (event: MouseEvent) => {
        event.preventDefault();
        const url = `${location.origin}${location.pathname}#${heading.id}`;
        history.replaceState(null, "", `#${heading.id}`);
        heading.scrollIntoView({ behavior: "smooth" });
        // How: 复制失败(如非 HTTPS 环境)也不阻塞跳转。
        navigator.clipboard?.writeText(url).catch(() => {});
        anchor.classList.add("copied");
        window.setTimeout(() => anchor.classList.remove("copied"), 1200);
      };

      anchor.addEventListener("click", onClick);
      heading.appendChild(anchor);
      cleanups.push(() => {
        anchor.removeEventListener("click", onClick);
        anchor.remove();
      });
    });

    return () => cleanups.forEach((fn) => fn());
  }, []);

  return null;
}
