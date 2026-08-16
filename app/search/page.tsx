import type { Metadata } from "next";
import { getSearchDocuments } from "@/lib/posts";
import { SearchClient } from "../components/SearchClient";

export const metadata: Metadata = {
  title: "搜索",
  description: "在标题、简介、标签与正文中模糊搜索全部文章。",
  alternates: { canonical: "/search" },
};

// Why: 构建期把搜索索引直接烘焙进本页(仅访问 /search 时加载)，客户端组件
// 拿到后即可离线模糊搜索，无需任何后端接口。v7 编辑流排版。
export default function SearchPage() {
  const documents = getSearchDocuments();

  return (
    <div className="system-page system-subpage mx-auto w-full max-w-4xl px-4">
      <h1
        className="pt-10 text-3xl font-extrabold uppercase text-poster-title
          md:text-4xl"
      >
        搜索
      </h1>
      <div className="mt-2 text-[10px] uppercase tracking-widest
        text-poster-text-muted">
        {"// QUERY"}
      </div>

      <div className="mt-8">
        <SearchClient documents={documents} />
      </div>
    </div>
  );
}
