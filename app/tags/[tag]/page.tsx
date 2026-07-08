import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllTags, getPostsByTag } from "@/lib/posts";
import { siteConfig } from "@/lib/siteConfig";
import { SectionLabel } from "../../components/SectionLabel";
import { PostList } from "../../components/PostList";

type PageProps = { params: Promise<{ tag: string }> };

// Why: 用小写 slug 作路由参数(不 encodeURIComponent——Next 会自行编码，若这里
// 再编码会导致生产环境双重编码、链接对不上而 404)。
export function generateStaticParams() {
  return getAllTags().map(({ slug }) => ({ tag: slug }));
}

// How: params.tag 可能是编码态(视环境而定)，安全解码；已解码字符串再解码是无害的。
function safeDecode(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

// How: URL 里的 tag 参数即 slug；展示时查回首次出现的原始写法(更好看的大小写)。
function displayName(slug: string): string {
  return getAllTags().find((item) => item.slug === slug)?.tag ?? slug;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { tag } = await params;
  const slug = safeDecode(tag);
  const name = displayName(slug);
  return {
    title: `标签: ${name}`,
    description: `与「${name}」相关的全部文章。`,
    alternates: { canonical: `/tags/${encodeURIComponent(slug)}` },
  };
}

export default async function TagPage({ params }: PageProps) {
  const { tag } = await params;
  const slug = safeDecode(tag);
  const posts = getPostsByTag(slug);

  // How: 无任何文章命中该标签(如手改 URL)时返回 404。
  if (posts.length === 0) {
    notFound();
  }

  const name = displayName(slug);

  return (
    <section className="relative pt-8">
      <SectionLabel>[TAG // {name.toUpperCase()}]</SectionLabel>
      <div
        className="mb-8 flex items-end justify-between border-b border-poster-line
          pb-4"
      >
        <div>
          <span className="block text-[10px] tracking-widest text-poster-text-muted">
            {"// FILTERED_BY_TAG"}
          </span>
          <h1 className="text-xl font-extrabold uppercase text-poster-title">
            #{name}
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
