import type { AchievementCategory } from "./category";
import type { AchievementDefinition } from "./definition";

export type AchievementCatalogMeta = {
  version: string;
  generatedAt: string;
  source: "typescript" | "json";
};

/**
 * A versioned bundle of achievement definitions for one or more categories.
 */
export type AchievementCatalog = {
  meta: AchievementCatalogMeta;
  achievements: readonly AchievementDefinition[];
};

export type CategoryAchievementCatalog = AchievementCatalog & {
  category: AchievementCategory;
};

export type MasterAchievementCatalog = {
  meta: AchievementCatalogMeta;
  byCategory: Record<AchievementCategory, readonly AchievementDefinition[]>;
  all: readonly AchievementDefinition[];
};

export type CatalogValidationIssue = {
  code:
    | "duplicate_id"
    | "missing_prerequisite"
    | "invalid_metric"
    | "circular_prerequisite"
    | "category_mismatch";
  achievementId: string;
  message: string;
};

export type CatalogValidationResult = {
  valid: boolean;
  issues: readonly CatalogValidationIssue[];
};
