import lighthouse from "lighthouse";
import * as chromeLauncher from "chrome-launcher";
import { writeFileSync } from "node:fs";

const BASE = "http://127.0.0.1:8080";
const formFactor = process.argv[2] === "desktop" ? "desktop" : "mobile";
const pages = (process.argv[3]
  ? process.argv[3].split(",")
  : ["index.html", "about.html", "it.html", "focus.html", "health.html", "contact.html", "job.html", "H1B.html"]);

const chrome = await chromeLauncher.launch({
  chromeFlags: ["--headless=new", "--no-sandbox", "--disable-gpu"],
  chromePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
});

const desktopCfg = {
  formFactor: "desktop",
  screenEmulation: { mobile: false, width: 1350, height: 940, deviceScaleFactor: 1, disabled: false },
  throttling: { rttMs: 40, throughputKbps: 10240, cpuSlowdownMultiplier: 1 },
};

const results = [];
for (const p of pages) {
  const opts = {
    port: chrome.port,
    output: "json",
    logLevel: "error",
    onlyCategories: ["performance", "accessibility", "best-practices", "seo"],
    ...(formFactor === "desktop" ? desktopCfg : {}),
  };
  const r = await lighthouse(`${BASE}/${p}`, opts);
  const c = r.lhr.categories;
  const row = {
    page: p,
    perf: Math.round(c.performance.score * 100),
    a11y: Math.round(c.accessibility.score * 100),
    bp: Math.round(c["best-practices"].score * 100),
    seo: Math.round(c.seo.score * 100),
    lcp: r.lhr.audits["largest-contentful-paint"].displayValue,
    cls: r.lhr.audits["cumulative-layout-shift"].displayValue,
    tbt: r.lhr.audits["total-blocking-time"].displayValue,
    fcp: r.lhr.audits["first-contentful-paint"].displayValue,
  };
  // collect failing/opportunity audits for perf + best-practices to guide fixes
  const probs = [];
  for (const catKey of ["performance", "best-practices", "seo", "accessibility"]) {
    for (const ref of c[catKey].auditRefs) {
      const a = r.lhr.audits[ref.id];
      if (a && a.score !== null && a.score < 0.9 && a.scoreDisplayMode !== "informative" && a.scoreDisplayMode !== "manual") {
        probs.push(`${catKey}:${ref.id}(${a.score})`);
      }
    }
  }
  row.problems = [...new Set(probs)];
  const lcpEl = r.lhr.audits["largest-contentful-paint-element"];
  row.lcpElement = lcpEl?.details?.items?.[0]?.items?.[0]?.node?.snippet?.slice(0, 90) || "?";
  results.push(row);
  console.log(`${p.padEnd(16)} P:${row.perf} A:${row.a11y} BP:${row.bp} SEO:${row.seo}  | LCP ${row.lcp}  TBT ${row.tbt}  CLS ${row.cls}`);
}
try { await chrome.kill(); } catch (e) { /* windows temp-cleanup EPERM is harmless */ }
writeFileSync(`e:/claude/cloudfen/audit/lh-${formFactor}.json`, JSON.stringify(results, null, 2));

console.log("\n== unique problem audits (score<0.9) ==");
const all = {};
for (const r of results) for (const p of r.problems) all[p] = (all[p] || 0) + 1;
for (const [k, v] of Object.entries(all).sort((a, b) => b[1] - a[1])) console.log(`  ${k}  x${v}`);
