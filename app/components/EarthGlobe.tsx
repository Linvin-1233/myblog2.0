import { feature } from "topojson-client";
import landTopo from "world-atlas/land-110m.json";

// ===== 正射投影：真实陆地轮廓 → 球面圆盘 =====
// How: 视角中心定在大西洋(15°E, 0°N)，把 world-atlas 的陆地多边形逐点
// 投影到 viewBox 的球面圆盘上；背面的点跳过，轮廓在圆盘边缘自然断开。
// 全部在构建期(服务端组件)算好，运行时零成本。
const CX = 120;
const CY = 120;
const R = 60;
const LON0 = 15;

function project(lon: number, lat: number) {
  const lam = ((lon - LON0) * Math.PI) / 180;
  const phi = (lat * Math.PI) / 180;
  const cosPhi = Math.cos(phi);
  return {
    x: CX + R * cosPhi * Math.sin(lam),
    y: CY - R * Math.sin(phi),
    // Why: 小负容差让轮廓在圆盘边缘少断线，视觉上更连续。
    front: cosPhi * Math.cos(lam) >= -0.02,
  };
}

function ringPath(ring: number[][]): string {
  let d = "";
  let pen = false;
  for (const [lon, lat] of ring) {
    const p = project(lon, lat);
    if (!p.front) {
      pen = false;
      continue;
    }
    d += `${pen ? "L" : "M"}${p.x.toFixed(1)} ${p.y.toFixed(1)}`;
    pen = true;
  }
  return d;
}

// How: 过滤碎小岛屿(投影后外接框小于阈值)，只保留可辨识的大陆/大岛。
function landPaths(): string[] {
  const land = landTopo.objects.land as {
    type: string;
    geometries?: unknown[];
  };
  // How: world-atlas 的 land 是 GeometryCollection，feature() 需逐个
  // 子几何体调用(整体调用会返回无 geometry 的 FeatureCollection)。
  const geoms =
    land.type === "GeometryCollection" && land.geometries
      ? land.geometries
      : [land];
  const paths: string[] = [];
  for (const geomObj of geoms) {
    const geo = feature(landTopo as never, geomObj) as unknown as {
      geometry?: { type: string; coordinates: unknown };
    };
    if (!geo.geometry) continue;
    // How: MultiPolygon = [多边形[环[点]]]，Polygon 单包一层统一成同结构；
    // 显式标注避免 TS 把两分支并成 4D|5D 而报类型错。
    const polys: number[][][][] =
      geo.geometry.type === "MultiPolygon"
        ? (geo.geometry.coordinates as number[][][][])
        : [(geo.geometry.coordinates as number[][][])];
    for (const poly of polys) {
      for (const ring of poly) {
        let minX = Infinity;
        let maxX = -Infinity;
        let minY = Infinity;
        let maxY = -Infinity;
        for (const [lon, lat] of ring) {
          const p = project(lon, lat);
          // Why: 过滤只看可见点，背面点的镜像投影会污染外接框。
          if (!p.front) continue;
          if (p.x < minX) minX = p.x;
          if (p.x > maxX) maxX = p.x;
          if (p.y < minY) minY = p.y;
          if (p.y > maxY) maxY = p.y;
        }
        // Why: 只保留可见跨度 ≥ 3.5 单位且点足够多的地块——碎岛和
        // 投影到背面的碎片被过滤，不列颠/冰岛等大岛保留。
        if (maxX - minX < 3.5 && maxY - minY < 3.5) continue;
        const d = ringPath(ring);
        if (d.length > 40) paths.push(d);
      }
    }
  }
  return paths;
}

const CONTINENTS = landPaths();

// Why: 矢量扫描地球——真实大陆使用低亮度渐变填充和连续海岸线，旋转扇区
// 提供雷达读取感；经纬网与仪器刻度负责细节，不再依赖高频点阵。
export function EarthGlobe({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 240 240"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <clipPath id="globe-disc">
          <circle cx="120" cy="120" r="59" />
        </clipPath>
        <linearGradient id="land-fill" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="var(--color-poster-ice)" stopOpacity="0.3" />
          <stop offset="1" stopColor="var(--color-poster-ice)" stopOpacity="0.08" />
        </linearGradient>
      </defs>
      <g stroke="var(--color-poster-line)" opacity="0.65">
        {Array.from({ length: 24 }, (_, index) => {
          const angle = index * 15;
          const major = index % 2 === 0;
          return (
            <line
              key={angle}
              x1="120"
              y1={major ? "51" : "54"}
              x2="120"
              y2="58"
              strokeWidth={major ? "1" : "0.6"}
              transform={`rotate(${angle} 120 120)`}
            />
          );
        })}
      </g>
      {/* 虚线轨道椭圆(水平，冷静秩序) */}
      <ellipse
        cx="120"
        cy="120"
        rx="112"
        ry="46"
        fill="none"
        stroke="var(--color-poster-line)"
        strokeWidth="1.2"
        strokeDasharray="6 5"
      />
      {/* 轨道末端的尺寸刻度线 */}
      <g stroke="var(--color-poster-line)" strokeWidth="1" opacity="0.8">
        <line x1="8" y1="108" x2="8" y2="132" />
        <line x1="232" y1="108" x2="232" y2="132" />
        <line x1="108" y1="74" x2="132" y2="74" />
      </g>
      {/* 卫星本体：主体 + 太阳能板 + 天线(落在轨道右上) */}
      <g
        stroke="var(--color-poster-ice)"
        strokeWidth="1.1"
        fill="none"
        transform="translate(212, 94) rotate(28)"
      >
        <rect x="-8" y="-5" width="16" height="10" />
        <rect x="-16" y="-1.5" width="6" height="3" />
        <rect x="10" y="-1.5" width="6" height="3" />
        <line x1="0" y1="-5" x2="0" y2="-9" />
        <circle cx="0" cy="-10" r="1.2" />
        <line x1="-8" y1="0" x2="-14" y2="4" />
        <circle cx="-14.5" cy="4.5" r="1" />
      </g>
      {/* 卫星旁边的状态像素点 */}
      <circle cx="224" cy="80" r="1.6" fill="var(--color-poster-title)" />
      <circle cx="229" cy="74" r="1.2" fill="var(--color-poster-ice)" />

      {/* 地球球体：大陆采样点常驻低亮度，雷达扇区旋转点亮。 */}
      <g
        stroke="var(--color-poster-ice)"
        fill="none"
        strokeLinecap="round"
      >
        <circle
          cx="120"
          cy="120"
          r="60"
          fill="var(--color-poster-panel)"
          fillOpacity="0.34"
          strokeWidth="1.2"
        />
        <g className="globe-grid-rest" opacity="0.18" strokeWidth="0.6">
          <ellipse cx="120" cy="120" rx="20" ry="60" />
          <ellipse cx="120" cy="120" rx="40" ry="60" />
          <line x1="60" y1="120" x2="180" y2="120" />
          <line x1="68" y1="90" x2="172" y2="90" />
          <line x1="68" y1="150" x2="172" y2="150" />
          <ellipse cx="120" cy="120" rx="52" ry="22" strokeDasharray="3 5" />
        </g>
        <g clipPath="url(#globe-disc)" fill="url(#land-fill)" strokeWidth="0.9" opacity="0.82">
          {CONTINENTS.map((d) => (
            <path key={d.slice(0, 24)} d={d} />
          ))}
        </g>
      </g>

      <g className="radar-sweep" aria-hidden="true" clipPath="url(#globe-disc)">
        <path
          d="M120 120 L120 58 A62 62 0 0 1 176 93 Z"
          fill="var(--color-poster-ice)"
          opacity="0.08"
        />
        <line x1="120" y1="120" x2="120" y2="58" stroke="var(--color-poster-ice)" />
      </g>

      <g stroke="var(--color-poster-ice)" opacity="0.55" aria-hidden="true">
        <circle cx="120" cy="120" r="4" fill="none" />
        <line x1="108" y1="120" x2="116" y2="120" />
        <line x1="124" y1="120" x2="132" y2="120" />
        <line x1="120" y1="108" x2="120" y2="116" />
        <line x1="120" y1="124" x2="120" y2="132" />
      </g>
      <g fill="var(--color-poster-text-muted)" fontSize="5.5" letterSpacing="0.8">
        <text x="63" y="188">LAND / VECTOR</text>
        <text x="143" y="188">SWEEP / 12 S</text>
        <text x="62" y="55">N 90</text>
        <text x="158" y="121">EQ 00</text>
      </g>
      <g fill="var(--color-poster-ice)" opacity="0.5" aria-hidden="true">
        <circle cx="80" cy="84" r="1.4" />
        <circle cx="156" cy="105" r="1" />
        <circle cx="137" cy="158" r="1.2" />
      </g>

      {/* 左下角十字准星 */}
      <g stroke="var(--color-poster-line)" strokeWidth="1" opacity="0.7">
        <line x1="30" y1="196" x2="30" y2="216" />
        <line x1="20" y1="206" x2="40" y2="206" />
        <circle cx="30" cy="206" r="14" fill="none" strokeDasharray="2 3" />
      </g>

      {/* Keep the orbit label above the dense globe artwork and give it a quiet backing. */}
      <g aria-hidden="true">
        <rect
          x="124"
          y="40"
          width="102"
          height="15"
          fill="var(--color-poster-bg)"
          fillOpacity="0.88"
        />
        <text
          x="130"
          y="50"
          fontSize="9"
          letterSpacing="1.5"
          fill="var(--color-poster-ice)"
        >
          ORBIT // R 112
        </text>
      </g>
    </svg>
  );
}
