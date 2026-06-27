// Inline minimal critical CSS so the preloader paints on first HTML parse (improves FCP)
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const SITE = "e:/claude/cloudfen/site";
const CRIT = `<style>body{margin:0;background:#f7f9fb;font-family:'Plus Jakarta Sans','Jakarta Fallback',system-ui,sans-serif}.cf-preload{position:fixed;inset:0;z-index:9999;display:grid;place-items:center;background:#f7f9fb}.cf-preload-in{display:flex;flex-direction:column;align-items:center;gap:24px}.cf-preload-logo{height:42px;width:auto}.cf-preload-track{position:relative;width:184px;height:3px;border-radius:3px;background:#e4e9ee;overflow:hidden}.cf-preload-txt{font:600 11px/1 'Plus Jakarta Sans','Jakarta Fallback',system-ui,sans-serif;letter-spacing:.26em;text-transform:uppercase;color:#5d6f80}</style>`;
const ANCHOR = `<link href="css/site.css" rel="stylesheet">`;

let n = 0;
for (const f of readdirSync(SITE).filter((x) => x.endsWith(".html"))) {
  const p = join(SITE, f);
  let html = readFileSync(p, "utf8");
  if (html.includes("cf-preload{position:fixed")) continue; // already inlined
  if (!html.includes(ANCHOR)) continue;
  html = html.replace(ANCHOR, CRIT + ANCHOR);
  writeFileSync(p, html);
  n++;
}
console.log(`inlined critical CSS into ${n} files`);
