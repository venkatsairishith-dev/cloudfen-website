import { readFileSync } from "node:fs";
const r = JSON.parse(readFileSync("e:/claude/cloudfen/audit/report-after1.json","utf8"));
console.log("== color-contrast targets (unique) ==");
const cc=new Set(); for(const x of r) for(const v of (x.axe||[])) if(v.id==="color-contrast")(v.targets||[]).forEach(t=>cc.add(`${x.page}: ${t}`));
console.log([...cc].join("\n"));
console.log("\n== small tap targets (index mobile) ==");
const im=r.find(x=>x.page==="index.html"&&x.vp==="mobile"); console.log(JSON.stringify(im.smallTargets,null,1));
console.log("\n== console errors detail ==");
for(const p of ["job.html","H1B.html","everify.html"]){const e=r.find(x=>x.page===p&&x.vp==="desktop"); console.log(p, JSON.stringify(e.consoleErrors));}
