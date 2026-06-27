import { chromium } from "playwright";
const b = await chromium.launch({ channel: "chrome", headless: true });
const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, isMobile: true });
const p = await ctx.newPage();
await p.goto("http://127.0.0.1:8080/index.html", { waitUntil: "load" });
await p.waitForTimeout(2500);
const lcp = await p.evaluate(() => new Promise((res) => {
  let last = null;
  new PerformanceObserver((l) => { for (const e of l.getEntries()) last = e; }).observe({ type: "largest-contentful-paint", buffered: true });
  setTimeout(() => {
    if (!last) return res("none");
    const el = last.element;
    res({ time: Math.round(last.renderTime || last.loadTime), tag: el?.tagName, cls: el?.className?.toString?.().slice(0,40), size: Math.round(last.size), txt: (el?.textContent || "").trim().slice(0, 40) });
  }, 300);
}));
console.log(JSON.stringify(lcp));
await b.close();
