"use server";

import { getDepartmentSummary } from "@/app/actions/department";
import { requireUser } from "@/lib/auth";
import { getPrismaClient } from "@/lib/prisma";
import {
  getWeeklyWeaknessReport,
  toWeaknessOutput,
  type WeaknessDetectionOutput,
  type WeaknessReport,
} from "@/features/weakness-detection";

export type { WeaknessDetectionOutput } from "@/features/weakness-detection";

export async function getWeaknessReportForUser(): Promise<WeaknessReport | null> {
  const user = await requireUser();
  const prisma = getPrismaClient();
  if (!prisma) return null;

  const { activeView } = await getDepartmentSummary(user.id);
  return getWeeklyWeaknessReport(prisma, user.id, { sportView: activeView });
}

export async function getWeaknessDetectionOutput(): Promise<WeaknessDetectionOutput | null> {
  const report = await getWeaknessReportForUser();
  if (!report) return null;
  return toWeaknessOutput(report);
}
