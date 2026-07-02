import type { PrismaClient } from "@prisma/client";

export async function findActiveGoals(prisma: PrismaClient, userId: string, take = 3) {
  return prisma.goal.findMany({
    where: { userId, status: "ACTIVE" },
    take,
    orderBy: { createdAt: "desc" },
  });
}
