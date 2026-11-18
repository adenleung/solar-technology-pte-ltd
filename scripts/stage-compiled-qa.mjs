// Creates instrumented copies of the compiled homepage for local measurements.
import { readFile, writeFile, mkdir, cp } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
const root = fileURLToPath(new URL("../", import.meta.url));
const qa = path.join(root, "dist", "client", "__qa");
await mkdir(qa, { recursive: true });
await cp(path.join(root, "public", "__qa"), qa, { recursive: true });
const source = await readFile(
  path.join(root, "dist", "server", "prerendered-routes", "index.html"),
  "utf8",
);
const instrument =
  '<script>history.replaceState(null,"","/");</script><script async src="/__qa/web-vitals-sample.js"></script>';
const observer = await readFile(
  path.join(root, "node_modules", "web-vitals", "dist", "web-vitals.iife.js"),
  "utf8",
);
const probe = `
const size=window.innerWidth+"x"+window.innerHeight;
function emit(n,v){console.info("SOLAR-LAB "+size+" "+n+" "+v);}
for(const name of ["LCP","CLS","INP","FCP","TTFB"]){
  webVitals["on"+name]?.(metric=>emit(name,Number(metric.value.toFixed(4))),{reportAllChanges:true});
}
new PerformanceObserver(list=>{for(const e of list.getEntries())if(e.name==="first-contentful-paint")emit("paint",e.startTime);}).observe({type:"paint",buffered:true});
`;
await writeFile(path.join(qa, "web-vitals-sample.js"), observer + "\n" + probe);
await writeFile(
  path.join(qa, "measured.html"),
  source.replace("</head>", instrument + "</head>"),
);
await writeFile(
  path.join(qa, "phone.html"),
  '<!doctype html><html lang="en"><meta charset="utf-8"><title>Phone lab sample</title><body style="margin:0;background:#0b1117"><iframe src="/__qa/measured.html" title="390 pixel solar homepage" width="390" height="844" style="display:block;border:0"></iframe></body></html>',
);

// Exercise the system-preference code in Chromium instances whose host preference is fixed.
// CSS comes from the authored reduced-motion media blocks of the release stylesheets.
const reducedScript = `<script>
history.replaceState(null,"","/");
const realMatch = matchMedia.bind(window);
window.matchMedia = function(query){
 const media = realMatch(query);
 if (query !== "(prefers-reduced-motion: reduce)") return media;
 return {matches:true,media:query,addEventListener(){},removeEventListener(){},addListener(){},removeListener(){}};
};
window.addEventListener("load",()=>{
 const rules=[];
 for(const sheet of document.styleSheets)for(const rule of sheet.cssRules){
   if(rule.conditionText?.includes("prefers-reduced-motion: reduce"))for(const child of rule.cssRules)rules.push(child.cssText);
 }
 const style=document.createElement("style");style.textContent=rules.join("\\n");document.head.appendChild(style);
});
</script>`;
await writeFile(path.join(qa,"reduced.html"),source.replace("</head>",reducedScript+"</head>"));
