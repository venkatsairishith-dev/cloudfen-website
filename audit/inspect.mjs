import { readFileSync } from "node:fs";
const r = JSON.parse(readFileSync("e:/claude/cloudfen/audit/report-before.json","utf8"));
const idxM = r.find(x=>x.page==="index.html"&&x.vp==="mobile");
console.log("== index mobile overflow offenders ==");
console.log(JSON.stringify(idxM.offenders,null,1));
console.log("\n== console errors (sample pages) ==");
for (const p of ["job.html","H1B.html","everify.html"]) {
  const e = r.find(x=>x.page===p&&x.vp==="desktop");
  console.log(p, JSON.stringify(e.consoleErrors), "failedReq:", JSON.stringify(e.failedReq));
}
console.log("\n== color-contrast targets (unique across site) ==");
const cc = new Set();
for (const x of r) for (const v of (x.axe||[])) if (v.id==="color-contrast") (v.targets||[]).forEach(t=>cc.add(t));
console.log([...cc].slice(0,30).join("\n"));
console.log("\n== landmark-unique targets ==");
const lu = new Set();
for (const x of r) for (const v of (x.axe||[])) if (v.id==="landmark-unique") (v.targets||[]).forEach(t=>lu.add(t));
console.log([...lu].join("\n"));
console.log("\n== heading-order targets (sample) ==");
const ho = new Set();
for (const x of r) for (const v of (x.axe||[])) if (v.id==="heading-order") (v.targets||[]).forEach(t=>ho.add(t));
console.log([...ho].slice(0,12).join("\n"));
console.log("\n== region sample targets (index) ==");
const reg = r.find(x=>x.page==="index.html"&&x.vp==="desktop").axe.find(v=>v.id==="region");
console.log(reg?JSON.stringify(reg.targets):"none");
