"use server";

import { revalidatePath } from "next/cache";
import type { PbCategory, PbRecordType, ScoreDirection, SportDepartment } from "@prisma/client";

import { requireUser } from "@/lib/auth";
import {
  formatDisplayValue,
  isPbImprovement,
  parsePbInput,
} from "@/lib/pb-format";
import {
  ensurePbCatalogSeeded,
  pbDefinitionWhereForView,
  pbRecordWhereForView,
  sportFromView,
} from "@/lib/pb-seed";
import { getPrismaClient } from "@/lib/prisma";
import { isMissingSchemaError } from "@/lib/prisma/schema-compat";
import {
  appendAchievementMessage,
  syncAchievementsAfterActivity,
} from "@/lib/achievements/sync-after-activity";
import type { SportView } from "@/lib/sports/types";

type ActionResult = { error?: string; success?: string };

export type PbBoardItem = {
  definitionId: string;
  slug: string;
  name: string;
  category: PbCategory;
  subcategory: string | null;
  unit: string;
  recordType: PbRecordType;
  scoreDirection: ScoreDirection;
  isCore: boolean;
  sortOrder: number;
  description: string | null;
  current: {
    id: string;
    value: number;
    displayValue: string;
    achievedAt: string;
    notes: string | null;
    sourceWorkoutId: string | null;
  } | null;
};

function resolvePbSport(
  definitionSport: SportDepartment | null | undefined,
  view: SportView,
): SportDepartment {
  return definitionSport ?? sportFromView(view);
}

export async function getPersonalBestBoard(
  userId: string,
  view: SportView = "crossfit",
): Promise<{
  items: PbBoardItem[];
  stats: { totalLogged: number; coreLogged: number; coreTotal: number; recentCount: number };
  view: SportView;
}> {
  const prisma = getPrismaClient();
  if (!prisma) {
    return {
      items: [],
      stats: { totalLogged: 0, coreLogged: 0, coreTotal: 0, recentCount: 0 },
      view,
    };
  }

  await ensurePbCatalogSeeded(view);

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const defWhere = pbDefinitionWhereForView(view);
  const recordWhere = pbRecordWhereForView(view);

  let definitions;
  let personalBests;
  let recentCount;

  try {
    [definitions, personalBests, recentCount] = await Promise.all([
      prisma.pbDefinition.findMany({
        where: defWhere,
        orderBy: [{ category: "asc" }, { sortOrder: "asc" }],
      }),
      prisma.personalBest.findMany({
        where: { userId, ...recordWhere },
        include: { pbDefinition: { select: { isCore: true, sport: true } } },
      }),
      prisma.personalBest.count({
        where: { userId, ...recordWhere, updatedAt: { gte: thirtyDaysAgo } },
      }),
    ]);
  } catch (error) {
    if (!isMissingSchemaError(error)) throw error;
    definitions = await prisma.pbDefinition.findMany({
      where: view === "hyrox" ? { slug: { startsWith: "hyrox-" } } : { NOT: { slug: { startsWith: "hyrox-" } } },
      orderBy: [{ category: "asc" }, { sortOrder: "asc" }],
    });
    personalBests = await prisma.personalBest.findMany({
      where: {
        userId,
        pbDefinitionId: { in: definitions.map((d) => d.id) },
      },
      include: { pbDefinition: { select: { isCore: true, sport: true } } },
    });
    recentCount = await prisma.personalBest.count({
      where: {
        userId,
        pbDefinitionId: { in: definitions.map((d) => d.id) },
        updatedAt: { gte: thirtyDaysAgo },
      },
    });
  }

  const bestByDefId = new Map(personalBests.map((pb) => [pb.pbDefinitionId, pb]));

  const items: PbBoardItem[] = definitions.map((def) => {
    const current = bestByDefId.get(def.id);
    return {
      definitionId: def.id,
      slug: def.slug,
      name: def.name,
      category: def.category,
      subcategory: def.subcategory,
      unit: def.unit,
      recordType: def.recordType,
      scoreDirection: def.scoreDirection,
      isCore: def.isCore,
      sortOrder: def.sortOrder,
      description: def.description,
      current: current
        ? {
            id: current.id,
            value: current.value,
            displayValue: current.displayValue,
            achievedAt: current.achievedAt.toISOString(),
            notes: current.notes,
            sourceWorkoutId: current.sourceWorkoutId,
          }
        : null,
    };
  });

  const coreTotal = definitions.filter((d) => d.isCore).length;
  const coreLogged = personalBests.filter((pb) => pb.pbDefinition.isCore).length;

  return {
    items,
    view,
    stats: {
      totalLogged: personalBests.length,
      coreLogged,
      coreTotal,
      recentCount,
    },
  };
}

export async function getRecentPersonalBests(
  userId: string,
  limit = 5,
  view: SportView = "crossfit",
) {
  const prisma = getPrismaClient();
  if (!prisma) return [];

  await ensurePbCatalogSeeded(view);

  const recordWhere = pbRecordWhereForView(view);
  const defWhere = pbDefinitionWhereForView(view);

  let rows;
  try {
    rows = await prisma.personalBest.findMany({
      where: { userId, ...recordWhere },
      orderBy: { updatedAt: "desc" },
      take: limit,
      include: {
        pbDefinition: {
          select: { name: true, category: true, isCore: true, recordType: true },
        },
      },
    });
  } catch (error) {
    if (!isMissingSchemaError(error)) throw error;
    const definitions = await prisma.pbDefinition.findMany({
      where: view === "hyrox" ? { slug: { startsWith: "hyrox-" } } : { NOT: { slug: { startsWith: "hyrox-" } } },
      select: { id: true },
    });
    rows = await prisma.personalBest.findMany({
      where: { userId, pbDefinitionId: { in: definitions.map((d) => d.id) } },
      orderBy: { updatedAt: "desc" },
      take: limit,
      include: {
        pbDefinition: {
          select: { name: true, category: true, isCore: true, recordType: true },
        },
      },
    });
  }

  // Exclude crossfit PBs if sport filter failed open
  if (rows.length && view === "hyrox") {
    const hyroxDefIds = new Set(
      (
        await prisma.pbDefinition.findMany({
          where: defWhere,
          select: { id: true },
        })
      ).map((d) => d.id),
    );
    rows = rows.filter((r) => hyroxDefIds.has(r.pbDefinitionId));
  }

  return rows.map((row) => ({
    id: row.id,
    name: row.pbDefinition.name,
    category: row.pbDefinition.category,
    isCore: row.pbDefinition.isCore,
    displayValue: row.displayValue,
    achievedAt: row.achievedAt.toISOString(),
  }));
}

export async function logPersonalBestAction(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  try {
    const user = await requireUser();
    const prisma = getPrismaClient();
    if (!prisma) return { error: "Database not configured. Check your Supabase connection." };

    const view = (String(formData.get("sportView") ?? "crossfit") as SportView) || "crossfit";
    await ensurePbCatalogSeeded(view);

    const pbDefinitionId = String(formData.get("pbDefinitionId") ?? "");
    const rawValue = String(formData.get("value") ?? "");
    const notes = String(formData.get("notes") ?? "").trim() || undefined;
    const achievedAtRaw = String(formData.get("achievedAt") ?? "");

    if (!pbDefinitionId) return { error: "Select a PB to log" };

    const definition = await prisma.pbDefinition.findUnique({
      where: { id: pbDefinitionId },
    });
    if (!definition) return { error: "PB not found" };

    const pbSport = resolvePbSport(definition.sport, view);

    const parsed =
      definition.recordType === "MILESTONE"
        ? { value: 1, displayValue: "Achieved ✓" }
        : parsePbInput(rawValue, definition.recordType);

    if ("error" in parsed) return { error: parsed.error };

    const achievedAt = achievedAtRaw ? new Date(achievedAtRaw) : new Date();
    if (Number.isNaN(achievedAt.getTime())) {
      return { error: "Invalid date" };
    }

    const displayValue =
      definition.recordType === "MILESTONE"
        ? "Achieved ✓"
        : parsed.displayValue ||
          formatDisplayValue(parsed.value, definition.recordType, definition.unit);

    const existing = await prisma.personalBest.findUnique({
      where: { userId_pbDefinitionId: { userId: user.id, pbDefinitionId } },
    });

    const improved = isPbImprovement(
      parsed.value,
      existing?.value ?? null,
      definition.scoreDirection,
    );

    const createData = {
      userId: user.id,
      pbDefinitionId,
      value: parsed.value,
      displayValue,
      achievedAt,
      notes,
      sport: pbSport,
    };

    if (existing && !improved) {
      await prisma.personalBestHistory.create({
        data: {
          userId: user.id,
          personalBestId: existing.id,
          value: parsed.value,
          displayValue,
          achievedAt,
          notes,
        },
      });
      return {
        success: `Logged attempt (${displayValue}) — current PB remains ${existing.displayValue}`,
      };
    }

    if (existing) {
      await prisma.personalBestHistory.create({
        data: {
          userId: user.id,
          personalBestId: existing.id,
          value: existing.value,
          displayValue: existing.displayValue,
          achievedAt: existing.achievedAt,
          notes: existing.notes,
        },
      });

      try {
        await prisma.personalBest.update({
          where: { id: existing.id },
          data: { value: parsed.value, displayValue, achievedAt, notes, sport: pbSport },
        });
      } catch (error) {
        if (!isMissingSchemaError(error)) throw error;
        await prisma.personalBest.update({
          where: { id: existing.id },
          data: { value: parsed.value, displayValue, achievedAt, notes },
        });
      }

      revalidatePath("/pbs");
      revalidatePath("/dashboard");
      const achievementMessage = await syncAchievementsAfterActivity(user.id);
      return {
        success: appendAchievementMessage(
          `New PB! ${definition.name}: ${displayValue}`,
          achievementMessage,
        ),
      };
    }

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
        userId: user.id,
        personalBestId: created.id,
        value: parsed.value,
        displayValue,
        achievedAt,
        notes,
      },
    });

    revalidatePath("/pbs");
    revalidatePath("/dashboard");
    const achievementMessage = await syncAchievementsAfterActivity(user.id);
    return {
      success: appendAchievementMessage(
        `PB logged! ${definition.name}: ${displayValue}`,
        achievementMessage,
      ),
    };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Failed to log PB" };
  }
}

export async function createCustomPbAction(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  try {
    await requireUser();
    const prisma = getPrismaClient();
    if (!prisma) return { error: "Database not configured." };

    const view = (String(formData.get("sportView") ?? "crossfit") as SportView) || "crossfit";
    const pbSport = sportFromView(view);

    const name = String(formData.get("name") ?? "").trim();
    const unit = String(formData.get("unit") ?? "score").trim() || "score";
    const recordType = String(formData.get("recordType") ?? "SCORE") as PbRecordType;
    const scoreDirection = String(formData.get("scoreDirection") ?? "HIGHER_IS_BETTER") as ScoreDirection;

    if (!name) return { error: "Name is required" };

    const slug =
      `${view === "hyrox" ? "hyrox-custom" : "custom"}-${name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")}-${Date.now().toString(36)}`;

    const maxOrder = await prisma.pbDefinition.aggregate({
      where: { category: "CUSTOM", ...pbDefinitionWhereForView(view) },
      _max: { sortOrder: true },
    });

    const baseData = {
      slug,
      name,
      category: "CUSTOM" as const,
      unit,
      recordType,
      scoreDirection,
      isCore: false,
      sortOrder: (maxOrder._max.sortOrder ?? 2000) + 1,
      description: view === "hyrox" ? "Custom Hyrox PB" : "Custom PB",
    };

    try {
      await prisma.pbDefinition.create({
        data: { ...baseData, sport: pbSport },
      });
    } catch (error) {
      if (!isMissingSchemaError(error)) throw error;
      await prisma.pbDefinition.create({ data: baseData });
    }

    revalidatePath("/pbs");
    return { success: `Custom PB "${name}" created — log your first result below.` };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Failed to create custom PB" };
  }
}
