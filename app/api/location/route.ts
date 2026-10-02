// Why: 作者位置改为"准实时"——iOS 快捷指令定时把手机 GPS POST 到本路由，存进
// Upstash Redis(见 lib/authorLocationStore.ts)。本路由只写不读：任何 GET 都不
// 返回坐标，坐标页的距离展示走 /api/distance，由服务端读取坐标后仅返回派生结果。
//
// 需要的环境变量(见 .env.example)：
//   KV_REST_API_URL / KV_REST_API_TOKEN   —— Vercel 的 Upstash 集成自动注入
//   (兼容旧名 LOCATION_STORE_URL / LOCATION_STORE_TOKEN)
//   LOCATION_WRITE_SECRET                  —— 快捷指令写入时的共享口令(需自行设置)

import { setStoredAuthorLocation } from "@/lib/authorLocationStore";

export const dynamic = "force-dynamic";

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

  const ok = await setStoredAuthorLocation({
    lat,
    lng,
    city: typeof body.city === "string" ? body.city : null,
    updatedAt: Date.now(),
  });
  if (!ok) {
    return Response.json({ error: "store write failed" }, { status: 502 });
  }
  return Response.json({ ok: true });
}
