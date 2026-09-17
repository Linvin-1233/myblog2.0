// Why: 主视觉大字——干净的钴蓝展示字，不带任何阴影/挤压/落影。
export function ExtrudeType({
  text,
  className = "",
}: {
  text: string;
  className?: string;
}) {
  return <span className={`extrude-type ${className}`}>{text}</span>;
}
