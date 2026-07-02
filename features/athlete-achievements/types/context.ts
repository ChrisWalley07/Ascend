import type { AchievementCategory } from "./category";
import type { AchievementId } from "./ids";
import type { AchievementMetricSnapshot } from "./metrics";

/**
 * Input context for the achievement evaluation engine.
 * Populated by collectors from workouts, benchmarks, races, and user profile data.
 */
export type AchievementEvaluationContext = {
  userId: string;
  asOf: Date;
  metrics: AchievementMetricSnapshot;
  completedAchievementIds: ReadonlySet<AchievementId>;
  activeCategories: readonly AchievementCategory[];
};

export type AchievementEvaluatorOptions = {
  /** When true, hidden achievements are included in evaluation. */
  includeHidden?: boolean;
  /** Limit evaluation to specific categories. */
  categories?: readonly AchievementCategory[];
};

export type AchievementEvaluationResult = {
  evaluatedAt: string;
  newlyCompleted: readonly AchievementId[];
  newlyUnlocked: readonly AchievementId[];
  totalXpEarned: number;
};
