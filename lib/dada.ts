// Why: 达达主义的"偶得"(chance operation)要可复现——用内容本身做种子，
// 构建期预渲染与客户端 hydration 得到同一结果，绝不使用 Math.random。
// 所有函数保持纯函数：同输入必同输出。

// How: FNV-1a 32 位散列，把任意字符串变成稳定的整数种子。
export function seedFrom(value: string): number {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return Math.abs(hash);
}

// How: 从种子取 [min, max] 闭区间内的整数。
export function chanceInt(seed: number, min: number, max: number): number {
  return min + (seed % (max - min + 1));
}

// How: 稳定的"偶得编号"，用于抬头/侧栏的等宽微文案。
export function chanceCode(value: string): string {
  return `0x${seedFrom(value)
    .toString(16)
    .toUpperCase()
    .padStart(8, "0")
    .slice(0, 8)}`;
}

// How: 稳定的微倾角(±amplitude 度，一位小数)，用于印章或碎片错位。
export function chanceTilt(value: string, amplitude = 1.6): string {
  const tenths = chanceInt(seedFrom(value), -amplitude * 10, amplitude * 10);
  return `${(tenths / 10).toFixed(1)}deg`;
}
