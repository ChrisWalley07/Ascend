export type { AchievementId } from "./ids";
export { achievementId, isAchievementId } from "./ids";

export type { AchievementCategory, AchievementCategoryMeta } from "./category";
export {
  ACHIEVEMENT_CATEGORIES,
  ACHIEVEMENT_CATEGORY_META,
  isAchievementCategory,
} from "./category";

export type { AchievementDifficulty, AchievementDifficultyMeta } from "./difficulty";
export {
  ACHIEVEMENT_DIFFICULTIES,
  ACHIEVEMENT_DIFFICULTY_META,
  isAchievementDifficulty,
} from "./difficulty";

export type { AchievementRarity, AchievementRarityMeta } from "./rarity";
export {
  ACHIEVEMENT_RARITIES,
  ACHIEVEMENT_RARITY_META,
  isAchievementRarity,
} from "./rarity";

export type { AchievementIcon, AchievementIconLibrary } from "./icon";

export type {
  AchievementMetricKey,
  CrossfitMetricKey,
  HyroxMetricKey,
  RunningMetricKey,
  WeightliftingMetricKey,
  AchievementMetricMeta,
  AchievementMetricSnapshot,
  AchievementMetricValue,
  MetricDirection,
} from "./metrics";
export {
  ACHIEVEMENT_METRIC_META,
  CROSSFIT_METRICS,
  HYROX_METRICS,
  RUNNING_METRICS,
  WEIGHTLIFTING_METRICS,
  isAchievementMetricKey,
} from "./metrics";

export type {
  AchievementRequirement,
  RequirementBase,
  RequirementKind,
  RequirementByKind,
  NumericRequirement,
  CountRequirement,
  StreakRequirement,
  BooleanRequirement,
  CompoundRequirement,
  NumericComparisonOperator,
} from "./requirements";

export type {
  AchievementDefinition,
  AchievementDefinitionInput,
} from "./definition";
export { defineAchievement } from "./definition";

export type {
  AchievementProgress,
  RequirementProgress,
  RequirementProgressNode,
} from "./progress";
export { EMPTY_ACHIEVEMENT_PROGRESS, createCompletedProgress } from "./progress";

export type {
  AchievementState,
  AchievementUnlockStatus,
  ResolvedAchievement,
  AchievementStateMap,
} from "./state";
export {
  createDefaultAchievementState,
  resolveAchievement,
} from "./state";

export type {
  AchievementCatalog,
  CategoryAchievementCatalog,
  MasterAchievementCatalog,
  AchievementCatalogMeta,
  CatalogValidationIssue,
  CatalogValidationResult,
} from "./catalog";

export type {
  AchievementEvaluationContext,
  AchievementEvaluatorOptions,
  AchievementEvaluationResult,
} from "./context";

export type {
  AchievementRegistry,
  AchievementRegistryQuery,
  AchievementRegistryFactory,
} from "./registry";

export type {
  AchievementReport,
  AchievementCategorySummary,
  AchievementReportOptions,
} from "./report";
