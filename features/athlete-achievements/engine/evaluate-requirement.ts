import type {
  AchievementMetricSnapshot,
  AchievementRequirement,
  AchievementProgress,
  RequirementProgress,
  RequirementProgressNode,
} from "../types";
import { flattenRequirements } from "../utils/requirements";
import {
  clampPercent,
  metricUnit,
  readMetricAsNumber,
} from "./metrics";

export type RequirementEvaluation = {
  node: RequirementProgressNode;
  leaves: RequirementProgress[];
  completed: boolean;
  percent: number;
};

function requirementTarget(req: AchievementRequirement): number {
  switch (req.kind) {
    case "streak":
      return req.targetDays;
    case "compound":
      return 1;
    case "boolean":
      return req.expected ? 1 : 0;
    default:
      return req.target;
  }
}

function evaluateNumeric(
  requirement: Extract<AchievementRequirement, { kind: "numeric" }>,
  metrics: AchievementMetricSnapshot,
): RequirementEvaluation {
  const value = readMetricAsNumber(metrics, requirement.metric);
  const unit = metricUnit(requirement.metric);
  const target = requirement.target;

  let completed = false;
  let percent = 0;
  const current = value ?? 0;

  if (requirement.operator === "eq") {
    completed = value != null && value === target;
    percent = completed ? 100 : value != null ? 0 : 0;
  } else if (requirement.operator === "gte") {
    completed = value != null && value >= target;
    percent = target > 0 ? clampPercent(((value ?? 0) / target) * 100) : completed ? 100 : 0;
  } else if (requirement.operator === "lte") {
    completed = value != null && value <= target;
    if (value == null) {
      percent = 0;
    } else if (value <= target) {
      percent = 100;
    } else {
      percent = clampPercent((target / value) * 100);
    }
  }

  const leaf: RequirementProgress = {
    requirementId: requirement.id,
    label: requirement.label,
    current,
    target,
    unit,
    percent,
    completed,
  };

  const node: RequirementProgressNode = {
    ...leaf,
    kind: requirement.kind,
  };

  return { node, leaves: [leaf], completed, percent };
}

function evaluateCount(
  requirement: Extract<AchievementRequirement, { kind: "count" }>,
  metrics: AchievementMetricSnapshot,
): RequirementEvaluation {
  const value = readMetricAsNumber(metrics, requirement.metric) ?? 0;
  const target = requirement.target;
  const unit = metricUnit(requirement.metric);
  const completed = value >= target;
  const percent = target > 0 ? clampPercent((value / target) * 100) : completed ? 100 : 0;

  const node: RequirementProgressNode = {
    requirementId: requirement.id,
    label: requirement.label,
    kind: requirement.kind,
    current: value,
    target,
    unit,
    percent,
    completed,
  };

  return {
    node,
    leaves: [{ ...node }],
    completed,
    percent,
  };
}

function evaluateStreak(
  requirement: Extract<AchievementRequirement, { kind: "streak" }>,
  metrics: AchievementMetricSnapshot,
): RequirementEvaluation {
  const value = readMetricAsNumber(metrics, requirement.metric) ?? 0;
  const target = requirement.targetDays;
  const unit = metricUnit(requirement.metric);
  const completed = value >= target;
  const percent = target > 0 ? clampPercent((value / target) * 100) : completed ? 100 : 0;

  const node: RequirementProgressNode = {
    requirementId: requirement.id,
    label: requirement.label,
    kind: requirement.kind,
    current: value,
    target,
    unit,
    percent,
    completed,
  };

  return {
    node,
    leaves: [{ ...node }],
    completed,
    percent,
  };
}

function evaluateBoolean(
  requirement: Extract<AchievementRequirement, { kind: "boolean" }>,
  metrics: AchievementMetricSnapshot,
): RequirementEvaluation {
  const raw = metrics[requirement.metric];
  const boolValue = raw === true || raw === 1;
  const completed = boolValue === requirement.expected;
  const percent = completed ? 100 : 0;

  const node: RequirementProgressNode = {
    requirementId: requirement.id,
    label: requirement.label,
    kind: requirement.kind,
    current: boolValue ? 1 : 0,
    target: requirement.expected ? 1 : 0,
    unit: "",
    percent,
    completed,
  };

  return {
    node,
    leaves: [{ ...node }],
    completed,
    percent,
  };
}

function evaluateCompound(
  requirement: Extract<AchievementRequirement, { kind: "compound" }>,
  metrics: AchievementMetricSnapshot,
): RequirementEvaluation {
  const childResults = requirement.requirements.map((child) =>
    evaluateRequirement(child, metrics),
  );

  const children = childResults.map((result) => result.node);
  const leaves = childResults.flatMap((result) => result.leaves);
  const percents = childResults.map((result) => result.percent);

  const completed =
    requirement.operator === "all"
      ? childResults.every((result) => result.completed)
      : childResults.some((result) => result.completed);

  const percent =
    requirement.operator === "all"
      ? percents.length > 0
        ? clampPercent(percents.reduce((sum, p) => sum + p, 0) / percents.length)
        : 0
      : percents.length > 0
        ? Math.max(...percents)
        : 0;

  const node: RequirementProgressNode = {
    requirementId: requirement.id,
    label: requirement.label,
    kind: requirement.kind,
    current: completed ? 1 : 0,
    target: 1,
    unit: "",
    percent,
    completed,
    children,
  };

  return { node, leaves, completed, percent };
}

export function evaluateRequirement(
  requirement: AchievementRequirement,
  metrics: AchievementMetricSnapshot,
): RequirementEvaluation {
  switch (requirement.kind) {
    case "numeric":
      return evaluateNumeric(requirement, metrics);
    case "count":
      return evaluateCount(requirement, metrics);
    case "streak":
      return evaluateStreak(requirement, metrics);
    case "boolean":
      return evaluateBoolean(requirement, metrics);
    case "compound":
      return evaluateCompound(requirement, metrics);
    default: {
      const _exhaustive: never = requirement;
      return _exhaustive;
    }
  }
}

export function isRequirementMet(
  requirement: AchievementRequirement,
  metrics: AchievementMetricSnapshot,
): boolean {
  return evaluateRequirement(requirement, metrics).completed;
}

export function buildAchievementProgress(
  requirement: AchievementRequirement,
  metrics: AchievementMetricSnapshot,
): AchievementProgress {
  const evaluation = evaluateRequirement(requirement, metrics);
  return {
    percent: evaluation.percent,
    requirements: evaluation.leaves,
    root: evaluation.node,
  };
}

export function buildLockedProgress(
  requirement: AchievementRequirement,
): AchievementProgress {
  const leaves = flattenRequirements(requirement).map((req) => ({
    requirementId: req.id,
    label: req.label,
    current: 0,
    target: requirementTarget(req),
    unit:
      req.kind === "compound" || req.kind === "boolean" ? "" : metricUnit(req.metric),
    percent: 0,
    completed: false,
  }));

  return {
    percent: 0,
    requirements: leaves,
    root: {
      requirementId: requirement.id,
      label: requirement.label,
      kind: requirement.kind,
      current: 0,
      target: 1,
      unit: "",
      percent: 0,
      completed: false,
    },
  };
}
