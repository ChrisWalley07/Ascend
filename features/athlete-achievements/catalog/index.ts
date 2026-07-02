import type {
  AchievementCatalog,
  AchievementCategory,
  AchievementDefinition,
  MasterAchievementCatalog,
} from "../types";
import { ACHIEVEMENT_CATEGORIES } from "../types";

import { crossfitAchievements } from "./crossfit";
import { hyroxAchievements } from "./hyrox";
import { runningAchievements } from "./running";
import { weightliftingAchievements } from "./weightlifting";

export const CATALOG_VERSION = "1.0.0";

const CATEGORY_ACHIEVEMENTS: Record<AchievementCategory, readonly AchievementDefinition[]> = {
  crossfit: crossfitAchievements,
  hyrox: hyroxAchievements,
  running: runningAchievements,
  weightlifting: weightliftingAchievements,
};

export function buildMasterCatalog(): MasterAchievementCatalog {
  const all = ACHIEVEMENT_CATEGORIES.flatMap((category) => CATEGORY_ACHIEVEMENTS[category]);

  return {
    meta: {
      version: CATALOG_VERSION,
      generatedAt: new Date().toISOString(),
      source: "typescript",
    },
    byCategory: { ...CATEGORY_ACHIEVEMENTS },
    all,
  };
}

export function buildCategoryCatalog(category: AchievementCategory): AchievementCatalog {
  return {
    meta: {
      version: CATALOG_VERSION,
      generatedAt: new Date().toISOString(),
      source: "typescript",
    },
    achievements: CATEGORY_ACHIEVEMENTS[category],
  };
}

export function getAllAchievementDefinitions(): readonly AchievementDefinition[] {
  return buildMasterCatalog().all;
}

export {
  crossfitAchievements,
  hyroxAchievements,
  runningAchievements,
  weightliftingAchievements,
};
