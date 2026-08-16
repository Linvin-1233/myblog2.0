"use client";

import { useEffect, useRef, useState } from "react";
import type { AuthorLocation } from "@/lib/siteConfig";
import { InteractiveGeoGlobe } from "./InteractiveGeoGlobe";

type Coords = { lat: number; lng: number };

// How: 大圆(haversine)距离，单位公里；地球平均半径 6371km。
function haversineKm(a: Coords, b: Coords): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLon / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

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

// How: 免密钥的客户端反向地理编码(BigDataCloud)，把经纬度转成城市·国家名；
// 拿不到具名地点或失败则返回 null(调用方自行决定回退，避免显示裸坐标)。
async function reverseGeocode(c: Coords): Promise<string | null> {
  try {
    const url =
      "https://api.bigdatacloud.net/data/reverse-geocode-client" +
      `?latitude=${c.lat}&longitude=${c.lng}&localityLanguage=zh`;
    const res = await fetch(url);
    const data = await res.json();
    const place = [data.city || data.locality, data.countryName]
      .filter(Boolean)
      .join(" · ");
    return place || null;
  } catch {
    return null;
  }
}

type LocateStatus = "idle" | "locating" | "denied" | "unsupported";

export function GeoLink({ author }: { author: AuthorLocation }) {
  const [coords, setCoords] = useState<Coords | null>(null);
  const [place, setPlace] = useState("");
  const [source, setSource] = useState<"gps" | "ip" | null>(null);
  const [status, setStatus] = useState<LocateStatus>("idle");
  const [tz, setTz] = useState("");
  const [device, setDevice] = useState("");
  const [now, setNow] = useState(() => Date.now());
  // Why: 作者"准实时"位置(来自 /api/location，由 iOS 快捷指令上报)，无则回退 config。
  const [liveAuthor, setLiveAuthor] = useState<{
    lat: number;
    lng: number;
    city: string | null;
    updatedAt: number;
  } | null>(null);
  const [liveAuthorDetails, setLiveAuthorDetails] = useState<{
    place: string;
    timezone: string;
  } | null>(null);
  const sourceRef = useRef<"gps" | "ip" | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTz(Intl.DateTimeFormat().resolvedOptions().timeZone);
    setDevice(detectDevice(navigator.userAgent));

    let cancelled = false;

    // Why: 拉取作者实时位置(可选功能，未配置存储时返回 null)。
    fetch("/api/location")
      .then((res) => res.json())
      .then((data) => {
        if (cancelled || !data || typeof data.lat !== "number") return;
        setLiveAuthor(data);
      })
      .catch(() => {});

    // Why: 先用 IP(Vercel 头)做基线定位，页面即刻有数据；用户再点按钮升级到 GPS。
    fetch("/api/geo")
      .then((res) => res.json())
      .then((data) => {
        if (cancelled || sourceRef.current === "gps") return;
        if (typeof data.latitude === "number") {
          setCoords({ lat: data.latitude, lng: data.longitude });
          setPlace(
            [data.city, data.country].filter(Boolean).join(" · ") || "IP 定位",
          );
          setSource("ip");
          sourceRef.current = "ip";
        }
      })
      .catch(() => {});

    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    if (!liveAuthor) return;
    let cancelled = false;

    Promise.all([
      reverseGeocode({ lat: liveAuthor.lat, lng: liveAuthor.lng }),
      import("tz-lookup")
        .then(({ default: timezoneAt }) => timezoneAt(liveAuthor.lat, liveAuthor.lng))
        .catch(() => ""),
    ]).then(([place, timezone]) => {
      if (!cancelled) {
        setLiveAuthorDetails({
          place: place || liveAuthor.city || "实时位置",
          timezone,
        });
      }
    });

    return () => {
      cancelled = true;
    };
  }, [liveAuthor]);

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
  const useLive = liveAuthor !== null;
  const authorCoords = useLive
    ? { lat: liveAuthor!.lat, lng: liveAuthor!.lng }
    : author.lat !== null && author.lng !== null
      ? { lat: author.lat, lng: author.lng }
      : null;
  const authorPlace = useLive
    ? liveAuthorDetails?.place ?? "位置解析中…"
    : [author.city, author.country].filter(Boolean).join(" · ") || "—";
  const authorTimezone = useLive
    ? liveAuthorDetails?.timezone ?? ""
    : author.timezone;
  const distanceKm =
    authorCoords && coords ? haversineKm(authorCoords, coords) : null;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <LocationCard
          label={`AUTHOR // 作者${useLive ? " (LIVE)" : ""}`}
          place={authorPlace}
          timezone={authorTimezone ? tzLabel(now, authorTimezone) : "时区解析中…"}
          clock={authorTimezone ? timeInZone(now, authorTimezone) : undefined}
        />
        <LocationCard
          label={`VISITOR // 你${source ? ` (${source.toUpperCase()})` : ""}`}
          place={place || (status === "locating" ? "定位中…" : "待定位")}
          timezone={tzLabel(now, visitorTz)}
          clock={timeInZone(now, visitorTz)}
        />
      </div>

      <InteractiveGeoGlobe author={authorCoords} visitor={coords} />

      <div
        className="grid grid-cols-1 gap-4 border-t border-poster-line pt-4
          sm:grid-cols-3"
      >
        <Stat
          label="直线距离"
          value={
            distanceKm !== null
              ? `${Math.round(distanceKm).toLocaleString("en-US")} km`
              : "—"
          }
        />
        <Stat
          label="时差"
          value={authorTimezone ? tzOffsetLabel(now, authorTimezone, visitorTz) : "解析中…"}
        />
        <Stat label="你的设备" value={device || "检测中…"} />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={requestGps}
          className="border border-poster-line bg-poster-panel px-4 py-2 text-[11px]
            font-extrabold uppercase tracking-widest text-poster-ice transition-colors
            hover:border-poster-ice hover:bg-poster-ice hover:text-poster-bg
            active:translate-x-px active:translate-y-px"
        >
          [ 使用精确定位 GPS ]
        </button>
        {coords && (
          <span className="text-[11px] text-poster-text-muted">
            坐标: {coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}
          </span>
        )}
        {status === "denied" && (
          <span className="text-[11px] text-poster-text-muted">
            已拒绝定位权限，沿用 IP 定位。
          </span>
        )}
        {status === "unsupported" && (
          <span className="text-[11px] text-poster-text-muted">
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
    <div
      className="border-t border-poster-line pt-4"
    >
      <div className="text-[10px] font-bold tracking-widest text-poster-ice">
        {label}
      </div>
      <div className="mt-2 text-lg font-extrabold text-poster-title">
        {place}
      </div>
      <div className="mt-1 text-[11px] text-poster-text-muted">{timezone}</div>
      {clock && (
        <div className="mt-2 text-2xl font-extrabold tabular-nums text-poster-ice">
          {clock}
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] tracking-widest text-poster-text-muted">
        {"// "}
        {label}
      </div>
      <div className="mt-1 text-sm font-extrabold text-poster-text-bright">
        {value}
      </div>
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
