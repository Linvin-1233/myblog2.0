import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllSlugs, getPostBySlug, getAdjacentPosts, tagToSlug } from "@/lib/posts";
import { siteConfig, gitalkConfig, postLicense } from "@/lib/siteConfig";
import { formatDate } from "@/lib/format";
import { JsonLd } from "../../components/JsonLd";
import { Comments } from "../../components/Comments";
import { ImageLightbox } from "../../components/ImageLightbox";
import { HeadingAnchors } from "../../components/HeadingAnchors";
import { LicenseCard } from "../../components/LicenseCard";
// Why: KaTeX 数学公式需要其样式表；只在会渲染正文的文章页引入，不拖累其它路由。
import "katex/dist/katex.min.css";

type PageProps = { params: Promise<{ slug: string }> };

// Why: 静态导出必须在构建期知道所有文章路径，否则 [slug] 动态段无法生成 HTML。
export function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

// Why: 每篇文章需要独立的标题/描述/OG/canonical，才能被搜索与社交正确收录。
export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) {
    return {};
  }

  const url = `/posts/${post.slug}`;
  return {
    title: post.title,
    description: post.description,
    alternates: { canonical: url },
    keywords: post.tags,
    openGraph: {
      type: "article",
      url,
      title: post.title,
      description: post.description,
      publishedTime: post.date,
      modifiedTime: post.updated ?? post.date,
      tags: post.tags,
      images: post.cover ? [{ url: post.cover }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
      images: post.cover ? [post.cover] : undefined,
    },
  };
}

export default async function PostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  // How: slug 不存在时返回 404 页，避免渲染空文章。
  if (!post) {
    notFound();
  }

  // Why: BlogPosting 结构化数据描述文章实体，作者/时间/标题供搜索引擎解析。
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    dateModified: post.updated ?? post.date,
    author: { "@type": "Person", name: siteConfig.author },
    keywords: post.tags.join(", "),
    url: `${siteConfig.url}/posts/${post.slug}`,
    mainEntityOfPage: `${siteConfig.url}/posts/${post.slug}`,
  };

  // How: 连同上/下篇文章的轻导航，用 getAdjacentPosts 按日期序获取。
  const adjacentPosts = getAdjacentPosts(post.slug);

  return (
    <article className="system-page system-document mx-auto w-full max-w-3xl px-4">
      <JsonLd data={articleSchema} />

      {/* 头部：一行元信息 + 大标题(编辑流，无面板无侧栏) */}
      <header className="mt-6 border-l-4 border-poster-ice/70
        bg-[var(--poster-content-wash)] py-4 pl-5 md:mt-10 md:py-6 md:pl-8">
        <div
          className="text-[10px] uppercase tracking-widest
            text-poster-text-muted"
        >
          {"// DOC"} · [{formatDate(post.date)}] · {post.readingMinutes} MIN
        </div>
        <h1
          className="mt-4 text-4xl font-extrabold uppercase leading-tight
            tracking-tight text-poster-title md:text-5xl"
        >
          {post.title}
        </h1>
        {post.description && (
          <p className="mt-4 text-sm text-poster-text-bright">
            {post.description}
          </p>
        )}
        {post.tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-x-3 gap-y-1">
            {post.tags.map((tag) => (
              <Link
                key={tag}
                href={`/tags/${encodeURIComponent(tagToSlug(tag))}`}
                className="text-[10px] font-bold uppercase text-poster-ice
                  transition-colors hover:text-poster-title"
              >
                #{tag}
              </Link>
            ))}
          </div>
        )}
      </header>

      {/* 正文使用不透明阅读面板隔离动态背景，长文阅读不受环境层干扰。 */}
      <div className="relative mt-10 border border-poster-line bg-poster-bg
        px-5 py-8 shadow-[0_24px_80px_rgba(0,0,0,0.28)]
        before:absolute before:inset-x-0 before:top-0 before:h-px
        before:bg-poster-ice/40 sm:px-8 md:px-10 md:py-10">
        {/* How: 正文由 markdown 在构建期渲染为可信 HTML，注入后由
            .post-content 统一套用文档排版。ImageLightbox 用事件委派捕获
            所有 <img> 点击并弹出灯箱。 */}
        <ImageLightbox>
          <div
            className="post-content"
            dangerouslySetInnerHTML={{ __html: post.contentHtml }}
          />
        </ImageLightbox>
        <HeadingAnchors />

        {/* Why: 文章结尾版权行，内容全局配置(config.yml)；
            更新时间取 updated，缺失则回退发布日期。 */}
        {postLicense.enable && (
          <LicenseCard
            license={postLicense}
            author={siteConfig.author}
            updated={post.updated ?? post.date}
          />
        )}
      </div>

      {/* 上/下篇导航——按日期序，纯文本链接 */}
      {(adjacentPosts.prev || adjacentPosts.next) && (
        <nav
          className="mt-12 flex items-center justify-between border-t
            border-poster-line pt-6 text-[11px] font-extrabold uppercase
            tracking-widest"
        >
          {adjacentPosts.prev ? (
            <Link
              href={`/posts/${adjacentPosts.prev.slug}`}
              className="group max-w-[45%] text-poster-ice
                transition-colors hover:text-poster-title"
            >
              <span className="text-poster-text-muted">◄ PREV</span>
              <span className="mt-1 block truncate">
                {adjacentPosts.prev.title}
              </span>
            </Link>
          ) : (
            <span />
          )}

          {adjacentPosts.next && (
            <Link
              href={`/posts/${adjacentPosts.next.slug}`}
              className="group max-w-[45%] text-right text-poster-ice
                transition-colors hover:text-poster-title"
            >
              <span className="text-poster-text-muted">NEXT ►</span>
              <span className="mt-1 block truncate">
                {adjacentPosts.next.title}
              </span>
            </Link>
          )}
        </nav>
      )}

      {/* Why: 仅在 config.yml 配好 Gitalk(启用且必填项齐全)时渲染评论区。 */}
      {gitalkConfig.enable &&
        gitalkConfig.clientID &&
        gitalkConfig.repo &&
        gitalkConfig.owner && (
          <section className="mt-12 border-t border-poster-line pt-8">
            <h2
              className="text-xs font-extrabold uppercase tracking-widest
                text-poster-ice"
            >
              {"// COMMENTS"}
            </h2>
            <div className="mt-4">
              <Comments
                options={{
                  clientID: gitalkConfig.clientID,
                  clientSecret: gitalkConfig.clientSecret,
                  repo: gitalkConfig.repo,
                  owner: gitalkConfig.owner,
                  admin: gitalkConfig.admin,
                }}
                id={post.slug}
                title={post.title}
                proxy={gitalkConfig.proxy}
              />
            </div>
          </section>
        )}
    </article>
  );
}
