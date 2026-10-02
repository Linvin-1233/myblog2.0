// Why: 静态预渲染的页面无法得知访客位置；这条 Serverless Function 读取 Vercel
// 边缘注入的地理请求头(x-vercel-ip-*)，只返回访客城市/国家/时区。
// 绝不回传经纬度：距离计算改由 /api/distance 在服务端完成。
// 无需浏览器定位授权。本地开发无这些头时字段为 null，客户端优雅降级。

// How: 读取请求头即为动态数据，强制动态渲染(不被静态缓存)。
export const dynamic = "force-dynamic";

// How: 请求头来自外部且可能含非法百分号编码，decodeURIComponent 会抛 URIError；
// 这里失败时回退原始值，避免整条路由 500。
function safeDecode(value: string | null): string | null {
  if (!value) return null;
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export function GET(request: Request) {
  const h = request.headers;

  return Response.json({
    // How: Vercel 的 city 头是 URL 编码的(可能含 %20)，安全解码后返回。
    city: safeDecode(h.get("x-vercel-ip-city")),
    country: h.get("x-vercel-ip-country"),
    region: h.get("x-vercel-ip-country-region"),
    timezone: h.get("x-vercel-ip-timezone"),
  });
}
