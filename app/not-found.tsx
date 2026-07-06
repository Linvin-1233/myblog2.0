import Link from "next/link";

// Why: 静态导出会把此页输出为 404.html，供服务器作为兜底错误页；沿用海报风
// 保持视觉一致，并给出返回首页的明确出口。
export default function NotFound() {
  return (
    <section className="flex min-h-[50vh] flex-col items-center justify-center
      text-center">
      <div className="text-[9px] uppercase tracking-[0.4em] text-poster-ice
        opacity-60">
        [ SIGNAL_LOST ]
      </div>
      <h1
        className="mt-4 text-6xl font-extrabold uppercase tracking-[0.2em]
          text-poster-title md:text-8xl"
      >
        4<span className="text-poster-ice animate-blink">0</span>4
      </h1>
      <p className="mt-4 text-[11px] uppercase tracking-[0.3em]
        text-poster-text-muted">
        {"// ROUTE_NOT_FOUND_IN_GRID"}
      </p>
      <Link
        href="/"
        className="mt-8 border-2 border-poster-line bg-poster-panel px-4 py-2
          text-[11px] font-extrabold uppercase tracking-widest text-poster-ice
          transition-all hover:border-poster-ice hover:bg-poster-ice
          hover:text-poster-bg shadow-[3px_3px_0px_var(--poster-shadow)]"
      >
        [◄ RETURN_TO_NODE]
      </Link>
    </section>
  );
}
