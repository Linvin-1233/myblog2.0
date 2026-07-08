import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const root = process.cwd();
const imagesRoot = path.join(root, "posts", "images");
const outputDir = path.join(root, "public", "post-images");

if (!fs.existsSync(imagesRoot)) {
  console.log("No posts/images/ directory — skipping image optimization.");
  process.exit(0);
}

const imageExts = new Set([".png", ".jpg", ".jpeg", ".gif", ".webp", ".avif"]);
let count = 0;

function walk(dir) {
  const result = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) result.push(...walk(full));
    else if (imageExts.has(path.extname(entry.name).toLowerCase()))
      result.push(full);
  }
  return result;
}

const files = walk(imagesRoot);
console.log(`Found ${files.length} image(s) in posts/images/. Optimizing…`);
fs.mkdirSync(outputDir, { recursive: true });

// Why: 记录每张输出图的宽高，供 markdown 渲染时注入 <img width/height>，
// 预留版面、消除 CLS 与强制重排。键统一用正斜杠(跨平台一致)。
const manifest = {};

for (const file of files) {
  const relative = path.relative(imagesRoot, file);
  const key = relative.split(path.sep).join("/");
  const outDir = path.join(outputDir, path.dirname(relative));
  fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, path.basename(relative));
  const ext = path.extname(relative).toLowerCase();

  // Why: 保持原格式/扩展名不变，markdown 里 images/foo.png 直接映射
  // 到 /post-images/foo.png，无需改引用；动画 GIF 等格式也不会丢失。
  // How: 先限制最大宽度(内容区约 1024px，留 retina 余量取 1600)，大图显著减重；
  // withoutEnlargement 保证小图不被拉伸放大。
  const pipeline = sharp(file).resize({
    width: 1600,
    withoutEnlargement: true,
  });
  if (ext === ".png") {
    pipeline.png({ compressionLevel: 9, palette: true });
  } else if (ext === ".jpg" || ext === ".jpeg") {
    pipeline.jpeg({ quality: 80, mozjpeg: true });
  } else if (ext === ".webp") {
    pipeline.webp({ quality: 80 });
  } else if (ext === ".avif") {
    pipeline.avif({ quality: 70 });
  } else {
    // gif 等：仅复制(保留动画帧)，并单独读取尺寸。
    fs.copyFileSync(file, outPath);
    const meta = await sharp(file).metadata();
    if (meta.width && meta.height) {
      manifest[key] = { w: meta.width, h: meta.height };
    }
    count++;
    console.log(`  ${relative} (copied)`);
    continue;
  }

  const info = await pipeline.toFile(outPath);
  if (info.width && info.height) {
    manifest[key] = { w: info.width, h: info.height };
  }
  count++;
  console.log(`  ${relative} → optimized`);
}

// How: 尺寸清单写入 public/post-images/manifest.json，构建期由 lib/markdown 读取。
fs.writeFileSync(
  path.join(outputDir, "manifest.json"),
  JSON.stringify(manifest),
);

console.log(`Optimized ${count} image(s).`);
