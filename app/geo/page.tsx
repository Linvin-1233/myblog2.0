import type { Metadata } from "next";
import { authorLocation } from "@/lib/siteConfig";
import { SectionLabel } from "../components/SectionLabel";
import { GeoLink } from "../components/GeoLink";

export const metadata: Metadata = {
  title: "坐标",
  description: "作者与你的所在地、直线距离与时差；可用 GPS 精确定位。",
  alternates: { canonical: "/geo" },
};

// Why: 把"你我之间"做成独立页面。访客定位/设备检测均为客户端能力，
// 页面本身仍是静态预渲染，只有 GeoLink 内部按需请求 /api/geo 与浏览器定位。
export default function GeoPage() {
  return (
    <section className="relative pt-8">
      <SectionLabel>[SEC // GEO_LINK]</SectionLabel>
      <div className="mb-8 border-b border-poster-line pb-4">
        <span className="block text-[10px] tracking-widest text-poster-text-muted">
          {"// YOU_AND_ME"}
        </span>
        <h1 className="text-xl font-extrabold uppercase text-poster-title">
          你我之间
        </h1>
      </div>

      <GeoLink author={authorLocation} />
    </section>
  );
}
