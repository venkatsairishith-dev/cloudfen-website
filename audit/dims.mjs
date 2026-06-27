// Add intrinsic width/height to every <img src="images/..."> to reserve space (kills CLS + unsized-images)
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { imageSize } from "image-size";

const SITE = "e:/claude/cloudfen/site";
const cache = {};
function dim(rel) {
  if (cache[rel]) return cache[rel];
  try { const d = imageSize(readFileSync(join(SITE, rel))); return (cache[rel] = { w: d.width, h: d.height }); }
  catch { return (cache[rel] = null); }
}

let imgs = 0, files = 0;
for (const f of readdirSync(SITE).filter((x) => x.endsWith(".html"))) {
  const p = join(SITE, f);
  let html = readFileSync(p, "utf8");
  const out = html.replace(/<img\b([^>]*?)src="(images\/[^"]+)"([^>]*)>/g, (m, pre, src, post) => {
    if (/\bwidth=/.test(m) || /\bheight=/.test(m)) return m; // already sized
    const d = dim(src);
    if (!d) return m;
    imgs++;
    return `<img${pre}src="${src}" width="${d.w}" height="${d.h}"${post}>`;
  });
  if (out !== html) { writeFileSync(p, out); files++; }
}
console.log(`added width/height to ${imgs} images across ${files} files`);
