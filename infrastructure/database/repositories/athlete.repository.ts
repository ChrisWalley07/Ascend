import type { PrismaClient } from "@prisma/client";

export async function findAthleteProfile(prisma: PrismaClient, userId: string) {
  return prisma.athleteProfile.findUnique({ where: { userId } });
}

export async function findAthleteScoreHistory(prisma: PrismaClient, userId: string, take = 30) {
  return prisma.athleteScore.findMany({
    where: { userId },
    orderBy: { date: "asc" },
    take,
  });
}

export async function findHyroxScoreHistory(prisma: PrismaClient, userId: string, take = 30) {
  return prisma.hyroxAthleteScore.findMany({
    where: { userId },
    orderBy: { date: "asc" },
    take,
  }).catch(() => []);
}
