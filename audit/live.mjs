import { chromium } from "playwright";
const U = "https://venkatsairishith-dev.github.io/cloudfen-website/";
const b = await chromium.launch({ channel: "chrome", headless: true });
for (const [w, h, lbl] of [[1440,900,"desktop"],[390,844,"mobile"]]) {
  const ctx = await b.newContext({ viewport:{width:w,height:h}, isMobile:w<768 });
  const p = await ctx.newPage();
  const errs = [];
  p.on("console", m => { if (m.type()==="error") errs.push(m.text()); });
  p.on("requestfailed", r => { if(!r.url().startsWith("data:")) errs.push("REQFAIL "+r.url().split("/").pop()); });
  await p.goto(U, { waitUntil:"load", timeout:30000 });
  await p.waitForTimeout(1500);
  const d = await p.evaluate(() => ({ overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth, title: document.title, brokenImgs: [...document.images].filter(i=>i.complete&&i.naturalWidth===0).length }));
  console.log(`${lbl}: overflow=${d.overflow}px brokenImgs=${d.brokenImgs} console/reqErrors=${errs.length} ${errs.slice(0,3).join("; ")}`);
  await ctx.close();
}
await b.close();
