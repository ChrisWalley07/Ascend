import { format } from "date-fns";

import { roundScore } from "@/shared/utils/math";
import { linearTrendSlope } from "@/services/athlete-intelligence/utils/math";

import type {
  DatedValue,
  PredictionDirection,
  PredictionFactor,
  TimeSeriesPoint,
  TrendProjection,
} from "../types";

function confidenceFromSamples(
  sampleSize: number,
  minimum: number,
  ideal: number,
  recencyDays: number,
): number {
  const sampleFactor =
    sampleSize < minimum
      ? (sampleSize / minimum) * 40
      : 40 + ((Math.min(sampleSize, ideal) - minimum) / Math.max(ideal - minimum, 1)) * 40;
  const recencyFactor = recencyDays <= 7 ? 20 : recencyDays <= 21 ? 14 : recencyDays <= 45 ? 8 : 0;
  return roundScore(sampleFactor + recencyFactor);
}

export function toTimeSeries(points: DatedValue[]): TimeSeriesPoint[] {
  return points.map((point) => ({
    date: point.date.toISOString(),
    label: format(point.date, "MMM d"),
    value: point.value,
    projected: false,
  }));
}

export function projectLinearTrend(
  points: DatedValue[],
  horizonDays: number,
  direction: PredictionDirection,
  minSamples: number,
  idealSamples: number,
): TrendProjection | null {
  if (points.length === 0) return null;

  const sorted = [...points].sort((a, b) => a.date.getTime() - b.date.getTime());
  const values = sorted.map((p) => p.value);
  const current = values.at(-1)!;

  const dayOffsets = sorted.map((p) =>
    (p.date.getTime() - sorted[0].date.getTime()) / (1000 * 60 * 60 * 24),
  );
  const slopePerDay =
    dayOffsets.length >= 2 && dayOffsets.at(-1)! > 0
      ? linearTrendSlope(values) / Math.max(dayOffsets.at(-1)! / (values.length - 1), 1)
      : 0;

  const projectedRaw = current + slopePerDay * horizonDays;
  const projected =
    direction === "lower_is_better"
      ? Math.max(projectedRaw, current * 0.92)
      : Math.min(projectedRaw, current * 1.15);

  const lastDate = sorted.at(-1)!.date;
  const recencyDays = (Date.now() - lastDate.getTime()) / (1000 * 60 * 60 * 24);

  const factors: PredictionFactor[] = [];

  if (sorted.length >= minSamples) {
    const delta = current - values[0];
    const improving =
      direction === "lower_is_better" ? delta < 0 : delta > 0;
    factors.push({
      label: "Historical trend",
      impact: improving ? "positive" : delta === 0 ? "neutral" : "negative",
      description: improving
        ? `Metric has moved ${Math.abs(Math.round(delta))} ${direction === "lower_is_better" ? "seconds faster" : "units higher"} across ${sorted.length} samples.`
        : delta === 0
          ? "Performance has held steady over the sample window."
          : "Recent trend is flat or regressing — projection assumes conservative improvement.",
    });
  } else {
    factors.push({
      label: "Limited history",
      impact: "neutral",
      description: `Only ${sorted.length} data point${sorted.length === 1 ? "" : "s"} available — projection uses conservative defaults.`,
    });
  }

  if (recencyDays > 30) {
    factors.push({
      label: "Stale data",
      impact: "negative",
      description: `Last recorded value was ${Math.round(recencyDays)} days ago — confidence is reduced.`,
    });
  } else if (recencyDays <= 14) {
    factors.push({
      label: "Recent activity",
      impact: "positive",
      description: "Fresh data within the last two weeks improves projection accuracy.",
    });
  }

  const confidence = confidenceFromSamples(sorted.length, minSamples, idealSamples, recencyDays);

  return {
    current,
    projected: Math.round(projected * 10) / 10,
    slopePerDay,
    confidence,
    factors,
  };
}

export function buildProjectionTimeline(
  history: TimeSeriesPoint[],
  projectedValue: number,
  horizonDays: number,
  now: Date,
): TimeSeriesPoint[] {
  const futureDate = new Date(now);
  futureDate.setDate(futureDate.getDate() + horizonDays);

  const midDate = new Date(now);
  midDate.setDate(midDate.getDate() + Math.round(horizonDays / 2));

  return [
    ...history,
    {
      date: midDate.toISOString(),
      label: format(midDate, "MMM d"),
      value: Math.round(
        history.length > 0
          ? (history.at(-1)!.value + projectedValue) / 2
          : projectedValue * 0.5,
      ),
      projected: true,
    },
    {
      date: futureDate.toISOString(),
      label: format(futureDate, "MMM d"),
      value: projectedValue,
      projected: true,
    },
  ];
}

import type { WorkoutSnapshot } from "@/services/athlete-intelligence/types";

export function extractWorkoutMaxWeightSeries(
  workouts: WorkoutSnapshot[],
  nameMatchers: string[],
): DatedValue[] {
  const byMonth = new Map<string, number>();

  for (const workout of workouts) {
    for (const ex of workout.exercises) {
      const name = ex.name.toLowerCase();
      if (!nameMatchers.some((m) => name.includes(m))) continue;
      const weight = ex.weightKg ?? 0;
      if (weight <= 0) continue;
      const key = format(workout.date, "yyyy-MM");
      byMonth.set(key, Math.max(byMonth.get(key) ?? 0, weight));
    }
  }

  return Array.from(byMonth.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => ({
      date: new Date(`${key}-01T12:00:00`),
      value,
    }));
}

export function estimateVo2From5k(seconds: number): number {
  const minutes = seconds / 60;
  if (minutes <= 0) return 0;
  return Math.round((22.351 * (5 / minutes) - 11.288) * 10) / 10;
}
