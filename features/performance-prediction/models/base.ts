import type { PerformancePrediction, PredictionMetricKey } from "../types";
import type { PredictionModelContext } from "../collectors/data-collector";

export type PredictionModel = {
  key: PredictionMetricKey;
  /** Return null to skip when insufficient data */
  predict: (ctx: PredictionModelContext) => PerformancePrediction | null;
};

export function buildPrediction(
  key: PredictionMetricKey,
  ctx: PredictionModelContext,
  parts: Omit<PerformancePrediction, "key" | "horizonLabel"> & { horizonDays: number },
): PerformancePrediction {
  const weeks = parts.horizonDays / 7;
  const horizonLabel =
    parts.horizonDays % 7 === 0
      ? `${weeks} week${weeks === 1 ? "" : "s"}`
      : `${parts.horizonDays} days`;

  return {
    key,
    horizonLabel,
    ...parts,
  };
}
