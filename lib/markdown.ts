import { marked } from "marked";
import { markedHighlight } from "marked-highlight";
import { gfmHeadingId, resetHeadings } from "marked-gfm-heading-id";
import markedFootnote from "marked-footnote";
import markedKatex from "marked-katex-extension";
import { markedEmoji } from "marked-emoji";
import { nameToEmoji } from "gemoji";
import hljs from "highlight.js";
import fs from "node:fs";
import path from "node:path";

// Why: 读取 optimize-images.mjs 产出的尺寸清单，构建期给正文图片注入
// width/height，预留版面高度、消除 CLS 与强制重排。清单缺失时静默跳过。
type ImageManifest = Record<string, { w: number; h: number }>;

function loadImageManifest(): ImageManifest {
  const manifestPath = path.join(
    process.cwd(),
    "public",
    "post-images",
    "manifest.json",
  );
  if (!fs.existsSync(manifestPath)) return {};
  try {
    return JSON.parse(fs.readFileSync(manifestPath, "utf8")) as ImageManifest;
  } catch {
    return {};
  }
}

const imageManifest = loadImageManifest();

// Why: marked 是无状态单例，配置一次即可复用；把扩展在模块加载时统一注册，
// 避免每次渲染都重复 use() 造成插件叠加。
// 扩展：标题锚点 ID、脚注、KaTeX 数学公式、:emoji: 短码、代码高亮。
marked.use(
  gfmHeadingId(),
  markedFootnote(),
  markedKatex({ throwOnError: false }),
  markedEmoji({ emojis: nameToEmoji, renderer: (token) => token.emoji }),
  markedHighlight({
    langPrefix: "hljs language-",
    // How: 已知语言用对应语法高亮，未知语言回退到自动探测，
    // 保证代码块在海报风终端样式下始终有配色。
    highlight(code, lang) {
      const language = hljs.getLanguage(lang) ? lang : "plaintext";
      return hljs.highlight(code, { language }).value;
    },
  }),
);

marked.setOptions({
  gfm: true,
  breaks: false,
});

// Why: 中文按字符、英文按单词估算，粗略但足够展示“阅读时长”这类元信息；
// 200 词/分钟是通用阅读速度经验值。
const WORDS_PER_MINUTE = 200;

function estimateReadingMinutes(raw: string): number {
  const cjkCount = (raw.match(/[\u4e00-\u9fa5]/g) ?? []).length;
  const wordCount = raw
    .replace(/[\u4e00-\u9fa5]/g, " ")
    .split(/\s+/)
    .filter(Boolean).length;
  const minutes = Math.ceil((cjkCount + wordCount) / WORDS_PER_MINUTE);
  return Math.max(1, minutes);
}

export type RenderedMarkdown = {
  html: string;
  readingMinutes: number;
};

// How: 在构建期把 markdown 正文转成 HTML 字符串，页面用
// dangerouslySetInnerHTML 注入；因内容源自本仓库可信文件，无需运行时净化。
export function renderMarkdown(raw: string): RenderedMarkdown {
  // How: 每次渲染前重置标题 slug 计数，避免跨文章累积导致 id 漂移(如 -1/-2)。
  resetHeadings();
  // How: 关闭 async 让 parse 同步返回字符串，便于在服务端组件直接使用。
  let html = marked.parse(raw, { async: false }) as string;

  // Why: markdown 里图片用 images/foo.png 引用(相对于 posts/ 目录的真实路径)，
  // 但静态站点运行时需从 public/post-images/ 取。这里在构建期把整个 <img> 标签
  // 重写：src 前缀映射到 /post-images/，并按清单注入 width/height 与懒加载。
  html = html.replace(
    /<img([^>]*?)src="images\/([^"]+)"([^>]*?)>/g,
    (_match: string, pre: string, rel: string, post: string) => {
      const dim = imageManifest[rel];
      const sizeAttrs = dim ? ` width="${dim.w}" height="${dim.h}"` : "";
      return (
        `<img${pre}src="/post-images/${rel}"${post}` +
        `${sizeAttrs} loading="lazy" decoding="async">`
      );
    },
  );

  return {
    html,
    readingMinutes: estimateReadingMinutes(raw),
  };
}
