import type { AchievementMetricKey } from "./metrics";

/** Shared fields for every requirement node in the tree. */
export type RequirementBase = {
  /** Stable id for progress tracking and debugging. */
  id: string;
  /** Human-readable label shown in progress UI. */
  label: string;
};

export type NumericComparisonOperator = "gte" | "lte" | "eq";

export type NumericRequirement = RequirementBase & {
  kind: "numeric";
  metric: AchievementMetricKey;
  operator: NumericComparisonOperator;
  target: number;
};

export type CountRequirement = RequirementBase & {
  kind: "count";
  metric: AchievementMetricKey;
  target: number;
  /** Rolling window in days. Omit for all-time count. */
  windowDays?: number;
};

export type StreakRequirement = RequirementBase & {
  kind: "streak";
  metric: AchievementMetricKey;
  targetDays: number;
};

export type BooleanRequirement = RequirementBase & {
  kind: "boolean";
  metric: AchievementMetricKey;
  expected: boolean;
};

export type CompoundRequirement = RequirementBase & {
  kind: "compound";
  operator: "all" | "any";
  requirements: readonly AchievementRequirement[];
};

/**
 * Discriminated union — evaluators switch on `kind` for exhaustive handling.
 */
export type AchievementRequirement =
  | NumericRequirement
  | CountRequirement
  | StreakRequirement
  | BooleanRequirement
  | CompoundRequirement;

export type RequirementKind = AchievementRequirement["kind"];

export type RequirementByKind<K extends RequirementKind> = Extract<
  AchievementRequirement,
  { kind: K }
>;
