import type { PrismaClient } from "@prisma/client";
import { subDays } from "date-fns";

import { pbRecordWhereForView } from "@/lib/pb-seed";
import { isMissingSchemaError } from "@/lib/prisma/schema-compat";
import type { SportView } from "@/domain/models/sport";
import { DATE_WINDOWS } from "@/shared/constants/date-windows";

export async function countRecentPersonalBests(
  prisma: PrismaClient,
  userId: string,
  view: SportView,
) {
  const pbWhere = pbRecordWhereForView(view);
  return prisma.personalBest.count({
    where: {
      userId,
      ...pbWhere,
      updatedAt: { gte: subDays(new Date(), DATE_WINDOWS.month) },
    },
  });
}

export async function findPersonalRecordHistory(prisma: PrismaClient, userId: string) {
  try {
    const records = await prisma.personalRecord.findMany({
      where: { userId },
      select: { achievedAt: true },
      orderBy: { achievedAt: "asc" },
    });
    if (records.length > 0) return records;
  } catch (error) {
    if (!isMissingSchemaError(error)) {
      console.error("[analytics] personalRecord history failed", error);
    }
  }

  try {
    return await prisma.personalBest.findMany({
      where: { userId },
      select: { achievedAt: true },
      orderBy: { achievedAt: "asc" },
    });
  } catch (error) {
    console.error("[analytics] personalBest history failed", error);
    return [];
  }
}
