import type { AchievementCategory } from "./category";
import type { ResolvedAchievement } from "./state";

export type AchievementCategorySummary = {
  category: AchievementCategory;
  total: number;
  completed: number;
  unlocked: number;
  locked: number;
  totalXp: number;
  earnedXp: number;
  completionPercent: number;
};

/**
 * Aggregated report for dashboards, profile screens, and notifications.
 */
export type AchievementReport = {
  generatedAt: string;
  userId: string;
  achievements: readonly ResolvedAchievement[];
  categorySummaries: readonly AchievementCategorySummary[];
  totalXp: number;
  earnedXp: number;
  completionPercent: number;
  recentlyCompleted: readonly ResolvedAchievement[];
  nextUp: readonly ResolvedAchievement[];
};

export type AchievementReportOptions = {
  category?: AchievementCategory;
  limit?: number;
  includeHidden?: boolean;
  includeLocked?: boolean;
};
