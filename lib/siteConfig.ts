import fs from "node:fs";
import path from "node:path";
import { load as yamlLoad } from "js-yaml";

// Why: 站点级可变内容(元信息/社交/关于/版权/Gitalk)集中到仓库根的 config.yml，
// 让非代码维护者也能改站点。此模块在构建期(服务端)用 fs 读取，勿在客户端组件
// 中直接 import——需要的字段以 props 形式传给客户端组件。

export type SocialLink = { label: string; url: string };

type RawConfig = {
  site?: {
    name?: string;
    title?: string;
    description?: string;
    author?: string;
    locale?: string;
    url?: string;
    postsPerPage?: number;
    latestCountOnHome?: number;
  };
  copyright?: string;
  social?: SocialLink[];
  about?: string;
  location?: {
    city?: string;
    country?: string;
    lat?: number;
    lng?: number;
    timezone?: string;
  };
  gitalk?: {
    enable?: boolean;
    proxy?: boolean;
    clientID?: string;
    clientSecret?: string;
    repo?: string;
    owner?: string;
    admin?: string[];
  };
};

// How: 缺文件或字段时退回合理默认，避免个别遗漏导致构建崩溃。
function loadRawConfig(): RawConfig {
  const configPath = path.join(process.cwd(), "config.yml");
  if (!fs.existsSync(configPath)) return {};
  return (yamlLoad(fs.readFileSync(configPath, "utf8")) as RawConfig) ?? {};
}

const raw = loadRawConfig();
const site = raw.site ?? {};

// Why: 域名优先取环境变量，便于不同部署环境覆盖；统一去尾斜杠避免拼出双斜杠。
const rawSiteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? site.url ?? "https://blog.linvin.net";
export const siteUrl = rawSiteUrl.replace(/\/$/, "");

export const siteConfig = {
  name: site.name ?? "Blog",
  title: site.title ?? "Blog",
  description: site.description ?? "",
  author: site.author ?? "",
  locale: site.locale ?? "zh-CN",
  url: siteUrl,
  postsPerPage: site.postsPerPage ?? 6,
  latestCountOnHome: site.latestCountOnHome ?? 4,
  socialLinks: (raw.social ?? []).filter((link) => link.url),
};

export type SiteConfig = typeof siteConfig;

// Why: 作者坐标供"你我相距多远"功能使用；客户端组件以 props 接收(此模块 server-only)。
const location = raw.location ?? {};
export const authorLocation = {
  city: location.city ?? "",
  country: location.country ?? "",
  lat: typeof location.lat === "number" ? location.lat : null,
  lng: typeof location.lng === "number" ? location.lng : null,
  timezone: location.timezone ?? "UTC",
};

export type AuthorLocation = typeof authorLocation;

// Why: 关于页文案来自 config，缺省时用作者+简介兜底，保证页面始终有内容。
export const aboutContent =
  raw.about ?? `你好！我是 ${siteConfig.author}。\n\n${siteConfig.description}`;

// How: 版权模板里的 {year} 在渲染时替换为当前年份，避免硬编码年份过期。
const copyrightTemplate = raw.copyright ?? `© {year} ${siteConfig.author}`;
export function renderCopyright(year: number): string {
  return copyrightTemplate.replace("{year}", String(year));
}

const gitalk = raw.gitalk ?? {};
export const gitalkConfig = {
  enable: gitalk.enable === true,
  // Why: proxy=true 时评论走本站 /api/gitalk 转发 OAuth/GitHub 请求，改善国内访问。
  proxy: gitalk.proxy === true,
  // Why: OAuth 凭据从环境变量读取(不进 git)，config.yml 仅作本地回退。
  // 必须用 NEXT_PUBLIC_ 前缀，因为 Gitalk 在浏览器端使用这两个值。
  clientID: process.env.NEXT_PUBLIC_GITALK_CLIENT_ID ?? gitalk.clientID ?? "",
  clientSecret:
    process.env.NEXT_PUBLIC_GITALK_CLIENT_SECRET ?? gitalk.clientSecret ?? "",
  repo: gitalk.repo ?? "",
  owner: gitalk.owner ?? "",
  admin: (gitalk.admin ?? []).filter(Boolean),
};

export type GitalkConfig = typeof gitalkConfig;
