export type {
  AchievementEngineInput,
  AchievementEngineOptions,
  AchievementEngineResult,
  PriorCompletedAchievement,
} from "./types";

export {
  runAchievementEngine,
  runAchievementEngineForDefinitions,
  arePrerequisitesMet,
} from "./evaluate-engine";

export {
  evaluateRequirement,
  isRequirementMet,
  buildAchievementProgress,
  buildLockedProgress,
} from "./evaluate-requirement";
export type { RequirementEvaluation } from "./evaluate-requirement";

export {
  readMetricValue,
  readMetricAsNumber,
  metricUnit,
  metricDirection,
  clampPercent,
} from "./metrics";

export {
  arePrerequisitesMet as checkPrerequisites,
  resolveCompletionSet,
  resolveUnlockSet,
} from "./unlock";

export {
  calculateXpAward,
  resolveXpAward,
  sumXpAwards,
} from "./xp";
export type { XpAward } from "./xp";
