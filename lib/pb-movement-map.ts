import type { PbRecordType } from "@prisma/client";

type PbPick = "maxWeight" | "maxReps" | "minTime" | "maxDistance" | "maxCalories";

export type MovementPbMapping = {
  slug: string;
  recordType: PbRecordType;
  unit: string;
  pick: PbPick;
  /** Rep PBs: skip inflated set×rep totals (e.g. 5×5 = 25) */
  maxRepCount?: number;
};

/** Canonical movement names (from workout interpreter) → PB catalog slugs */
export const MOVEMENT_PB_MAP: Record<string, MovementPbMapping> = {
  "Back Squat": { slug: "back-squat-1rm", recordType: "WEIGHT", unit: "kg", pick: "maxWeight" },
  "Front Squat": { slug: "front-squat-1rm", recordType: "WEIGHT", unit: "kg", pick: "maxWeight" },
  "Overhead Squat": { slug: "overhead-squat-1rm", recordType: "WEIGHT", unit: "kg", pick: "maxWeight" },
  Deadlift: { slug: "deadlift-1rm", recordType: "WEIGHT", unit: "kg", pick: "maxWeight" },
  "Bench Press": { slug: "bench-press-1rm", recordType: "WEIGHT", unit: "kg", pick: "maxWeight" },
  "Strict Press": { slug: "strict-press-1rm", recordType: "WEIGHT", unit: "kg", pick: "maxWeight" },
  "Push Press": { slug: "push-press-1rm", recordType: "WEIGHT", unit: "kg", pick: "maxWeight" },
  Snatch: { slug: "snatch-1rm", recordType: "WEIGHT", unit: "kg", pick: "maxWeight" },
  Clean: { slug: "clean-1rm", recordType: "WEIGHT", unit: "kg", pick: "maxWeight" },
  "Clean and Jerk": { slug: "clean-jerk-1rm", recordType: "WEIGHT", unit: "kg", pick: "maxWeight" },
  Thruster: { slug: "max-thrusters-weight", recordType: "WEIGHT", unit: "kg", pick: "maxWeight" },
  "Pull Up": { slug: "max-pull-ups", recordType: "REPS", unit: "reps", pick: "maxReps", maxRepCount: 30 },
  "Chest to Bar": { slug: "max-ctb", recordType: "REPS", unit: "reps", pick: "maxReps", maxRepCount: 30 },
  "Muscle Up": { slug: "max-ring-muscle-ups", recordType: "REPS", unit: "reps", pick: "maxReps", maxRepCount: 20 },
  "Bar Muscle Up": { slug: "max-bar-muscle-ups", recordType: "REPS", unit: "reps", pick: "maxReps", maxRepCount: 20 },
  "Handstand Push Up": { slug: "max-hspu", recordType: "REPS", unit: "reps", pick: "maxReps", maxRepCount: 30 },
  "Toes to Bar": { slug: "max-t2b-unbroken", recordType: "REPS", unit: "reps", pick: "maxReps", maxRepCount: 40 },
  "Push Up": { slug: "max-push-ups", recordType: "REPS", unit: "reps", pick: "maxReps", maxRepCount: 100 },
  "Wall Ball": { slug: "max-wall-balls-unbroken", recordType: "REPS", unit: "reps", pick: "maxReps", maxRepCount: 50 },
  "Double Under": { slug: "max-du-unbroken", recordType: "REPS", unit: "reps", pick: "maxReps", maxRepCount: 200 },
  "Box Jump": { slug: "box-jump-height", recordType: "HEIGHT", unit: "cm", pick: "maxDistance" },
  Row: { slug: "row-2000m", recordType: "TIME", unit: "sec", pick: "minTime" },
  "Bike Erg": { slug: "bikeerg-10km", recordType: "TIME", unit: "sec", pick: "minTime" },
  "Ski Erg": { slug: "skierg-2000m", recordType: "TIME", unit: "sec", pick: "minTime" },
  "Run 400m": { slug: "run-400m", recordType: "TIME", unit: "sec", pick: "minTime" },
};

/** Benchmark WOD name (normalized) → PB slug */
export const WOD_PB_MAP: Record<string, string> = {
  fran: "wod-fran",
  grace: "wod-grace",
  isabel: "wod-isabel",
  diane: "wod-diane",
  helen: "wod-helen",
  cindy: "wod-cindy",
  murph: "wod-murph",
  dt: "wod-dt",
  chad: "wod-chad",
  jackie: "wod-jackie",
  elizabeth: "wod-elizabeth",
  karen: "wod-karen",
  nancy: "wod-nancy",
  annie: "wod-annie",
  mary: "wod-mary",
};

/** Row / run distance (meters) → specific PB slug */
export const DISTANCE_PB_MAP: Array<{ meters: number; slug: string }> = [
  { meters: 100, slug: "row-100m" },
  { meters: 250, slug: "row-250m" },
  { meters: 500, slug: "row-500m" },
  { meters: 1000, slug: "row-1000m" },
  { meters: 2000, slug: "row-2000m" },
  { meters: 5000, slug: "row-5000m" },
  { meters: 10000, slug: "row-10000m" },
  { meters: 400, slug: "run-400m" },
  { meters: 800, slug: "run-800m" },
  { meters: 1500, slug: "run-1500m" },
  { meters: 3000, slug: "run-3km" },
  { meters: 5000, slug: "run-5km" },
  { meters: 10000, slug: "run-10km" },
  { meters: 21097, slug: "run-half-marathon" },
  { meters: 42195, slug: "run-marathon" },
];
