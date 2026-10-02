// Why: 作者"准实时"位置存于 Upstash Redis(REST)，只有服务端能访问。坐标读取
// 封装在此，绝不把原始坐标下发到客户端——/api/distance 只返回派生的距离/地点/时区。
//   KV_REST_API_URL / KV_REST_API_TOKEN   —— Vercel 的 Upstash 集成自动注入
//   (兼容旧名 LOCATION_STORE_URL / LOCATION_STORE_TOKEN)

const STORE_KEY = "author:location";

export type StoredAuthorLocation = {
  lat: number;
  lng: number;
  city: string | null;
  updatedAt: number;
};

// How: 用 Upstash REST 的"命令数组"接口，便于存取任意 JSON 字符串值。
async function redisCommand(
  command: unknown[],
): Promise<{ result: unknown } | null> {
  const url = process.env.KV_REST_API_URL ?? process.env.LOCATION_STORE_URL;
  const token =
    process.env.KV_REST_API_TOKEN ?? process.env.LOCATION_STORE_TOKEN;
  if (!url || !token) return null;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(command),
      cache: "no-store",
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function getStoredAuthorLocation(): Promise<StoredAuthorLocation | null> {
  const stored = await redisCommand(["GET", STORE_KEY]);
  if (!stored || typeof stored.result !== "string") return null;
  try {
    const parsed = JSON.parse(stored.result);
    if (typeof parsed?.lat !== "number" || typeof parsed?.lng !== "number") {
      return null;
    }
    return {
      lat: parsed.lat,
      lng: parsed.lng,
      city: typeof parsed.city === "string" ? parsed.city : null,
      updatedAt: typeof parsed.updatedAt === "number" ? parsed.updatedAt : 0,
    };
  } catch {
    return null;
  }
}

export async function setStoredAuthorLocation(
  value: StoredAuthorLocation,
): Promise<boolean> {
  const ok = await redisCommand(["SET", STORE_KEY, JSON.stringify(value)]);
  return ok !== null;
}
