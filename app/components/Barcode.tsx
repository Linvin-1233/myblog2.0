import { chanceInt, seedFrom } from "@/lib/dada";

// Why: 条纹码——用内容本身做种子的确定性条宽，不引随机数，SSR 与 hydration
// 结果一致。只取 currentColor，落在哪个色块/哪段文字里就继承那个墨色。
export function Barcode({
  value,
  bars = 26,
  className = "",
}: {
  value: string;
  bars?: number;
  className?: string;
}) {
  const seed = seedFrom(value);

  return (
    <span
      aria-hidden="true"
      className={`inline-flex h-5 items-stretch gap-[2px] ${className}`}
    >
      {Array.from({ length: bars }, (_, index) => {
        const width = chanceInt(seed + index * 131, 1, 3);
        const full = chanceInt(seed + index * 977, 0, 2) > 0;
        return (
          <span
            key={index}
            className="block bg-current"
            style={{ width: `${width}px`, height: full ? "100%" : "62%" }}
          />
        );
      })}
    </span>
  );
}
