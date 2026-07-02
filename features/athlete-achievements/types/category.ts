export const ACHIEVEMENT_CATEGORIES = [
  "crossfit",
  "hyrox",
  "running",
  "weightlifting",
] as const;

export type AchievementCategory = (typeof ACHIEVEMENT_CATEGORIES)[number];

export type AchievementCategoryMeta = {
  key: AchievementCategory;
  label: string;
  description: string;
};

export const ACHIEVEMENT_CATEGORY_META: Record<AchievementCategory, AchievementCategoryMeta> = {
  crossfit: {
    key: "crossfit",
    label: "CrossFit",
    description: "Benchmarks, WODs, gymnastics, and general fitness milestones.",
  },
  hyrox: {
    key: "hyrox",
    label: "HYROX",
    description: "Race finishes, station strength, and hybrid endurance goals.",
  },
  running: {
    key: "running",
    label: "Running",
    description: "Distance, pace, consistency, and race achievements.",
  },
  weightlifting: {
    key: "weightlifting",
    label: "Weightlifting",
    description: "Snatch, clean & jerk, squat cycles, and total milestones.",
  },
};

export function isAchievementCategory(value: string): value is AchievementCategory {
  return (ACHIEVEMENT_CATEGORIES as readonly string[]).includes(value);
}
