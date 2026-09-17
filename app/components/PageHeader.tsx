import { chanceTilt } from "@/lib/dada";
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

      <div
        className="relative z-10 col-span-1 row-span-full border-r-2
          border-poster-line py-8 font-mono text-[9px] uppercase
          tracking-[0.3em] text-poster-text-muted"
      >
        <span className="[writing-mode:vertical-rl]">{`INDEX / ${index}`}</span>
      </div>

      <div className="relative z-10 col-span-11 col-start-2 flex flex-col justify-end px-6 pb-10 md:col-span-8 md:pb-14">
        <div className="flex flex-wrap items-center gap-3 font-mono text-[9px] uppercase tracking-[0.3em] text-poster-text-muted">
          <span className="border-2 border-poster-ice bg-poster-ice px-1.5 py-0.5 text-poster-bg">
            {index}
          </span>
          <span>{kicker}</span>
          <span className="h-0.5 w-16 bg-poster-title" />
        </div>

        <h1 className="mt-8 max-w-[92%]">
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

      <aside className="absolute top-8 right-0 z-10 hidden w-44 md:block">
        <span
          className="stamp text-poster-fault"
          style={{ transform: `rotate(${chanceTilt(kicker, 4.5)})` }}
        >
          {`NO.${index}`}
        </span>
        {meta && meta.length > 0 && (
          <dl className="mt-8 border-l-2 border-poster-line pl-3">
            {meta.map((entry) => (
              <div key={entry.label} className="mb-4">
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
      </aside>
    </header>
  );
}
