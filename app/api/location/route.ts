// Why: 作者位置改为"准实时"——iOS 快捷指令定时把手机 GPS POST 到本路由，存进
// Redis(Upstash REST)；站点读取最新值显示。可选功能：未配置存储环境变量时
// GET 返回 null，前端回退到 config.yml 的静态坐标。
//
// 需要的环境变量(见 .env.example)：
//   KV_REST_API_URL / KV_REST_API_TOKEN   —— Vercel 的 Upstash 集成自动注入
//   (兼容旧名 LOCATION_STORE_URL / LOCATION_STORE_TOKEN)
//   LOCATION_WRITE_SECRET                  —— 快捷指令写入时的共享口令(需自行设置)

export const dynamic = "force-dynamic";

const STORE_KEY = "author:location";

// How: 用 Upstash REST 的"命令数组"接口，便于存取任意 JSON 字符串值。
async function redisCommand(command: unknown[]): Promise<{ result: unknown } | null> {
  const url = process.env.KV_REST_API_URL ?? process.env.LOCATION_STORE_URL;
  const token =
    process.env.KV_REST_API_TOKEN ?? process.env.LOCATION_STORE_TOKEN;
  if (!url || !token) return null;

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
}

export async function GET() {
  const stored = await redisCommand(["GET", STORE_KEY]);
  if (!stored || typeof stored.result !== "string") {
    return Response.json(null);
  }
  try {
    return Response.json(JSON.parse(stored.result));
  } catch {
    return Response.json(null);
  }
}

export async function POST(request: Request) {
  const secret = process.env.LOCATION_WRITE_SECRET;
  if (!secret) {
    return Response.json({ error: "store not configured" }, { status: 501 });
  }

  const body = await request.json().catch(() => null);
  // Why: 用共享口令鉴权，只有持有 token 的快捷指令能写入。
  if (!body || body.token !== secret) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }

  const lat = Number(body.lat);
  const lng = Number(body.lng);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return Response.json({ error: "invalid coords" }, { status: 400 });
  }

  const value = JSON.stringify({
    lat,
    lng,
    city: typeof body.city === "string" ? body.city : null,
    updatedAt: Date.now(),
  });

  const ok = await redisCommand(["SET", STORE_KEY, value]);
  if (!ok) {
    return Response.json({ error: "store write failed" }, { status: 502 });
  }
  return Response.json({ ok: true });
}
