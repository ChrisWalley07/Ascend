import { achievementId } from "../../types";
import type { AchievementDefinition } from "../../types";
import type { AchievementCatalogJson } from "./types";

/**
 * Converts a JSON catalog into strongly-typed definitions.
 * Validates ids and casts to branded AchievementId.
 */
export function parseAchievementCatalogJson(
  catalog: AchievementCatalogJson,
): readonly AchievementDefinition[] {
  return catalog.achievements.map((entry) => ({
    ...entry,
    id: achievementId(entry.id),
    prerequisites: entry.prerequisites.map(achievementId),
  }));
}
