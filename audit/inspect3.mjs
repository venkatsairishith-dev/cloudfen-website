import { readFileSync } from "node:fs";
const r = JSON.parse(readFileSync("e:/claude/cloudfen/audit/lh-mobile.json","utf8"));
for (const p of ["focus.html","opt.html","index.html"]) {
  const x = r.find(z=>z.page===p);
  console.log(p, "LCP", x.lcp, "->", x.lcpElement);
}
