import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllTags, getPostsByTag } from "@/lib/posts";
import { siteConfig } from "@/lib/siteConfig";
import { padIndex } from "@/lib/format";
import { PostList } from "../../components/PostList";
import { PageHeader } from "../../components/PageHeader";

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
    <div className="shell pb-20">
      <PageHeader
        index="02.1"
        kicker={`TAG_FILTER // ${slug.toUpperCase()}`}
        title={`#${name}`}
        meta={[
          { label: "RECORDS", value: padIndex(posts.length) },
          {
            label: "PER PAGE",
            value: padIndex(siteConfig.postsPerPage),
          },
        ]}
      />

      <div className="mt-10">
        <PostList posts={posts} perPage={siteConfig.postsPerPage} />
      </div>
    </div>
  );
}
