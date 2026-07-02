import type { HyroxWorkoutType } from "@prisma/client";

export type HyroxStation = {
  slug: string;
  name: string;
  sequence: number;
  distanceMeters?: number;
  isRun: boolean;
};

/** Official Hyrox race station order */
export const HYROX_STATIONS: HyroxStation[] = [
  { slug: "run-1", name: "1 km Run", sequence: 1, distanceMeters: 1000, isRun: true },
  { slug: "skierg", name: "SkiErg", sequence: 2, distanceMeters: 1000, isRun: false },
  { slug: "sled-push", name: "Sled Push", sequence: 3, distanceMeters: 50, isRun: false },
  { slug: "sled-pull", name: "Sled Pull", sequence: 4, distanceMeters: 50, isRun: false },
  { slug: "burpee-broad-jump", name: "Burpee Broad Jump", sequence: 5, distanceMeters: 80, isRun: false },
  { slug: "row", name: "Row", sequence: 6, distanceMeters: 1000, isRun: false },
  { slug: "farmers-carry", name: "Farmers Carry", sequence: 7, distanceMeters: 200, isRun: false },
  { slug: "sandbag-lunges", name: "Sandbag Lunges", sequence: 8, distanceMeters: 100, isRun: false },
  { slug: "wall-balls", name: "Wall Balls", sequence: 9, distanceMeters: 0, isRun: false },
  { slug: "run-8", name: "1 km Run (Finish)", sequence: 10, distanceMeters: 1000, isRun: true },
];

export const HYROX_WORKOUT_TYPES: { value: HyroxWorkoutType; label: string }[] = [
  { value: "RACE_SIMULATION", label: "Race Simulation" },
  { value: "STATION_PRACTICE", label: "Station Practice" },
  { value: "RUNNING_SESSION", label: "Running Session" },
  { value: "INTERVALS", label: "Intervals" },
  { value: "STRENGTH", label: "Strength" },
  { value: "RECOVERY", label: "Recovery" },
  { value: "MOBILITY", label: "Mobility" },
  { value: "CUSTOM_SESSION", label: "Custom Session" },
];

export type HyroxExerciseCategory =
  | "Running"
  | "Machines"
  | "Carries"
  | "Sleds"
  | "Functional"
  | "Strength"
  | "Mobility"
  | "Recovery";

export type HyroxExercise = {
  name: string;
  category: HyroxExerciseCategory;
  movementType: string;
  primaryMuscles: string[];
};

export const HYROX_EXERCISES: HyroxExercise[] = [
  { name: "Run 1km", category: "Running", movementType: "Cardio", primaryMuscles: ["Legs", "Cardio"] },
  { name: "SkiErg", category: "Machines", movementType: "Cardio", primaryMuscles: ["Back", "Arms"] },
  { name: "Row", category: "Machines", movementType: "Cardio", primaryMuscles: ["Back", "Legs"] },
  { name: "Bike Erg", category: "Machines", movementType: "Cardio", primaryMuscles: ["Legs", "Cardio"] },
  { name: "Sled Push", category: "Sleds", movementType: "Power", primaryMuscles: ["Legs", "Core"] },
  { name: "Sled Pull", category: "Sleds", movementType: "Power", primaryMuscles: ["Back", "Legs"] },
  { name: "Burpee Broad Jump", category: "Functional", movementType: "Metcon", primaryMuscles: ["Full Body"] },
  { name: "Farmers Carry", category: "Carries", movementType: "Grip", primaryMuscles: ["Grip", "Core"] },
  { name: "Sandbag Lunges", category: "Carries", movementType: "Strength", primaryMuscles: ["Legs", "Core"] },
  { name: "Wall Ball", category: "Functional", movementType: "Metcon", primaryMuscles: ["Legs", "Shoulders"] },
  { name: "Back Squat", category: "Strength", movementType: "Strength", primaryMuscles: ["Legs"] },
  { name: "Deadlift", category: "Strength", movementType: "Strength", primaryMuscles: ["Posterior Chain"] },
  { name: "Mobility Flow", category: "Mobility", movementType: "Mobility", primaryMuscles: ["Full Body"] },
  { name: "Easy Run", category: "Recovery", movementType: "Cardio", primaryMuscles: ["Legs"] },
];

export const HYROX_BENCHMARKS = [
  { name: "8 x 1 km Runs", scoreUnit: "time", description: "Full race running component" },
  { name: "100 Wall Balls For Time", scoreUnit: "time", description: "Wall ball capacity test" },
  { name: "1000m SkiErg", scoreUnit: "time", description: "SkiErg benchmark" },
  { name: "1000m Row", scoreUnit: "time", description: "Row benchmark" },
  { name: "50m Sled Push", scoreUnit: "time", description: "Sled push benchmark" },
  { name: "50m Sled Pull", scoreUnit: "time", description: "Sled pull benchmark" },
  { name: "Farmers Carry 200m", scoreUnit: "time", description: "Grip and carry test" },
  { name: "Sandbag Lunges 100m", scoreUnit: "time", description: "Lunge benchmark" },
  { name: "80m Burpee Broad Jump", scoreUnit: "time", description: "BBJ benchmark" },
];

export const HYROX_GOAL_TEMPLATES = [
  { title: "Sub 60 minutes", unit: "min", targetValue: 60 },
  { title: "Sub 70 minutes", unit: "min", targetValue: 70 },
  { title: "Sub 90 minutes", unit: "min", targetValue: 90 },
  { title: "Complete First Race", unit: "race", targetValue: 1 },
  { title: "Qualify for Worlds", unit: "race", targetValue: 1 },
];

export const HYROX_DIVISIONS = ["Open", "Pro", "Doubles", "Relay"] as const;

export const HYROX_AGE_GROUPS = [
  "16-24",
  "25-29",
  "30-34",
  "35-39",
  "40-44",
  "45-49",
  "50-54",
  "55-59",
  "60+",
] as const;

export function formatHyroxTime(seconds: number | null | undefined): string {
  if (!seconds || seconds <= 0) return "—";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function formatPace(secondsPerKm: number | null | undefined): string {
  if (!secondsPerKm || secondsPerKm <= 0) return "—";
  const m = Math.floor(secondsPerKm / 60);
  const s = Math.round(secondsPerKm % 60);
  return `${m}:${String(s).padStart(2, "0")}/km`;
}
