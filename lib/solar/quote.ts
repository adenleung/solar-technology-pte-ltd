export const MAX_FILE_BYTES = 5 * 1024 * 1024;
export const MAX_REQUEST_BYTES = MAX_FILE_BYTES + 64 * 1024;
export const CONSENT_VERSION = "2026-11-project-review";
export const BUILDING_TYPES = [
  "Residential",
  "Commercial",
  "Industrial",
  "Other",
] as const;
export const FILE_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
] as const;
export type QuoteContext = {
  product?: string;
  building?: string;
  roof?: string;
};
