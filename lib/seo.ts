import type { Metadata } from "next";
import { siteConfig } from "./siteConfig";

// Why: 根布局的 openGraph/twitter 会作为默认值被所有子页继承——若子页不显式覆盖，
// 分享任意子页都会显示首页标题与首页 URL。这里集中生成子页元数据，保证
// title/description/canonical/OG/Twitter 五处使用同一份文案，且绝对 URL 带尾斜杠。
export function pageMetadata({
  title,
  description,
  path,
}: {
  title: string;
  description: string;
  path: string;
}): Metadata {
  const canonical = path === "/" ? "/" : `${path.replace(/\/+$/, "")}/`;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      type: "website",
      locale: siteConfig.locale,
      url: `${siteConfig.url}${canonical}`,
      siteName: siteConfig.name,
      title,
      description,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}
