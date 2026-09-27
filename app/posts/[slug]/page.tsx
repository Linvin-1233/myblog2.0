import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getAllPostMeta,
  getAllSlugs,
  getAdjacentPosts,
  getPostBySlug,
  tagToSlug,
} from "@/lib/posts";
import { siteConfig, gitalkConfig, postLicense } from "@/lib/siteConfig";
import { chanceCode, chanceTilt } from "@/lib/dada";
import { formatDate, padIndex } from "@/lib/format";
import { JsonLd } from "../../components/JsonLd";
import { Comments } from "../../components/Comments";
import { ImageLightbox } from "../../components/ImageLightbox";
import { HeadingAnchors } from "../../components/HeadingAnchors";
import { LicenseCard } from "../../components/LicenseCard";
import { ExtrudeType } from "../../components/ExtrudeType";
import "katex/dist/katex.min.css";

type PageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};

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

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-t-2 border-poster-line pt-2">
      <dt className="text-poster-text-muted">{label}</dt>
      <dd className="truncate text-right text-poster-text-bright">{value}</dd>
    </div>
  );
}

export default async function PostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

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

  const adjacentPosts = getAdjacentPosts(post.slug);
  const allPosts = getAllPostMeta();
  const position = allPosts.findIndex((item) => item.slug === post.slug) + 1;
  const total = allPosts.length;

  return (
    <article className="shell pb-32">
      <JsonLd data={articleSchema} />

      <header className="relative grid min-h-[32rem] grid-cols-12 gap-5 border-b-4 border-poster-line py-10 md:gap-8 md:py-16">
        <div className="col-span-1 hidden border-r-2 border-poster-line md:block">
          <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-poster-ice [writing-mode:vertical-rl]">
            DOC / {padIndex(position)} / {chanceCode(post.slug)}
          </span>
        </div>

        <div className="col-span-12 flex flex-col justify-end md:col-span-8 md:col-start-2">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 font-mono text-[10px] uppercase tracking-[0.24em] text-poster-text-muted">
            <span className="border-2 border-poster-ice bg-poster-ice px-1.5 py-0.5 text-poster-bg">DOC</span>
            <time dateTime={post.date}>{formatDate(post.date)}</time>
            <span className="h-0.5 w-8 bg-poster-title" />
            <span>{padIndex(post.readingMinutes)} MIN READ</span>
          </div>

          <h1 className="mt-10 max-w-[92%]">
            <ExtrudeType text={post.title} className="text-[clamp(4rem,11vw,10rem)] uppercase" />
          </h1>

          {post.description && (
            <p className="mt-10 max-w-xl border-l-4 border-poster-ice pl-4 font-editorial text-xl italic leading-snug text-poster-text-bright">
              {post.description}
            </p>
          )}

          {post.tags.length > 0 && (
            <div className="mt-8 flex max-w-2xl flex-wrap gap-2">
              {post.tags.map((tag) => (
                <Link
                  key={tag}
                  href={`/tags/${encodeURIComponent(tagToSlug(tag))}`}
                  className="border-2 border-poster-line px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.18em] text-poster-text-muted hover:border-poster-title hover:text-poster-title"
                >
                  #{tag}
                </Link>
              ))}
            </div>
          )}
        </div>

        <aside className="absolute top-10 right-0 hidden w-40 md:block">
          {/* 与抬头右上的元数据同一处理：实色场。抬头两角各一块，
              文章正文以下的档案栏再来一块，页面就形成固定的色块节奏。 */}
          <div className="block-panel mt-12 p-3 font-mono text-[9px] uppercase tracking-[0.18em]">
            <div>INDEX {padIndex(position)} / {padIndex(total)}</div>
            <div className="mt-2">CHANCE {chanceCode(post.slug)}</div>
            <div className="mt-2">MODE READ_ONLY</div>
          </div>
        </aside>
      </header>

      <div className="mt-24 grid grid-cols-12 gap-5 md:gap-8">
        <aside className="col-span-12 md:col-span-2 md:col-start-2">
          <div className="border-l-4 border-poster-line pl-4 md:sticky md:top-24">
            <div className="font-mono text-[9px] uppercase tracking-[0.3em] text-poster-ice">
              {"// DOSSIER"}
            </div>
            <dl className="mt-5 space-y-3 font-mono text-[10px] uppercase tracking-[0.16em]">
              <MetaRow label="FILE" value={post.slug} />
              <MetaRow label="DATE" value={formatDate(post.date)} />
              {post.updated && <MetaRow label="UPDATED" value={formatDate(post.updated)} />}
              <MetaRow label="READ" value={`${padIndex(post.readingMinutes)} MIN`} />
              <MetaRow label="INDEX" value={`${padIndex(position)} / ${padIndex(total)}`} />
            </dl>

            {(adjacentPosts.prev || adjacentPosts.next) && (
              <nav className="mt-10 space-y-4 border-t-2 border-poster-line pt-4">
                {adjacentPosts.prev && (
                  <Link href={`/posts/${adjacentPosts.prev.slug}`} className="group block border-b-2 border-poster-line pb-4">
                    <span className="font-mono text-[9px] uppercase tracking-[0.24em] text-poster-text-muted">◄ NEWER</span>
                    <span className="type-condensed mt-2 block text-xl uppercase text-poster-title group-hover:text-poster-ice">{adjacentPosts.prev.title}</span>
                  </Link>
                )}
                {adjacentPosts.next && (
                  <Link href={`/posts/${adjacentPosts.next.slug}`} className="group block border-b-2 border-poster-line pb-4">
                    <span className="font-mono text-[9px] uppercase tracking-[0.24em] text-poster-text-muted">OLDER ►</span>
                    <span className="type-condensed mt-2 block text-xl uppercase text-poster-title group-hover:text-poster-ice">{adjacentPosts.next.title}</span>
                  </Link>
                )}
              </nav>
            )}
          </div>
        </aside>

        <div className="col-span-12 min-w-0 md:col-span-8 md:col-start-4">
          <div className="border-t-4 border-poster-line pt-8">
            <ImageLightbox>
              <div className="post-content" dangerouslySetInnerHTML={{ __html: post.contentHtml }} />
            </ImageLightbox>
            <HeadingAnchors />
            {postLicense.enable && (
              <LicenseCard license={postLicense} author={siteConfig.author} updated={post.updated ?? post.date} />
            )}
          </div>

          {gitalkConfig.enable && gitalkConfig.clientID && gitalkConfig.repo && gitalkConfig.owner && (
            <section className="mt-20 border-t-4 border-poster-line pt-6">
              <div className="font-mono text-[9px] uppercase tracking-[0.3em] text-poster-ice">{"// COMMENTS"}</div>
              <div className="mt-5">
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
        </div>
      </div>
    </article>
  );
}
