import type { Metadata } from "next";
import { getSearchDocuments } from "@/lib/posts";
import { pageMetadata } from "@/lib/seo";
import { SearchClient } from "../components/SearchClient";
import { PageHeader } from "../components/PageHeader";

export const metadata: Metadata = pageMetadata({
  title: "搜索",
  description: "在标题、简介、标签与正文中模糊搜索全部文章。",
  path: "/search",
});

// Why: 构建期把搜索索引直接烘焙进本页(仅访问 /search 时加载)，客户端组件
// 拿到后即可离线模糊搜索，无需任何后端接口。
export default function SearchPage() {
  const documents = getSearchDocuments();

  return (
    <div className="shell pb-20">
      <PageHeader
        index="05"
        kicker="QUERY // FULL-TEXT"
        title="搜索"
        meta={[
          { label: "INDEXED", value: documents.length.toString().padStart(2, "0") },
          { label: "ENGINE", value: "FUSE.JS" },
          { label: "SCOPE", value: "TITLE/TAG/BODY" },
        ]}
      />

      <div className="mt-10">
        <SearchClient documents={documents} />
      </div>
    </div>
  );
}
