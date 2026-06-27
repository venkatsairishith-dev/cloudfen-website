import lighthouse from "lighthouse";
import * as chromeLauncher from "chrome-launcher";
const chrome = await chromeLauncher.launch({ chromeFlags: ["--headless=new", "--no-sandbox"], chromePath: "C:/Program Files/Google/Chrome/Application/chrome.exe" });
const r = await lighthouse("http://127.0.0.1:8080/index.html", { port: chrome.port, output: "json", logLevel: "error", onlyCategories: ["performance"] });
const a = r.lhr.audits;
const el = a["largest-contentful-paint-element"];
console.log("LCP:", a["largest-contentful-paint"].displayValue);
console.log(JSON.stringify(el?.details?.items, null, 1)?.slice(0, 1200));
try { await chrome.kill(); } catch {}
