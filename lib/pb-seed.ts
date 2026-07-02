import type { SportDepartment } from "@prisma/client";

import { HYROX_PB_CATALOG } from "@/lib/hyrox/pb-catalog";
import { PB_CATALOG } from "@/lib/pb-catalog";
import { getPrismaClient } from "@/lib/prisma";
import { isMissingSchemaError } from "@/lib/prisma/schema-compat";
import type { SportView } from "@/lib/sports/types";

export function sportFromView(view: SportView): SportDepartment {
  return view === "hyrox" ? "HYROX" : "CROSSFIT";
}

export function pbDefinitionWhereForView(
  view: SportView,
): { sport: SportDepartment } | { OR: ({ sport: SportDepartment | null })[] } {
  if (view === "hyrox") return { sport: "HYROX" };
  return { OR: [{ sport: "CROSSFIT" }, { sport: null }] };
}

export function pbRecordWhereForView(
  view: SportView,
): { sport: SportDepartment } | { OR: ({ sport: SportDepartment })[] } {
  if (view === "hyrox") return { sport: "HYROX" };
  return { OR: [{ sport: "CROSSFIT" }] };
}

function stripSportField<T extends { sport?: SportDepartment | null }>(data: T) {
  const { sport: _sport, ...legacy } = data;
  return legacy;
}

async function countDefinitionsForSport(sport: SportDepartment | null): Promise<number> {
  const prisma = getPrismaClient();
  if (!prisma) return 0;

  try {
    if (sport === "HYROX") {
      return prisma.pbDefinition.count({ where: { sport: "HYROX" } });
    }
    return prisma.pbDefinition.count({
      where: { OR: [{ sport: "CROSSFIT" }, { sport: null }] },
    });
  } catch (error) {
    if (!isMissingSchemaError(error)) throw error;
    if (sport === "HYROX") {
      return prisma.pbDefinition.count({ where: { slug: { startsWith: "hyrox-" } } });
    }
    return prisma.pbDefinition.count({ where: { NOT: { slug: { startsWith: "hyrox-" } } } });
  }
}

async function upsertCatalog(
  sport: SportDepartment | null,
  entries: typeof PB_CATALOG,
) {
  const prisma = getPrismaClient();
  if (!prisma) return false;

  const existing = await countDefinitionsForSport(sport);
  if (existing >= entries.length) return true;

  for (const entry of entries) {
    const data = {
      slug: entry.slug,
      name: entry.name,
      category: entry.category,
      sport: entry.sport ?? sport,
      subcategory: entry.subcategory,
      unit: entry.unit,
      recordType: entry.recordType,
      scoreDirection: entry.scoreDirection,
      isCore: entry.isCore,
      sortOrder: entry.sortOrder,
      description: entry.description,
    };

    try {
      await prisma.pbDefinition.upsert({
        where: { slug: entry.slug },
        create: data,
        update: {
          name: data.name,
          category: data.category,
          sport: data.sport,
          subcategory: data.subcategory,
          unit: data.unit,
          recordType: data.recordType,
          scoreDirection: data.scoreDirection,
          isCore: data.isCore,
          sortOrder: data.sortOrder,
          description: data.description,
        },
      });
    } catch (error) {
      if (!isMissingSchemaError(error)) throw error;
      const legacyData = stripSportField(data);
      await prisma.pbDefinition.upsert({
        where: { slug: entry.slug },
        create: legacyData,
        update: {
          name: legacyData.name,
          category: legacyData.category,
          subcategory: legacyData.subcategory,
          unit: legacyData.unit,
          recordType: legacyData.recordType,
          scoreDirection: legacyData.scoreDirection,
          isCore: legacyData.isCore,
          sortOrder: legacyData.sortOrder,
          description: legacyData.description,
        },
      });
    }
  }

  return true;
}

export async function ensurePbCatalogSeeded(view: SportView = "crossfit") {
  if (view === "hyrox") {
    return upsertCatalog("HYROX", HYROX_PB_CATALOG);
  }
  return upsertCatalog(null, PB_CATALOG);
}

export async function ensureAllPbCatalogsSeeded() {
  await ensurePbCatalogSeeded("crossfit");
  await ensurePbCatalogSeeded("hyrox");
}
