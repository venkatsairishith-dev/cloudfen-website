import { chromium } from "playwright";
const r = await fetch("http://127.0.0.1:8080/index.html").then(x=>x.status).catch(e=>"ERR "+e.message);
console.log("server status:", r);
const b = await chromium.launch({ channel: "chrome", headless: true });
const p = await b.newPage();
await p.goto("http://127.0.0.1:8080/index.html", { waitUntil: "load" });
console.log("title:", await p.title());
await b.close();
console.log("PLAYWRIGHT+CHROME OK");
