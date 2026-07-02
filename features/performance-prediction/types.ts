import type { SportView } from "@/domain/models/sport";

export type PredictionMetricKey =
  | "hyrox_finish"
  | "run_5k"
  | "run_10k"
  | "squat"
  | "deadlift"
  | "bench"
  | "vo2_estimate"
  | "engine_score"
  | "fitness_score";

export type PredictionDirection = "lower_is_better" | "higher_is_better";

export type TimeSeriesPoint = {
  date: string;
  label: string;
  value: number;
  projected?: boolean;
};

export type PredictionFactor = {
  label: string;
  impact: "positive" | "negative" | "neutral";
  description: string;
};

export type PerformancePrediction = {
  key: PredictionMetricKey;
  label: string;
  unit: string;
  direction: PredictionDirection;
  current: number | null;
  currentDisplay: string;
  projected: number | null;
  projectedDisplay: string;
  horizonDays: number;
  horizonLabel: string;
  confidence: number;
  supported: boolean;
  factors: PredictionFactor[];
  history: TimeSeriesPoint[];
  projectionTimeline: TimeSeriesPoint[];
};

export type PerformancePredictionReport = {
  generatedAt: string;
  sportView: SportView;
  predictions: PerformancePrediction[];
};

export type PerformancePredictionOptions = {
  sportView?: SportView;
};

export type DatedValue = {
  date: Date;
  value: number;
};

export type TrendProjection = {
  current: number;
  projected: number;
  slopePerDay: number;
  confidence: number;
  factors: PredictionFactor[];
};
