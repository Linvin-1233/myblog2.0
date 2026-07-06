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

for (const file of files) {
  const relative = path.relative(imagesRoot, file);
  const outDir = path.join(outputDir, path.dirname(relative));
  fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, path.basename(relative));
  const ext = path.extname(relative).toLowerCase();

  // Why: 保持原格式/扩展名不变，markdown 里 images/foo.png 直接映射
  // 到 /post-images/foo.png，无需改引用；动画 GIF 等格式也不会丢失。
  const pipeline = sharp(file);
  if (ext === ".png") {
    pipeline.png({ compressionLevel: 9, palette: true });
  } else if (ext === ".jpg" || ext === ".jpeg") {
    pipeline.jpeg({ quality: 80, mozjpeg: true });
  } else if (ext === ".webp") {
    pipeline.webp({ quality: 80 });
  } else if (ext === ".avif") {
    pipeline.avif({ quality: 70 });
  } else {
    // gif 等：仅复制(resharp 会保留动画帧)
    fs.copyFileSync(file, outPath);
    count++;
    console.log(`  ${relative} (copied)`);
    continue;
  }

  await pipeline.toFile(outPath);
  count++;
  console.log(`  ${relative} → optimized`);
}

console.log(`Optimized ${count} image(s).`);
