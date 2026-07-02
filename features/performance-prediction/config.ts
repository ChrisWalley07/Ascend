import type { PredictionMetricKey } from "./types";

export const METRIC_CONFIG: Record<
  PredictionMetricKey,
  {
    label: string;
    unit: string;
    defaultHorizonDays: number;
    minSamples: number;
    idealSamples: number;
  }
> = {
  hyrox_finish: {
    label: "Hyrox Finish Time",
    unit: "sec",
    defaultHorizonDays: 56,
    minSamples: 2,
    idealSamples: 5,
  },
  run_5k: {
    label: "5K Time",
    unit: "sec",
    defaultHorizonDays: 42,
    minSamples: 2,
    idealSamples: 6,
  },
  run_10k: {
    label: "10K Time",
    unit: "sec",
    defaultHorizonDays: 56,
    minSamples: 2,
    idealSamples: 5,
  },
  squat: {
    label: "Squat",
    unit: "kg",
    defaultHorizonDays: 84,
    minSamples: 2,
    idealSamples: 6,
  },
  deadlift: {
    label: "Deadlift",
    unit: "kg",
    defaultHorizonDays: 84,
    minSamples: 2,
    idealSamples: 6,
  },
  bench: {
    label: "Bench",
    unit: "kg",
    defaultHorizonDays: 84,
    minSamples: 2,
    idealSamples: 6,
  },
  vo2_estimate: {
    label: "VO2 Estimate",
    unit: "ml/kg/min",
    defaultHorizonDays: 42,
    minSamples: 2,
    idealSamples: 5,
  },
  engine_score: {
    label: "Engine Score",
    unit: "pts",
    defaultHorizonDays: 28,
    minSamples: 3,
    idealSamples: 10,
  },
  fitness_score: {
    label: "Fitness Score",
    unit: "pts",
    defaultHorizonDays: 28,
    minSamples: 3,
    idealSamples: 10,
  },
};

export const PB_SLUGS = {
  run5k: "run-5km",
  run10k: "run-10km",
  squat: "back-squat-1rm",
  deadlift: "deadlift-1rm",
  bench: "bench-press-1rm",
} as const;
