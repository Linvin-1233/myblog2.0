import Link from "next/link";

// Why: 404(v6 叙事 glitch)——"信号丢失"是故障叙事终点：完整故障分裂的
// 大标题 + 终端报错行，返回按钮 = 重启。
export default function NotFound() {
  return (
    <section
      className="flex min-h-[50vh] flex-col items-center
        justify-center px-6 py-16 text-center"
    >
      <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-poster-title">[ ERR_404 ]</div>
      <h1
        className="mt-4 text-7xl font-extrabold uppercase tracking-[0.2em]
          text-poster-title md:text-9xl"
      >
        <span className="glitch" data-text="404">404</span>
      </h1>
      <p className="mt-4 text-[11px] uppercase tracking-[0.3em]
        text-poster-text-muted">
        {"> ROUTE_NOT_FOUND_IN_GRID // SIGNAL_LOST"}
      </p>
      <Link
        href="/"
        className="mt-8 border border-poster-line bg-poster-panel px-4 py-2 text-[11px]
          font-extrabold uppercase tracking-widest text-poster-ice transition-colors
          hover:border-poster-ice hover:bg-poster-ice hover:text-poster-bg"
      >
        [◄ REBOOT_TO_INDEX]
      </Link>
    </section>
  );
}
