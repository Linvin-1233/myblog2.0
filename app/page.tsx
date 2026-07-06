import Link from "next/link";
import { getAllPostMeta } from "@/lib/posts";
import { siteConfig } from "@/lib/siteConfig";
import { SectionLabel } from "./components/SectionLabel";
import { PostCard } from "./components/PostCard";

// Why: 首页复刻 example 的海报视觉：全屏 hero + 分区数据面板。作为服务端组件，
// 构建期读取最新文章并直接渲染进静态 HTML。
export default function HomePage() {
  const latestPosts = getAllPostMeta().slice(0, siteConfig.latestCountOnHome);

  return (
    <div className="space-y-24">
      <section className="flex min-h-[60vh] flex-col items-center justify-center
        text-center">
        <div
          className="mb-4 text-[9px] uppercase tracking-[0.4em] text-poster-ice
            opacity-60 animate-pulse"
        >
          [ GRID_NODE_ONLINE ]
        </div>
        <h1
          className="text-4xl font-extrabold uppercase leading-none tracking-[0.2em]
            text-poster-title sm:text-6xl md:text-7xl"
        >
          {siteConfig.name.split("_")[0]}_
          <span className="text-poster-ice">
            {siteConfig.name.split("_")[1] ?? ""}
          </span>
        </h1>
        <p
          className="mt-4 max-w-xl text-[11px] uppercase tracking-[0.3em]
            text-poster-text-muted"
        >
          {"// "}
          {siteConfig.description}
        </p>
      </section>

      <section
        className="relative border-2 border-poster-line bg-poster-panel/20 px-6
          py-16 shadow-[5px_5px_0px_var(--poster-shadow)]"
      >
        <SectionLabel>[SEC_01 // INTRO_DATA]</SectionLabel>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-12 md:items-center">
          <div className="md:col-span-4">
            <span className="block text-[10px] tracking-wider text-poster-text-muted">
              ID: 0x7F4A_CORE
            </span>
            <h2
              className="text-2xl font-extrabold uppercase tracking-tight
                text-poster-title md:text-3xl"
            >
              INTRO
              <br />
              DUCTION
            </h2>
          </div>
          <div
            className="space-y-3 border-l border-poster-line pl-6 text-xs
              leading-relaxed text-poster-text-bright md:col-span-8 md:text-sm"
          >
            <p>{siteConfig.description}</p>
            <div className="flex flex-wrap gap-3 pt-2">
              {siteConfig.socialLinks.map((link) => (
                <a
                  key={link.url}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="border border-poster-line bg-poster-panel/40 px-2.5
                    py-1 text-[10px] font-bold tracking-widest
                    text-poster-text-bright transition-all
                    hover:border-poster-ice hover:bg-poster-ice
                    hover:text-poster-bg"
                >
                  [ {link.label} ]
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="relative pt-8">
        <SectionLabel>[SEC_02 // LATEST_PAYLOAD]</SectionLabel>
        <div
          className="mb-8 flex items-end justify-between border-b
            border-poster-line pb-4"
        >
          <h2 className="text-xl font-extrabold uppercase text-poster-title">
            最新文章
          </h2>
          <Link
            href="/posts"
            className="text-[11px] font-extrabold text-poster-ice
              transition-all hover:tracking-wider"
          >
            ALL_POSTS ↗
          </Link>
        </div>

        {latestPosts.length === 0 ? (
          <div
            className="border border-poster-line bg-poster-panel py-16
              text-center text-xs tracking-widest text-poster-ice"
          >
            &gt; NO_PAYLOAD_FOUND // 暂无文章
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {latestPosts.map((post, index) => (
              <PostCard key={post.slug} post={post} index={index + 1} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
