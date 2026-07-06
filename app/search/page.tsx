import type { Metadata } from "next";
import { getSearchDocuments } from "@/lib/posts";
import { SectionLabel } from "../components/SectionLabel";
import { SearchClient } from "../components/SearchClient";

export const metadata: Metadata = {
  title: "搜索",
  description: "在标题、简介、标签与正文中模糊搜索全部文章。",
  alternates: { canonical: "/search" },
};

// Why: 构建期把搜索索引直接烘焙进本页(仅访问 /search 时加载)，客户端组件
// 拿到后即可离线模糊搜索，无需任何后端接口。
export default function SearchPage() {
  const documents = getSearchDocuments();

  return (
    <section className="relative pt-8">
      <SectionLabel>[SEC // QUERY_ENGINE]</SectionLabel>
      <div className="mb-8 border-b border-poster-line pb-4">
        <span className="block text-[10px] tracking-widest text-poster-text-muted">
          {"// FULL_TEXT_LOOKUP"}
        </span>
        <h1 className="text-xl font-extrabold uppercase text-poster-title">
          搜索
        </h1>
      </div>

      <SearchClient documents={documents} />
    </section>
  );
}
