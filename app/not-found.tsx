import Link from "next/link";
import { chanceCode } from "@/lib/dada";

// Why: 404 = 传输中断，也是达达式的自嘲——巨型故障数字旁压一枚"LOST"实心碎片，
// 粗描边按钮把出口做得像工业开关。
export default function NotFound() {
  return (
    <section className="relative flex min-h-[70vh] flex-col justify-center overflow-hidden border-b-4 border-poster-line">
      <div
        aria-hidden="true"
        className="grid-field absolute inset-0 opacity-40
          [mask-image:radial-gradient(120%_80%_at_50%_50%,black,transparent_80%)]"
      />

      <div className="shell relative py-20">
        <div
          className="flex flex-wrap items-center gap-3 font-mono text-[10px]
            uppercase tracking-[0.3em] text-poster-text-muted"
        >
          <span className="bg-poster-fault px-1.5 py-0.5 text-poster-bg">
            ERR
          </span>
          <span>404 // SIGNAL LOST</span>
          <span className="stamp ml-2 hidden text-poster-text-muted sm:inline-block">
            {`CHANCE ${chanceCode("404")}`}
          </span>
        </div>

        {/* Why: 404 这个数字本身是排印元素，压在一整块冰蓝色场上。
            大色块的基本处理：让版面最重的那一格是实色，而不是描边。 */}
        <div className="block-ice relative mt-6 px-6 py-10 md:px-10 md:py-14">
          <h1 className="relative m-0">
            <span className="type-display block text-[clamp(4.5rem,22vw,15rem)] uppercase leading-[0.8]">
              404
            </span>
            <span
              aria-hidden="true"
              className="type-condensed absolute -top-2 right-4 hidden -rotate-6
                border-2 border-current px-2 text-2xl md:block"
            >
              LOST
            </span>
          </h1>
        </div>

        <p
          className="mt-6 max-w-xl font-mono text-xs uppercase leading-relaxed
            tracking-[0.2em] text-poster-text-muted"
        >
          &gt; ROUTE_NOT_FOUND // PACKET DROPPED BEFORE ARRIVAL
          <br />
          &gt; 平滑的版面是谎言。
        </p>

        <div className="mt-9 flex flex-wrap gap-4">
          <Link
            href="/"
            className="border-2 border-poster-ice bg-poster-ice px-5 py-3
              font-mono text-[10px] uppercase tracking-[0.24em] text-poster-bg
              shadow-[5px_5px_0_var(--poster-line)] transition-[transform,box-shadow]
              hover:translate-x-[3px] hover:translate-y-[3px]
              hover:shadow-[2px_2px_0_var(--poster-line)]"
          >
            [ REBOOT_TO_INDEX ]
          </Link>
          <Link
            href="/posts"
            className="hard-hover border-2 border-poster-line px-5 py-3
              font-mono text-[10px] uppercase tracking-[0.24em]
              text-poster-text-muted transition-colors hover:border-poster-title
              hover:text-poster-title"
          >
            [ BROWSE POSTS ]
          </Link>
        </div>
      </div>
    </section>
  );
}
