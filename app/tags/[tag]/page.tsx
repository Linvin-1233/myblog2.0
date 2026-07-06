import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllTags, getPostsByTag } from "@/lib/posts";
import { siteConfig } from "@/lib/siteConfig";
import { SectionLabel } from "../../components/SectionLabel";
import { PostList } from "../../components/PostList";

type PageProps = { params: Promise<{ tag: string }> };

// Why: 静态导出需预生成每个标签页；标签可能含中文/空格，用 encodeURIComponent
// 保证 URL 段安全且与文章内链接一致。
export function generateStaticParams() {
  return getAllTags().map(({ tag }) => ({ tag: encodeURIComponent(tag) }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { tag } = await params;
  const decoded = decodeURIComponent(tag);
  return {
    title: `标签: ${decoded}`,
    description: `与「${decoded}」相关的全部文章。`,
    alternates: { canonical: `/tags/${tag}` },
  };
}

export default async function TagPage({ params }: PageProps) {
  const { tag } = await params;
  const decoded = decodeURIComponent(tag);
  const posts = getPostsByTag(decoded);

  // How: 无任何文章命中该标签(如手改 URL)时返回 404。
  if (posts.length === 0) {
    notFound();
  }

  return (
    <section className="relative pt-8">
      <SectionLabel>[TAG // {decoded.toUpperCase()}]</SectionLabel>
      <div
        className="mb-8 flex items-end justify-between border-b border-poster-line
          pb-4"
      >
        <div>
          <span className="block text-[10px] tracking-widest text-poster-text-muted">
            {"// FILTERED_BY_TAG"}
          </span>
          <h1 className="text-xl font-extrabold uppercase text-poster-title">
            #{decoded}
          </h1>
        </div>
        <span className="text-xs font-bold text-poster-ice">
          MATCH: {posts.length.toString().padStart(2, "0")}
        </span>
      </div>

      <PostList posts={posts} perPage={siteConfig.postsPerPage} />
    </section>
  );
}
