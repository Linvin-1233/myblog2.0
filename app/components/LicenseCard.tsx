import type { PostLicense } from "@/lib/siteConfig";
import { formatDate } from "@/lib/format";

// Why: 文章结尾版权行(v7 编辑流)——细线之下的元信息行：
// LICENSE 标注 + 作者/更新时间/协议(可点击)，无面板无徽章。
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
    <div className="mt-12 border-t border-poster-line pt-6">
      <div className="text-[10px] font-bold uppercase tracking-widest
        text-poster-ice">
        LICENSE // TERMS
      </div>
      {license.note && (
        <p className="mt-2 text-xs leading-relaxed text-poster-text-muted">
          {license.note}
        </p>
      )}
      <div
        className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[11px]
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
                hover:text-poster-title hover:underline"
            >
              {license.name}
            </a>
          ) : (
            <span className="font-bold text-poster-ice">{license.name}</span>
          ))}
      </div>
    </div>
  );
}
