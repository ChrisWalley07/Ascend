import type { PrismaClient } from "@prisma/client";

import type { AchievementCategory } from "../types/category";
import { getAchievementRegistry } from "../registry";
import { runAchievementEngine } from "../engine/evaluate-engine";
import type { AchievementEngineResult } from "../engine/types";
import { resolveXpAward } from "../engine/xp";
import { collectAchievementMetrics } from "../collectors/metrics-collector";
import {
  loadPriorCompletedAchievements,
  persistNewlyCompletedAchievements,
  syncGamificationXp,
} from "../persistence/catalog-achievements";

export type EvaluateAthleteAchievementsInput = {
  userId: string;
  activeCategories: readonly AchievementCategory[];
  asOf?: Date;
};

export async function evaluateAndSyncAthleteAchievements(
  prisma: PrismaClient,
  input: EvaluateAthleteAchievementsInput,
): Promise<AchievementEngineResult> {
  const asOf = input.asOf ?? new Date();
  const [metrics, priorCompleted] = await Promise.all([
    collectAchievementMetrics(prisma, input.userId, asOf),
    loadPriorCompletedAchievements(prisma, input.userId),
  ]);

  const registry = getAchievementRegistry();
  const result = runAchievementEngine({
    definitions: registry.getAll(),
    context: {
      userId: input.userId,
      asOf,
      metrics,
      completedAchievementIds: new Set(priorCompleted.keys()),
      activeCategories: [...input.activeCategories],
    },
    options: { priorCompleted },
  });

  if (result.newlyCompleted.length > 0) {
    const evaluatedAt = asOf.toISOString();
    await persistNewlyCompletedAchievements(
      prisma,
      input.userId,
      result.newlyCompleted.map((achievementId) => {
        const definition = registry.getById(achievementId);
        const prior = priorCompleted.get(achievementId);
        const xp = definition
          ? resolveXpAward(definition, prior).awardedXp
          : 0;

        return {
          achievementId,
          completedAt: evaluatedAt,
          unlockedAt: prior?.unlockedAt ?? evaluatedAt,
          xpAwarded: xp,
        };
      }),
    );
  }

  const streakDays =
    typeof metrics.streak_days === "number" ? metrics.streak_days : 0;
  await syncGamificationXp(prisma, input.userId, result.earnedXp, streakDays);

  return result;
}

export function formatAchievementUnlockSummary(result: AchievementEngineResult): string | null {
  const unlocks = [...result.newlyCompleted, ...result.newlyUnlocked.filter(
    (id) => !result.newlyCompleted.includes(id),
  )];

  if (unlocks.length === 0) return null;

  const titles = unlocks
    .slice(0, 3)
    .map((id) => {
      const achievement = result.all.find((item) => item.id === id);
      return achievement?.title ?? id;
    });

  const suffix = unlocks.length > 3 ? ` (+${unlocks.length - 3} more)` : "";
  return `Achievement${unlocks.length === 1 ? "" : "s"} unlocked: ${titles.join(", ")}${suffix}`;
}
