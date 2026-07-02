export {
  analyzeRaceSplits,
  predictFinishFromSessions,
  type RacePrediction,
  type RaceSplitInput,
} from "@/lib/hyrox/predictor";

export {
  getPerformancePredictionReport,
  analyzePerformancePredictions,
  collectPredictionContext,
  PREDICTION_MODELS,
  METRIC_CONFIG,
  formatMetricValue,
  horizonLabel,
} from "@/features/performance-prediction";

export type {
  PerformancePredictionReport,
  PerformancePrediction,
  PerformancePredictionOptions,
  PredictionMetricKey,
  PredictionFactor,
  TimeSeriesPoint,
  PredictionDirection,
} from "@/features/performance-prediction";
