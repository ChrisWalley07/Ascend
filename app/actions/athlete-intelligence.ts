"use server";

import { getDepartmentSummary } from "@/app/actions/department";
import { requireUser } from "@/lib/auth";
import { getPrismaClient } from "@/lib/prisma";
import { generateAthleteIntelligence } from "@/features/intelligence";
import type { AthleteIntelligenceReport, IntelligenceEngineOptions } from "@/features/intelligence";

export async function getAthleteIntelligenceReport(
  options: IntelligenceEngineOptions = {},
): Promise<AthleteIntelligenceReport | null> {
  const user = await requireUser();
  const prisma = getPrismaClient();
  if (!prisma) return null;

  const { activeView } = await getDepartmentSummary(user.id);
  return generateAthleteIntelligence(prisma, user.id, {
    ...options,
    sportView: options.sportView ?? activeView,
  });
}
