import type { PrismaClient } from "@prisma/client";

import { HYROX_BENCHMARKS } from "@/lib/hyrox/catalog";

export async function ensureHyroxBenchmarks(prisma: PrismaClient) {
  try {
    const existing = await prisma.benchmark.count({ where: { sport: "HYROX" } });
    if (existing > 0) return;

    await prisma.benchmark.createMany({
      data: HYROX_BENCHMARKS.map((b) => ({
        name: b.name,
        type: "CUSTOM",
        sport: "HYROX",
        description: b.description,
        scoringMode: "LOWER_IS_BETTER",
        scoreUnit: b.scoreUnit,
      })),
      skipDuplicates: true,
    });
  } catch {
    // sport column not migrated yet — benchmarks seed skipped
  }
}
