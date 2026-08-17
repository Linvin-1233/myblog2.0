"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { feature } from "topojson-client";
import landTopo from "world-atlas/land-110m.json";

type Coords = { lat: number; lng: number };
type Projected = { x: number; y: number; front: boolean };
type View = { yaw: number; pitch: number };
type Vector = { x: number; y: number; z: number };

const CX = 160;
const CY = 160;
const R = 112;

function rotate(lng: number, lat: number, view: View): Vector {
  const lam = ((lng - view.yaw) * Math.PI) / 180;
  const phi = (lat * Math.PI) / 180;
  const pitch = view.pitch * Math.PI / 180;
  const cosPhi = Math.cos(phi);
  const sphereX = cosPhi * Math.sin(lam);
  const sphereY = Math.sin(phi);
  const sphereZ = cosPhi * Math.cos(lam);
  const rotatedY = Math.cos(pitch) * sphereY - Math.sin(pitch) * sphereZ;
  const rotatedZ = Math.sin(pitch) * sphereY + Math.cos(pitch) * sphereZ;
  return { x: sphereX, y: rotatedY, z: rotatedZ };
}

function projectVector(vector: Vector): Projected {
  return { x: CX + R * vector.x, y: CY - R * vector.y, front: vector.z >= 0 };
}

function project(lng: number, lat: number, view: View): Projected {
  return projectVector(rotate(lng, lat, view));
}

function loadLandRings(): number[][][] {
  const land = landTopo.objects.land as { type: string; geometries?: unknown[] };
  const geometries = land.type === "GeometryCollection" && land.geometries
    ? land.geometries
    : [land];
  const rings: number[][][] = [];

  for (const geometry of geometries) {
    const geo = feature(landTopo as never, geometry) as unknown as {
      geometry?: { type: string; coordinates: unknown };
    };
    if (!geo.geometry) continue;
    const polygons: number[][][][] = geo.geometry.type === "MultiPolygon"
      ? geo.geometry.coordinates as number[][][][]
      : [geo.geometry.coordinates as number[][][]];

    for (const polygon of polygons) {
      for (const ring of polygon) {
        rings.push(ring);
      }
    }
  }
  return rings;
}

const LAND_RINGS = loadLandRings();

function horizonIntersection(a: Vector, b: Vector): Vector {
  const t = a.z / (a.z - b.z);
  const x = a.x + (b.x - a.x) * t;
  const y = a.y + (b.y - a.y) * t;
  const radius = Math.hypot(x, y) || 1;
  return { x: x / radius, y: y / radius, z: 0 };
}

function horizonArc(from: Vector, to: Vector): Vector[] {
  const start = Math.atan2(from.y, from.x);
  let delta = Math.atan2(to.y, to.x) - start;
  if (delta > Math.PI) delta -= Math.PI * 2;
  if (delta < -Math.PI) delta += Math.PI * 2;
  const steps = Math.max(2, Math.ceil(Math.abs(delta) / (Math.PI / 36)));
  return Array.from({ length: steps - 1 }, (_, index) => {
    const angle = start + delta * ((index + 1) / steps);
    return { x: Math.cos(angle), y: Math.sin(angle), z: 0 };
  });
}

// Split a ring into visible pieces and close each piece along the curved horizon.
function clipToFront(vectors: Vector[]): Vector[][] {
  const outsideIndex = vectors.findIndex((vector) => vector.z < 0);
  if (outsideIndex === -1) return [vectors];
  const ordered = [
    ...vectors.slice(outsideIndex),
    ...vectors.slice(0, outsideIndex),
    vectors[outsideIndex],
  ];
  const segments: Vector[][] = [];
  let segment: Vector[] | null = null;

  for (let index = 1; index < ordered.length; index++) {
    const previous = ordered[index - 1];
    const current = ordered[index];
    if (previous.z < 0 && current.z >= 0) {
      segment = [horizonIntersection(previous, current), current];
    } else if (previous.z >= 0 && current.z >= 0) {
      segment?.push(current);
    } else if (previous.z >= 0 && current.z < 0 && segment) {
      segment.push(horizonIntersection(previous, current));
      const start = segment[0];
      const end = segment[segment.length - 1];
      segment.push(...horizonArc(end, start));
      segments.push(segment);
      segment = null;
    }
  }
  return segments;
}

function landPaths(view: View): string[] {
  const paths: string[] = [];
  for (const ring of LAND_RINGS) {
    const segments = clipToFront(ring.map(([lng, lat]) => rotate(lng, lat, view)));
    for (const clipped of segments) {
      if (clipped.length < 3) continue;
      const d = clipped.map((vector, index) => {
        const point = projectVector(vector);
        return `${index === 0 ? "M" : "L"}${point.x.toFixed(1)} ${point.y.toFixed(1)}`;
      }).join("") + "Z";
      if (d.length > 30) paths.push(d);
    }
  }
  return paths;
}

function toVector(coords: Coords): [number, number, number] {
  const lat = coords.lat * Math.PI / 180;
  const lng = coords.lng * Math.PI / 180;
  return [Math.cos(lat) * Math.cos(lng), Math.cos(lat) * Math.sin(lng), Math.sin(lat)];
}

function greatCirclePath(a: Coords, b: Coords, view: View): string {
  const av = toVector(a);
  const bv = toVector(b);
  const dot = Math.max(-1, Math.min(1, av[0] * bv[0] + av[1] * bv[1] + av[2] * bv[2]));
  const angle = Math.acos(dot);
  const sinAngle = Math.sin(angle);
  let d = "";
  let drawing = false;

  for (let index = 0; index <= 64; index++) {
    const t = index / 64;
    const fromWeight = sinAngle < 0.0001 ? 1 - t : Math.sin((1 - t) * angle) / sinAngle;
    const toWeight = sinAngle < 0.0001 ? t : Math.sin(t * angle) / sinAngle;
    const x = fromWeight * av[0] + toWeight * bv[0];
    const y = fromWeight * av[1] + toWeight * bv[1];
    const z = fromWeight * av[2] + toWeight * bv[2];
    const length = Math.hypot(x, y, z) || 1;
    const point = project(
      Math.atan2(y / length, x / length) * 180 / Math.PI,
      Math.asin(z / length) * 180 / Math.PI,
      view,
    );
    if (!point.front) {
      drawing = false;
      continue;
    }
    d += `${drawing ? "L" : "M"}${point.x.toFixed(1)} ${point.y.toFixed(1)}`;
    drawing = true;
  }
  return d;
}

function graticulePaths(view: View): string[] {
  const lines: Coords[][] = [];
  for (const lat of [-60, -30, 0, 30, 60]) {
    lines.push(Array.from({ length: 37 }, (_, index) => ({ lat, lng: -180 + index * 10 })));
  }
  for (const lng of [-120, -60, 0, 60, 120, 180]) {
    lines.push(Array.from({ length: 19 }, (_, index) => ({ lng, lat: -90 + index * 10 })));
  }
  return lines.map((line) => {
    let d = "";
    let drawing = false;
    for (const coords of line) {
      const point = project(coords.lng, coords.lat, view);
      if (!point.front) {
        drawing = false;
        continue;
      }
      d += `${drawing ? "L" : "M"}${point.x.toFixed(1)} ${point.y.toFixed(1)}`;
      drawing = true;
    }
    return d;
  }).filter(Boolean);
}

function normalizeAngle(value: number): number {
  return ((value + 540) % 360) - 180;
}

export function InteractiveGeoGlobe({
  author,
  visitor,
}: {
  author: Coords | null;
  visitor: Coords | null;
}) {
  const [view, setView] = useState<View>({ yaw: 15, pitch: 0 });
  const dragRef = useRef<{ x: number; y: number; view: View } | null>(null);
  const pendingViewRef = useRef<View | null>(null);
  const frameRef = useRef(0);
  const lastProjectionRef = useRef(0);
  const paths = useMemo(() => landPaths(view), [view]);
  const graticule = useMemo(() => graticulePaths(view), [view]);
  const authorPoint = author ? project(author.lng, author.lat, view) : null;
  const visitorPoint = visitor ? project(visitor.lng, visitor.lat, view) : null;
  const route = author && visitor ? greatCirclePath(author, visitor, view) : "";

  useEffect(() => () => {
    if (frameRef.current) cancelAnimationFrame(frameRef.current);
  }, []);

  return (
    <section className="overflow-hidden border-y border-poster-line bg-poster-bg/80 p-4 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b
        border-poster-line pb-3 text-[9px] tracking-[0.18em] text-poster-text-muted">
        <span className="text-poster-ice">LIVE ORBITAL PROJECTION</span>
        <span>任意方向拖动 · 360° SPHERE</span>
      </div>
      <div className="grid items-center gap-6 pt-5 lg:grid-cols-[minmax(0,1fr)_180px]">
        <svg
          viewBox="0 0 320 320"
          role="img"
          aria-label="作者与访客位置及直线距离的可旋转矢量地球演示"
          onPointerDown={(event) => {
            dragRef.current = { x: event.clientX, y: event.clientY, view };
            event.currentTarget.setPointerCapture(event.pointerId);
          }}
          onPointerMove={(event) => {
            if (!dragRef.current) return;
            pendingViewRef.current = {
              yaw: normalizeAngle(dragRef.current.view.yaw - (event.clientX - dragRef.current.x) * 0.55),
              pitch: normalizeAngle(dragRef.current.view.pitch + (event.clientY - dragRef.current.y) * 0.55),
            };
            if (!frameRef.current) {
              frameRef.current = requestAnimationFrame(() => {
                frameRef.current = 0;
                const now = performance.now();
                if (pendingViewRef.current && now - lastProjectionRef.current >= 32) {
                  lastProjectionRef.current = now;
                  setView(pendingViewRef.current);
                }
              });
            }
          }}
          onPointerUp={(event) => {
            dragRef.current = null;
            if (pendingViewRef.current) {
              lastProjectionRef.current = performance.now();
              setView(pendingViewRef.current);
            }
            pendingViewRef.current = null;
            event.currentTarget.releasePointerCapture(event.pointerId);
          }}
          onPointerCancel={() => {
            dragRef.current = null;
            pendingViewRef.current = null;
          }}
          className="mx-auto aspect-square w-full max-w-[560px] cursor-grab
            touch-none select-none active:cursor-grabbing"
        >
          <defs>
            <clipPath id="geo-disc"><circle cx={CX} cy={CY} r={R} /></clipPath>
            <linearGradient id="geo-land-fill" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="var(--color-poster-ice)" stopOpacity="0.28" />
              <stop offset="1" stopColor="var(--color-poster-ice)" stopOpacity="0.08" />
            </linearGradient>
            <radialGradient id="geo-sphere-shade" cx="34%" cy="28%" r="72%">
              <stop offset="0" stopColor="var(--color-poster-ice)" stopOpacity="0.1" />
              <stop offset="0.62" stopColor="var(--color-poster-panel)" stopOpacity="0.2" />
              <stop offset="1" stopColor="#000" stopOpacity="0.52" />
            </radialGradient>
          </defs>
          <circle cx={CX} cy={CY} r={R} fill="var(--color-poster-panel)" fillOpacity="0.65"
            stroke="var(--color-poster-line)" />
          <g clipPath="url(#geo-disc)" opacity="0.12" stroke="var(--color-poster-ice)" fill="none">
            {graticule.map((path, index) => <path key={`grid-${index}`} d={path} />)}
          </g>
          <g clipPath="url(#geo-disc)" fill="url(#geo-land-fill)"
            stroke="var(--color-poster-ice)" strokeWidth="0.85" opacity="0.82">
            {paths.map((path, index) => <path key={`${index}-${path.slice(0, 18)}`} d={path} />)}
          </g>
          <circle cx={CX} cy={CY} r={R} fill="url(#geo-sphere-shade)" pointerEvents="none" />
          {route && <path d={route} fill="none" stroke="var(--color-poster-ice)"
            strokeWidth="1.2" strokeDasharray="5 6" opacity="0.48" />}
          <Marker point={authorPoint} label="A" />
          <Marker point={visitorPoint} label="V" hollow />
          <circle cx={CX} cy={CY} r={R + 9} fill="none" stroke="var(--color-poster-line)" />
        </svg>
        <div className="grid gap-4 text-[9px] tracking-[0.15em] text-poster-text-muted">
          <div className="border-l-2 border-poster-ice pl-3">
            <b className="block text-poster-ice">A / AUTHOR</b>
            {author ? "LOCATION SIGNAL ACTIVE" : "NO SIGNAL"}
          </div>
          <div className="border-l-2 border-poster-title pl-3">
            <b className="block text-poster-title">V / VISITOR</b>
            {visitor ? `${visitor.lat.toFixed(2)}, ${visitor.lng.toFixed(2)}` : "WAITING IP / GPS"}
          </div>
          <div className="border-t border-poster-line pt-3">
            YAW {view.yaw.toFixed(1)}°<br />PITCH {view.pitch.toFixed(1)}°
          </div>
        </div>
      </div>
    </section>
  );
}

function Marker({
  point,
  label,
  hollow = false,
}: {
  point: Projected | null;
  label: string;
  hollow?: boolean;
}) {
  if (!point?.front) return null;
  return (
    <g transform={`translate(${point.x} ${point.y})`}>
      <circle r="9" fill="none" stroke="var(--color-poster-ice)" opacity="0.45" />
      <circle r="4" fill={hollow ? "var(--color-poster-bg)" : "var(--color-poster-ice)"}
        stroke="var(--color-poster-ice)" strokeWidth="2" />
      <text x="11" y="3" fill="var(--color-poster-title)" fontSize="9">{label}</text>
    </g>
  );
}
