import { copyFile, mkdir, rm } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
const root = fileURLToPath(new URL("../", import.meta.url));
const folder = path.join(root, "public", "__qa");
if (process.argv.includes("--clean")) {
  await rm(folder, { recursive: true, force: true });
} else {
  await mkdir(folder, { recursive: true });
  for (const file of ["browser.html", "browser-suite.js", "timings.html"])
    await copyFile(path.join(root, "tests", file), path.join(folder, file));
  await copyFile(
    path.join(root, "node_modules", "axe-core", "axe.min.js"),
    path.join(folder, "axe.min.js"),
  );
  await copyFile(
    path.join(root, "node_modules", "web-vitals", "dist", "web-vitals.iife.js"),
    path.join(folder, "web-vitals.js"),
  );
  console.log(
    "Open /__qa/browser.html in the local preview. Remove the temporary route before release.",
  );
}
