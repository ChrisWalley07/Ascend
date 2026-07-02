import { revalidatePath } from "next/cache";

import { syncAchievementsForUser } from "@/app/actions/achievements";
import { formatAchievementUnlockSummary } from "@/features/athlete-achievements/services/evaluate-and-sync";
import { getPrismaClient } from "@/lib/prisma";

export async function syncAchievementsAfterActivity(userId: string): Promise<string | null> {
  const prisma = getPrismaClient();
  if (!prisma) return null;

  const result = await syncAchievementsForUser(userId);
  if (!result) return null;

  revalidatePath("/achievements");
  revalidatePath("/dashboard");

  return formatAchievementUnlockSummary(result);
}

export function appendAchievementMessage(
  baseMessage: string,
  achievementMessage: string | null,
): string {
  if (!achievementMessage) return baseMessage;
  return `${baseMessage} ${achievementMessage}`;
}
