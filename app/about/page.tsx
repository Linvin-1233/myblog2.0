import type { Metadata } from "next";
import Link from "next/link";
import { renderMarkdown } from "@/lib/markdown";
import { getAllPostMeta, getAllTags } from "@/lib/posts";
import { pageMetadata } from "@/lib/seo";
import { chanceCode, chanceTilt } from "@/lib/dada";
import { padIndex } from "@/lib/format";
import { DadaCollage } from "../components/DadaCollage";
import { ImageLightbox } from "../components/ImageLightbox";
import { HeadingAnchors } from "../components/HeadingAnchors";
import { PageHeader } from "../components/PageHeader";
import "katex/dist/katex.min.css";

export const metadata: Metadata = pageMetadata({
  title: "关于",
  description: `关于 ${siteConfig.name} 与本站。`,
  path: "/about",
});

// Why: About 是档案页，不再把正文塞进居中卡片；左侧露出规格和照片碎片，
// 右侧正文被推远，留白本身成为版面的一部分。
export default function AboutPage() {
  const aboutHtml = renderMarkdown(aboutContent).html;
  const posts = getAllPostMeta();
  const tags = getAllTags();
  const based = [authorLocation.city, authorLocation.country].filter(Boolean).join(", ") || "—";

  return (
    <div className="shell pb-32">
      <PageHeader
        index="04"
        kicker="OPERATOR // DOSSIER"
        title="关于"
        meta={[
          { label: "NAME", value: siteConfig.author || siteConfig.name },
          { label: "BASED", value: based },
          { label: "TIMEZONE", value: authorLocation.timezone },
          { label: "LOCALE", value: siteConfig.locale },
        ]}
      />

      <div className="mt-24 grid grid-cols-12 gap-5 md:gap-8">
        <aside className="col-span-12 md:col-span-3">
          <div className="border-l-4 border-poster-line pl-4">
            <div className="flex items-start justify-between gap-3">
              <div className="font-mono text-[9px] uppercase tracking-[0.3em] text-poster-ice">
                {"// SPEC"}
              </div>
              <span className="stamp text-poster-fault" style={{ transform: `rotate(${chanceTilt(siteConfig.name, 5.5)})` }}>
                PROFILE
              </span>
            </div>
            <dl className="mt-8 space-y-4 font-mono text-[10px] uppercase tracking-[0.16em]">
              <div className="border-t-2 border-poster-line pt-2">
                <dt className="text-poster-text-muted">STATUS</dt>
                <dd className="mt-1 text-poster-text-bright">ONLINE</dd>
              </div>
              <div className="border-t-2 border-poster-line pt-2">
                <dt className="text-poster-text-muted">RECORDS</dt>
                <dd className="mt-1 text-poster-text-bright">{padIndex(posts.length)}</dd>
              </div>
              <div className="border-t-2 border-poster-line pt-2">
                <dt className="text-poster-text-muted">TOPICS</dt>
                <dd className="mt-1 text-poster-text-bright">{padIndex(tags.length)}</dd>
              </div>
              <div className="border-t-2 border-poster-line pt-2">
                <dt className="text-poster-text-muted">CHANCE</dt>
                <dd className="mt-1 text-poster-text-bright">{chanceCode(siteConfig.name)}</dd>
              </div>
            </dl>
          </div>

          <div className="mt-16">
            <DadaCollage compact />
          </div>

          <div className="mt-12 font-mono text-[9px] uppercase tracking-[0.3em] text-poster-ice">
            {"// FEED"}
          </div>
          <div className="mt-4 flex flex-col gap-2">
            <a
              href="/feed.xml"
              className="flex items-center justify-between border-2 border-poster-line px-3 py-2.5 font-mono text-[10px] uppercase tracking-[0.2em] text-poster-text-muted hover:border-poster-title hover:text-poster-title"
            >
              RSS
              <span>↗</span>
            </a>
            <a
              href="/sitemap.xml"
              className="flex items-center justify-between border-2 border-poster-line px-3 py-2.5 font-mono text-[10px] uppercase tracking-[0.2em] text-poster-text-muted hover:border-poster-title hover:text-poster-title"
            >
              SITEMAP
              <span>↗</span>
            </a>
          </div>
        </aside>

        <main className="col-span-12 min-w-0 md:col-span-8 md:col-start-5">
          <div className="border-t-4 border-poster-line pt-8">
            <ImageLightbox>
              <div className="post-content" dangerouslySetInnerHTML={{ __html: aboutHtml }} />
            </ImageLightbox>
            <HeadingAnchors />
          </div>

          <div className="mt-16 border-t-2 border-poster-line pt-5 font-mono text-[10px] uppercase tracking-[0.2em] text-poster-text-muted">
            <span className="text-poster-ice">{"// CONTACT_VIA"}</span>
            <span className="ml-6">{siteConfig.socialLinks.map((link) => link.label).join(" / ")}</span>
          </div>

          <section className="mt-24 border-t-4 border-poster-line pt-6">
            <div className="flex flex-wrap items-center gap-3 font-mono text-[9px] uppercase tracking-[0.3em] text-poster-ice">
              <span>{"// COLOPHON"}</span>
              <span className="h-0.5 flex-1 bg-poster-line" />
              <span className="text-poster-text-muted">{chanceCode(aboutContent)}</span>
            </div>
            <dl className="mt-8 grid gap-8 sm:grid-cols-3 font-mono text-[10px] uppercase tracking-[0.16em]">
              <div className="border-t-2 border-poster-line pt-2">
                <dt className="text-poster-text-muted">DISPLAY</dt>
                <dd className="mt-1 text-poster-text-bright">ANTON / BEBAS NEUE</dd>
              </div>
              <div className="border-t-2 border-poster-line pt-2">
                <dt className="text-poster-text-muted">TEXT</dt>
                <dd className="mt-1 text-poster-text-bright">CHAKRA PETCH / INSTRUMENT SERIF</dd>
              </div>
              <div className="border-t-2 border-poster-line pt-2">
                <dt className="text-poster-text-muted">CODE</dt>
                <dd className="mt-1 text-poster-text-bright">JETBRAINS MONO / MARKED + KATEX</dd>
              </div>
            </dl>
          </section>
        </main>
      </div>
    </div>
  );
}
