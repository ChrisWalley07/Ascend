import type { AchievementEvaluationContext, AchievementEvaluatorOptions } from "../types/context";
import type { AchievementDefinition } from "../types/definition";
import type { AchievementId } from "../types/ids";
import type { ResolvedAchievement } from "../types/state";

export type PriorCompletedAchievement = {
  completedAt: string;
  xpAwarded: number;
  unlockedAt?: string;
};

export type AchievementEngineOptions = AchievementEvaluatorOptions & {
  /** Max items returned in `nextAchievements`. Default 5. */
  nextAchievementsLimit?: number;
  /**
   * Previously persisted completions — prevents re-awarding XP and
   * keeps achievements completed even if metrics regress.
   */
  priorCompleted?: ReadonlyMap<AchievementId, PriorCompletedAchievement>;
};

export type AchievementEngineInput = {
  definitions: readonly AchievementDefinition[];
  context: AchievementEvaluationContext;
  options?: AchievementEngineOptions;
};

export type AchievementEngineResult = {
  evaluatedAt: string;
  userId: string;
  /** 0–100 share of eligible achievements completed. */
  completionPercent: number;
  /** Total XP from all completed achievements. */
  earnedXp: number;
  /** Prerequisites not met. */
  locked: readonly ResolvedAchievement[];
  /** Unlocked and in progress. */
  available: readonly ResolvedAchievement[];
  /** Fully completed. */
  completed: readonly ResolvedAchievement[];
  /** Closest available achievements to completion. */
  nextAchievements: readonly ResolvedAchievement[];
  /** Achievements completed during this evaluation pass. */
  newlyCompleted: readonly AchievementId[];
  /** Achievements unlocked during this evaluation pass. */
  newlyUnlocked: readonly AchievementId[];
  /** XP earned only from newly completed achievements. */
  newlyEarnedXp: number;
  /** All resolved achievements in evaluation scope. */
  all: readonly ResolvedAchievement[];
};
