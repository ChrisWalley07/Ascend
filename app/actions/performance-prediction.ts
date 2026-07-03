"use server";

import { getDepartmentSummary } from "@/app/actions/department";
import { requireUser } from "@/lib/auth";
import { getPrismaClient } from "@/lib/prisma";
import {
  getPerformancePredictionReport,
  type PerformancePredictionReport,
} from "@/features/performance-prediction";

export async function getPerformancePredictionsForUser(): Promise<PerformancePredictionReport | null> {
  const user = await requireUser();
  const prisma = getPrismaClient();
  if (!prisma) return null;

  try {
    const { activeView } = await getDepartmentSummary(user.id);
    return await getPerformancePredictionReport(prisma, user.id, { sportView: activeView });
  } catch (error) {
    console.error("[predictions] load failed", error);
    return null;
  }
}
