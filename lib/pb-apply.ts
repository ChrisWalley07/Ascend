import type { PrismaClient } from "@prisma/client";

import type { WorkoutPbCandidate } from "@/lib/pb-auto-detect";
import { pbDisplayFromCandidate } from "@/lib/pb-auto-detect";
import { isPbImprovement } from "@/lib/pb-format";
import { ensurePbCatalogSeeded } from "@/lib/pb-seed";
import { isMissingSchemaError } from "@/lib/prisma/schema-compat";
import type { SportDepartment } from "@prisma/client";

export type AppliedPbUpdate = {
  slug: string;
  name: string;
  displayValue: string;
  improved: boolean;
};

export async function applyWorkoutPbCandidates(
  prisma: PrismaClient,
  userId: string,
  workoutId: string,
  workoutDate: Date,
  candidates: WorkoutPbCandidate[],
  workoutSport: SportDepartment = "CROSSFIT",
): Promise<{ count: number; updates: AppliedPbUpdate[] }> {
  if (candidates.length === 0) return { count: 0, updates: [] };

  await ensurePbCatalogSeeded(workoutSport === "HYROX" ? "hyrox" : "crossfit");

  const updates: AppliedPbUpdate[] = [];

  for (const candidate of candidates) {
    const definition = await prisma.pbDefinition.findUnique({
      where: { slug: candidate.slug },
    });
    if (!definition) continue;

    const defSport = definition.sport ?? "CROSSFIT";
    if (workoutSport === "HYROX" && defSport !== "HYROX") continue;
    if (workoutSport !== "HYROX" && defSport === "HYROX") continue;

    const displayValue = pbDisplayFromCandidate(candidate);

    const existing = await prisma.personalBest.findUnique({
      where: { userId_pbDefinitionId: { userId, pbDefinitionId: definition.id } },
    });

    const improved = isPbImprovement(
      candidate.value,
      existing?.value ?? null,
      definition.scoreDirection,
    );

    if (existing && !improved) continue;

    if (existing) {
      await prisma.personalBestHistory.create({
        data: {
          userId,
          personalBestId: existing.id,
          value: existing.value,
          displayValue: existing.displayValue,
          achievedAt: existing.achievedAt,
          notes: existing.notes,
        },
      });

      await prisma.personalBest.update({
        where: { id: existing.id },
        data: {
          value: candidate.value,
          displayValue,
          achievedAt: workoutDate,
          sourceWorkoutId: workoutId,
        },
      });
    } else {
      const createData = {
        userId,
        pbDefinitionId: definition.id,
        value: candidate.value,
        displayValue,
        achievedAt: workoutDate,
        sourceWorkoutId: workoutId,
        sport: defSport,
      };

      let created;
      try {
        created = await prisma.personalBest.create({ data: createData });
      } catch (error) {
        if (!isMissingSchemaError(error)) throw error;
        const { sport: _s, ...legacy } = createData;
        created = await prisma.personalBest.create({ data: legacy });
      }

      await prisma.personalBestHistory.create({
        data: {
          userId,
          personalBestId: created.id,
          value: candidate.value,
          displayValue,
          achievedAt: workoutDate,
        },
      });
    }

    updates.push({
      slug: definition.slug,
      name: definition.name,
      displayValue,
      improved: true,
    });
  }

  return { count: updates.length, updates };
}
