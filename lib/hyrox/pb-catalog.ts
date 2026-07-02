import type { PbCategory, PbRecordType, ScoreDirection } from "@prisma/client";

import type { PbCatalogEntry } from "@/lib/pb-catalog";

function def(
  slug: string,
  name: string,
  category: PbCategory,
  opts: {
    subcategory?: string;
    unit: string;
    recordType: PbRecordType;
    scoreDirection: ScoreDirection;
    isCore?: boolean;
    sortOrder: number;
    description?: string;
  },
): PbCatalogEntry {
  return {
    slug,
    name,
    category,
    sport: "HYROX",
    subcategory: opts.subcategory,
    unit: opts.unit,
    recordType: opts.recordType,
    scoreDirection: opts.scoreDirection,
    isCore: opts.isCore ?? false,
    sortOrder: opts.sortOrder,
    description: opts.description,
  };
}

/** Hyrox-specific PB catalog — stations, running, and race benchmarks */
export const HYROX_PB_CATALOG: PbCatalogEntry[] = [
  def("hyrox-race-finish", "Hyrox Race Finish", "TIME_CAPACITY", {
    subcategory: "Race",
    unit: "time",
    recordType: "TIME",
    scoreDirection: "LOWER_IS_BETTER",
    isCore: true,
    sortOrder: 1,
    description: "Full race finish time",
  }),
  def("hyrox-1km-run", "1 km Run", "RUNNING", {
    subcategory: "Race pace",
    unit: "time",
    recordType: "TIME",
    scoreDirection: "LOWER_IS_BETTER",
    isCore: true,
    sortOrder: 10,
  }),
  def("hyrox-5km-run", "5 km Run", "RUNNING", {
    unit: "time",
    recordType: "TIME",
    scoreDirection: "LOWER_IS_BETTER",
    isCore: true,
    sortOrder: 11,
  }),
  def("hyrox-8x1km-total", "8 × 1 km Runs (session)", "RUNNING", {
    unit: "time",
    recordType: "TIME",
    scoreDirection: "LOWER_IS_BETTER",
    isCore: true,
    sortOrder: 12,
    description: "Full race running component simulation",
  }),
  def("hyrox-skierg-1000m", "1000m SkiErg", "ERG", {
    subcategory: "Station",
    unit: "time",
    recordType: "TIME",
    scoreDirection: "LOWER_IS_BETTER",
    isCore: true,
    sortOrder: 20,
  }),
  def("hyrox-row-1000m", "1000m Row", "ERG", {
    subcategory: "Station",
    unit: "time",
    recordType: "TIME",
    scoreDirection: "LOWER_IS_BETTER",
    isCore: true,
    sortOrder: 21,
  }),
  def("hyrox-bike-1000m", "1000m Bike Erg", "ERG", {
    subcategory: "Station",
    unit: "time",
    recordType: "TIME",
    scoreDirection: "LOWER_IS_BETTER",
    sortOrder: 22,
  }),
  def("hyrox-sled-push-50m", "50m Sled Push", "STRONGMAN", {
    subcategory: "Station",
    unit: "time",
    recordType: "TIME",
    scoreDirection: "LOWER_IS_BETTER",
    isCore: true,
    sortOrder: 30,
  }),
  def("hyrox-sled-pull-50m", "50m Sled Pull", "STRONGMAN", {
    subcategory: "Station",
    unit: "time",
    recordType: "TIME",
    scoreDirection: "LOWER_IS_BETTER",
    isCore: true,
    sortOrder: 31,
  }),
  def("hyrox-farmers-carry-200m", "200m Farmers Carry", "STRONGMAN", {
    subcategory: "Station",
    unit: "time",
    recordType: "TIME",
    scoreDirection: "LOWER_IS_BETTER",
    isCore: true,
    sortOrder: 32,
  }),
  def("hyrox-lunges-100m", "100m Sandbag Lunges", "STRONGMAN", {
    subcategory: "Station",
    unit: "time",
    recordType: "TIME",
    scoreDirection: "LOWER_IS_BETTER",
    isCore: true,
    sortOrder: 33,
  }),
  def("hyrox-wall-balls-100", "100 Wall Balls", "POWER", {
    subcategory: "Station",
    unit: "time",
    recordType: "TIME",
    scoreDirection: "LOWER_IS_BETTER",
    isCore: true,
    sortOrder: 40,
  }),
  def("hyrox-bbj-80m", "80m Burpee Broad Jump", "POWER", {
    subcategory: "Station",
    unit: "time",
    recordType: "TIME",
    scoreDirection: "LOWER_IS_BETTER",
    isCore: true,
    sortOrder: 41,
  }),
  def("hyrox-sled-push-weight", "Sled Push Working Weight", "STRENGTH", {
    subcategory: "Sled",
    unit: "kg",
    recordType: "WEIGHT",
    scoreDirection: "HIGHER_IS_BETTER",
    sortOrder: 50,
  }),
  def("hyrox-wall-ball-weight", "Wall Ball Weight", "STRENGTH", {
    subcategory: "Wall ball",
    unit: "kg",
    recordType: "WEIGHT",
    scoreDirection: "HIGHER_IS_BETTER",
    sortOrder: 51,
  }),
];

export const HYROX_CORE_PB_COUNT = HYROX_PB_CATALOG.filter((p) => p.isCore).length;

export const HYROX_PB_CATEGORY_META: Partial<
  Record<PbCategory, { label: string; emoji: string; description: string }>
> = {
  TIME_CAPACITY: { label: "Race", emoji: "🏁", description: "Full race finish times" },
  RUNNING: { label: "Running", emoji: "🏃", description: "1 km splits & endurance runs" },
  ERG: { label: "Machines", emoji: "🚣", description: "SkiErg, row, bike" },
  STRONGMAN: { label: "Stations", emoji: "🛷", description: "Sleds, carries, lunges" },
  POWER: { label: "Functional", emoji: "⚡", description: "Wall balls, BBJ" },
  STRENGTH: { label: "Strength", emoji: "🏋️", description: "Working weights" },
  CUSTOM: { label: "Custom", emoji: "✨", description: "Your own Hyrox PBs" },
};
