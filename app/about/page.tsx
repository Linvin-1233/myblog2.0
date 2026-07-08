import type { Metadata } from "next";
import { renderMarkdown } from "@/lib/markdown";
import { aboutContent, siteConfig } from "@/lib/siteConfig";
import { SectionLabel } from "../components/SectionLabel";
import { ImageLightbox } from "../components/ImageLightbox";
import { HeadingAnchors } from "../components/HeadingAnchors";
import "katex/dist/katex.min.css";

export const metadata: Metadata = {
  title: "关于",
  description: `关于 ${siteConfig.name} 与本站。`,
  alternates: { canonical: "/about" },
};

// Why: 关于文案改从 config.yml 的 about 字段读取，维护时无需碰代码文件。
export default function AboutPage() {
  const aboutHtml = renderMarkdown(aboutContent).html;

  return (
    <section className="relative pt-8">
      <SectionLabel>[SEC // OPERATOR_PROFILE]</SectionLabel>
      <div className="mb-8 border-b border-poster-line pb-4">
        <span className="block text-[10px] tracking-widest text-poster-text-muted">
          {"// WHO_AM_I"}
        </span>
        <h1 className="text-xl font-extrabold uppercase text-poster-title">
          关于
        </h1>
      </div>

      <ImageLightbox>
        <div
          className="post-content"
          dangerouslySetInnerHTML={{ __html: aboutHtml }}
        />
      </ImageLightbox>
      <HeadingAnchors />

      <div className="mt-8 flex flex-wrap gap-3">
        {siteConfig.socialLinks.map((link) => (
          <a
            key={link.url}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="border border-poster-line bg-poster-panel/40 px-2.5 py-1
              text-[10px] font-bold tracking-widest text-poster-text-bright
              transition-all hover:border-poster-ice hover:bg-poster-ice
              hover:text-poster-bg"
          >
            [ {link.label} ]
          </a>
        ))}
      </div>
    </section>
  );
}
