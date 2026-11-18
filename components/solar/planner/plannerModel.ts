import { siliconDefinitions } from "../../../lib/solar/siliconModules.ts";

/** Highest front-side STC variant in each catalogue series, ordered for roof selection. */
export const MODULES = siliconDefinitions
  .map((module) => ({
    id: module.id.toUpperCase(),
    watts: module.high,
    lengthMm: module.length,
    widthMm: module.width,
    sheet: module.file + ".pdf",
  }))
  .sort((a, b) => a.watts - b.watts);

export const BUILDINGS = {
  residential: "Residential",
  commercial: "Commercial",
  industrial: "Industrial",
} as const;
export const ROOFS = {
  flat: "Flat roof",
  pitched: "Single-pitch roof",
} as const;
export const MOUNTS = {
  rack: "Spaced rack rows",
  flush: "Close-coupled rails",
} as const;
export const LIMITS = {
  roofMin: 1,
  roofMax: 10000,
  yieldMin: 0,
  yieldMax: 3000,
} as const;
export const SHEET_BASE = "https://solartechnologysg.com/datasheets/";

export type PlannerConfig = {
  buildingType: keyof typeof BUILDINGS;
  roofType: keyof typeof ROOFS;
  roofArea: number;
  usablePercent: number;
  modelId: string;
  mounting: keyof typeof MOUNTS;
  storageInterest: boolean;
  annualYield: number | null;
};

export const DEFAULT_PLAN: PlannerConfig = {
  buildingType: "residential",
  roofType: "pitched",
  roofArea: 120,
  usablePercent: 75,
  modelId: "SP-N16B-96HG",
  mounting: "flush",
  storageInterest: false,
  annualYield: null,
};

/** Illustrative roof aspect ratios, inclination and spacing; these are planner assumptions. */
export const SHAPES = {
  residential: 1.6,
  commercial: 1.9,
  industrial: 2.4,
} as const;
export const PITCH_DEGREES = 12;
export const COLUMN_GAP = 0.04;
export const ROW_GAPS = { flush: 0.04, rack: 0.45 } as const;

function inRange(value: unknown, min: number, max: number): value is number {
  return (
    typeof value === "number" &&
    Number.isFinite(value) &&
    value >= min &&
    value <= max
  );
}

function choice<T extends object>(
  choices: T,
  value: unknown,
): value is Extract<keyof T, string> {
  return (
    typeof value === "string" &&
    Object.prototype.hasOwnProperty.call(choices, value)
  );
}

/** The bound applies on both client and server, before calculating or persisting any estimate. */
export function parsePlannerConfig(input: unknown): PlannerConfig | null {
  if (!input || typeof input !== "object" || Array.isArray(input)) return null;
  const data = input as Record<string, unknown>;
  if (
    !choice(BUILDINGS, data.buildingType) ||
    !choice(ROOFS, data.roofType) ||
    !choice(MOUNTS, data.mounting)
  )
    return null;
  if (
    !inRange(data.roofArea, LIMITS.roofMin, LIMITS.roofMax) ||
    !inRange(data.usablePercent, 0, 100)
  )
    return null;
  if (
    typeof data.modelId !== "string" ||
    !MODULES.some((module) => module.id === data.modelId)
  )
    return null;
  if (
    typeof data.storageInterest !== "boolean" ||
    (data.annualYield !== null &&
      !inRange(data.annualYield, LIMITS.yieldMin, LIMITS.yieldMax))
  )
    return null;
  return {
    buildingType: data.buildingType,
    roofType: data.roofType,
    roofArea: data.roofArea,
    usablePercent: data.usablePercent,
    modelId: data.modelId,
    mounting: data.mounting,
    storageInterest: data.storageInterest,
    annualYield: data.annualYield,
  };
}

function pack(
  width: number,
  depth: number,
  moduleWidth: number,
  moduleDepth: number,
  rowGap: number,
) {
  // A gap divides adjacent modules; fitting one module never requires an outside gap.
  const columns = Math.floor(
    (width + COLUMN_GAP + 1e-9) / (moduleWidth + COLUMN_GAP),
  );
  const rows = Math.floor((depth + rowGap + 1e-9) / (moduleDepth + rowGap));
  const arrayWidth =
    columns === 0 ? 0 : columns * moduleWidth + (columns - 1) * COLUMN_GAP;
  const arrayDepth = rows === 0 ? 0 : rows * moduleDepth + (rows - 1) * rowGap;
  return {
    rows,
    columns,
    moduleWidth,
    moduleDepth,
    arrayWidth,
    arrayDepth,
    moduleCount: rows * columns,
  };
}

export function calculateLayout(config: PlannerConfig) {
  const model = MODULES.find((item) => item.id === config.modelId);
  if (!model) throw new RangeError("Unknown photovoltaic module");
  const roofWidth = Math.sqrt(config.roofArea * SHAPES[config.buildingType]);
  const roofDepth = config.roofArea / roofWidth;
  // The usable rectangle is inset evenly in proportion on each axis.
  const usableScale = Math.sqrt(config.usablePercent / 100);
  const usableWidth = roofWidth * usableScale;
  const usableDepth = roofDepth * usableScale;
  const rowGap = ROW_GAPS[config.mounting];
  const long = model.lengthMm / 1000;
  const short = model.widthMm / 1000;
  const portrait = pack(usableWidth, usableDepth, short, long, rowGap);
  const landscape = pack(usableWidth, usableDepth, long, short, rowGap);
  const isPortrait = portrait.moduleCount >= landscape.moduleCount;
  const chosen = isPortrait ? portrait : landscape;
  const capacityKw = (chosen.moduleCount * model.watts) / 1000;
  const annualKwh =
    config.annualYield === null
      ? null
      : Math.round(capacityKw * config.annualYield);
  return {
    ...chosen,
    model,
    isPortrait,
    rowGap,
    capacityKw,
    annualKwh,
    roofWidth,
    roofDepth,
    usableWidth,
    usableDepth,
  };
}

export type PlannerLayout = ReturnType<typeof calculateLayout>;
