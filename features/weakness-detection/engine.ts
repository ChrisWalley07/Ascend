import { startOfWeek, format } from "date-fns";

import { roundScore } from "@/shared/utils/math";

import {
  ATTRIBUTE_LABELS,
  ATTRIBUTE_ORDER,
  RECOMMENDATIONS,
  SEVERITY_WEIGHT,
  WEAKNESS_THRESHOLDS,
} from "./config";
import type {
  AttributeSnapshot,
  PriorityItem,
  WeaknessAttributeCategory,
  WeaknessItem,
  WeaknessReport,
  WeaknessSeverity,
  WeeklyWeaknessContext,
} from "./types";

function severityFor(score: number, delta: number): WeaknessSeverity | null {
  if (score < WEAKNESS_THRESHOLDS.criticalScore) return "critical";
  if (score < WEAKNESS_THRESHOLDS.highScore) return "high";
  if (score < WEAKNESS_THRESHOLDS.moderateScore) return "moderate";
  if (
    score < WEAKNESS_THRESHOLDS.decliningCeiling &&
    delta <= WEAKNESS_THRESHOLDS.minDeclineDelta
  ) {
    return "low";
  }
  if (score < WEAKNESS_THRESHOLDS.weaknessCeiling) return "low";
  return null;
}

function trendFromDelta(delta: number): AttributeSnapshot["trend"] {
  if (delta >= WEAKNESS_THRESHOLDS.minImproveDelta) return "improving";
  if (delta <= WEAKNESS_THRESHOLDS.minDeclineDelta) return "declining";
  return delta === 0 ? "unknown" : "stable";
}

function buildSnapshots(ctx: WeeklyWeaknessContext): AttributeSnapshot[] {
  return ATTRIBUTE_ORDER.map((category) => {
    const currentScore = roundScore(ctx.current[category]);
    const priorScore = roundScore(ctx.prior[category]);
    const weeklyDelta = roundScore(currentScore - priorScore);
    return {
      category,
      label: ATTRIBUTE_LABELS[category],
      currentScore,
      priorScore,
      weeklyDelta,
      confidence: ctx.confidenceByCategory[category],
      trend: trendFromDelta(weeklyDelta),
    };
  });
}

function buildWeaknesses(snapshots: AttributeSnapshot[]): WeaknessItem[] {
  const items: WeaknessItem[] = [];

  for (const snap of snapshots) {
    const severity = severityFor(snap.currentScore, snap.weeklyDelta);
    if (!severity) continue;

    items.push({
      category: snap.category,
      severity,
      confidence: snap.confidence,
      recommendation: RECOMMENDATIONS[snap.category],
      currentScore: snap.currentScore,
      weeklyDelta: snap.weeklyDelta,
    });
  }

  return items.sort((a, b) => {
    const severityDiff = (SEVERITY_WEIGHT[b.severity] ?? 0) - (SEVERITY_WEIGHT[a.severity] ?? 0);
    if (severityDiff !== 0) return severityDiff;
    return a.currentScore - b.currentScore;
  });
}

function buildPriorityList(
  snapshots: AttributeSnapshot[],
  weaknesses: WeaknessItem[],
): PriorityItem[] {
  const weaknessCategories = new Set(weaknesses.map((w) => w.category));

  return snapshots
    .filter((snap) => weaknessCategories.has(snap.category))
    .map((snap) => {
      const weakness = weaknesses.find((w) => w.category === snap.category)!;
      const priority = roundScore(
        (SEVERITY_WEIGHT[weakness.severity] ?? 0) * 0.5 +
          (100 - snap.currentScore) * 0.35 +
          snap.confidence * 0.15,
      );
      return {
        category: snap.category,
        label: snap.label,
        priority,
        reason: `${snap.label} scored ${snap.currentScore}/100 (${snap.weeklyDelta >= 0 ? "+" : ""}${snap.weeklyDelta} this week).`,
      };
    })
    .sort((a, b) => b.priority - a.priority);
}

function pickExtreme(
  snapshots: AttributeSnapshot[],
  pick: "max" | "min",
): WeaknessAttributeCategory {
  const sorted = [...snapshots].sort((a, b) =>
    pick === "max" ? b.currentScore - a.currentScore : a.currentScore - b.currentScore,
  );
  return sorted[0]?.category ?? "strength";
}

function pickTrend(
  snapshots: AttributeSnapshot[],
  direction: "improving" | "declining",
): WeaknessAttributeCategory {
  const sorted = [...snapshots].sort((a, b) =>
    direction === "improving" ? b.weeklyDelta - a.weeklyDelta : a.weeklyDelta - b.weeklyDelta,
  );
  const match = sorted.find((s) =>
    direction === "improving"
      ? s.weeklyDelta >= WEAKNESS_THRESHOLDS.minImproveDelta
      : s.weeklyDelta <= WEAKNESS_THRESHOLDS.minDeclineDelta,
  );
  return match?.category ?? sorted[0]?.category ?? "strength";
}

export function analyzeWeeklyWeaknesses(ctx: WeeklyWeaknessContext): WeaknessReport {
  const attributes = buildSnapshots(ctx);
  const weaknesses = buildWeaknesses(attributes);
  const priorityList = buildPriorityList(attributes, weaknesses);

  const overallConfidence = roundScore(
    attributes.reduce((sum, attribute) => sum + attribute.confidence, 0) /
      Math.max(attributes.length, 1),
  );

  const weekStart = startOfWeek(ctx.collectedAt, { weekStartsOn: 1 });

  return {
    generatedAt: ctx.collectedAt.toISOString(),
    sportView: ctx.sportView,
    weekLabel: `Week of ${format(weekStart, "MMM d")}`,
    strongestAttribute: pickExtreme(attributes, "max"),
    weakestAttribute: pickExtreme(attributes, "min"),
    mostImproved: pickTrend(attributes, "improving"),
    mostRegressed: pickTrend(attributes, "declining"),
    attributes,
    weaknesses,
    priorityList,
    overallConfidence,
  };
}
