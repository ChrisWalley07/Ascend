import type { PrismaClient } from "@prisma/client";
import { formatHyroxTime } from "@/lib/hyrox/catalog";
import { analyzeRaceSplits } from "@/lib/hyrox/predictor";
import type { SportView } from "@/domain/models/sport";
import { resolveActiveView } from "@/domain/models/sport";
import { collectIntelligenceData } from "@/services/athlete-intelligence";
import { analyzeAthleteIntelligence } from "@/services/athlete-intelligence";
import { DATE_WINDOWS } from "@/shared/constants/date-windows";
import { average } from "@/shared/utils/math";

import type { CoachDataContext, CoachGoalContext, CoachRaceContext } from "../types";

export async function collectCoachData(
  prisma: PrismaClient,
  userId: string,
  sportView?: SportView,
): Promise<CoachDataContext | null> {
  const raw = await collectIntelligenceData(prisma, userId, { sportView });
  if (!raw) return null;

  const intelligence = analyzeAthleteIntelligence(raw);
  const view = raw.sportView;

  const [profile, goals, races] = await Promise.all([
    prisma.athleteProfile.findUnique({
      where: { userId },
      select: {
        name: true,
        trainingDaysPerWeek: true,
        competitionTarget: true,
        sportDepartment: true,
        activeSportView: true,
        profileCompleted: true,
      },
    }),
    prisma.goal.findMany({
      where: { userId, status: "ACTIVE" },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    view === "hyrox"
      ? prisma.hyroxRace
          .findMany({
            where: { userId },
            orderBy: { raceDate: "desc" },
            take: 5,
            include: { splits: { orderBy: { sequence: "asc" } } },
          })
          .catch(() => [])
      : Promise.resolve([]),
  ]);

  const recoveryLogs = raw.recoveryLogs;
  const avgReadiness =
    recoveryLogs.length > 0 ? average(recoveryLogs.map((l) => l.readinessScore)) : null;
  const sorenessValues = recoveryLogs
    .map((l) => l.soreness)
    .filter((v): v is number => v != null);
  const avgSoreness = sorenessValues.length > 0 ? average(sorenessValues) : null;

  const acwrMetric = intelligence.domains.training_load.metrics.find((m) => m.key === "acwr");
  const acwr = acwrMetric?.value ?? null;

  const sessionsPerWeek = (raw.workouts.length / DATE_WINDOWS.quarter) * 7;

  const goalContexts: CoachGoalContext[] = goals.map((goal) => ({
    id: goal.id,
    title: goal.title,
    targetValue: goal.targetValue,
    currentValue: goal.currentValue,
    unit: goal.unit,
    progressPct: Math.min(100, Math.max(0, (goal.currentValue / goal.targetValue) * 100)),
    deadline: goal.targetDate,
  }));

  let raceContext: CoachRaceContext | null = null;
  if (view === "hyrox" && races.length > 0) {
    const upcoming = races.find((r) => r.raceDate >= new Date() && !r.finishTimeSeconds);
    const latest = races.find((r) => r.finishTimeSeconds);
    const target = upcoming ?? latest;
    if (target) {
      const analysis = target.splits.length ? analyzeRaceSplits(target.splits) : null;
      raceContext = {
        name: target.name ?? "Hyrox Race",
        raceDate: target.raceDate,
        finishTimeSeconds: target.finishTimeSeconds,
        isUpcoming: Boolean(upcoming),
        weakestStation: analysis?.weakestStation?.name ?? target.weakestStationSlug,
        strongestStation: analysis?.strongestStation?.name ?? target.strongestStationSlug,
      };
    }
  }

  return {
    userId,
    sportView: sportView ?? resolveActiveView(profile?.sportDepartment ?? "CROSSFIT", profile?.activeSportView),
    athleteType: raw.athleteType,
    collectedAt: raw.collectedAt,
    athleteName: profile?.name ?? "Athlete",
    trainingDaysPerWeek: profile?.trainingDaysPerWeek ?? null,
    competitionTarget: profile?.competitionTarget ?? null,
    intelligence,
    goals: goalContexts,
    race: raceContext,
    recentWorkoutCount: raw.workouts.filter(
      (w) => w.date >= new Date(Date.now() - DATE_WINDOWS.month * 24 * 60 * 60 * 1000),
    ).length,
    sessionsPerWeek,
    avgReadiness,
    avgSoreness,
    acwr,
    profileComplete: profile?.profileCompleted ?? false,
  };
}
