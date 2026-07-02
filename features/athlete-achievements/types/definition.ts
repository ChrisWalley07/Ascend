import type { AchievementCategory } from "./category";
import type { AchievementDifficulty } from "./difficulty";
import type { AchievementIcon } from "./icon";
import type { AchievementId } from "./ids";
import type { AchievementRarity } from "./rarity";
import type { AchievementRequirement } from "./requirements";

/**
 * Static, data-driven achievement definition.
 * Lives in catalog files — never embedded in UI components.
 *
 * Runtime fields (`completed`, `progress`) belong on `AchievementState`.
 */
export type AchievementDefinition = {
  id: AchievementId;
  title: string;
  description: string;
  category: AchievementCategory;
  difficulty: AchievementDifficulty;
  icon: AchievementIcon;
  xp: number;
  /** Other achievements that must be completed before this one unlocks. */
  prerequisites: readonly AchievementId[];
  requirements: AchievementRequirement;
  rarity: AchievementRarity;
  /** Optional taxonomy for filtering and analytics. */
  tags?: readonly string[];
  /** Hidden until unlocked or completed (e.g. secret achievements). */
  hidden?: boolean;
  /** ISO 8601 — when this definition was added to the catalog. */
  versionAdded?: string;
};

/**
 * Type helper for catalog authors — ensures objects satisfy the schema at compile time.
 */
export type AchievementDefinitionInput = Omit<AchievementDefinition, "id"> & {
  id: string;
};

export function defineAchievement<T extends AchievementDefinitionInput>(
  input: T,
): T & AchievementDefinition {
  return input as T & AchievementDefinition;
}
