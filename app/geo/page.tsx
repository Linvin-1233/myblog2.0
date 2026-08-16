import type { Metadata } from "next";
import { authorLocation } from "@/lib/siteConfig";
import { GeoLink } from "../components/GeoLink";

export const metadata: Metadata = {
  title: "坐标",
  description: "作者与你的所在地、直线距离与时差；可用 GPS 精确定位。",
  alternates: { canonical: "/geo" },
};

// Why: 把"你我之间"做成独立页面。访客定位/设备检测均为客户端能力，
// 页面本身仍是静态预渲染，只有 GeoLink 内部按需请求 /api/geo 与浏览器定位。
// v7 编辑流排版。
export default function GeoPage() {
  return (
    <div className="system-page system-subpage mx-auto w-full max-w-4xl px-4">
      <h1
        className="pt-10 text-3xl font-extrabold uppercase text-poster-title
          md:text-4xl"
      >
        你我之间
      </h1>
      <div className="mt-2 text-[10px] uppercase tracking-widest
        text-poster-text-muted">
        {"// GEO_LINK"}
      </div>

      <div className="mt-8">
        <GeoLink author={authorLocation} />
      </div>
    </div>
  );
}
