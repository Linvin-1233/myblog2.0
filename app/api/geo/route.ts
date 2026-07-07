// Why: 静态预渲染的页面无法得知访客位置；这条 Serverless Function 读取 Vercel
// 边缘注入的地理请求头(x-vercel-ip-*)，返回访客城市/国家/经纬度/时区。
// 无需浏览器定位授权。本地开发无这些头时字段为 null，客户端优雅降级。

// How: 读取请求头即为动态数据，强制动态渲染(不被静态缓存)。
export const dynamic = "force-dynamic";

export function GET(request: Request) {
  const h = request.headers;
  const city = h.get("x-vercel-ip-city");
  const lat = h.get("x-vercel-ip-latitude");
  const lng = h.get("x-vercel-ip-longitude");

  return Response.json({
    // How: Vercel 的 city 头是 URL 编码的(可能含 %20)，解码后返回。
    city: city ? decodeURIComponent(city) : null,
    country: h.get("x-vercel-ip-country"),
    region: h.get("x-vercel-ip-country-region"),
    latitude: lat ? Number(lat) : null,
    longitude: lng ? Number(lng) : null,
    timezone: h.get("x-vercel-ip-timezone"),
  });
}
