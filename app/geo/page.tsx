import type { Metadata } from "next";
import { authorLocation } from "@/lib/siteConfig";
import { pageMetadata } from "@/lib/seo";
import { GeoLink } from "../components/GeoLink";
import { PageHeader } from "../components/PageHeader";

export const metadata: Metadata = pageMetadata({
  title: "坐标",
  description: "作者与你的所在地、直线距离与时差；可用 GPS 精确定位。",
  path: "/geo",
});

// Why: 把"你我之间"做成独立页面。访客定位/设备检测均为客户端能力，
// 页面本身仍是静态预渲染，只有 GeoLink 内部按需请求 /api/geo 与浏览器定位。
export default function GeoPage() {
  return (
    <div className="shell pb-20">
      <PageHeader
        index="06"
        kicker="TELEMETRY // GEO_LINK"
        title="你我之间"
        meta={[
          {
            label: "ORIGIN",
            value:
              [authorLocation.city, authorLocation.country]
                .filter(Boolean)
                .join(", ") || "—",
          },
          { label: "TIMEZONE", value: authorLocation.timezone },
          { label: "PROTOCOL", value: "GPS / IP" },
        ]}
      />

      <div className="mt-10">
        <GeoLink author={authorLocation} />
      </div>
    </div>
  );
}
