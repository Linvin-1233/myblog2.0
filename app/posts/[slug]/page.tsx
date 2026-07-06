import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllSlugs, getPostBySlug } from "@/lib/posts";
import { siteConfig, gitalkConfig } from "@/lib/siteConfig";
import { formatDate } from "@/lib/format";
import { SectionLabel } from "../../components/SectionLabel";
import { JsonLd } from "../../components/JsonLd";
import { Comments } from "../../components/Comments";

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

  return (
    <article className="relative pt-8">
      <JsonLd data={articleSchema} />
      <SectionLabel>[DOC // {post.slug.toUpperCase()}]</SectionLabel>

      <header className="mb-8 border-b border-poster-line pb-6">
        <div
          className="mb-3 flex flex-wrap items-center gap-3 text-[10px]
            font-bold uppercase tracking-widest text-poster-text-muted"
        >
          <time dateTime={post.date} className="text-poster-ice">
            {formatDate(post.date)}
          </time>
          <span>{"// "}{post.readingMinutes} MIN_READ</span>
        </div>
        <h1
          className="text-2xl font-extrabold uppercase leading-tight
            tracking-tight text-poster-title md:text-4xl"
        >
          {post.title}
        </h1>
        {post.description && (
          <p className="mt-3 text-sm text-poster-text-bright">
            {post.description}
          </p>
        )}
        {post.tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <Link
                key={tag}
                href={`/tags/${encodeURIComponent(tag)}`}
                className="border border-poster-line bg-poster-panel/40 px-2
                  py-0.5 text-[10px] uppercase text-poster-text-bright
                  transition-colors hover:border-poster-ice hover:text-poster-ice"
              >
                #{tag}
              </Link>
            ))}
          </div>
        )}
      </header>

      {/* How: 正文由 markdown 在构建期渲染为可信 HTML，注入后由 .post-content
          统一套用海报风排版。 */}
      <div
        className="post-content"
        dangerouslySetInnerHTML={{ __html: post.contentHtml }}
      />

      <footer className="mt-12 border-t border-poster-line pt-6">
        <Link
          href="/posts"
          className="text-[11px] font-extrabold uppercase tracking-widest
            text-poster-ice transition-all hover:tracking-[0.2em]"
        >
          [◄ BACK_TO_MANIFEST]
        </Link>
      </footer>

      {/* Why: 仅在 config.yml 配好 Gitalk(启用且必填项齐全)时渲染评论区。 */}
      {gitalkConfig.enable &&
        gitalkConfig.clientID &&
        gitalkConfig.repo &&
        gitalkConfig.owner && (
          <section className="relative mt-12 pt-8">
            <SectionLabel>[SEC // COMMENTS]</SectionLabel>
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
            />
          </section>
        )}
    </article>
  );
}
