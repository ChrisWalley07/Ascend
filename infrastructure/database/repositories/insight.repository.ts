import type { PrismaClient } from "@prisma/client";

export async function findRecentInsights(prisma: PrismaClient, userId: string, take = 3) {
  return prisma.aIInsight.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take,
  });
}
