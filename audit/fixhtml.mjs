// Make Google Fonts non-render-blocking + preload the homepage LCP image
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const SITE = "e:/claude/cloudfen/site";
const HREF = "https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500;1,600&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap";
const OLD = `<link href="${HREF}" rel="stylesheet">`;
const NEW =
  `<link rel="preload" as="style" href="${HREF}">` +
  `<link rel="stylesheet" href="${HREF}" media="print" onload="this.media='all'">` +
  `<noscript><link rel="stylesheet" href="${HREF}"></noscript>`;

const HERO_PRELOAD = `<link rel="preload" as="image" href="images/carousel/2.jpg" fetchpriority="high">`;

let changed = 0, heroDone = false;
for (const f of readdirSync(SITE).filter((x) => x.endsWith(".html"))) {
  const p = join(SITE, f);
  let html = readFileSync(p, "utf8");
  let before = html;
  if (html.includes(OLD)) html = html.replace(OLD, NEW);
  // preload hero only on the homepage (its CSS background is the LCP candidate)
  if (f === "index.html" && !html.includes(HERO_PRELOAD)) {
    html = html.replace(`<link href="css/site.css" rel="stylesheet">`, HERO_PRELOAD + `<link href="css/site.css" rel="stylesheet">`);
    heroDone = true;
  }
  if (html !== before) { writeFileSync(p, html); changed++; }
}
console.log(`fonts made non-blocking on ${changed} files; hero preload added: ${heroDone}`);
