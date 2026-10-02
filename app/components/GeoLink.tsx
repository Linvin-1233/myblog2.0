"use client";

import { useEffect, useRef, useState } from "react";
import type { AuthorLocation } from "@/lib/siteConfig";
import { reverseGeocode, type Coords } from "@/lib/geo";

// How: 从 UA 粗略识别设备类型/系统(含版本)/浏览器，满足"检测我的手机"。
function detectDevice(ua: string): string {
  const isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(ua);
  let os = "UNKNOWN_OS";
  if (/iPhone|iPad|iPod/i.test(ua)) {
    const m = ua.match(/OS (\d+[_.]\d+)/);
    os = `iOS ${m ? m[1].replace("_", ".") : ""}`.trim();
  } else if (/Android/i.test(ua)) {
    const m = ua.match(/Android (\d+(?:\.\d+)?)/);
    os = `Android ${m ? m[1] : ""}`.trim();
  } else if (/Windows NT/i.test(ua)) os = "Windows";
  else if (/Mac OS X/i.test(ua)) os = "macOS";
  else if (/Linux/i.test(ua)) os = "Linux";

  let browser = "UNKNOWN";
  if (/Edg\//i.test(ua)) browser = "Edge";
  else if (/CriOS\//i.test(ua)) browser = "Chrome";
  else if (/OPR\/|Opera/i.test(ua)) browser = "Opera";
  else if (/Chrome\//i.test(ua)) browser = "Chrome";
  else if (/Firefox\/|FxiOS\//i.test(ua)) browser = "Firefox";
  else if (/Safari\//i.test(ua)) browser = "Safari";

  return `${isMobile ? "MOBILE" : "DESKTOP"} · ${os} · ${browser}`;
}

// How: 按指定时区取当前时钟(HH:MM:SS)。
function timeInZone(now: number, timeZone: string): string {
  try {
    return new Date(now).toLocaleTimeString("zh-CN", {
      timeZone,
      hour12: false,
    });
  } catch {
    return "--:--:--";
  }
}

// How: 把 IANA 时区(如 Asia/Shanghai)显示为友好英文长名 + 偏移，
// 如 "China Standard Time · GMT+8"。取不到则回退原始名。
function tzLabel(now: number, timeZone: string): string {
  const part = (option: "long" | "shortOffset") => {
    try {
      return new Intl.DateTimeFormat("en-US", { timeZone, timeZoneName: option })
        .formatToParts(new Date(now))
        .find((p) => p.type === "timeZoneName")?.value;
    } catch {
      return undefined;
    }
  };
  const long = part("long") ?? timeZone;
  const offset = part("shortOffset");
  return offset ? `${long} · ${offset}` : long;
}

type LocateStatus = "idle" | "locating" | "denied" | "unsupported";

// Why: 遥测面板——两端坐标、时钟、距离、设备，全部方角单元格拼装；
// 链接示意只用一条 SVG 虚线，不做地球/轨迹等旧视觉语言。
export function GeoLink({ author }: { author: AuthorLocation }) {
  const [coords, setCoords] = useState<Coords | null>(null);
  const [place, setPlace] = useState("");
  const [source, setSource] = useState<"gps" | "ip" | null>(null);
  const [status, setStatus] = useState<LocateStatus>("idle");
  const [tz, setTz] = useState("");
  const [device, setDevice] = useState("");
  // Why: 时钟不能在初始 state 里取 Date.now()——客户端组件也会被静态预渲染，
  // 服务端与客户端取到的时间必然不同，时钟文本会水合不一致。挂载后再开始走秒。
  const [now, setNow] = useState<number | null>(null);
  // Why: 作者地点/时区与距离由 /api/distance 在服务端算好后返回；作者的精确 GPS
  // 坐标只存在服务端，绝不下发到浏览器。
  const [authorInfo, setAuthorInfo] = useState<{
    live: boolean;
    place: string;
    timezone: string;
  } | null>(null);
  const [distanceKm, setDistanceKm] = useState<number | null>(null);
  const sourceRef = useRef<"gps" | "ip" | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTz(Intl.DateTimeFormat().resolvedOptions().timeZone);
    setDevice(detectDevice(navigator.userAgent));
    setNow(Date.now());

    let cancelled = false;

    // Why: 先用 IP(Vercel 头)展示访客城市；/api/geo 只回地点文本，不含经纬度，
    // 距离由 /api/distance 用同一批边缘头在服务端算。用户再点按钮升级到 GPS。
    fetch("/api/geo")
      .then((res) => res.json())
      .then((data) => {
        if (cancelled || sourceRef.current === "gps" || !data) return;
        const label = [data.city, data.country].filter(Boolean).join(" · ");
        if (!label && !data.timezone) return;
        setPlace(label || "IP 定位");
        setSource("ip");
        sourceRef.current = "ip";
      })
      .catch(() => {});

    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, []);

  // Why: 距离需要访客坐标，而访客坐标由 IP/GPS 异步获得；coords 一变就重新请求
  // 服务端，由服务端读取作者坐标并只返回距离——坐标本身不出服务端。
  useEffect(() => {
    let cancelled = false;
    fetch("/api/distance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(coords ? { lat: coords.lat, lng: coords.lng } : {}),
    })
      .then((res) => res.json())
      .then((data) => {
        if (cancelled || !data) return;
        setAuthorInfo({
          live: Boolean(data.live),
          place: typeof data.place === "string" ? data.place : "",
          timezone: typeof data.timezone === "string" ? data.timezone : "",
        });
        setDistanceKm(
          typeof data.distanceKm === "number" ? data.distanceKm : null,
        );
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [coords]);

  const requestGps = () => {
    if (!navigator.geolocation) {
      setStatus("unsupported");
      return;
    }
    setStatus("locating");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const c = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setCoords(c);
        setSource("gps");
        sourceRef.current = "gps";
        setStatus("idle");
        reverseGeocode(c).then((p) =>
          setPlace(p ?? `${c.lat.toFixed(4)}, ${c.lng.toFixed(4)}`),
        );
      },
      () => setStatus("denied"),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
    );
  };

  const visitorTz = tz || "UTC";
  const useLive = authorInfo?.live ?? false;
  const authorPlace =
    authorInfo?.place ||
    ([author.city, author.country].filter(Boolean).join(" · ") || "—");
  const authorTimezone = authorInfo?.timezone || author.timezone;
  // Why: now 为 null 表示尚未挂载；时钟/时差在挂载前不渲染，避免水合不一致。
  const clockReady = now !== null;

  return (
    <div className="space-y-8">
      <div className="grid gap-px bg-poster-line md:grid-cols-2">
        <LocationCard
          label={`AUTHOR // 作者${useLive ? " (LIVE)" : ""}`}
          place={authorPlace}
          timezone={
            authorTimezone && clockReady
              ? tzLabel(now, authorTimezone)
              : "时区解析中…"
          }
          clock={
            authorTimezone && clockReady
              ? timeInZone(now, authorTimezone)
              : undefined
          }
        />
        <LocationCard
          label={`VISITOR // 你${source ? ` (${source.toUpperCase()})` : ""}`}
          place={place || (status === "locating" ? "定位中…" : "待定位")}
          timezone={clockReady ? tzLabel(now, visitorTz) : "时区解析中…"}
          clock={clockReady ? timeInZone(now, visitorTz) : undefined}
        />
      </div>

      {/* Why: 距离是这一页的主对象，所以它是整块实色场，
          数字直接当图形用——不描边、不加面板。 */}
      <div className="block-ice p-8 md:p-10">
        <div className="font-mono text-[9px] uppercase tracking-[0.3em] opacity-70">
          {"// DISTANCE"}
        </div>
        <div className="mt-3 font-mono text-[clamp(2.5rem,8vw,4.5rem)] leading-none tabular-nums">
          {distanceKm !== null
            ? `${Math.round(distanceKm).toLocaleString("en-US")} km`
            : "—"}
        </div>
      </div>

      <div className="grid gap-px bg-poster-line sm:grid-cols-2">
        <Stat
          label="时差"
          value={
            authorTimezone && clockReady
              ? tzOffsetLabel(now, authorTimezone, visitorTz)
              : "解析中…"
          }
        />
        <Stat label="你的设备" value={device || "检测中…"} />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={requestGps}
          className="border-2 border-poster-ice bg-poster-ice px-4 py-2.5
            font-mono text-[10px] uppercase tracking-[0.2em] text-poster-bg
            transition-colors hover:bg-transparent hover:text-poster-ice
            active:translate-x-px active:translate-y-px"
        >
          [ 使用精确定位 GPS ]
        </button>
        {coords && (
          <span
            className="font-mono text-[10px] uppercase tracking-[0.16em]
              text-poster-text-muted"
          >
            COORDS · {coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}
          </span>
        )}
        {status === "denied" && (
          <span className="font-mono text-[10px] text-poster-text-muted">
            已拒绝定位权限，沿用 IP 定位。
          </span>
        )}
        {status === "unsupported" && (
          <span className="font-mono text-[10px] text-poster-text-muted">
            当前环境不支持地理定位。
          </span>
        )}
      </div>
    </div>
  );
}

function LocationCard({
  label,
  place,
  timezone,
  clock,
}: {
  label: string;
  place: string;
  timezone: string;
  clock?: string;
}) {
  return (
    <div className="bg-poster-bg p-5">
      <div
        className="font-mono text-[9px] uppercase tracking-[0.3em] text-poster-ice"
      >
        {label}
      </div>
      <div className="mt-3 text-lg text-poster-title">{place}</div>
      <div className="mt-1 font-mono text-[10px] text-poster-text-muted">
        {timezone}
      </div>
      {clock && (
        <div className="mt-3 font-mono text-3xl tabular-nums text-poster-ice">
          {clock}
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-poster-bg p-4">
      <div
        className="font-mono text-[9px] uppercase tracking-[0.24em]
          text-poster-text-muted"
      >
        {"// "}
        {label}
      </div>
      <div className="mt-2 text-sm text-poster-text-bright">{value}</div>
    </div>
  );
}

function tzOffsetLabel(now: number, tzA: string, tzB: string): string {
  const offset = (tz: string) => {
    try {
      const value = new Date(now).toLocaleString("en-US", {
        timeZone: tz,
        timeZoneName: "shortOffset",
      });
      const match = value.match(/GMT([+-]\d+)(?::(\d+))?/);
      if (!match) return 0;
      return Number(match[1]) + (match[2] ? Number(match[2]) / 60 : 0);
    } catch {
      return 0;
    }
  };
  const diff = offset(tzB) - offset(tzA);
  if (diff === 0) return "同一时区";
  return `${diff > 0 ? "快" : "慢"} ${Math.abs(diff)} 小时`;
}
