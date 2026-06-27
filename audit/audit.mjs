// CloudFen multi-viewport audit: screenshots + console errors + overflow + a11y (axe-core)
import { chromium } from "playwright";
import { readFileSync, readdirSync, mkdirSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const SITE = join(ROOT, "site");
const BASE = "http://127.0.0.1:8080";
const PHASE = process.argv[2] || "before";
const ONLY = process.argv[3]; // optional single page e.g. index.html

const AXE = readFileSync(join(__dirname, "node_modules", "axe-core", "axe.min.js"), "utf8");

const pages = readdirSync(SITE).filter((f) => f.endsWith(".html")).sort();
const targets = ONLY ? pages.filter((p) => p === ONLY) : pages;

const VIEWPORTS = [
  { name: "desktop", width: 1440, height: 900, isMobile: false },
  { name: "tablet", width: 768, height: 1024, isMobile: true },
  { name: "mobile", width: 390, height: 844, isMobile: true },
];

const shotDir = join(__dirname, "screenshots", PHASE);
mkdirSync(shotDir, { recursive: true });

const browser = await chromium.launch({ channel: "chrome", headless: true });
const report = [];

for (const page of targets) {
  for (const vp of VIEWPORTS) {
    const ctx = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      deviceScaleFactor: 1,
      isMobile: vp.isMobile,
      hasTouch: vp.isMobile,
      reducedMotion: "no-preference",
    });
    const pg = await ctx.newPage();
    const consoleErrors = [];
    const pageErrors = [];
    const failedReq = [];
    pg.on("console", (m) => { if (m.type() === "error") consoleErrors.push(m.text()); });
    pg.on("pageerror", (e) => pageErrors.push(String(e.message || e)));
    pg.on("requestfailed", (r) => {
      const u = r.url();
      if (!u.startsWith("data:")) failedReq.push(`${u} (${r.failure()?.errorText || "failed"})`);
    });

    const url = `${BASE}/${page}`;
    let loadMs = null;
    try {
      const t0 = Date.now();
      await pg.goto(url, { waitUntil: "load", timeout: 30000 });
      await pg.evaluate(() => document.fonts && document.fonts.ready).catch(() => {});
      await pg.waitForTimeout(1500); // let preloader finish + animations settle
      loadMs = Date.now() - t0;
    } catch (e) {
      report.push({ page, vp: vp.name, error: `goto failed: ${e.message}` });
      await ctx.close();
      continue;
    }

    // ---- overflow + offenders + broken images ----
    const diag = await pg.evaluate(() => {
      const de = document.documentElement;
      const overflowX = de.scrollWidth - de.clientWidth;
      const vw = window.innerWidth;
      const offenders = [];
      const all = document.body.querySelectorAll("*");
      for (const el of all) {
        const r = el.getBoundingClientRect();
        if (r.width === 0 || r.height === 0) continue;
        if (r.right > vw + 2 || r.left < -2) {
          const cls = (el.className && el.className.toString) ? el.className.toString().slice(0, 40) : "";
          offenders.push({
            sel: el.tagName.toLowerCase() + (el.id ? "#" + el.id : "") + (cls ? "." + cls.trim().replace(/\s+/g, ".") : ""),
            right: Math.round(r.right), left: Math.round(r.left), w: Math.round(r.width),
          });
        }
      }
      // dedupe by selector, keep widest
      const bySel = {};
      for (const o of offenders) { if (!bySel[o.sel] || o.w > bySel[o.sel].w) bySel[o.sel] = o; }
      const top = Object.values(bySel).sort((a, b) => b.right - a.right).slice(0, 8);

      const brokenImgs = [...document.images]
        .filter((i) => i.complete && i.naturalWidth === 0)
        .map((i) => i.getAttribute("src"));

      // tap target check (mobile): interactive elements smaller than 24px
      const small = [];
      if (window.innerWidth < 700) {
        for (const el of document.querySelectorAll("a,button,input,select,[role=button]")) {
          // WCAG 2.5.8 exempts links rendered inline within a sentence/paragraph
          if (el.tagName === "A" && el.closest("p")) continue;
          const r = el.getBoundingClientRect();
          if (r.width > 0 && r.height > 0 && (r.height < 24 || r.width < 24)) {
            small.push((el.tagName.toLowerCase()) + " " + (el.textContent || "").trim().slice(0, 20));
          }
        }
      }
      return { overflowX, vw, top, brokenImgs, small: small.slice(0, 12) };
    });

    // ---- axe-core accessibility ----
    let axe = { violations: [], err: null };
    try {
      await pg.addScriptTag({ content: AXE });
      axe.violations = await pg.evaluate(async () => {
        const res = await window.axe.run(document, {
          runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "best-practice"] },
        });
        return res.violations.map((v) => ({
          id: v.id, impact: v.impact, help: v.help, nodes: v.nodes.length,
          targets: v.nodes.slice(0, 4).map((n) => (n.target || []).join(" ")),
        }));
      });
    } catch (e) { axe.err = e.message; }

    await pg.screenshot({ path: join(shotDir, `${page.replace(".html", "")}-${vp.name}.png`), fullPage: true }).catch(() => {});

    report.push({
      page, vp: vp.name, loadMs,
      overflowX: diag.overflowX,
      offenders: diag.overflowX > 1 ? diag.top : [],
      brokenImgs: diag.brokenImgs,
      smallTargets: diag.small,
      consoleErrors, pageErrors, failedReq,
      axe: axe.violations, axeErr: axe.err,
    });
    await ctx.close();
  }
  process.stdout.write(".");
}
await browser.close();

writeFileSync(join(__dirname, `report-${PHASE}.json`), JSON.stringify(report, null, 2));

// ---- summary ----
console.log("\n\n==== AUDIT SUMMARY (" + PHASE + ") ====");
const agg = {};
for (const r of report) {
  const k = r.page;
  agg[k] = agg[k] || { overflow: [], axe: {}, console: 0, broken: 0, small: 0, errs: [] };
  if (r.overflowX > 1) agg[k].overflow.push(`${r.vp}:${r.overflowX}px`);
  for (const v of (r.axe || [])) agg[k].axe[v.id] = (agg[k].axe[v.id] || 0) + 1;
  agg[k].console += (r.consoleErrors || []).length + (r.pageErrors || []).length;
  agg[k].broken += (r.brokenImgs || []).length;
  agg[k].small += (r.smallTargets || []).length;
}
let totalOverflow = 0, totalAxe = 0, totalConsole = 0, totalBroken = 0;
for (const [page, a] of Object.entries(agg)) {
  const axeIds = Object.keys(a.axe);
  totalOverflow += a.overflow.length;
  totalAxe += axeIds.reduce((s, id) => s + a.axe[id], 0);
  totalConsole += a.console;
  totalBroken += a.broken;
  const parts = [];
  if (a.overflow.length) parts.push("OVERFLOW[" + a.overflow.join(",") + "]");
  if (axeIds.length) parts.push("A11Y{" + axeIds.map((id) => id + ":" + a.axe[id]).join(", ") + "}");
  if (a.console) parts.push("CONSOLE:" + a.console);
  if (a.broken) parts.push("BROKEN_IMG:" + a.broken);
  if (a.small) parts.push("SMALL_TAP:" + a.small);
  console.log((parts.length ? "❌ " : "✅ ") + page.padEnd(20) + " " + (parts.join("  ") || "clean"));
}
console.log("\nTOTALS  overflow-instances:" + totalOverflow + "  a11y-violations:" + totalAxe + "  console-errors:" + totalConsole + "  broken-imgs:" + totalBroken);

// unique axe rules across the site
const rules = {};
for (const r of report) for (const v of (r.axe || [])) rules[v.id] = { impact: v.impact, help: v.help, count: (rules[v.id]?.count || 0) + v.nodes };
console.log("\nUNIQUE A11Y RULES:");
for (const [id, v] of Object.entries(rules).sort((a, b) => b[1].count - a[1].count)) {
  console.log(`  [${v.impact}] ${id} (${v.count} nodes) — ${v.help}`);
}
