import type { AchievementRequirement } from "./requirements";

export type RequirementProgress = {
  requirementId: string;
  label: string;
  current: number;
  target: number;
  unit: string;
  percent: number;
  completed: boolean;
};

/**
 * Aggregated progress for a single achievement.
 * Produced by the evaluation engine — not stored in catalog definitions.
 */
export type AchievementProgress = {
  /** 0–100 overall completion percentage. */
  percent: number;
  /** Individual requirement nodes (flattened for UI consumption). */
  requirements: readonly RequirementProgress[];
  /** Raw requirement tree with per-node progress (for nested compound requirements). */
  root: RequirementProgressNode;
};

export type RequirementProgressNode = {
  requirementId: string;
  label: string;
  kind: AchievementRequirement["kind"];
  current: number;
  target: number;
  unit: string;
  percent: number;
  completed: boolean;
  children?: readonly RequirementProgressNode[];
};

export const EMPTY_ACHIEVEMENT_PROGRESS: AchievementProgress = {
  percent: 0,
  requirements: [],
  root: {
    requirementId: "root",
    label: "Progress",
    kind: "numeric",
    current: 0,
    target: 1,
    unit: "",
    percent: 0,
    completed: false,
  },
};

export function createCompletedProgress(
  requirements: readonly RequirementProgress[],
): AchievementProgress {
  return {
    percent: 100,
    requirements,
    root: {
      requirementId: "root",
      label: "Complete",
      kind: "compound",
      current: 1,
      target: 1,
      unit: "",
      percent: 100,
      completed: true,
      children: requirements.map((r) => ({
        requirementId: r.requirementId,
        label: r.label,
        kind: "numeric" as const,
        current: r.current,
        target: r.target,
        unit: r.unit,
        percent: 100,
        completed: true,
      })),
    },
  };
}
