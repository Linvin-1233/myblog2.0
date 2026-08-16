import type { Metadata } from "next";
import { renderMarkdown } from "@/lib/markdown";
import { aboutContent, siteConfig } from "@/lib/siteConfig";
import { ImageLightbox } from "../components/ImageLightbox";
import { HeadingAnchors } from "../components/HeadingAnchors";
import "katex/dist/katex.min.css";

export const metadata: Metadata = {
  title: "关于",
  description: `关于 ${siteConfig.name} 与本站。`,
  alternates: { canonical: "/about" },
};

// Why: 关于页(v7 编辑流)——标题 + 正文窄栏 + 纯文本社交链接。
export default function AboutPage() {
  const aboutHtml = renderMarkdown(aboutContent).html;

  return (
    <div className="system-page system-subpage mx-auto w-full max-w-3xl px-4">
      <h1
        className="pt-10 text-3xl font-extrabold uppercase text-poster-title
          md:text-4xl"
      >
        关于
      </h1>
      <div className="mt-2 text-[10px] uppercase tracking-widest
        text-poster-text-muted">
        {"// OPERATOR"}
      </div>

      <div className="mt-8 border-t border-poster-line pt-8">
        <ImageLightbox>
          <div
            className="post-content"
            dangerouslySetInnerHTML={{ __html: aboutHtml }}
          />
        </ImageLightbox>
        <HeadingAnchors />
      </div>

      <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 border-t
        border-poster-line pt-6">
        {siteConfig.socialLinks.map((link) => (
          <a
            key={link.url}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] font-bold tracking-widest
              text-poster-ice transition-colors hover:text-poster-title"
          >
            {link.label} ↗
          </a>
        ))}
      </div>
    </div>
  );
}
