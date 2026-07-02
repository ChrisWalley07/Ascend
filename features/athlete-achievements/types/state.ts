import type { AchievementDefinition } from "./definition";
import type { AchievementId } from "./ids";
import type { AchievementProgress } from "./progress";

export type AchievementUnlockStatus = "locked" | "unlocked" | "completed";

/**
 * Per-athlete runtime state for a single achievement.
 * Merged with `AchievementDefinition` to form `ResolvedAchievement`.
 */
export type AchievementState = {
  achievementId: AchievementId;
  completed: boolean;
  completedAt: string | null;
  unlockedAt: string | null;
  progress: AchievementProgress;
  unlocked: boolean;
  unlockStatus: AchievementUnlockStatus;
  /** XP actually awarded (may differ from definition.xp with multipliers). */
  xpAwarded: number;
};

export type ResolvedAchievement = AchievementDefinition & AchievementState;

export type AchievementStateMap = ReadonlyMap<AchievementId, AchievementState>;

export function createDefaultAchievementState(
  achievementId: AchievementId,
  unlocked = false,
): AchievementState {
  return {
    achievementId,
    completed: false,
    completedAt: null,
    unlockedAt: unlocked ? new Date().toISOString() : null,
    progress: {
      percent: 0,
      requirements: [],
      root: {
        requirementId: achievementId,
        label: "Not started",
        kind: "numeric",
        current: 0,
        target: 1,
        unit: "",
        percent: 0,
        completed: false,
      },
    },
    unlocked,
    unlockStatus: unlocked ? "unlocked" : "locked",
    xpAwarded: 0,
  };
}

export function resolveAchievement(
  definition: AchievementDefinition,
  state: AchievementState,
): ResolvedAchievement {
  return { ...definition, ...state };
}
