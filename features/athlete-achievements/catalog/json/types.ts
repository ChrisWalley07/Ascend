import type { AchievementDefinitionInput } from "../../types";

/**
 * JSON-serializable achievement catalog format.
 * Load at build time or runtime — UI never hardcodes achievements.
 */
export type AchievementCatalogJson = {
  version: string;
  achievements: readonly AchievementDefinitionInput[];
};
