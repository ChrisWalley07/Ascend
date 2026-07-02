import type { PrismaClient } from "@prisma/client";

import type { SportView } from "@/domain/models/sport";
import { analyzeAthleteIntelligence, collectIntelligenceData } from "@/services/athlete-intelligence";
import type { AthleteIntelligenceReport, IntelligenceRawData } from "@/services/athlete-intelligence/types";
import { acuteChronicLoad, averageRpe } from "@/services/athlete-intelligence/utils/workout-metrics";
import { DEFAULT_INTELLIGENCE_CONFIG } from "@/services/athlete-intelligence/config";

import type { RecoveryReadinessOptions } from "../types";

export type RecoveryReadinessContext = {
  sportView: SportView;
  collectedAt: Date;
  raw: IntelligenceRawData;
  intelligence: AthleteIntelligenceReport;
  acuteLoad: number;
  chronicLoad: number;
  acwr: number;
  avgRpe: number;
};

export async function collectRecoveryReadinessContext(
  prisma: PrismaClient,
  userId: string,
  options: RecoveryReadinessOptions = {},
): Promise<RecoveryReadinessContext | null> {
  const raw = await collectIntelligenceData(prisma, userId, { sportView: options.sportView });
  if (!raw) return null;

  const intelligence = analyzeAthleteIntelligence(raw);
  const thresholds = DEFAULT_INTELLIGENCE_CONFIG.thresholds;
  const now = new Date();

  const { acute, chronic, acwr } = acuteChronicLoad(
    raw.workouts,
    now,
    thresholds.acuteLoadDays,
    thresholds.chronicLoadDays,
    thresholds.defaultRpe,
  );

  const recentWorkouts = raw.workouts.filter((w) => {
    const cutoff = new Date(now);
    cutoff.setDate(cutoff.getDate() - thresholds.acuteLoadDays);
    return w.date >= cutoff;
  });

  return {
    sportView: raw.sportView,
    collectedAt: now,
    raw,
    intelligence,
    acuteLoad: acute,
    chronicLoad: chronic,
    acwr,
    avgRpe: averageRpe(recentWorkouts, thresholds.defaultRpe),
  };
}
