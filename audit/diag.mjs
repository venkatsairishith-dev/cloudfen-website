import lighthouse from "lighthouse";
import * as chromeLauncher from "chrome-launcher";

const BASE = "http://127.0.0.1:8080";
const pages = (process.argv[2] || "focus.html,opt.html").split(",");
const chrome = await chromeLauncher.launch({
  chromeFlags: ["--headless=new", "--no-sandbox", "--disable-gpu"],
  chromePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
});
for (const p of pages) {
  const r = await lighthouse(`${BASE}/${p}`, { port: chrome.port, output: "json", logLevel: "error",
    onlyCategories: ["performance"] });
  const a = r.lhr.audits;
  console.log(`\n===== ${p}  perf=${Math.round(r.lhr.categories.performance.score*100)} =====`);
  console.log("LCP:", a["largest-contentful-paint"].displayValue, " CLS:", a["cumulative-layout-shift"].displayValue);
  const lcpEl = a["largest-contentful-paint-element"]?.details?.items?.[0];
  const snip = lcpEl?.items?.[0]?.node?.snippet;
  console.log("LCP element:", (snip || JSON.stringify(lcpEl) || "n/a").slice(0, 200));
  // LCP phase breakdown
  const phases = a["largest-contentful-paint-element"]?.details?.items?.[1]?.items;
  if (phases) console.log("LCP phases:", JSON.stringify(phases).slice(0, 300));
  // CLS culprits
  const shifts = (a["layout-shifts"]?.details?.items || []);
  console.log("CLS items:", (JSON.stringify(shifts) || "[]").slice(0, 300));
  // LCP phases
  const ph = a["lcp-discovery-insight"] || a["largest-contentful-paint-element"];
  // top opportunities by savings
  const opps = [];
  for (const [id, au] of Object.entries(a)) {
    const ms = au?.details?.overallSavingsMs || au?.metricSavings?.LCP || 0;
    if (ms > 100) opps.push(`${id}: ${Math.round(ms)}ms`);
  }
  console.log("savings:", opps.slice(0, 8).join("  |  "));
}
try { await chrome.kill(); } catch {}
