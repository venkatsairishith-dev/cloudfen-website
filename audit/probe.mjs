import { chromium } from "playwright";
const b = await chromium.launch({ channel: "chrome", headless: true });
const p = await b.newPage();
await p.setViewportSize({ width: 1280, height: 900 });
await p.goto("http://127.0.0.1:8080/index.html", { waitUntil: "load" });
await p.waitForTimeout(1000);
const r = await p.evaluate(() => {
  const dd = document.querySelector(".nav .dd");
  const cs = getComputedStyle(dd);
  return { visibility: cs.visibility, opacity: cs.opacity, ddRect: dd.getBoundingClientRect().height };
});
console.log("dropdown at rest:", JSON.stringify(r));
await b.close();
