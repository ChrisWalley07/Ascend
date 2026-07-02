import type { PrismaClient, SportDepartment } from "@prisma/client";

import { isMissingSchemaError } from "@/lib/prisma/schema-compat";

export type SportProfileRow = {
  sportDepartment: SportDepartment | null;
  activeSportView: SportDepartment | null;
};

export async function loadSportProfile(
  prisma: PrismaClient,
  userId: string,
): Promise<SportProfileRow | null> {
  try {
    return await prisma.athleteProfile.findUnique({
      where: { userId },
      select: { sportDepartment: true, activeSportView: true },
    });
  } catch (error) {
    if (!isMissingSchemaError(error)) throw error;

    const legacy = await prisma.athleteProfile.findUnique({
      where: { userId },
      select: { sportDepartment: true },
    });
    if (!legacy) return null;

    return {
      sportDepartment: legacy.sportDepartment,
      activeSportView: null,
    };
  }
}
