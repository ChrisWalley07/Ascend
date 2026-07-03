"use server";

import { format } from "date-fns";

import { getDepartmentSummary } from "@/app/actions/department";
import { syncAchievementsForUser } from "@/app/actions/achievements";
import { getAthleteProfileData } from "@/app/actions/profile";
import { getPersonalBestBoard } from "@/app/actions/personal-bests";
import {
  calculateXpProgressionFromAchievements,
  type AchievementEngineResult,
} from "@/features/athlete-achievements";
import type { XpPlayerProgress } from "@/features/athlete-achievements/xp";
import type { ResolvedAchievement } from "@/features/athlete-achievements/types/state";
import { getAthleteScoreSnapshot } from "@/lib/athlete-score";
import { requireUser } from "@/lib/auth";
import { benchmarkWhereForView } from "@/lib/sport/workout-filter";
import { getPrismaClient } from "@/lib/prisma";

export type ProfileBenchmarkPreview = {
  id: string;
  name: string;
  bestScore: string;
  attemptCount: number;
  improved: boolean;
  lastAttemptDate: string | null;
};

export type ProfilePrPreview = {
  id: string;
  name: string;
  displayValue: string;
  achievedAt: string;
  category: string;
};

export type ProfileScreenStats = {
  totalWorkouts: number;
  workoutsLast30Days: number;
  personalBestsLogged: number;
  benchmarksLogged: number;
  trainingStreakDays: number;
  overallScore: number;
  goalAlignmentScore: number;
};

export type ProfileScreenData = {
  name: string;
  profileImageUrl: string | null;
  sportLabel: string;
  profileCompleted: boolean;
  achievementResult: AchievementEngineResult;
  xpProgress: XpPlayerProgress;
  stats: ProfileScreenStats;
  benchmarks: ProfileBenchmarkPreview[];
  recentPrs: ProfilePrPreview[];
  recentUnlocks: ResolvedAchievement[];
};

function summarizeBenchmarkAttempts(
  attempts: { score: string; scoreValue: number; date: Date }[],
  scoringMode: "LOWER_IS_BETTER" | "HIGHER_IS_BETTER",
) {
  if (attempts.length === 0) {
    return { best: "—", improved: false, lastDate: null as Date | null };
  }

  const sorted = [...attempts].sort((a, b) => a.scoreValue - b.scoreValue);
  const best =
    scoringMode === "LOWER_IS_BETTER" ? sorted[0]! : sorted[sorted.length - 1]!;
  const first = attempts[0]!;
  const latest = attempts[attempts.length - 1]!;
  const improved =
    scoringMode === "LOWER_IS_BETTER"
      ? latest.scoreValue <= first.scoreValue
      : latest.scoreValue >= first.scoreValue;

  return { best: best.score, improved, lastDate: latest.date };
}

function createEmptyAchievementResult(userId: string): AchievementEngineResult {
  return {
    evaluatedAt: new Date().toISOString(),
    userId,
    completionPercent: 0,
    earnedXp: 0,
    locked: [],
    available: [],
    completed: [],
    nextAchievements: [],
    newlyCompleted: [],
    newlyUnlocked: [],
    newlyEarnedXp: 0,
    all: [],
  };
}

function createFallbackProfileScreenData(
  userId: string,
  sportLabel: string,
): ProfileScreenData {
  const emptyResult = createEmptyAchievementResult(userId);
  return {
    name: "Athlete",
    profileImageUrl: null,
    sportLabel,
    profileCompleted: false,
    achievementResult: emptyResult,
    xpProgress: calculateXpProgressionFromAchievements(0),
    stats: {
      totalWorkouts: 0,
      workoutsLast30Days: 0,
      personalBestsLogged: 0,
      benchmarksLogged: 0,
      trainingStreakDays: 0,
      overallScore: 62,
      goalAlignmentScore: 0,
    },
    benchmarks: [],
    recentPrs: [],
    recentUnlocks: [],
  };
}

async function loadAthleteProfileScreenDataInternal(
  userId: string,
): Promise<ProfileScreenData> {
  const prisma = getPrismaClient();
  const { activeView, viewConfig } = await getDepartmentSummary(userId);
  const { profile, analysis } = await getAthleteProfileData(userId);

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [
    achievementResult,
    scoreSnapshot,
    pbBoard,
    workoutCounts,
    benchmarkCount,
    streakFromGamification,
    profileRow,
  ] = await Promise.all([
    syncAchievementsForUser(userId, activeView),
    getAthleteScoreSnapshot(userId),
    getPersonalBestBoard(userId, activeView).catch(() => ({
      items: [],
      stats: { totalLogged: 0, coreLogged: 0, coreTotal: 0, recentCount: 0 },
      view: activeView,
    })),
    prisma
      ? Promise.all([
          prisma.workout.count({ where: { userId } }).catch(() => 0),
          prisma.workout
            .count({ where: { userId, date: { gte: thirtyDaysAgo } } })
            .catch(() => 0),
        ])
      : Promise.resolve([0, 0] as const),
    prisma
      ? prisma.benchmarkAttempt.count({ where: { userId } }).catch(() => 0)
      : Promise.resolve(0),
    prisma
      ? prisma.gamificationProfile
          .findUnique({ where: { userId }, select: { streakDays: true } })
          .catch(() => null)
      : Promise.resolve(null),
    prisma
      ? prisma.athleteProfile
          .findUnique({
            where: { userId },
            select: { profileImageUrl: true },
          })
          .catch(() => null)
      : Promise.resolve(null),
  ]);

  const emptyResult = createEmptyAchievementResult(userId);

  const result = achievementResult ?? emptyResult;
  const xpProgress = calculateXpProgressionFromAchievements(result.earnedXp);

  let benchmarks: ProfileBenchmarkPreview[] = [];
  if (prisma) {
    try {
      const sportFilter = await benchmarkWhereForView(prisma, activeView);
      const benchmarkRows = await prisma.benchmark.findMany({
        where: sportFilter,
        orderBy: { name: "asc" },
        take: 12,
        include: {
          attempts: {
            where: { userId },
            orderBy: { date: "desc" },
            select: { score: true, scoreValue: true, date: true },
          },
        },
      });

      benchmarks = benchmarkRows
        .filter((row) => row.attempts.length > 0)
        .map((row) => {
          const summary = summarizeBenchmarkAttempts(row.attempts, row.scoringMode);
          return {
            id: row.id,
            name: row.name,
            bestScore: summary.best,
            attemptCount: row.attempts.length,
            improved: summary.improved,
            lastAttemptDate: summary.lastDate ? format(summary.lastDate, "MMM d, yyyy") : null,
          };
        })
        .sort((a, b) => b.attemptCount - a.attemptCount)
        .slice(0, 5);
    } catch (error) {
      console.error("[profile] benchmark preview load failed", error);
    }
  }

  const recentPrs: ProfilePrPreview[] = pbBoard.items
    .filter((item) => item.current)
    .map((item) => ({
      id: item.current!.id,
      name: item.name,
      displayValue: item.current!.displayValue,
      achievedAt: item.current!.achievedAt,
      category: item.category,
    }))
    .sort((a, b) => new Date(b.achievedAt).getTime() - new Date(a.achievedAt).getTime())
    .slice(0, 6);

  const recentUnlocks = [...result.completed]
    .sort((a, b) => {
      const aTime = a.completedAt ? new Date(a.completedAt).getTime() : 0;
      const bTime = b.completedAt ? new Date(b.completedAt).getTime() : 0;
      return bTime - aTime;
    })
    .slice(0, 6);

  const [totalWorkouts, workoutsLast30Days] = workoutCounts;

  return {
    name: profile?.name ?? "Athlete",
    profileImageUrl: profileRow?.profileImageUrl ?? null,
    sportLabel: viewConfig.label,
    profileCompleted: profile?.profileCompleted ?? false,
    achievementResult: result,
    xpProgress,
    stats: {
      totalWorkouts,
      workoutsLast30Days,
      personalBestsLogged: pbBoard.stats.totalLogged,
      benchmarksLogged: benchmarkCount,
      trainingStreakDays: streakFromGamification?.streakDays ?? 0,
      overallScore: scoreSnapshot.overallScore,
      goalAlignmentScore: analysis?.goalAlignmentScore ?? 0,
    },
    benchmarks,
    recentPrs,
    recentUnlocks,
  };
}

export async function getAthleteProfileScreenData(): Promise<ProfileScreenData> {
  const user = await requireUser();

  try {
    return await loadAthleteProfileScreenDataInternal(user.id);
  } catch (error) {
    console.error("[profile] screen data load failed", error);
    const summary = await getDepartmentSummary(user.id).catch(() => null);
    return createFallbackProfileScreenData(user.id, summary?.viewConfig.label ?? "CrossFit");
  }
}
