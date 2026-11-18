import assert from "node:assert/strict";
import test from "node:test";
import {
  BUILDINGS,
  calculateLayout,
  DEFAULT_PLAN,
  MODULES,
  MOUNTS,
  parsePlannerConfig,
  SHAPES,
} from "./plannerModel.ts";

test("default residential roof fits 10 × 4 of the verified 450 W module", () => {
  const layout = calculateLayout(DEFAULT_PLAN);
  assert.equal(layout.columns, 10);
  assert.equal(layout.rows, 4);
  assert.equal(layout.capacityKw, 18);
  assert.equal(layout.annualKwh, null);
  assert.deepEqual(parsePlannerConfig(DEFAULT_PLAN), DEFAULT_PLAN);
});

test("zero usable area and very small roofs fit no whole modules", () => {
  for (const inputs of [
    { usablePercent: 0 },
    { roofArea: 1, usablePercent: 100 },
  ]) {
    const layout = calculateLayout({ ...DEFAULT_PLAN, ...inputs });
    assert.equal(layout.moduleCount, 0);
    assert.equal(layout.capacityKw, 0);
  }
});

test("client input is strictly bounded and stale product IDs are rejected on the server", () => {
  for (const bad of [
    null,
    {},
    [],
    { roofArea: NaN },
    { roofArea: Infinity },
    { annualYield: NaN },
    { annualYield: 3001 },
    { annualYield: "1100" },
    { mounting: "__proto__" },
    { buildingType: "toString" },
    { modelId: "SP-EXAMPLE" },
    { usablePercent: -1 },
    { roofArea: 10001 },
    { storageInterest: 1 },
  ]) {
    const candidate =
      bad && Object.keys(bad).length ? { ...DEFAULT_PLAN, ...bad } : bad;
    assert.equal(parsePlannerConfig(candidate), null);
  }
  assert.equal(
    parsePlannerConfig({ ...DEFAULT_PLAN, unsaved: "field" }).unsaved,
    undefined,
  );
});

test("every drawn row and column fits the usable rectangle including interior gaps", () => {
  for (const buildingType of Object.keys(BUILDINGS))
    for (const model of MODULES)
      for (const mounting of Object.keys(MOUNTS)) {
        for (const roofArea of [1, 24.8, 120, 348, 10000])
          for (const usablePercent of [0, 24, 70, 100]) {
            const layout = calculateLayout({
              ...DEFAULT_PLAN,
              roofArea,
              usablePercent,
              modelId: model.id,
              buildingType,
              mounting,
            });
            assert.ok(layout.arrayWidth <= layout.usableWidth + 1e-8);
            assert.ok(layout.arrayDepth <= layout.usableDepth + 1e-8);
            assert.equal(layout.moduleCount, layout.rows * layout.columns);
            assert.equal(
              layout.capacityKw,
              (layout.moduleCount * model.watts) / 1000,
            );
            assert.ok(
              Math.abs(
                layout.roofWidth / layout.roofDepth - SHAPES[buildingType],
              ) < 1e-10,
            );
            assert.ok(
              Math.abs(
                layout.usableWidth * layout.usableDepth -
                  (roofArea * usablePercent) / 100,
              ) < 1e-8,
            );
          }
      }
});

test("maximises single-orientation packing and gapped rack rows never increase the count", () => {
  for (const area of [10, 33, 101.5, 250, 401]) {
    const plan = { ...DEFAULT_PLAN, roofArea: area, usablePercent: 100 };
    for (const mounting of Object.keys(MOUNTS)) {
      const l = calculateLayout({ ...plan, mounting });
      const total = (w, d) =>
        Math.floor((l.usableWidth + 0.04 + 1e-9) / (w + 0.04)) *
        Math.floor((l.usableDepth + l.rowGap + 1e-9) / (d + l.rowGap));
      assert.equal(
        l.moduleCount,
        Math.max(total(1.134, 1.762), total(1.762, 1.134)),
      );
    }
    assert.ok(
      calculateLayout({ ...plan, mounting: "rack" }).moduleCount <=
        calculateLayout({ ...plan, mounting: "flush" }).moduleCount,
    );
  }
});

test("generation uses only entered yield, rounds to kWh, and storage interest does not change DC rating", () => {
  assert.equal(
    calculateLayout({ ...DEFAULT_PLAN, annualYield: 1200 }).annualKwh,
    21600,
  );
  assert.equal(
    calculateLayout({ ...DEFAULT_PLAN, annualYield: 0 }).annualKwh,
    0,
  );
  assert.equal(
    calculateLayout({
      ...DEFAULT_PLAN,
      annualYield: 1158.717,
      storageInterest: true,
    }).annualKwh,
    Math.round(18 * 1158.717),
  );
});
