import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { siteConfig } from "@/lib/siteConfig";
import { ThemeScript } from "./components/ThemeScript";
import { PosterBackground } from "./components/PosterBackground";
import { SiteHeader } from "./components/SiteHeader";
import { SiteFooter } from "./components/SiteFooter";

// Why: 拉丁字符用本地 JetBrains Mono 强化终端/海报质感；仓库仅提供 Bold 一档，
// 而该风格文字普遍偏粗，故直接以 700 注册。中文不在此字体内，会经字体栈回退到
// sans-serif(见 globals.css 的 --font-mono)，从而实现“中文 sans-serif / 英文等宽”。
const jetbrainsMono = localFont({
  src: "../fonts/JetBrainsMono-Bold.woff2",
  variable: "--font-jetbrains",
  weight: "700",
  display: "swap",
  // Why: 关闭自动度量回退，否则 --font-jetbrains 会内含一个衬线系回退字体，
  // 抢在我们指定的 sans-serif 之前接管中文，导致中文字体不符预期。
  adjustFontFallback: false,
});

// Why: metadataBase 让所有相对的 OG/canonical 链接自动补全为绝对地址，
// 是静态导出下 SEO 正确性的关键;title.template 让子页统一带上站点后缀。
export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.title,
    template: `%s // ${siteConfig.name}`,
  },
  description: siteConfig.description,
  authors: [{ name: siteConfig.author }],
  alternates: {
    canonical: "/",
    types: {
      "application/rss+xml": [{ url: "/feed.xml", title: siteConfig.title }],
    },
  },
  openGraph: {
    type: "website",
    locale: siteConfig.locale,
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: siteConfig.title,
    description: siteConfig.description,
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.title,
    description: siteConfig.description,
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    // How: suppressHydrationWarning 因为 data-theme 由 ThemeScript 在客户端
    // 首帧写入，与服务端渲染的初始值可能不同，抑制这一预期内的告警。
    <html
      lang="zh-CN"
      suppressHydrationWarning
      className={jetbrainsMono.variable}
    >
      <head>
        <ThemeScript />
      </head>
      <body
        className="min-h-screen bg-poster-bg font-mono text-poster-text
          antialiased selection:bg-poster-ice selection:text-black"
      >
        <PosterBackground />
        <div className="relative z-10 flex min-h-screen flex-col">
          <SiteHeader />
          <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-12 md:px-8">
            {children}
          </main>
          <SiteFooter />
        </div>
      </body>
    </html>
  );
}
