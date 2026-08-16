export default function Loading() {
  return (
    <div className="grid min-h-[58vh] place-content-center gap-3 p-6 text-poster-text-muted"
      role="status" aria-label="正在接收页面数据">
      <div className="text-[11px] tracking-[0.24em] text-poster-ice">RX://ROUTE_BUFFER</div>
      <div className="h-[7px] w-[min(520px,76vw)] border border-poster-line">
        <span className="block h-full w-2/3 animate-pulse bg-poster-ice/70" />
      </div>
      <div className="max-w-[520px] overflow-hidden whitespace-nowrap text-[8px]
        tracking-[0.12em]" aria-hidden="true">
        01100101 11001001 00110110 10110010 // DECODING_PACKET
      </div>
    </div>
  );
}
