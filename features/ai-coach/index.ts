import type { PrismaClient } from "@prisma/client";

import { collectCoachData } from "./collectors/coach-data-collector";
import { generateCoachReport } from "./engine";
import type { CoachEngineOptions, CoachReport } from "./types";

export async function getCoachReport(
  prisma: PrismaClient,
  userId: string,
  options: CoachEngineOptions = {},
): Promise<CoachReport | null> {
  const ctx = await collectCoachData(prisma, userId, options.sportView);
  if (!ctx) return null;
  return generateCoachReport(ctx);
}

export { collectCoachData } from "./collectors/coach-data-collector";
export { generateCoachReport } from "./engine";
export { COACH_SECTION_META, COACH_THRESHOLDS } from "./config";
export { getRulesForView } from "./rules";

export type {
  CoachReport,
  CoachRecommendation,
  CoachSection,
  CoachSectionId,
  CoachDataContext,
  CoachEngineOptions,
} from "./types";
