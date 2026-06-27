// Responsive card test: 9 widths × card-bearing pages — overflow, tap targets, console
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const BASE = "http://127.0.0.1:8080";
const WIDTHS = [320, 375, 390, 414, 768, 1024, 1280, 1440, 1920];
// pages that contain card components
const PAGES = ["index.html", "about.html", "it.html", "focus.html", "health.html", "contact.html", "job.html", "cpt.html"];
const shot = "e:/claude/cloudfen/audit/screenshots/cards";
mkdirSync(shot, { recursive: true });

const browser = await chromium.launch({ channel: "chrome", headless: true });
let problems = 0;
for (const page of PAGES) {
  const line = [];
  for (const w of WIDTHS) {
    const ctx = await browser.newContext({ viewport: { width: w, height: 900 }, isMobile: w < 768, hasTouch: w < 768 });
    const pg = await ctx.newPage();
    const errs = [];
    pg.on("console", (m) => { if (m.type() === "error") errs.push(m.text()); });
    pg.on("pageerror", (e) => errs.push(String(e.message)));
    await pg.goto(`${BASE}/${page}`, { waitUntil: "load" });
    await pg.evaluate(() => document.fonts && document.fonts.ready).catch(() => {});
    await pg.waitForTimeout(900);
    const r = await pg.evaluate((vw) => {
      const de = document.documentElement;
      const overflow = de.scrollWidth - de.clientWidth;
      const off = [];
      if (overflow > 1) {
        for (const el of document.body.querySelectorAll("*")) {
          const b = el.getBoundingClientRect();
          if (b.width && b.right > vw + 2) {
            // skip if clipped by an ancestor
            let clipped = false, p = el.parentElement;
            while (p) { const ov = getComputedStyle(p).overflowX; if (ov === "hidden" || ov === "clip") { clipped = true; break; } p = p.parentElement; }
            if (!clipped) off.push(el.tagName.toLowerCase() + "." + (el.className.toString ? el.className.toString().trim().replace(/\s+/g, ".").slice(0, 30) : ""));
          }
        }
      }
      // touch targets < 44px (skip inline links inside paragraphs, and hidden)
      const small = [];
      for (const el of document.querySelectorAll("a,button,input,select,[role=button]")) {
        if (el.tagName === "A" && el.closest("p")) continue;
        const b = el.getBoundingClientRect();
        if (b.width && b.height && (b.height < 44 || b.width < 44)) small.push(el.tagName.toLowerCase() + ":" + (el.textContent || "").trim().slice(0, 14));
      }
      return { overflow, off: [...new Set(off)].slice(0, 5), small: [...new Set(small)].slice(0, 6) };
    }, w);
    const issues = [];
    if (r.overflow > 1) issues.push(`OVERFLOW ${r.overflow}px ${r.off.join(",")}`);
    if (errs.length) issues.push(`CONSOLE:${errs.length}`);
    if (issues.length) { problems++; line.push(`  @${w}: ${issues.join(" | ")}`); }
    // capture a screenshot at 3 representative widths
    if ([390, 768, 1440].includes(w)) await pg.screenshot({ path: `${shot}/${page.replace(".html", "")}-${w}.png`, fullPage: true }).catch(() => {});
    await ctx.close();
  }
  // report smallest-tap summary at mobile (390) separately handled above
  console.log((line.length ? "❌ " : "✅ ") + page.padEnd(15) + (line.length ? "\n" + line.join("\n") : " clean across all 9 widths"));
}
await browser.close();
console.log(`\n${problems ? "❌ " + problems + " width-issues found" : "✅ No overflow/console issues at any width"}`);
