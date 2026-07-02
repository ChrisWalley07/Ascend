import type { XpProgressionConfig } from "./types";

/** Default curve: L1=0, L2=250, L3=600, then ×2.4 per level. */
export const DEFAULT_XP_PROGRESSION: XpProgressionConfig = {
  level2Threshold: 250,
  level3Threshold: 600,
  growthRatio: 2.4,
  exponentialBase: 250,
};

const LEVEL_TITLE_TABLE: readonly string[] = [
  "Rookie",        // 1
  "Trainee",       // 2
  "Athlete",       // 3
  "Contender",     // 4
  "Specialist",    // 5
  "Elite",         // 6
  "Champion",      // 7
  "Master",        // 8
  "Legend",        // 9
  "Ascendant",     // 10
];

const POST_MAX_TITLE_PREFIXES = [
  "Mythic",
  "Immortal",
  "Transcendent",
  "Eternal",
  "Supreme",
] as const;

export function getLevelTitle(level: number): string {
  const safeLevel = Math.max(1, Math.floor(level));

  if (safeLevel <= LEVEL_TITLE_TABLE.length) {
    return LEVEL_TITLE_TABLE[safeLevel - 1]!;
  }

  const overflow = safeLevel - LEVEL_TITLE_TABLE.length;
  const prefix =
    POST_MAX_TITLE_PREFIXES[(overflow - 1) % POST_MAX_TITLE_PREFIXES.length]!;
  return `${prefix} ${LEVEL_TITLE_TABLE[LEVEL_TITLE_TABLE.length - 1]}`;
}

/**
 * Cumulative XP required to **reach** a given level.
 * Level 1 = 0 XP, Level 2 = 250 XP, Level 3 = 600 XP, then exponential.
 */
export function getCumulativeXpForLevel(
  level: number,
  config: XpProgressionConfig = DEFAULT_XP_PROGRESSION,
): number {
  const safeLevel = Math.max(1, Math.floor(level));

  if (safeLevel === 1) return 0;
  if (safeLevel === 2) return config.level2Threshold;
  if (safeLevel === 3) return config.level3Threshold;

  return Math.round(
    config.exponentialBase * Math.pow(config.growthRatio, safeLevel - 2),
  );
}

/** XP band size between `level` and `level + 1`. */
export function getXpRequiredForLevel(
  level: number,
  config: XpProgressionConfig = DEFAULT_XP_PROGRESSION,
): number {
  const safeLevel = Math.max(1, Math.floor(level));
  return (
    getCumulativeXpForLevel(safeLevel + 1, config) -
    getCumulativeXpForLevel(safeLevel, config)
  );
}

export function getLevelFromTotalXp(
  totalXp: number,
  config: XpProgressionConfig = DEFAULT_XP_PROGRESSION,
): number {
  const xp = Math.max(0, totalXp);
  let level = 1;

  while (getCumulativeXpForLevel(level + 1, config) <= xp) {
    level += 1;
    if (level > 10_000) break;
  }

  return level;
}
