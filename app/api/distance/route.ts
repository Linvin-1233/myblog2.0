// Why: 作者实时 GPS 坐标只存服务端。浏览器无法得知作者坐标，本路由在服务端读取
// 存储并计算与访客的距离，只返回距离、地点名与时区——双方坐标都不下发。
// 访客坐标优先取请求体(GPS)，缺省时取 Vercel 边缘注入的 IP 坐标。
// 未配置存储或未上报时回退到 config.yml 的静态坐标(同样只在服务端参与计算)。

import timezoneAt from "tz-lookup";
import { authorLocation } from "@/lib/siteConfig";
import { getStoredAuthorLocation } from "@/lib/authorLocationStore";
import { haversineKm, reverseGeocode } from "@/lib/geo";

export const dynamic = "force-dynamic";

function safeTimezone(lat: number, lng: number, fallback: string): string {
  try {
    return timezoneAt(lat, lng) || fallback;
  } catch {
    return fallback;
  }
}

// Why: 本路由公开，而反向地理编码是一次外部请求；用进程内小缓存(同一坐标 10 分钟)
// 避免被反复调用时反复打 BigDataCloud。
let placeCache: { key: string; place: string; at: number } | null = null;

async function cachedReverseGeocode(lat: number, lng: number): Promise<string | null> {
  const key = `${lat.toFixed(2)},${lng.toFixed(2)}`;
  if (placeCache && placeCache.key === key && Date.now() - placeCache.at < 600_000) {
    return placeCache.place;
  }
  const place = await reverseGeocode({ lat, lng });
  if (place) placeCache = { key, place, at: Date.now() };
  return place;
}

function finiteOrNull(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  // How: 优先用请求体里的访客坐标(GPS)；没有则回退到 Vercel 边缘注入的 IP 坐标，
  // 全程只在服务端参与距离计算。任何一个都不回传。
  let vLat = finiteOrNull(body?.lat);
  let vLng = finiteOrNull(body?.lng);
  if (vLat === null || vLng === null) {
    vLat = finiteOrNull(request.headers.get("x-vercel-ip-latitude"));
    vLng = finiteOrNull(request.headers.get("x-vercel-ip-longitude"));
  }
  const stored = await getStoredAuthorLocation();

  let live = false;
  let aLat: number | null = authorLocation.lat;
  let aLng: number | null = authorLocation.lng;
  let place =
    [authorLocation.city, authorLocation.country].filter(Boolean).join(" · ") ||
    "—";
  let timezone = authorLocation.timezone;

  if (stored) {
    live = true;
    aLat = stored.lat;
    aLng = stored.lng;
    place =
      stored.city ||
      (await cachedReverseGeocode(stored.lat, stored.lng)) ||
      "实时位置";
    timezone = safeTimezone(stored.lat, stored.lng, authorLocation.timezone);
  }

  const distanceKm =
    aLat !== null && aLng !== null && vLat !== null && vLng !== null
      ? haversineKm({ lat: aLat, lng: aLng }, { lat: vLat, lng: vLng })
      : null;

  return Response.json({ live, place, timezone, distanceKm });
}
