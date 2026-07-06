// Why: 列表、详情、归档多处都要展示日期与序号，格式集中一处，避免
// 各页面各写一套导致风格不一致。

// How: 用固定的 en-CA 语言环境产出 YYYY-MM-DD，避免依赖构建机时区/语言，
// 保证服务端预渲染与客户端 hydration 结果一致(否则 React 会告警)。
export function formatDate(isoDate: string): string {
  const parsed = new Date(isoDate);
  if (Number.isNaN(parsed.getTime())) {
    return isoDate;
  }
  return parsed.toLocaleDateString("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: "UTC",
  });
}

// Why: 海报风大量使用 “01 / 02” 这类补零编号，抽成函数复用。
export function padIndex(value: number): string {
  return value.toString().padStart(2, "0");
}
