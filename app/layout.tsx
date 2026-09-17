import type { Metadata } from "next";
import localFont from "next/font/local";
import {
  Anton,
  Bebas_Neue,
  Chakra_Petch,
  Instrument_Serif,
} from "next/font/google";
import "./globals.css";
import { siteConfig } from "@/lib/siteConfig";
import { ThemeScript } from "./components/ThemeScript";
import { RouteGlitchTransition } from "./components/RouteGlitchTransition";
import { SiteHeader } from "./components/SiteHeader";
import { StatusFooter } from "./components/StatusFooter";

// Why: 等宽只用于代码与微文案，沿用仓库内已有的 JetBrains Mono Bold；
// 中文不在此字体内，会经字体栈回退到系统中文黑体(见 globals.css 的 --font-cjk)。
const jetbrainsMono = localFont({
  src: "../fonts/JetBrainsMono-Bold.woff2",
  variable: "--font-jetbrains",
  weight: "700",
  display: "swap",
  // Why: 关闭自动度量回退，否则该变量会内含一个衬线系回退字体，
  // 抢在 --font-cjk 之前接管中文，导致中文字形不符预期。
  adjustFontFallback: false,
});

// Why: Marathon 式排印需要多套字体分工——Anton 做巨型标题、Bebas Neue 做
// 压缩标签、Chakra Petch 做技术正文、Instrument Serif 做编辑衬线引文。
// next/font 在构建期自托管，浏览器不直连 Google。
const anton = Anton({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-anton",
  display: "swap",
});

const bebasNeue = Bebas_Neue({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-bebas",
  display: "swap",
});

const chakraPetch = Chakra_Petch({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-chakra",
  display: "swap",
});

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-instrument",
  display: "swap",
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
      className={`${jetbrainsMono.variable} ${anton.variable} ${bebasNeue.variable} ${chakraPetch.variable} ${instrumentSerif.variable}`}
    >
      <body className="min-h-screen bg-poster-bg font-tech text-poster-text antialiased selection:bg-poster-ice selection:text-poster-bg">
        <ThemeScript />
        <RouteGlitchTransition />
        <div className="relative z-10 flex min-h-screen flex-col">
          <main className="flex-1">
            {/* Why: 站点导航嵌在正文版心内，不做独立顶栏，
                header/body/footer 之间不再有分割线。 */}
            <SiteHeader siteName={siteConfig.name} />
            {children}
          </main>
          <StatusFooter />
        </div>
      </body>
    </html>
  );
}
