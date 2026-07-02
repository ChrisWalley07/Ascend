export type XpPlayerProgress = {
  /** Lifetime XP from completed achievements. */
  totalXp: number;
  /** Current player level (starts at 1). */
  currentLevel: number;
  /** Display title for the current level. */
  levelTitle: string;
  /** Cumulative XP threshold for the current level. */
  xpForCurrentLevel: number;
  /** Cumulative XP threshold for the next level. */
  xpForNextLevel: number;
  /** XP needed within this level band to reach the next level. */
  xpRequiredForNextLevel: number;
  /** XP earned within the current level band. */
  xpInCurrentLevel: number;
  /** Remaining XP until the next level. */
  xpToNextLevel: number;
  /** 0–100 progress through the current level band. */
  progressPercent: number;
};

export type XpProgressionConfig = {
  /** Cumulative XP required to reach level 2. */
  level2Threshold: number;
  /** Cumulative XP required to reach level 3. */
  level3Threshold: number;
  /** Exponential growth ratio applied from level 4 onward. */
  growthRatio: number;
  /** Base XP used in the exponential formula (level 2 anchor). */
  exponentialBase: number;
};
