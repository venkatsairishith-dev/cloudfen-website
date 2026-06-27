import { chromium } from "playwright";
const b = await chromium.launch({ channel: "chrome", headless: true });
async function shot(page, w, name, sel) {
  const ctx = await b.newContext({ viewport: { width: w, height: 1000 }, deviceScaleFactor: 1.5 });
  const p = await ctx.newPage();
  await p.goto(`http://127.0.0.1:8080/${page}`, { waitUntil: "load" });
  await p.evaluate(() => document.fonts && document.fonts.ready).catch(()=>{});
  await p.waitForTimeout(800);
  // force-reveal scroll animations so cards are visible in the still
  await p.evaluate(() => document.querySelectorAll(".rv,.tx").forEach(e => e.classList.add("in")));
  await p.waitForTimeout(400);
  if (sel) { const el = await p.$(sel); if (el) { await el.screenshot({ path: `e:/claude/cloudfen/audit/screenshots/cards/${name}.png` }); await ctx.close(); return; } }
  await p.screenshot({ path: `e:/claude/cloudfen/audit/screenshots/cards/${name}.png` });
  await ctx.close();
}
// About: principle .card row, process .step, capability .capcol
await shot("about.html", 1280, "v-about-cards", "section.sec.paper2");
await shot("about.html", 1280, "v-about-steps", "section.sec:nth-of-type(3)");
// Index: choice cards + service cards + industry plates
await shot("index.html", 1280, "v-index-choices", ".choicebar");
await shot("index.html", 1280, "v-index-inds", "#industries");
// IT service page: "what you can expect" .card grid
await shot("it.html", 1280, "v-it-cards", null);
// Job: empty state card (API 404 -> empty state) + skeleton
await shot("job.html", 1280, "v-job", "section.sec");
console.log("done");
await b.close();
