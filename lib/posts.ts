import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { renderMarkdown } from "./markdown";

// Why: 所有 markdown 源文件集中在仓库根的 posts/，构建期用 fs 读取；
// 该路径只在服务端(构建期)访问，不会进入客户端包。
const postsDirectory = path.join(process.cwd(), "posts");

export type PostMeta = {
  slug: string;
  title: string;
  description: string;
  date: string;
  updated?: string;
  tags: string[];
  cover?: string;
  draft: boolean;
  readingMinutes: number;
};

export type Post = PostMeta & {
  contentHtml: string;
};

// How: YAML 里不加引号的 `date: 2026-01-15` 会被 js-yaml 解析成 Date 对象，
// 加引号才是字符串。这里统一兼容两种情况，避免误判为空而回退到 1970。
function toDateString(value: unknown): string | undefined {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString().slice(0, 10);
  }
  if (typeof value === "string" && value.trim()) {
    return value.trim();
  }
  return undefined;
}

// How: frontmatter 字段类型不可信(手写 md 易漏或写错)，逐字段做防御式归一，
// 缺失时给出合理默认，避免构建期因个别文章格式问题整体崩溃。
function normalizeMeta(
  slug: string,
  data: Record<string, unknown>,
  readingMinutes: number,
): PostMeta {
  const rawTags = data.tags;
  const tags = Array.isArray(rawTags)
    ? rawTags.map((tag) => String(tag).trim()).filter(Boolean)
    : typeof rawTags === "string"
      ? rawTags.split(",").map((tag) => tag.trim()).filter(Boolean)
      : [];

  return {
    slug,
    title: typeof data.title === "string" ? data.title : slug,
    description: typeof data.description === "string" ? data.description : "",
    date: toDateString(data.date) ?? "1970-01-01",
    updated: toDateString(data.updated),
    tags,
    cover: typeof data.cover === "string" ? data.cover : undefined,
    draft: data.draft === true,
    readingMinutes,
  };
}

// Why: 文件名即 slug(URL 稳定、可预测)，只接受 .md 后缀避免把
// README 之类非文章文件误纳入。
function listPostFiles(): string[] {
  if (!fs.existsSync(postsDirectory)) {
    return [];
  }
  return fs.readdirSync(postsDirectory).filter((name) => name.endsWith(".md"));
}

function readPostFile(fileName: string): Post {
  const slug = fileName.replace(/\.md$/, "");
  const fullPath = path.join(postsDirectory, fileName);
  const fileContents = fs.readFileSync(fullPath, "utf8");
  const { data, content } = matter(fileContents);
  const { html, readingMinutes } = renderMarkdown(content);

  return {
    ...normalizeMeta(slug, data, readingMinutes),
    contentHtml: html,
  };
}

// Why: 草稿(draft:true)只应在开发时可见，正式构建必须排除，
// 防止未完成内容随静态产物泄露。
function isVisible(post: PostMeta): boolean {
  return !post.draft || process.env.NODE_ENV !== "production";
}

// How: 按日期倒序，新文章置顶；相同日期时用 slug 保证排序稳定可复现。
function byDateDesc(a: PostMeta, b: PostMeta): number {
  if (a.date === b.date) {
    return a.slug.localeCompare(b.slug);
  }
  return a.date < b.date ? 1 : -1;
}

export function getAllPosts(): Post[] {
  return listPostFiles()
    .map(readPostFile)
    .filter(isVisible)
    .sort(byDateDesc);
}

export function getAllPostMeta(): PostMeta[] {
  // How: 列表类页面只需元信息；复制后删除正文，避免把大段 HTML 传到组件树。
  return getAllPosts().map((post) => {
    const clone: Partial<Post> = { ...post };
    delete clone.contentHtml;
    return clone as PostMeta;
  });
}

export function getPostBySlug(slug: string): Post | null {
  return getAllPosts().find((post) => post.slug === slug) ?? null;
}

export function getAllSlugs(): string[] {
  return getAllPostMeta().map((post) => post.slug);
}

// Why: 文章底部的上/下篇导航。列表按日期倒序(新→旧)，故"上一篇"=更新的那篇
// (数组中前一个)，"下一篇"=更旧的那篇(数组中后一个)。
export function getAdjacentPosts(slug: string): {
  prev: PostMeta | null;
  next: PostMeta | null;
} {
  const posts = getAllPostMeta();
  const index = posts.findIndex((post) => post.slug === slug);
  if (index === -1) return { prev: null, next: null };
  return {
    prev: index > 0 ? posts[index - 1] : null,
    next: index < posts.length - 1 ? posts[index + 1] : null,
  };
}

// Why: 标签页需要“全部标签 + 各自数量”，用 Map 聚合一次遍历得出，
// 再按出现频次降序，让热门标签靠前展示。
export function getAllTags(): { tag: string; count: number }[] {
  const counter = new Map<string, number>();
  for (const post of getAllPostMeta()) {
    for (const tag of post.tags) {
      counter.set(tag, (counter.get(tag) ?? 0) + 1);
    }
  }
  return Array.from(counter.entries())
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
}

export function getPostsByTag(tag: string): PostMeta[] {
  return getAllPostMeta().filter((post) => post.tags.includes(tag));
}

export type SearchDocument = {
  slug: string;
  title: string;
  description: string;
  tags: string[];
  date: string;
  content: string;
};

// How: 搜索需要可读的纯文本，去掉渲染后 HTML 的标签并还原基础实体，
// 再折叠空白，避免标签/换行干扰模糊匹配。
function htmlToPlainText(html: string): string {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

// Why: 静态导出没有后端，搜索索引在构建期生成并交给客户端；一次性产出
// 标题/简介/标签/正文纯文本，供搜索页做多字段模糊匹配。
export function getSearchDocuments(): SearchDocument[] {
  return getAllPosts().map((post) => ({
    slug: post.slug,
    title: post.title,
    description: post.description,
    tags: post.tags,
    date: post.date,
    content: htmlToPlainText(post.contentHtml),
  }));
}

// Why: 归档页按年份分组展示，年份倒序、组内沿用日期倒序。
export function getPostsGroupedByYear(): { year: string; posts: PostMeta[] }[] {
  const groups = new Map<string, PostMeta[]>();
  for (const post of getAllPostMeta()) {
    const year = post.date.slice(0, 4);
    const list = groups.get(year) ?? [];
    list.push(post);
    groups.set(year, list);
  }
  return Array.from(groups.entries())
    .map(([year, posts]) => ({ year, posts }))
    .sort((a, b) => (a.year < b.year ? 1 : -1));
}
