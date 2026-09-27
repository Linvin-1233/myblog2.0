import { Barcode } from "./Barcode";
import { ExtrudeType } from "./ExtrudeType";

// Why: 子页抬头不再是统一卡片，而是一张有空白、有边界、有裸露轨道的海报版心。
// 左侧竖轨保留网格，标题被推到下方，元数据只在右上角占一个小区域。
export function PageHeader({
  index,
  kicker,
  title,
  meta,
}: {
  index: string;
  kicker: string;
  title: string;
  meta?: readonly { label: string; value: string }[];
}) {
  return (
    <header className="page-header relative grid min-h-[29rem] grid-cols-12 border-b-4 border-poster-line">
      <div
        aria-hidden="true"
        className="grid-field absolute inset-0 opacity-20
          [mask-image:linear-gradient(110deg,black,transparent_70%)]"
      />

      {/* Why: 左轨是整块常驻色场，而不是一条发丝线。
          大色块的基本处理是"整栏成为实色"——这一栏本来就是结构，
          把它填成实色，抬头的层级就由面积决定，而不是靠边框。 */}
      <div
        className="block-ice relative z-10 col-span-1 row-span-full py-8
          font-mono text-[9px] uppercase tracking-[0.3em]"
      >
        <span className="[writing-mode:vertical-rl]">{`INDEX / ${index}`}</span>
      </div>

      <div className="relative z-10 col-span-11 col-start-2 flex flex-col justify-end px-6 pb-10 md:col-span-8 md:pb-14">
        <div
          className="flex flex-wrap items-center gap-3 font-mono text-[9px] uppercase tracking-[0.3em] text-poster-text-muted"
          data-reveal=""
          suppressHydrationWarning
        >
          <span className="border-2 border-poster-ice bg-poster-ice px-1.5 py-0.5 text-poster-bg">
            {index}
          </span>
          <span>{kicker}</span>
          <span className="h-0.5 w-16 bg-poster-title" />
        </div>

        <h1 className="mt-8 max-w-[92%]" data-reveal="" data-reveal-delay="1" suppressHydrationWarning>
          <ExtrudeType text={title} className="text-[clamp(4.5rem,14vw,11rem)] uppercase" />
        </h1>

        {meta && meta.length > 0 && (
          <dl className="mt-8 grid grid-cols-2 gap-x-5 gap-y-4 md:hidden">
            {meta.map((entry) => (
              <div key={entry.label} className="border-t-2 border-poster-line pt-2">
                <dt className="font-mono text-[9px] uppercase tracking-[0.2em] text-poster-text-muted">
                  {entry.label}
                </dt>
                <dd className="mt-1 font-mono text-xs text-poster-text-bright">
                  {entry.value}
                </dd>
              </div>
            ))}
          </dl>
        )}
      </div>

      <aside className="absolute top-8 right-0 z-10 hidden w-44 md:block" data-reveal="" data-reveal-delay="2" suppressHydrationWarning>
        {/* 元数据也做成实色场：抬头上有两个常驻色块(左轨 + 这块)，
            面积一大一小，版面才立得住。 */}
        {meta && meta.length > 0 && (
          <dl className="block-panel mt-8 p-3">
            {meta.map((entry) => (
              <div key={entry.label} className="mb-3 last:mb-0">
                <dt className="font-mono text-[9px] uppercase tracking-[0.2em] text-poster-ice">
                  {entry.label}
                </dt>
                <dd className="mt-1 font-mono text-xs text-poster-text-bright">
                  {entry.value}
                </dd>
              </div>
            ))}
          </dl>
        )}
        <Barcode
          value={kicker}
          bars={20}
          className="mt-6 text-poster-text-muted opacity-70"
        />
      </aside>
    </header>
  );
}
