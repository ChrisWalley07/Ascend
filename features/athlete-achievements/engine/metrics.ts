import {
  ACHIEVEMENT_METRIC_META,
  type AchievementMetricKey,
  type AchievementMetricSnapshot,
  type AchievementMetricValue,
} from "../types";

export function readMetricValue(
  metrics: AchievementMetricSnapshot,
  key: AchievementMetricKey,
): AchievementMetricValue {
  return metrics[key] ?? null;
}

export function readMetricAsNumber(
  metrics: AchievementMetricSnapshot,
  key: AchievementMetricKey,
): number | null {
  const value = readMetricValue(metrics, key);
  if (value == null) return null;
  if (typeof value === "boolean") return value ? 1 : 0;
  return value;
}

export function metricUnit(key: AchievementMetricKey): string {
  return ACHIEVEMENT_METRIC_META[key].unit;
}

export function metricDirection(key: AchievementMetricKey): "higher_is_better" | "lower_is_better" {
  return ACHIEVEMENT_METRIC_META[key].direction;
}

export function clampPercent(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, Math.round(value)));
}
