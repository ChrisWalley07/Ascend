import type { PrismaClient } from "@prisma/client";
import { subDays } from "date-fns";

import type { SportView } from "@/domain/models/sport";
import { resolveActiveView } from "@/domain/models/sport";
import { analyzeAthleteIntelligence, collectIntelligenceData } from "@/services/athlete-intelligence";
import type { AthleteIntelligenceReport, IntelligenceRawData } from "@/services/athlete-intelligence/types";
import { DATE_WINDOWS } from "@/shared/constants/date-windows";

import { PB_SLUGS } from "../config";
import type { DatedValue, PerformancePredictionOptions } from "../types";

export type PbHistoryPoint = {
  slug: string;
  value: number;
  achievedAt: Date;
};

export type PredictionModelContext = {
  sportView: SportView;
  collectedAt: Date;
  raw: IntelligenceRawData;
  intelligence: AthleteIntelligenceReport;
  crossfitScoreHistory: Array<{ date: Date; overallScore: number; engineScore: number }>;
  hyroxScoreHistory: Array<{ date: Date; overallScore: number; engineScore: number }>;
  pbHistory: PbHistoryPoint[];
};

export async function collectPredictionContext(
  prisma: PrismaClient,
  userId: string,
  options: PerformancePredictionOptions = {},
): Promise<PredictionModelContext | null> {
  const raw = await collectIntelligenceData(prisma, userId, { sportView: options.sportView });
  if (!raw) return null;

  const profile = await prisma.athleteProfile.findUnique({
    where: { userId },
    select: { sportDepartment: true, activeSportView: true },
  });

  const sportView =
    options.sportView ??
    resolveActiveView(profile?.sportDepartment ?? "CROSSFIT", profile?.activeSportView);

  const now = new Date();
  const windowStart = subDays(now, DATE_WINDOWS.quarter);

  const slugs = Object.values(PB_SLUGS);

  const [intelligence, crossfitScoreHistory, hyroxScoreHistory, pbDefinitions, pbRecords] =
    await Promise.all([
      Promise.resolve(analyzeAthleteIntelligence(raw)),
      prisma.athleteScore
        .findMany({
          where: { userId, date: { gte: windowStart } },
          orderBy: { date: "asc" },
          select: { date: true, overallScore: true, engineScore: true },
        })
        .catch(() => []),
      prisma.hyroxAthleteScore
        .findMany({
          where: { userId, date: { gte: windowStart } },
          orderBy: { date: "asc" },
          select: { date: true, overallScore: true, engineScore: true },
        })
        .catch(() => []),
      prisma.pbDefinition
        .findMany({
          where: { slug: { in: slugs } },
          select: { id: true, slug: true },
        })
        .catch(() => []),
      prisma.personalBest
        .findMany({
          where: { userId },
          include: {
            pbDefinition: { select: { slug: true } },
            history: { orderBy: { achievedAt: "asc" } },
          },
        })
        .catch(() => []),
    ]);

  const slugToId = new Map(pbDefinitions.map((def) => [def.slug, def.id]));
  void slugToId;

  const pbHistory: PbHistoryPoint[] = [];

  for (const record of pbRecords) {
    const slug = record.pbDefinition.slug;
    if (!slugs.includes(slug as (typeof slugs)[number])) continue;

    for (const entry of record.history) {
      pbHistory.push({ slug, value: entry.value, achievedAt: entry.achievedAt });
    }

    pbHistory.push({ slug, value: record.value, achievedAt: record.achievedAt });
  }

  const deduped = new Map<string, PbHistoryPoint>();
  for (const point of pbHistory.sort((a, b) => a.achievedAt.getTime() - b.achievedAt.getTime())) {
    deduped.set(`${point.slug}:${point.achievedAt.toISOString()}:${point.value}`, point);
  }

  return {
    sportView,
    collectedAt: now,
    raw,
    intelligence,
    crossfitScoreHistory,
    hyroxScoreHistory,
    pbHistory: Array.from(deduped.values()),
  };
}

export function pbSeries(ctx: PredictionModelContext, slug: string): DatedValue[] {
  return ctx.pbHistory
    .filter((p) => p.slug === slug)
    .map((p) => ({ date: p.achievedAt, value: p.value }));
}

export function raceFinishSeries(ctx: PredictionModelContext): DatedValue[] {
  return ctx.raw.races
    .filter((r) => r.finishTimeSeconds != null && r.finishTimeSeconds > 0)
    .map((r) => ({ date: r.raceDate, value: r.finishTimeSeconds as number }));
}
