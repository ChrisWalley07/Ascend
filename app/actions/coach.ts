"use server";

import { revalidatePath } from "next/cache";

import { getDepartmentSummary } from "@/app/actions/department";
import { requireUser } from "@/lib/auth";
import { getPrismaClient } from "@/lib/prisma";
import { getCoachReport, type CoachReport } from "@/features/ai-coach";

export async function getCoachReportForUser(): Promise<CoachReport | null> {
  const user = await requireUser();
  const prisma = getPrismaClient();
  if (!prisma) return null;

  const { activeView } = await getDepartmentSummary(user.id);
  return getCoachReport(prisma, user.id, { sportView: activeView });
}

export async function refreshCoachReportAction() {
  const user = await requireUser();
  void user;
  revalidatePath("/coach");
  revalidatePath("/dashboard");
}
