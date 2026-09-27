import Link from "next/link";
import { getAllPostMeta, getAllTags } from "@/lib/posts";
import { siteConfig } from "@/lib/siteConfig";
import { padIndex } from "@/lib/format";
import { Barcode } from "./components/Barcode";
import { ExtrudeType } from "./components/ExtrudeType";
import { PostRow } from "./components/PostRow";
import { ScrollTrace } from "./components/ScrollTrace";
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
    <div className="relative">
      <ScrollTrace />
      <section className="relative z-10 flex flex-col justify-center overflow-x-clip py-10 md:min-h-[100svh] md:py-24">
        {/* ============ 阶梯色块 + 技术线条 ============ */}
        {/* Why: 参考的是那张海报的线条与色块，不是它的文字或控件。
            所以：一块带台阶缺口的实色块当主体，四周与内部压细线——
            内缩基准线、三只角的细 L 角标、斜线纹理条、编号刻度、虚线短尺。
            线一律 1px、纯水平/垂直或纯 45°，不描边、不投影、不发光。
            How 线为什么用 SVG：折线只由水平和垂直线段组成，即使
            preserveAspectRatio="none" 拉伸，折角仍是正直角，
            只有线段长度随块宽变化——正好是需要的响应式行为。
            字标放在色块内部，这样它能继承 .block-ice 的墨色。 */}
        <div className="shell">
          <div className="hero-stage relative mx-auto w-full max-w-[60rem]">
            {/* Why 色块与字标必须各自独立定位：
                它们是两个元素，不是一个整体。位移挂在哪个元素上就只动哪个，
                色块不该"跟着字走"。所以下面两块各挂各的位移，互不带动。
                Why 位移只在 xl 起、且用百分比：窄屏没有横向余量，
                任何偏移都会把边缘推出屏幕；xl 起按容器宽的百分比移动，
                偏移与留白一起缩放，1280~1440 也不会把字标顶出去。 */}
            <div className="relative aspect-[4/5] sm:aspect-[16/10]">
              {/* ---- 色块：xl 整体左移 8%（相对自身宽度，随容器缩放） ---- */}
              <div className="absolute inset-0 xl:-translate-x-[8%]" data-reveal="wipe" suppressHydrationWarning>
                <div className="block-ice absolute inset-0 overflow-hidden">
                  {/* 内缩 12px 的基准线：只走上侧与左侧，各折一次直角再折回 */}
                  <div aria-hidden="true" className="pointer-events-none absolute inset-3">
                    <svg
                      className="h-full w-full"
                      viewBox="0 0 1000 625"
                      preserveAspectRatio="none"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={1}
                    >
                      <path
                        d="M0 0H600V44H690V0H1000"
                        vectorEffect="non-scaling-stroke"
                      />
                      <path
                        d="M0 0V340H44V430H0V625"
                        vectorEffect="non-scaling-stroke"
                      />
                    </svg>
                  </div>

                  {/* 四只角的细 L 角标。 */}
                  <span aria-hidden="true" className="pointer-events-none absolute left-8 top-8 h-10 w-10 border-t border-l border-current" />
                  <span aria-hidden="true" className="pointer-events-none absolute right-8 top-8 h-10 w-10 border-t border-r border-current" />
                  <span aria-hidden="true" className="pointer-events-none absolute bottom-8 left-8 h-10 w-10 border-b border-l border-current" />
                  <span aria-hidden="true" className="pointer-events-none absolute bottom-8 right-8 h-10 w-10 border-b border-r border-current" />

                  {/* 编号刻度：贴左内侧竖排，像图纸上的分区标记。
                      移动端色块变高，刻度移到左上角，免得被居中的大字压住。 */}
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute left-8 top-8 flex flex-col gap-4 font-mono text-[11px] leading-none tracking-[0.2em] xl:left-10 xl:top-1/2 xl:-translate-y-1/2 xl:gap-6"
                  >
                    <span>01</span>
                    <span>02</span>
                    <span>03</span>
                  </div>

                  {/* 斜线纹理条：参考图里用来分隔栏目的那几段。
                      移动端色块变高，纹理条改竖放，沿左缘往上下拉长。 */}
                  <span aria-hidden="true" className="hatch pointer-events-none absolute bottom-8 left-28 h-24 w-12 opacity-70 sm:bottom-10 sm:left-28 sm:h-14 sm:w-20" />
                  <span aria-hidden="true" className="hatch pointer-events-none absolute bottom-8 left-44 h-14 w-8 opacity-40 sm:bottom-24 sm:left-28 sm:h-6 sm:w-20" />

                  {/* 虚线短尺：1px 虚线的量度刻度。移动端收短，第三道支线只在 md 以上出现。 */}
                  <span aria-hidden="true" className="pointer-events-none absolute bottom-8 left-56 h-px w-20 border-t border-dashed border-current opacity-70 sm:bottom-10 sm:left-52 sm:w-24" />
                  <span aria-hidden="true" className="pointer-events-none absolute bottom-8 left-56 h-3 w-px border-l border-current opacity-70 sm:bottom-10 sm:left-52" />
                  <span aria-hidden="true" className="pointer-events-none absolute bottom-10 left-76 hidden h-2 w-px border-l border-current opacity-50 sm:block" />
                </div>
              </div>

              {/* ---- 出块区补一块斜纹场：托住悬在纸面上的 "1233" ----
                  Why: 字标右端出块后，那一侧只剩空纸面，重心全压在左边色块上。
                  借色块内部同一套斜纹语言，在出块的一段背后铺一块斜纹场，
                  把溢出的字托住，两边重量重新平衡。只在 xl 出现——溢出只在 xl。 */}
              <div
                aria-hidden="true"
                className="hatch pointer-events-none absolute -right-[8%] inset-y-0 hidden w-[8%] text-poster-ice opacity-50 xl:block"
              />

              {/* ---- 字标：与色块同向的横向擦除入场 ----
                  Why 与色块同向：字标和色块是同一件"印上去"的东西，
                  一起从左往右擦出来，而不是各走各的方向。
                  Why 色块外 + .on-field：住在块里会被块的 clip-path 一起裁掉；
                  独立出来才能各自控制墨色、各自擦除。 */}
              {/* ---- 字标：上下居中于色块，右移使「色块+字标」整组居中 ----
                  Why 字号用 cqw：容器宽上限 60rem、并随 shell 内边距收缩，
                  只有容器查询单位能在两段里都按同一比例缩放。实测 Anton
                  拉丁子集 "LINVIN" 宽 2.046em、"_1233" 宽 1.953em，主字
                  33cqw 与副字 14.5cqw 排成一行后合计 ≈0.958 容器宽。
                  Why 偏移用百分比而不是固定 px：色块左移 8%、字标右移
                  10.1%（= 8% + 字标比色块窄的那 2.1% 的一半），两者相加
                  正好让「色块左缘的留白 = 字标右缘的留白」，整组左右居中，
                  留白随容器缩放——固定 px 在 1280~1440 会把字标顶出屏幕。
                  字标右端落在纸面上的部分若仍用 --poster-bg 会与纸面同色
                  而消失，所以 h1 在 xl 铺横向渐变、background-clip:text
                  裁进字里，出块后换 --poster-title（边界 18.1% = 8%+10.1%，
                  见 globals.css 的 .hero-field）。items-center 让字标相对
                  色块上下居中。 */}
              <h1
                className="hero-field on-field absolute inset-0 m-0 flex items-center justify-center px-6 xl:translate-x-[10.1%]"
                data-reveal="wipe"
                data-reveal-delay="1"
                suppressHydrationWarning
              >
                <ExtrudeType text={main} className="hero-wordmark uppercase" />
                {suffix && (
                  <span className="outline-type type-display hero-suffix uppercase">
                    _{suffix}
                  </span>
                )}
              </h1>
            </div>

            {/* ---- 次级带：文字，同样走纵向，与色块错开 ---- */}
            <div
              className="mt-12 flex flex-wrap items-end justify-between gap-x-12 gap-y-8"
              data-reveal=""
              data-reveal-delay="3"
              suppressHydrationWarning
            >
              <div className="flex items-start gap-6">
                <span aria-hidden="true" className="hatch mt-1 hidden h-16 w-6 shrink-0 text-poster-ice sm:block" />
                <div>
                  <p className="m-0 max-w-[42ch] text-[clamp(1rem,1.4vw,1.25rem)] leading-[1.7] text-poster-text-bright">
                    {siteConfig.description}
                  </p>
                  <p className="kicker m-0 mt-5 text-poster-text-muted">
                    {`${padIndex(posts.length)} 篇文章 · ${padIndex(tags.length)} 个标签 · SINCE ${since}`}
                  </p>
                  <Barcode
                    value={siteConfig.name}
                    bars={30}
                    className="mt-5 text-poster-text-muted opacity-70"
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-4">
                <Link
                  href="/posts"
                  className="border-2 border-poster-ice bg-poster-ice px-5 py-3
                    font-mono text-[11px] uppercase tracking-[0.24em]
                    text-poster-bg shadow-[5px_5px_0_var(--poster-line)]
                    transition-[transform,box-shadow] hover:translate-x-[3px]
                    hover:translate-y-[3px] hover:shadow-[2px_2px_0_var(--poster-line)]"
                >
                  BROWSE POSTS →
                </Link>
                <Link
                  href="/about"
                  className="hard-hover border-2 border-poster-title px-5 py-3
                    font-mono text-[11px] uppercase tracking-[0.24em]
                    text-poster-text-muted hover:bg-poster-title hover:text-poster-bg"
                >
                  ABOUT OPERATOR
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>



      <section
        data-trace-gap
        className="shell relative z-10 grid gap-8 py-32 md:grid-cols-12 md:gap-0 md:py-44"
      >
        {/* Why: 与抬头左轨同一套处理——整栏实色。
            三个栏目各有一条冰蓝色脊，页面就有了垂直的色块脊柱，
            而不是每段各自带一条发丝线。 */}
        <div className="block-ice col-span-1 hidden py-6 md:block" data-reveal="wipe" suppressHydrationWarning>
          <span className="font-mono text-[9px] uppercase tracking-[0.3em] [writing-mode:vertical-rl]">
            02 / TRANSMISSIONS
          </span>
        </div>
        <div className="md:col-span-9 md:col-start-3">
          <div className="flex items-end justify-between gap-5 border-b-4 border-poster-line pb-4" data-reveal="" data-reveal-delay="1" suppressHydrationWarning>
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

      <section data-trace-list className="relative z-10">
        <div className="shell grid gap-8 py-28 md:grid-cols-12 md:gap-0 md:py-36">
          <div className="block-deep col-span-1 hidden py-6 md:block" data-reveal="wipe-right" suppressHydrationWarning>
            <span className="font-mono text-[9px] uppercase tracking-[0.3em] [writing-mode:vertical-rl]">
              03 / DIRECT ACCESS
            </span>
          </div>
          <nav className="md:col-span-10 md:col-start-3" data-reveal="" data-reveal-delay="2" suppressHydrationWarning>
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
