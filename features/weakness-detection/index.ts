import type { PrismaClient } from "@prisma/client";

import { collectWeeklyWeaknessContext } from "./collectors/weekly-collector";
import { analyzeWeeklyWeaknesses } from "./engine";
import type { WeaknessEngineOptions, WeaknessReport } from "./types";

export async function getWeeklyWeaknessReport(
  prisma: PrismaClient,
  userId: string,
  options: WeaknessEngineOptions = {},
): Promise<WeaknessReport | null> {
  const ctx = await collectWeeklyWeaknessContext(prisma, userId, options);
  if (!ctx) return null;
  return analyzeWeeklyWeaknesses(ctx);
}

export { analyzeWeeklyWeaknesses } from "./engine";
export { collectWeeklyWeaknessContext, weekLabel } from "./collectors/weekly-collector";
export {
  mapCrossfitToAttributes,
  mapHyroxToAttributes,
} from "./attributes/map-scores";
export {
  ATTRIBUTE_LABELS,
  ATTRIBUTE_ORDER,
  ICON_BY_ATTRIBUTE,
  RECOMMENDATIONS,
} from "./config";

export type {
  WeaknessReport,
  WeaknessItem,
  WeaknessAttributeCategory,
  WeaknessSeverity,
  AttributeSnapshot,
  PriorityItem,
  WeeklyWeaknessContext,
  WeaknessEngineOptions,
} from "./types";

export type WeaknessDetectionOutput = {
  weaknesses: Array<{
    category: string;
    severity: string;
    confidence: number;
    recommendation: string;
  }>;
  strongestAttribute: string;
  weakestAttribute: string;
  mostImproved: string;
  mostRegressed: string;
  priorityList: string[];
};

export function toWeaknessOutput(report: WeaknessReport): WeaknessDetectionOutput {
  return {
    weaknesses: report.weaknesses.map((item) => ({
      category: item.category,
      severity: item.severity,
      confidence: item.confidence,
      recommendation: item.recommendation,
    })),
    strongestAttribute: report.strongestAttribute,
    weakestAttribute: report.weakestAttribute,
    mostImproved: report.mostImproved,
    mostRegressed: report.mostRegressed,
    priorityList: report.priorityList.map((item) => item.category),
  };
}
