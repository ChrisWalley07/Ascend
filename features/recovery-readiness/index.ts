import type { PrismaClient } from "@prisma/client";

import { collectRecoveryReadinessContext } from "./collectors/data-collector";
import { analyzeRecoveryReadiness } from "./engine";
import type { RecoveryReadinessOptions, RecoveryReadinessReport } from "./types";

export async function getRecoveryReadinessReport(
  prisma: PrismaClient,
  userId: string,
  options: RecoveryReadinessOptions = {},
): Promise<RecoveryReadinessReport | null> {
  const ctx = await collectRecoveryReadinessContext(prisma, userId, options);
  if (!ctx) return null;
  return analyzeRecoveryReadiness(ctx);
}

export { analyzeRecoveryReadiness } from "./engine";
export { collectRecoveryReadinessContext } from "./collectors/data-collector";
export {
  READINESS_THRESHOLDS,
  TRAINING_RECOMMENDATIONS,
  ZONE_COLORS,
  zoneForAcwr,
  zoneForFatigue,
  zoneForHigherIsBetter,
} from "./config";

export type {
  RecoveryReadinessReport,
  RecoveryReadinessOptions,
  ReadinessZone,
  ScoreExplanation,
  ScoreKey,
  TrainingRecommendation,
} from "./types";
