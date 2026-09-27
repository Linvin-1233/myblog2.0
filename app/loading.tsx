// Why: 路由级加载态沿用同一套语法——方角缓冲条 + 等宽状态行，不用骨架屏。
export default function Loading() {
  return (
    <div
      data-route-loading
      className="shell grid min-h-[60vh] place-content-center gap-4"
      role="status"
      aria-label="正在接收页面数据"
    >
      <div
        className="flex items-center gap-3 font-mono text-[10px] uppercase
          tracking-[0.3em] text-poster-ice"
      >
        <span className="blink inline-block h-1.5 w-1.5 bg-poster-ice" />
        RX://ROUTE_BUFFER
        <span className="stamp text-poster-fault">WAIT</span>
      </div>
      <div className="h-2 w-[min(520px,76vw)] border-2 border-poster-line">
        <span className="hatch block h-full w-2/3 animate-pulse text-poster-ice" />
      </div>
      <div
        className="font-mono text-[9px] uppercase tracking-[0.24em]
          text-poster-text-muted"
      >
        DECODING PACKET ...
      </div>
    </div>
  );
}
