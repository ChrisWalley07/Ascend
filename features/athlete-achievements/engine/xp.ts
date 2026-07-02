import { ACHIEVEMENT_DIFFICULTY_META } from "../types/difficulty";
import type { AchievementDefinition } from "../types/definition";
import type { AchievementId } from "../types/ids";
import type { PriorCompletedAchievement } from "./types";

export type XpAward = {
  achievementId: AchievementId;
  baseXp: number;
  awardedXp: number;
};

export function calculateXpAward(
  definition: AchievementDefinition,
  applyDifficultyMultiplier = false,
): number {
  if (!applyDifficultyMultiplier) {
    return definition.xp;
  }

  const multiplier = ACHIEVEMENT_DIFFICULTY_META[definition.difficulty].xpMultiplier;
  return Math.round(definition.xp * multiplier);
}

export function resolveXpAward(
  definition: AchievementDefinition,
  prior?: PriorCompletedAchievement,
  applyDifficultyMultiplier = false,
): XpAward {
  const awardedXp =
    prior?.xpAwarded ?? calculateXpAward(definition, applyDifficultyMultiplier);

  return {
    achievementId: definition.id,
    baseXp: definition.xp,
    awardedXp,
  };
}

export function sumXpAwards(awards: readonly XpAward[]): number {
  return awards.reduce((total, award) => total + award.awardedXp, 0);
}
