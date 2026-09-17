import Image from "next/image";

// Why: 这是实际的剪贴画，不是抽象背景。仓库里的文章图片被当作照片碎片，
// 以固定的错位/旋转/纸片遮挡重新编排；所有位置都是确定的，SSR 不会漂移。
// hero 变体把整体压矮，保证首页首屏在 16:9 下装得下。
export function DadaCollage({
  compact = false,
  hero = false,
}: {
  compact?: boolean;
  hero?: boolean;
}) {
  const variant = hero ? " dada-collage-hero" : compact ? " dada-collage-compact" : "";
  return (
    <div className={`dada-collage${variant}`}>
      <div className="dada-collage-photo dada-photo-a">
        <Image
          src="/post-images/demo.png"
          alt="文章图片剪贴一"
          width={1440}
          height={1080}
          sizes="(min-width: 1024px) 34vw, 72vw"
        />
      </div>
      <div className="dada-collage-photo dada-photo-b">
        <Image
          src="/post-images/LiveNotes/img.png"
          alt="文章图片剪贴二"
          width={1600}
          height={1001}
          sizes="(min-width: 1024px) 22vw, 48vw"
        />
      </div>
      <div className="dada-paper dada-paper-a">NO IMAGE / NO ORDER</div>
      <div className="dada-paper dada-paper-b">CUT HERE</div>
      <div className="dada-rag" aria-hidden="true" />
      <div className="dada-collage-index">PHOTO / PAPER / ERROR / 07</div>
    </div>
  );
}
