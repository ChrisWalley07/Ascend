import type { MomentumDirection, TrendDirection } from "../types";

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function roundScore(value: number): number {
  return Math.round(clamp(value, 0, 100));
}

export function average(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export function percentChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

export function linearTrendSlope(values: number[]): number {
  if (values.length < 2) return 0;
  const n = values.length;
  const xMean = (n - 1) / 2;
  const yMean = average(values);
  let numerator = 0;
  let denominator = 0;
  for (let i = 0; i < n; i += 1) {
    numerator += (i - xMean) * (values[i] - yMean);
    denominator += (i - xMean) ** 2;
  }
  return denominator === 0 ? 0 : numerator / denominator;
}

export function trendFromSlope(
  slope: number,
  improvementThreshold: number,
  declineThreshold: number,
): TrendDirection {
  if (slope > improvementThreshold) return "up";
  if (slope < -declineThreshold) return "down";
  return slope === 0 ? "unknown" : "flat";
}

export function momentumFromTrend(
  trend: TrendDirection,
  hasEnoughData: boolean,
): MomentumDirection {
  if (!hasEnoughData) return "insufficient_data";
  if (trend === "up") return "improving";
  if (trend === "down") return "declining";
  return "stable";
}

export function confidenceFromSampleSize(
  sampleSize: number,
  minimum: number,
  ideal: number,
): number {
  if (sampleSize < minimum) {
    return roundScore((sampleSize / minimum) * 40);
  }
  return roundScore(40 + ((Math.min(sampleSize, ideal) - minimum) / (ideal - minimum)) * 60);
}

export function splitWindow<T extends { date: Date }>(
  items: T[],
  now: Date,
  recentDays: number,
): { recent: T[]; prior: T[] } {
  const recentStart = new Date(now);
  recentStart.setDate(recentStart.getDate() - recentDays);
  const priorStart = new Date(recentStart);
  priorStart.setDate(priorStart.getDate() - recentDays);

  const recent = items.filter((item) => item.date >= recentStart);
  const prior = items.filter((item) => item.date >= priorStart && item.date < recentStart);
  return { recent, prior };
}

export function weightedSum(
  parts: Array<{ value: number; weight: number }>,
): number {
  const totalWeight = parts.reduce((sum, part) => sum + part.weight, 0);
  if (totalWeight === 0) return 0;
  return parts.reduce((sum, part) => sum + part.value * part.weight, 0) / totalWeight;
}
