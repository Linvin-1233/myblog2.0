import type { PostLicense } from "@/lib/siteConfig";
import { formatDate } from "@/lib/format";

// Why: 文章结尾的版权卡片。左侧用协议名首字母做大号装饰，右侧列出作者、
// 最后更新时间与协议（可点击到协议原文）。内容来自 config.yml，全局统一。
export function LicenseCard({
  license,
  author,
  updated,
}: {
  license: PostLicense;
  author: string;
  updated: string;
}) {
  const initial = license.name.trim().charAt(0).toUpperCase() || "©";

  return (
    <aside
      className="mt-12 flex items-stretch gap-4 border-2 border-poster-line
        bg-poster-panel/40 shadow-[4px_4px_0px_var(--poster-shadow)]"
    >
      <div
        className="relative flex w-24 shrink-0 items-center justify-center
          overflow-hidden border-r border-poster-line bg-poster-panel"
        aria-hidden="true"
      >
        {/* How: 底纹网格 + 四角刻度 + 虚线方框，把首字母包成科技感"徽章"。 */}
        <div className="blueprint-grid absolute inset-0 opacity-20" />
        <span className="absolute left-1.5 top-1.5 h-2 w-2 border-l border-t
          border-poster-ice/70" />
        <span className="absolute right-1.5 top-1.5 h-2 w-2 border-r border-t
          border-poster-ice/70" />
        <span className="absolute bottom-1.5 left-1.5 h-2 w-2 border-b border-l
          border-poster-ice/70" />
        <span className="absolute bottom-1.5 right-1.5 h-2 w-2 border-b border-r
          border-poster-ice/70" />
        <span className="absolute top-2 text-[7px] tracking-[0.3em]
          text-poster-text-muted">LICENSE</span>
        <span className="absolute bottom-2 text-[7px] tracking-[0.2em]
          text-poster-text-muted">0x{initial.charCodeAt(0).toString(16)}</span>

        <span
          className="flex h-11 w-11 items-center justify-center border
            border-dashed border-poster-ice/60 text-2xl font-extrabold
            text-poster-ice [text-shadow:0_0_10px_var(--color-poster-ice)]"
          style={{
            // Why: 首字母用设备本地等宽字体栈，零网络加载，且带系统终端质感。
            fontFamily:
              '"SF Mono", "JetBrains Mono", "Cascadia Code", ' +
              '"Consolas", "Menlo", ui-monospace, monospace',
          }}
        >
          {initial}
        </span>
      </div>

      <div className="min-w-0 flex-1 space-y-1.5 py-4 pr-4">
        <div
          className="text-[10px] font-bold uppercase tracking-widest
            text-poster-text-muted"
        >
          {"// LICENSE"}
        </div>
        {license.note && (
          <p className="text-xs leading-relaxed text-poster-text-bright">
            {license.note}
          </p>
        )}
        <div
          className="flex flex-wrap gap-x-4 gap-y-1 pt-1 text-[11px]
            text-poster-text-muted"
        >
          <span>作者: {author}</span>
          <span>最后更新: {formatDate(updated)}</span>
          {license.name &&
            (license.url ? (
              <a
                href={license.url}
                target="_blank"
                rel="noopener noreferrer license"
                className="font-bold text-poster-ice transition-colors
                  hover:underline"
              >
                {license.name}
              </a>
            ) : (
              <span className="font-bold text-poster-ice">{license.name}</span>
            ))}
        </div>
      </div>
    </aside>
  );
}
