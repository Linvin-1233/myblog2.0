import Link from "next/link";
import { getAllPostMeta, getAllTags } from "@/lib/posts";
import { siteConfig } from "@/lib/siteConfig";
import { chanceCode, chanceTilt } from "@/lib/dada";
import { padIndex } from "@/lib/format";
import { DadaCollage } from "./components/DadaCollage";
import { ExtrudeType } from "./components/ExtrudeType";
import { PostRow } from "./components/PostRow";
import { navItems } from "./components/nav";

// Why: 首页是一张整屏海报：字标在左上、遥测在右上、简介与入口在左下、
// 剪贴画在右下，中间留出大片空白；斜向辅助线和角落的重复大字填满整个画面。
export default function HomePage() {
  const posts = getAllPostMeta();
  const tags = getAllTags();
  const latest = posts.slice(0, siteConfig.latestCountOnHome);
  const [word, suffix] = siteConfig.name.split("_");
  const main = word || siteConfig.name;
  const since = posts.length > 0 ? posts[posts.length - 1].date.slice(0, 4) : "—";

  return (
    <div>
      <section className="relative min-h-[100svh] overflow-hidden">
        <span aria-hidden="true" className="poster-rail poster-rail-a" />
        <span aria-hidden="true" className="poster-rail poster-rail-b" />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-[36%] -right-[3%]
            hidden rotate-[18deg] xl:block"
        >
          <ExtrudeType
            text={`${main} / NOTES`}
            className="text-[clamp(2.4rem,5vw,5.5rem)]"
          />
        </div>
        <div
          aria-hidden="true"
          className="pointer-events-none absolute bottom-[8%] left-[42%]
            hidden -rotate-[14deg] lg:block"
        >
          <ExtrudeType
            text="CUT / PASTE"
            className="text-[clamp(1.8rem,3.5vw,3.6rem)]"
          />
        </div>

        {/* 左下角色块：L 形角标贴在纸张左下角 */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute bottom-0 left-0 z-0
            hidden md:block"
        >
          <div className="h-40 w-10 bg-poster-ice" />
          <div className="cutout-b h-10 w-64 bg-poster-ice" />
        </div>

        {/* 中间色块：填补版面中央的空白 */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-[44%] left-1/2 z-0
            hidden -translate-x-1/2 rotate-[-6deg] lg:block"
        >
          <div className="cutout-a h-24 w-36 bg-poster-ice" />
          <div className="mt-3 ml-8 h-6 w-20 -rotate-3 bg-poster-title" />
        </div>

        <div
          className="shell relative z-10 flex min-h-[100svh] flex-col
            justify-between py-10 pb-24 md:py-14 md:pb-32"
        >
          <div className="flex flex-wrap items-start justify-between gap-12">
            <div className="max-w-[46rem]">
              <div
                className="flex flex-wrap items-center gap-3 font-mono text-[9px]
                  uppercase tracking-[0.3em] text-poster-text-muted"
              >
                <span className="bg-poster-ice px-1.5 py-0.5 text-poster-bg">
                  01
                </span>
                <span>{siteConfig.title}</span>
                <span className="h-0.5 w-10 bg-poster-title" />
                <span>SINCE {since}</span>
              </div>

              <h1 className="relative mt-6">
                <span
                  className="absolute -top-7 right-0 hidden rotate-3 border-2
                    border-poster-title bg-poster-title px-2 py-1 font-mono
                    text-[9px] uppercase tracking-[0.24em] text-poster-bg
                    md:block"
                >
                  merz / 1923
                </span>
                <ExtrudeType
                  text={main}
                  className="text-[clamp(4rem,9vw,9rem)] uppercase"
                />
                {suffix && (
                  <span
                    className="outline-type type-display -mt-[0.06em] ml-[8%] block
                      -rotate-2 text-[clamp(2.2rem,5.5vw,5rem)] uppercase
                      leading-[0.76]"
                  >
                    _{suffix}
                  </span>
                )}
                <span
                  aria-hidden="true"
                  className="absolute top-1/2 -right-3 hidden h-4 w-32
                    bg-poster-ice md:block"
                  style={{ transform: `rotate(${chanceTilt(siteConfig.name, 3)})` }}
                />
              </h1>
            </div>

            <dl
              className="w-44 border-l-2 border-poster-line pl-4 font-mono
                text-[9px] uppercase tracking-[0.2em] text-poster-text-muted"
            >
              <div className="pb-4">
                <dt>RECORDS</dt>
                <dd className="mt-1 text-poster-text-bright">
                  {padIndex(posts.length)}
                </dd>
              </div>
              <div className="py-4">
                <dt>TOPICS</dt>
                <dd className="mt-1 text-poster-text-bright">
                  {padIndex(tags.length)}
                </dd>
              </div>
              <div className="pt-4">
                <dt>CHANCE</dt>
                <dd className="mt-1 text-poster-text-bright">
                  {chanceCode(main)}
                </dd>
              </div>
            </dl>
          </div>

          <div className="flex flex-wrap items-end justify-between gap-14">
            <div className="max-w-md">
              <p
                className="border-l-4 border-poster-line pl-4 text-sm leading-relaxed
                  text-poster-text-bright"
              >
                {siteConfig.description}
              </p>
              <div className="mt-10 flex flex-wrap gap-4">
                <Link
                  href="/posts"
                  className="border-2 border-poster-ice bg-poster-ice px-5 py-3
                    font-mono text-[10px] uppercase tracking-[0.24em]
                    text-poster-bg shadow-[5px_5px_0_var(--poster-line)]
                    transition-[transform,box-shadow] hover:translate-x-[3px]
                    hover:translate-y-[3px]
                    hover:shadow-[2px_2px_0_var(--poster-line)]"
                >
                  BROWSE POSTS →
                </Link>
                <Link
                  href="/about"
                  className="hard-hover border-2 border-poster-title px-5 py-3
                    font-mono text-[10px] uppercase tracking-[0.24em]
                    text-poster-text-muted transition-colors
                    hover:bg-poster-title hover:text-poster-bg"
                >
                  ABOUT OPERATOR
                </Link>
              </div>
            </div>

            <div className="w-full md:w-[36%]">
              <DadaCollage hero />
            </div>
          </div>
        </div>
      </section>

      <section className="shell grid gap-8 py-32 md:grid-cols-12 md:gap-0 md:py-44">
        <div className="col-span-1 hidden border-r-2 border-poster-line md:block">
          <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-poster-ice [writing-mode:vertical-rl]">
            02 / TRANSMISSIONS
          </span>
        </div>
        <div className="col-span-12 md:col-span-9 md:col-start-3">
          <div className="flex items-end justify-between gap-5 border-b-4 border-poster-line pb-4">
            <h2 className="type-display max-w-[8ch] text-[clamp(3rem,8vw,7rem)] uppercase leading-[0.78] text-poster-title">
              最新文章
            </h2>
            <Link
              href="/posts"
              className="mb-1 border-2 border-poster-title px-3 py-2 font-mono
                text-[10px] uppercase tracking-[0.2em] text-poster-ice
                hover:bg-poster-title hover:text-poster-bg"
            >
              ALL →
            </Link>
          </div>
          <div className="mt-8">
            {latest.map((post, index) => (
              <PostRow key={post.slug} post={post} index={index} />
            ))}
          </div>
        </div>
      </section>

      <section>
        <div className="shell grid gap-8 py-28 md:grid-cols-12 md:gap-0 md:py-36">
          <div className="col-span-1 hidden border-r-2 border-poster-line md:block">
            <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-poster-ice [writing-mode:vertical-rl]">
              03 / DIRECT ACCESS
            </span>
          </div>
          <nav className="col-span-12 md:col-span-10 md:col-start-3">
            {navItems.map((item, index) => (
              <Link
                key={item.href}
                href={item.href}
                className={`group flex items-baseline gap-4 border-t-4 border-poster-line py-4 transition-colors hover:bg-poster-ice hover:text-poster-bg ${index % 2 ? "md:ml-[11%]" : ""}`}
              >
                <span className="font-mono text-[10px] text-poster-ice group-hover:text-poster-bg/70">
                  {padIndex(index + 1)}
                </span>
                <span className="type-condensed text-[clamp(2.4rem,6vw,5.5rem)] uppercase leading-none text-poster-title group-hover:text-poster-bg">
                  {item.label}
                </span>
                <span className="ml-auto font-mono text-sm text-poster-ice group-hover:text-poster-bg">
                  ↗
                </span>
              </Link>
            ))}
          </nav>
        </div>
      </section>
    </div>
  );
}
