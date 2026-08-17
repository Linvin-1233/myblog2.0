import Link from "next/link";
import { getAllPostMeta } from "@/lib/posts";
import { siteConfig } from "@/lib/siteConfig";
import { EarthGlobe } from "./components/EarthGlobe";
import { PostRow } from "./components/PostRow";
import { DataWarp } from "./components/DataWarp";

// Why: 首页是失序的轨道控制台：地球仍是主视觉，但标题、遥测和诊断块故意
// 跨网格错位，形成 system-art 混乱感；文章流保持稳定，提供阅读锚点。
export default function HomePage() {
  const latestPosts = getAllPostMeta().slice(0, siteConfig.latestCountOnHome);
  const nameParts = siteConfig.name.split("_");

  return (
    <div className="system-page mx-auto my-5 w-full max-w-6xl px-4 pb-14 md:my-10 md:px-8">
      <section className="relative isolate grid min-h-[760px] items-center gap-20 py-24
        lg:grid-cols-2 lg:gap-24">
        <DataWarp />
        <div className="relative z-10 mx-auto w-full min-w-0 max-w-[600px]
          lg:mx-0 lg:justify-self-end">
          <EarthGlobe className="earth-system h-auto w-full" />
        </div>

        <div className="relative z-10 min-w-0 border-l-4 border-poster-ice/55
          bg-[var(--poster-content-wash)] py-8 pl-6 pr-1 lg:py-10 lg:pl-12 lg:pr-4">
          <div className="mb-7 w-fit border border-poster-line px-3 py-1.5
            text-[8px] tracking-[0.2em] text-poster-ice">
            SYS.ART / SATELLITE ARCHIVE / CHANNEL 09
          </div>
          <h1
            className="text-5xl font-extrabold uppercase leading-[0.82]
              tracking-[-0.08em] text-poster-title sm:text-7xl md:text-8xl"
          >
            <span className="glitch" data-text={nameParts[0]}>
              {nameParts[0]}
            </span>
            <span className="rgb-split block translate-x-[0.18em]">
              _{nameParts[1] ?? ""}
            </span>
          </h1>
          <p
            className="mt-8 max-w-lg border-l border-poster-ice pl-5 text-[11px]
              uppercase leading-6 tracking-[0.2em] text-poster-text-muted"
          >
            {siteConfig.description}
          </p>
          <div className="mt-10 flex w-fit items-center gap-2 border-t
            border-poster-line pr-12 pt-3 text-[10px] tracking-[0.18em]
            text-poster-text-muted">
            <span className="text-poster-ice">&gt;</span>
            <span>ORBIT_LOCKED_</span>
            <span className="blink inline-block h-3 w-2 bg-poster-ice" />
          </div>
        </div>

      </section>

      <section className="relative mt-16 border-y border-poster-line/70
        bg-[var(--poster-content-wash)] py-6 md:mt-24 md:py-9">
        <div className="flex items-baseline justify-between border-l-4 border-poster-ice/60 pl-4">
          <h2
            className="text-xs font-extrabold uppercase tracking-widest
              text-poster-ice"
          >
            {"// 01 · LATEST_TRANSMISSION"}
          </h2>
          <Link
            href="/posts"
            className="text-[11px] font-extrabold text-poster-ice
              transition-colors hover:text-poster-title"
          >
            ALL →
          </Link>
        </div>

        <div className="mt-4 border-y border-poster-line bg-poster-bg/75">
          {latestPosts.length === 0 ? (
            <div className="py-16 text-center">
              <span className="text-xs tracking-widest text-poster-title">
                &gt; NO_SIGNAL
              </span>
              <span className="ml-2 text-xs text-poster-text-muted">
                暂无文章
              </span>
            </div>
          ) : (
            latestPosts.map((post) => (
              <PostRow key={post.slug} post={post} />
            ))
          )}
        </div>
      </section>

      <section className="ml-auto mt-24 grid gap-10 border-l-4 border-poster-ice/60
        bg-[var(--poster-content-wash)] p-6 md:w-4/5
        md:grid-cols-[minmax(0,1fr)_auto] md:p-9">
        <div>
          <h2
            className="text-xs font-extrabold uppercase tracking-widest
              text-poster-ice"
          >
            {"// 02 · STATION"}
          </h2>
          <p
            className="mt-4 max-w-2xl text-sm leading-relaxed
              text-poster-text-bright"
          >
            {siteConfig.description}
          </p>
          <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2">
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
        <div className="grid w-fit self-start whitespace-pre text-[9px]
          leading-[1.45] text-poster-text-muted opacity-65" aria-hidden="true">
          <span>┌─[ RX SIGNAL ]────────┐</span>
          <span>│ ▓▓░▓ ░▓▓▓ ▓░░▓ 87% │</span>
          <span>└────── SAT/07 ───────┘</span>
        </div>
      </section>
    </div>
  );
}
