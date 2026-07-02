import type { AchievementCategory } from "./category";
import type { AchievementDefinition } from "./definition";
import type { AchievementId } from "./ids";
import type { CatalogValidationResult } from "./catalog";

export type AchievementRegistryQuery = {
  category?: AchievementCategory;
  tags?: readonly string[];
  includeHidden?: boolean;
  ids?: readonly AchievementId[];
};

/**
 * Read-only registry contract.
 * UI and services depend on this interface — not on catalog file paths.
 */
export interface AchievementRegistry {
  readonly version: string;
  readonly size: number;

  getAll(query?: AchievementRegistryQuery): readonly AchievementDefinition[];
  getById(id: AchievementId): AchievementDefinition | undefined;
  getByCategory(category: AchievementCategory): readonly AchievementDefinition[];
  getPrerequisites(id: AchievementId): readonly AchievementDefinition[];
  getDependents(id: AchievementId): readonly AchievementDefinition[];
  validate(): CatalogValidationResult;
  has(id: AchievementId): boolean;
}

export type AchievementRegistryFactory = (
  definitions: readonly AchievementDefinition[],
  version?: string,
) => AchievementRegistry;
