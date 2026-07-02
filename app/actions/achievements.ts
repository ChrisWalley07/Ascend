"use server";

import { revalidatePath } from "next/cache";

import { getDepartmentSummary } from "@/app/actions/department";
import {
  calculateXpProgressionFromAchievements,
  type AchievementEngineResult,
} from "@/features/athlete-achievements";
import { evaluateAndSyncAthleteAchievements } from "@/features/athlete-achievements/services/evaluate-and-sync";
import type { AchievementCategory } from "@/features/athlete-achievements/types/category";
import type { XpPlayerProgress } from "@/features/athlete-achievements/xp";
import { requireUser } from "@/lib/auth";
import { getPrismaClient } from "@/lib/prisma";

export type AchievementPageData = {
  result: AchievementEngineResult;
  xpProgress: XpPlayerProgress;
};

function resolveActiveCategories(
  activeView: "crossfit" | "hyrox",
): readonly AchievementCategory[] {
  return activeView === "hyrox"
    ? (["hyrox", "running"] as const)
    : (["crossfit", "running", "weightlifting"] as const);
}

export async function syncAchievementsForUser(
  userId: string,
  activeView?: "crossfit" | "hyrox",
): Promise<AchievementEngineResult | null> {
  const prisma = getPrismaClient();
  if (!prisma) return null;

  const view =
    activeView ??
    (await getDepartmentSummary(userId).then((summary) => summary.activeView)) ??
    "crossfit";

  return evaluateAndSyncAthleteAchievements(prisma, {
    userId,
    activeCategories: resolveActiveCategories(view),
  });
}

export async function getAchievementPageData(): Promise<AchievementPageData> {
  const user = await requireUser();
  const { activeView } = await getDepartmentSummary(user.id);
  const result =
    (await syncAchievementsForUser(user.id, activeView)) ??
    ({
      evaluatedAt: new Date().toISOString(),
      userId: user.id,
      completionPercent: 0,
      earnedXp: 0,
      locked: [],
      available: [],
      completed: [],
      nextAchievements: [],
      newlyCompleted: [],
      newlyUnlocked: [],
      newlyEarnedXp: 0,
      all: [],
    } satisfies AchievementEngineResult);

  const xpProgress = calculateXpProgressionFromAchievements(result.earnedXp);

  return { result, xpProgress };
}

export async function refreshAchievementsAction(): Promise<{ error?: string }> {
  const user = await requireUser();
  const prisma = getPrismaClient();
  if (!prisma) return { error: "Database not configured." };

  await syncAchievementsForUser(user.id);
  revalidatePath("/achievements");
  revalidatePath("/dashboard");
  revalidatePath("/profile");
  return {};
}
