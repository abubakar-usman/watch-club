// Configurable list of restricted certifications per country (ISO 3166-1 alpha-2)
export const RESTRICTED_CERTIFICATIONS: Record<string, string[]> = {
  US: ["NC-17", "NR", "UR", "X", "XXX"],
  GB: ["18", "R18"],
  DE: ["18", "FSK 18"],
  FR: ["18"],
  CA: ["18+", "NC-17"],
  AU: ["RC", "R 18+"],
  IN: ["A"],
  DEFAULT: ["NC-17", "NR", "UR", "18", "R18", "RC", "X", "XXX", "A"],
};

// Default country code if x-vercel-ip-country request header is missing
export const DEFAULT_COUNTRY_CODE = "US";
