// Why: 结构化数据(JSON-LD)帮助搜索引擎理解文章/站点实体，提升富媒体展示
// 机会。做成通用组件，任何页面传入 schema 对象即可注入。
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      // How: JSON.stringify 输出可信的构建期数据，直接注入 script 内容。
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
