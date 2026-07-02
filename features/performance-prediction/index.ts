import { collectPredictionContext } from "./collectors/data-collector";
import { PREDICTION_MODELS } from "./models/registry";
import type { PerformancePredictionOptions, PerformancePredictionReport } from "./types";

export function analyzePerformancePredictions(
  ctx: NonNullable<Awaited<ReturnType<typeof collectPredictionContext>>>,
): PerformancePredictionReport {
  const predictions = PREDICTION_MODELS.map((model) => model.predict(ctx)).filter(
    (prediction): prediction is NonNullable<typeof prediction> => prediction != null,
  );

  return {
    generatedAt: ctx.collectedAt.toISOString(),
    sportView: ctx.sportView,
    predictions: predictions.sort((a, b) => b.confidence - a.confidence),
  };
}

export async function getPerformancePredictionReport(
  prisma: import("@prisma/client").PrismaClient,
  userId: string,
  options: PerformancePredictionOptions = {},
): Promise<PerformancePredictionReport | null> {
  const ctx = await collectPredictionContext(prisma, userId, options);
  if (!ctx) return null;
  return analyzePerformancePredictions(ctx);
}

export { PREDICTION_MODELS } from "./models/registry";
export { collectPredictionContext } from "./collectors/data-collector";
export { METRIC_CONFIG, PB_SLUGS } from "./config";
export { formatMetricValue, horizonLabel } from "./utils/format";

export type {
  PerformancePredictionReport,
  PerformancePrediction,
  PerformancePredictionOptions,
  PredictionMetricKey,
  PredictionFactor,
  TimeSeriesPoint,
  PredictionDirection,
} from "./types";
