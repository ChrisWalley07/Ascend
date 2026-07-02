import type { PrismaClient } from "@prisma/client";

import { isMissingSchemaError } from "@/lib/prisma/schema-compat";

import type { AchievementId } from "../types/ids";
import type { PriorCompletedAchievement } from "../engine/types";

export type StoredCatalogAchievement = PriorCompletedAchievement & {
  achievementId: AchievementId;
};

function catalogAchievements(prisma: PrismaClient) {
  return (
    prisma as PrismaClient & {
      athleteCatalogAchievement?: PrismaClient["athleteCatalogAchievement"];
    }
  ).athleteCatalogAchievement ?? null;
}

export async function loadPriorCompletedAchievements(
  prisma: PrismaClient,
  userId: string,
): Promise<Map<AchievementId, PriorCompletedAchievement>> {
  const catalog = catalogAchievements(prisma);
  if (!catalog) return new Map();

  try {
    const rows = await catalog.findMany({
      where: { userId },
      select: {
        achievementId: true,
        completedAt: true,
        unlockedAt: true,
        xpAwarded: true,
      },
    });

    return new Map(
      rows.map((row) => [
        row.achievementId as AchievementId,
        {
          completedAt: row.completedAt.toISOString(),
          unlockedAt: row.unlockedAt?.toISOString(),
          xpAwarded: row.xpAwarded,
        },
      ]),
    );
  } catch (error) {
    if (isMissingSchemaError(error)) return new Map();
    throw error;
  }
}

export async function persistNewlyCompletedAchievements(
  prisma: PrismaClient,
  userId: string,
  entries: readonly StoredCatalogAchievement[],
): Promise<void> {
  if (entries.length === 0) return;

  const catalog = catalogAchievements(prisma);
  if (!catalog) return;

  try {
    await prisma.$transaction(
      entries.map((entry) =>
        catalog.upsert({
          where: {
            userId_achievementId: {
              userId,
              achievementId: entry.achievementId,
            },
          },
          create: {
            userId,
            achievementId: entry.achievementId,
            completedAt: new Date(entry.completedAt),
            unlockedAt: entry.unlockedAt ? new Date(entry.unlockedAt) : new Date(entry.completedAt),
            xpAwarded: entry.xpAwarded,
          },
          update: {
            completedAt: new Date(entry.completedAt),
            unlockedAt: entry.unlockedAt ? new Date(entry.unlockedAt) : undefined,
            xpAwarded: entry.xpAwarded,
          },
        }),
      ),
    );
  } catch (error) {
    if (isMissingSchemaError(error)) return;
    throw error;
  }
}

export async function syncGamificationXp(
  prisma: PrismaClient,
  userId: string,
  earnedXp: number,
  streakDays: number,
): Promise<void> {
  try {
    await prisma.gamificationProfile.upsert({
      where: { userId },
      create: {
        userId,
        xp: earnedXp,
        streakDays,
        badges: [],
      },
      update: {
        xp: earnedXp,
        streakDays,
      },
    });
  } catch {
    // Gamification profile is optional enrichment.
  }
}
