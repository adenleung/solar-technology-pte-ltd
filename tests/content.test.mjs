import test from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import {
  products,
  projects,
  solutions,
  families,
  applications,
} from "../components/solar/catalogue/data.ts";
import { MODULES } from "../components/solar/planner/plannerModel.ts";
test("all catalogue, portfolio and application images resolve inside the release", () => {
  const rows = [
    ...products,
    ...projects,
    ...solutions,
    ...families,
    ...applications,
  ];
  for (const row of rows)
    assert.ok(
      existsSync(new URL("../public" + row.image, import.meta.url)),
      row.image,
    );
  assert.equal(new Set(products.map((p) => p.id)).size, 12);
  assert.equal(new Set(projects.map((p) => p.id)).size, 18);
  assert.equal(new Set(products.map((p) => p.datasheet)).size, 10);
});
test("each planner selection uses the same dimensions, output and sheet as the showroom", () => {
  for (const module of MODULES) {
    const p = products.find((p) => p.id === module.id.toLowerCase());
    assert.ok(p);
    assert.equal(p.powerW, module.watts);
    assert.equal(p.lengthMm, module.lengthMm);
    assert.equal(p.widthMm, module.widthMm);
    assert.ok(p.datasheet.endsWith("/" + module.sheet));
  }
});
