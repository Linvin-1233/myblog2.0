import type { PostLicense } from "@/lib/siteConfig";
import { formatDate } from "@/lib/format";

// Why: 文章结尾的版权档案条——方角标签 + 一行等宽元信息，无面板无徽章。
export function LicenseCard({
  license,
  author,
  updated,
}: {
  license: PostLicense;
  author: string;
  updated: string;
}) {
  return (
    <div className="mt-14 border-t-2 border-poster-line pt-6">
      <div
        className="flex items-center gap-3 font-mono text-[9px] uppercase
          tracking-[0.3em]"
      >
        <span className="bg-poster-ice px-1.5 py-0.5 text-poster-bg">
          LICENSE
        </span>
        <span className="h-px flex-1 bg-poster-line" />
        <span className="text-poster-text-muted">TERMS</span>
      </div>

      {license.note && (
        <p className="mt-3 text-xs leading-relaxed text-poster-text-muted">
          {license.note}
        </p>
      )}

      <div
        className="mt-3 flex flex-wrap gap-x-5 gap-y-1 font-mono text-[10px]
          uppercase tracking-[0.16em] text-poster-text-muted"
      >
        <span>AUTHOR · {author}</span>
        <span>UPDATED · {formatDate(updated)}</span>
        {license.name &&
          (license.url ? (
            <a
              href={license.url}
              target="_blank"
              rel="noopener noreferrer license"
              className="hard-hover text-poster-ice transition-colors
                hover:text-poster-title"
            >
              {license.name} ↗
            </a>
          ) : (
            <span className="text-poster-ice">{license.name}</span>
          ))}
      </div>
    </div>
  );
}
