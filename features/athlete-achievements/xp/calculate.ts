import {
  getCumulativeXpForLevel,
  getLevelFromTotalXp,
  getLevelTitle,
  getXpRequiredForLevel,
} from "./progression";
import type { XpPlayerProgress, XpProgressionConfig } from "./types";
import { DEFAULT_XP_PROGRESSION } from "./progression";

export function calculateXpProgression(
  totalXp: number,
  config: XpProgressionConfig = DEFAULT_XP_PROGRESSION,
): XpPlayerProgress {
  const xp = Math.max(0, Math.floor(totalXp));
  const currentLevel = getLevelFromTotalXp(xp, config);
  const xpForCurrentLevel = getCumulativeXpForLevel(currentLevel, config);
  const xpForNextLevel = getCumulativeXpForLevel(currentLevel + 1, config);
  const xpRequiredForNextLevel = getXpRequiredForLevel(currentLevel, config);
  const xpInCurrentLevel = xp - xpForCurrentLevel;
  const xpToNextLevel = Math.max(0, xpForNextLevel - xp);
  const progressPercent =
    xpRequiredForNextLevel > 0
      ? Math.min(100, Math.round((xpInCurrentLevel / xpRequiredForNextLevel) * 100))
      : 100;

  return {
    totalXp: xp,
    currentLevel,
    levelTitle: getLevelTitle(currentLevel),
    xpForCurrentLevel,
    xpForNextLevel,
    xpRequiredForNextLevel,
    xpInCurrentLevel,
    xpToNextLevel,
    progressPercent,
  };
}

/**
 * Sum XP from completed achievements and compute player progression.
 */
export function calculateXpProgressionFromAchievements(
  earnedXp: number,
  config?: XpProgressionConfig,
): XpPlayerProgress {
  return calculateXpProgression(earnedXp, config);
}
