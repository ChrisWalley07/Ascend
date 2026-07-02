export const ACHIEVEMENT_DIFFICULTIES = [
  "beginner",
  "intermediate",
  "advanced",
  "elite",
  "legendary",
] as const;

export type AchievementDifficulty = (typeof ACHIEVEMENT_DIFFICULTIES)[number];

export type AchievementDifficultyMeta = {
  key: AchievementDifficulty;
  label: string;
  sortOrder: number;
  xpMultiplier: number;
};

export const ACHIEVEMENT_DIFFICULTY_META: Record<
  AchievementDifficulty,
  AchievementDifficultyMeta
> = {
  beginner: { key: "beginner", label: "Beginner", sortOrder: 1, xpMultiplier: 1 },
  intermediate: { key: "intermediate", label: "Intermediate", sortOrder: 2, xpMultiplier: 1.25 },
  advanced: { key: "advanced", label: "Advanced", sortOrder: 3, xpMultiplier: 1.5 },
  elite: { key: "elite", label: "Elite", sortOrder: 4, xpMultiplier: 2 },
  legendary: { key: "legendary", label: "Legendary", sortOrder: 5, xpMultiplier: 3 },
};

export function isAchievementDifficulty(value: string): value is AchievementDifficulty {
  return (ACHIEVEMENT_DIFFICULTIES as readonly string[]).includes(value);
}
