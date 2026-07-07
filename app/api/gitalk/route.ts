// Why: 国内浏览器直连 github.com 的 OAuth token 端点常超时/被拦，且该端点不带
// CORS 头，前端本就无法直接换取 token。Gitalk 的 proxy 选项正是为此设计——
// widget 会把 {code, client_id, client_secret} POST 到本路由，由 Vercel
// Serverless Function(位于境外、可正常访问 GitHub)代为换取 access_token 后返回。
// 由 config.yml 的 gitalk.proxy 开关决定前端是否指向本路由。

const GITHUB_TOKEN_URL = "https://github.com/login/oauth/access_token";

export async function POST(request: Request) {
  const params = await request.json().catch(() => null);
  if (!params) {
    return Response.json({ error: "invalid body" }, { status: 400 });
  }

  try {
    // How: 原样转发 Gitalk 传来的 OAuth 参数到 GitHub，并要求 JSON 响应。
    const ghResponse = await fetch(GITHUB_TOKEN_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(params),
    });

    const data = await ghResponse.json();
    return Response.json(data, { status: ghResponse.status });
  } catch {
    return Response.json({ error: "proxy request failed" }, { status: 502 });
  }
}
