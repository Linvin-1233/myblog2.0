import Link from "next/link";
import { padIndex } from "@/lib/format";
import { chanceCode } from "@/lib/dada";
import { renderCopyright, siteConfig } from "@/lib/siteConfig";
import { navItems } from "./nav";

// Why: 页脚不再用粗边线把自己切成独立区块，而是和正文共用同一张纸面：
// 小号字标 + 三栏链接 + 一行校验文本，靠留白而不是边框分隔。
export function StatusFooter() {
  const year = new Date().getFullYear();
  const [word, suffix] = siteConfig.name.split("_");
  const main = word || siteConfig.name;

  return (
    <footer className="relative mt-32">
      <div className="shell grid gap-14 py-16 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <div className="flex items-baseline">
            <span className="type-display text-3xl uppercase text-poster-title">
              {main}
            </span>
            {suffix && (
              <span className="type-condensed text-2xl text-poster-ice">
                _{suffix}
              </span>
            )}
          </div>
          <p className="mt-5 max-w-xs text-xs leading-relaxed text-poster-text-muted">
            {siteConfig.description}
          </p>
        </div>

        <FooterColumn title="NAVIGATE">
          {navItems.map((item, index) => (
            <Link
              key={item.href}
              href={item.href}
              className="hard-hover flex items-baseline gap-2 text-[11px]
                uppercase tracking-[0.16em] text-poster-text-muted
                transition-colors hover:text-poster-title"
            >
              <span className="font-mono text-[9px] text-poster-ice">
                {padIndex(index + 1)}
              </span>
              <span>{item.label}</span>
            </Link>
          ))}
        </FooterColumn>

        <FooterColumn title="ELSEWHERE">
          {siteConfig.socialLinks.map((link) => (
            <a
              key={link.url}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="hard-hover text-[11px] uppercase tracking-[0.16em]
                text-poster-text-muted transition-colors hover:text-poster-title"
            >
              {link.label} ↗
            </a>
          ))}
        </FooterColumn>

        <FooterColumn title="FEED">
          <a
            href="/feed.xml"
            className="hard-hover text-[11px] uppercase tracking-[0.16em]
              text-poster-text-muted transition-colors hover:text-poster-title"
          >
            RSS ↗
          </a>
          <a
            href="/sitemap.xml"
            className="hard-hover text-[11px] uppercase tracking-[0.16em]
              text-poster-text-muted transition-colors hover:text-poster-title"
          >
            SITEMAP ↗
          </a>
          <span className="text-[11px] uppercase tracking-[0.16em] text-poster-text-muted">
            LOCALE · {siteConfig.locale}
          </span>
        </FooterColumn>
      </div>

      <div
        className="shell flex flex-wrap items-center justify-between gap-3 pb-10
          font-mono text-[9px] uppercase tracking-[0.24em] text-poster-text-muted"
      >
        <span>{renderCopyright(year)}</span>
        <span className="hidden md:inline">
          {`CHANCE · ${chanceCode(siteConfig.name)}`}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="blink inline-block h-1.5 w-1.5 bg-poster-ice" />
          SIGNAL STABLE
        </span>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="font-mono text-[9px] uppercase tracking-[0.3em] text-poster-ice">
        {"// "}
        {title}
      </div>
      <div className="mt-4 flex flex-col gap-2.5">{children}</div>
    </div>
  );
}
