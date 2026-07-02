import type { PrismaClient } from "@prisma/client";
import { subDays } from "date-fns";

import { DATE_WINDOWS } from "@/shared/constants/date-windows";

export async function findHyroxRaces(prisma: PrismaClient, userId: string) {
  return prisma.hyroxRace
    .findMany({
      where: { userId },
      orderBy: { raceDate: "asc" },
      include: { splits: { orderBy: { sequence: "asc" } } },
    })
    .catch(() => []);
}

export async function findHyroxWorkoutsSince(
  prisma: PrismaClient,
  where: Record<string, unknown>,
) {
  return prisma.workout.findMany({
    where: { ...where, date: { gte: subDays(new Date(), DATE_WINDOWS.quarter) } },
    orderBy: { date: "asc" },
    select: { date: true, durationSeconds: true, rpe: true },
  });
}
