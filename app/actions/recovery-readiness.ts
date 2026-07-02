"use server";

import { getDepartmentSummary } from "@/app/actions/department";
import { requireUser } from "@/lib/auth";
import { getPrismaClient } from "@/lib/prisma";
import {
  getRecoveryReadinessReport,
  type RecoveryReadinessReport,
} from "@/features/recovery-readiness";

export async function getRecoveryReadinessForUser(): Promise<RecoveryReadinessReport | null> {
  const user = await requireUser();
  const prisma = getPrismaClient();
  if (!prisma) return null;

  const { activeView } = await getDepartmentSummary(user.id);
  return getRecoveryReadinessReport(prisma, user.id, { sportView: activeView });
}
