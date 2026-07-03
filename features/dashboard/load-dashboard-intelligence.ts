import { differenceInCalendarDays, subDays, startOfWeek } from "date-fns";

import type { CoachReport } from "@/features/ai-coach";
import type { CoachGoalContext } from "@/features/ai-coach/types";
import { getCoachReport } from "@/features/ai-coach";
import { getRecoveryReadinessReport } from "@/features/recovery-readiness";
import { getWeeklyWeaknessReport } from "@/features/weakness-detection";
import { buildWeeklyDigest } from "@/features/weekly-digest";
import type { SportView } from "@/domain/models/sport";
import { ATTRIBUTE_LABELS } from "@/features/weakness-detection";
import { HYROX_STATIONS } from "@/lib/hyrox/catalog";
import type { RacePrepData } from "@/components/dashboard/hyrox-race-prep-panel";

import type { Prisma, PrismaClient } from "@prisma/client";

export type DashboardIntelligenceBundle = {
  coachReport: Awaited<ReturnType<typeof getCoachReport>>;
  recoveryReport: Awaited<ReturnType<typeof getRecoveryReadinessReport>>;
  weaknessReport: Awaited<ReturnType<typeof getWeeklyWeaknessReport>>;
  weeklyDigest: ReturnType<typeof buildWeeklyDigest>;
  racePrep: RacePrepData | null;
  focusArea: string | null;
  todayCheckIn: Awaited<ReturnType<typeof loadTodayCheckIn>>;
  showGettingStarted: boolean;
  currentScore: number;
};

export async function loadDashboardIntelligence(
  prisma: PrismaClient,
  userId: string,
  sportView: SportView,
  options: {
    overallScore: number;
    profileComplete: boolean;
    workoutCount: number;
    goals: CoachGoalContext[];
  },
): Promise<DashboardIntelligenceBundle> {
  try {
    return await loadDashboardIntelligenceInternal(prisma, userId, sportView, options);
  } catch (error) {
    console.error("[dashboard] intelligence load failed", error);
    return createFallbackDashboardIntelligence(options);
  }
}

function createFallbackDashboardIntelligence(options: {
  overallScore: number;
  profileComplete: boolean;
  workoutCount: number;
  goals: CoachGoalContext[];
}): DashboardIntelligenceBundle {
  return {
    coachReport: null,
    recoveryReport: null,
    weaknessReport: null,
    weeklyDigest: buildWeeklyDigest({
      coach: null,
      weakness: null,
      recovery: null,
      goals: options.goals,
      currentScore: options.overallScore,
    }),
    racePrep: null,
    focusArea: null,
    todayCheckIn: null,
    showGettingStarted: !options.profileComplete || options.workoutCount < 2,
    currentScore: options.overallScore,
  };
}

async function loadDashboardIntelligenceInternal(
  prisma: PrismaClient,
  userId: string,
  sportView: SportView,
  options: {
    overallScore: number;
    profileComplete: boolean;
    workoutCount: number;
    goals: CoachGoalContext[];
  },
): Promise<DashboardIntelligenceBundle> {
  const [coachReport, recoveryReport, weaknessReport, todayCheckIn, priorScore] =
    await Promise.all([
      getCoachReport(prisma, userId, { sportView }),
      getRecoveryReadinessReport(prisma, userId, { sportView }),
      getWeeklyWeaknessReport(prisma, userId, { sportView }),
      loadTodayCheckIn(prisma, userId),
      loadPriorWeekScore(prisma, userId, sportView),
    ]);

  const weeklyDigest = buildWeeklyDigest({
    coach: coachReport,
    weakness: weaknessReport,
    recovery: recoveryReport,
    goals: options.goals,
    priorScore,
    currentScore: options.overallScore,
  });

  const focusArea = weaknessReport
    ? ATTRIBUTE_LABELS[weaknessReport.weakestAttribute]
    : null;

  const racePrep =
    sportView === "hyrox"
      ? await buildRacePrep(prisma, userId, weaknessReport, coachReport)
      : null;

  await persistWeeklySnapshot(prisma, userId, sportView, {
    overallScore: options.overallScore,
    weakness: weaknessReport,
    recovery: recoveryReport,
    digest: weeklyDigest,
  });

  return {
    coachReport,
    recoveryReport,
    weaknessReport,
    weeklyDigest,
    racePrep,
    focusArea,
    todayCheckIn,
    showGettingStarted: !options.profileComplete || options.workoutCount < 2,
    currentScore: options.overallScore,
  };
}

async function loadTodayCheckIn(prisma: PrismaClient, userId: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const log = await prisma.recoveryLog.findFirst({
    where: { userId, date: { gte: today } },
    orderBy: { date: "desc" },
  });
  if (!log) return null;
  return {
    readiness: Math.round(log.readinessScore / 10),
    soreness: log.soreness,
    energy: log.energy,
    sleepHours: log.sleepHours,
    hrv: log.hrv,
    loggedAt: log.date.toISOString(),
  };
}

async function loadPriorWeekScore(
  prisma: PrismaClient,
  userId: string,
  sportView: SportView,
): Promise<number | null> {
  const target = subDays(new Date(), 7);

  if (sportView === "hyrox") {
    const row = await prisma.hyroxAthleteScore.findFirst({
      where: { userId, date: { lte: target } },
      orderBy: { date: "desc" },
      select: { overallScore: true },
    }).catch(() => null);
    return row ? Math.round(row.overallScore) : null;
  }

  const row = await prisma.athleteScore.findFirst({
    where: { userId, date: { lte: target } },
    orderBy: { date: "desc" },
    select: { overallScore: true },
  }).catch(() => null);
  return row ? Math.round(row.overallScore) : null;
}

async function buildRacePrep(
  prisma: PrismaClient,
  userId: string,
  weakness: Awaited<ReturnType<typeof getWeeklyWeaknessReport>>,
  coach: Awaited<ReturnType<typeof getCoachReport>>,
): Promise<RacePrepData | null> {
  const race = await prisma.hyroxRace.findFirst({
    where: { userId, raceDate: { gte: new Date() } },
    orderBy: { raceDate: "asc" },
  }).catch(() => null);

  if (!race) return null;

  const daysOut = differenceInCalendarDays(race.raceDate, new Date());
  const weeksOut = Math.max(1, Math.ceil(daysOut / 7));

  const latestWithSplits = await prisma.hyroxRace.findFirst({
    where: { userId },
    orderBy: { raceDate: "desc" },
    include: { splits: true },
  }).catch(() => null);

  let focusStation: string | null = null;
  if (latestWithSplits?.weakestStationSlug) {
    focusStation =
      HYROX_STATIONS.find((s) => s.slug === latestWithSplits.weakestStationSlug)?.name ??
      latestWithSplits.weakestStationSlug;
  }

  const focusAttribute = weakness ? ATTRIBUTE_LABELS[weakness.weakestAttribute] : null;
  const weeklyAction =
    coach?.sections.find((s) => s.id === "training_focus")?.recommendation?.action ??
    weakness?.priorityList[0]?.reason ??
    "Maintain race-pace running and station practice under fatigue.";

  return {
    raceName: race.name ?? "Hyrox Race",
    raceDate: race.raceDate,
    weeksOut,
    daysOut,
    focusStation,
    focusAttribute,
    weeklyAction,
  };
}

async function persistWeeklySnapshot(
  prisma: PrismaClient,
  userId: string,
  sportView: SportView,
  payload: Record<string, unknown>,
): Promise<void> {
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });

  const jsonPayload = payload as Prisma.InputJsonValue;

  try {
    await prisma.weeklyIntelligenceSnapshot.upsert({
      where: {
        userId_weekStart_sportKey: {
          userId,
          weekStart,
          sportKey: sportView,
        },
      },
      create: {
        userId,
        weekStart,
        sportKey: sportView,
        payload: jsonPayload,
      },
      update: {
        payload: jsonPayload,
      },
    });
  } catch {
    // Table may not exist until migration runs
  }
}
