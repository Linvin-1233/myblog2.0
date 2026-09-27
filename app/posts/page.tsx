import type { Metadata } from "next";
import { getAllPostMeta } from "@/lib/posts";
import { siteConfig } from "@/lib/siteConfig";
import { pageMetadata } from "@/lib/seo";
import { formatDate, padIndex } from "@/lib/format";
import { PostList } from "../components/PostList";
import { PageHeader } from "../components/PageHeader";

export const metadata: Metadata = pageMetadata({
  title: "全部文章",
  description: `${siteConfig.name} 的全部文章归档与分页浏览。`,
  path: "/posts",
});

// Why: 文章总列表——文件抬头 + 记录表 + 等宽分页条。
export default function PostsPage() {
  const posts = getAllPostMeta();
  const latest = posts[0]?.date;

  return (
    <div className="shell pb-20">
      <PageHeader
        index="01"
        kicker="ARCHIVE // ALL RECORDS"
        title="全部文章"
        meta={[
          { label: "RECORDS", value: padIndex(posts.length) },
          { label: "PER PAGE", value: padIndex(siteConfig.postsPerPage) },
          { label: "LATEST", value: latest ? formatDate(latest) : "—" },
          { label: "OWNER", value: siteConfig.author || siteConfig.name },
        ]}
      />

      <div className="mt-10">
        <PostList posts={posts} perPage={siteConfig.postsPerPage} />
      </div>
    </div>
  );
}
