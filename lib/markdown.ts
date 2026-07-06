import { marked } from "marked";
import { markedHighlight } from "marked-highlight";
import hljs from "highlight.js";

// Why: marked 是无状态单例，配置一次即可复用；把高亮插件在模块加载时注册，
// 避免每次渲染文章都重复 use() 造成插件叠加。
marked.use(
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
  // How: 关闭 async 让 parse 同步返回字符串，便于在服务端组件直接使用。
  let html = marked.parse(raw, { async: false }) as string;

  // Why: markdown 里图片用 images/foo.png 引用(相对于 posts/ 目录的真实路径)，
  // 但静态站点运行时需从 public/post-images/ 取。这里在构建期替换 src 属性，
  // 把 images/ 前缀映射到 /post-images/。
  html = html.replace(
    /src="images\/([^"]+)"/g,
    (_: string, relative: string) => `src="/post-images/${relative}"`,
  );

  return {
    html,
    readingMinutes: estimateReadingMinutes(raw),
  };
}
