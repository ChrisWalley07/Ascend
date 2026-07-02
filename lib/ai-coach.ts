import { format, startOfDay, subDays } from "date-fns";

import { analyzeAthleteProfile, toProfileInput } from "@/lib/athlete-analysis";
import { getAthleteScoreSnapshot } from "@/lib/athlete-score";
import { APP_NAME } from "@/lib/brand";
import { generateHyroxInsights } from "@/lib/hyrox/insights";
import { getPrismaClient } from "@/lib/prisma";
import { loadSportProfile } from "@/lib/sport/load-profile";
import { resolveActiveView } from "@/lib/sports/types";

export type InsightCard = {
  title: string;
  content: string;
  severity: "info" | "success" | "warning";
};

const PROFILE_SELECT = {
  name: true,
  age: true,
  gender: true,
  heightCm: true,
  weightKg: true,
  trainingAgeMonths: true,
  experienceLevel: true,
  primaryGoal: true,
  trainingDaysPerWeek: true,
  trainingEnvironment: true,
  injuriesNotes: true,
  focusAreas: true,
  strongAreas: true,
  sleepTargetHours: true,
  competitionTarget: true,
  coachNotes: true,
  sportDepartment: true,
  profileCompleted: true,
} as const;

function percentageChange(previous: number, current: number) {
  if (previous <= 0) return 0;
  return ((current - previous) / previous) * 100;
}

export async function generateAiInsights(userId: string) {
  const prisma = getPrismaClient();
  if (!prisma) return [] as InsightCard[];

  const now = new Date();
  const last30 = subDays(now, 30);
  const prev30 = subDays(now, 60);
  const startToday = startOfDay(now);

  try {
    const [workouts, personalRecords, recoveries, latestScores, achievements, profileRow, sportProfile] =
      await Promise.all([
      prisma.workout.findMany({
        where: {
          userId,
          date: {
            gte: prev30,
          },
        },
        include: {
          workoutExercises: {
            include: {
              exercise: {
                select: {
                  name: true,
                  category: true,
                },
              },
            },
          },
        },
        orderBy: { date: "asc" },
      }),
      prisma.personalRecord.findMany({
        where: {
          userId,
          achievedAt: {
            gte: prev30,
          },
        },
        include: {
          exercise: {
            select: {
              name: true,
              category: true,
            },
          },
        },
      }),
      prisma.recoveryLog.findMany({
        where: {
          userId,
          date: {
            gte: prev30,
          },
        },
      }),
      prisma.athleteScore.findMany({
        where: {
          userId,
        },
        orderBy: { date: "desc" },
        take: 8,
      }),
      prisma.achievement.findMany({
        where: {
          userId,
          type: "PR",
          awardedAt: {
            gte: prev30,
          },
        },
        orderBy: {
          awardedAt: "desc",
        },
      }),
      prisma.athleteProfile.findUnique({ where: { userId }, select: PROFILE_SELECT }),
      loadSportProfile(prisma, userId),
    ]);

    const activeView = sportProfile?.sportDepartment
      ? resolveActiveView(sportProfile.sportDepartment, sportProfile.activeSportView)
      : "crossfit";

    if (activeView === "hyrox") {
      const hyroxInsights = await generateHyroxInsights(userId, prisma);

      await prisma.aIInsight.deleteMany({
        where: { userId, createdAt: { gte: startToday } },
      });

      if (hyroxInsights.length > 0) {
        await prisma.aIInsight.createMany({
          data: hyroxInsights.map((insight) => ({
            userId,
            title: insight.title,
            content: insight.content,
            severity: insight.severity,
          })),
        });
      }

      return hyroxInsights;
    }

    const insights: InsightCard[] = [];

    if (profileRow && !profileRow.profileCompleted) {
      insights.push({
        title: "Complete your athlete profile",
        content:
          `Add your training background, goals, and focus areas so ${APP_NAME} can personalise your scores and recommendations.`,
        severity: "warning",
      });
    }

    if (profileRow?.profileCompleted) {
      const scoreSnapshot = await getAthleteScoreSnapshot(userId);
      const analysis = analyzeAthleteProfile(toProfileInput(profileRow), {
        workoutsPerWeek: workouts.filter((w) => w.date >= last30).length / 4.3,
        recentWorkoutCount: workouts.filter((w) => w.date >= last30).length,
        pbCount: personalRecords.length,
        categoryScores: {
          strengthScore: scoreSnapshot.strengthScore,
          olympicLiftingScore: scoreSnapshot.olympicLiftingScore,
          engineScore: scoreSnapshot.engineScore,
          gymnasticsScore: scoreSnapshot.gymnasticsScore,
          powerScore: scoreSnapshot.powerScore,
          consistencyScore: scoreSnapshot.consistencyScore,
          recoveryScore: scoreSnapshot.recoveryScore,
          mobilityScore: scoreSnapshot.mobilityScore,
        },
      });

      for (const insight of analysis.goalInsights.slice(0, 1)) {
        insights.push({ title: "Goal alignment", content: insight, severity: "info" });
      }
      for (const rec of analysis.recommendations.slice(0, 2)) {
        insights.push({ title: "Profile-based recommendation", content: rec, severity: "info" });
      }
      for (const gap of analysis.focusGapInsights.slice(0, 1)) {
        insights.push({ title: "Focus area check-in", content: gap, severity: "warning" });
      }
    }

    const recentSquatPr = personalRecords
      .filter((record) => record.exercise.name.toLowerCase().includes("squat") && record.achievedAt >= last30)
      .sort((a, b) => b.value - a.value)[0];
    const previousSquatPr = personalRecords
      .filter((record) => record.exercise.name.toLowerCase().includes("squat") && record.achievedAt < last30)
      .sort((a, b) => b.value - a.value)[0];

    if (recentSquatPr && previousSquatPr) {
      const change = percentageChange(previousSquatPr.value, recentSquatPr.value);
      if (change > 1) {
        insights.push({
          title: "Squat progression is trending up",
          content: `Your squat PR moved from ${previousSquatPr.value.toFixed(1)} ${previousSquatPr.unit} to ${recentSquatPr.value.toFixed(1)} ${recentSquatPr.unit} (${change.toFixed(1)}% improvement).`,
          severity: "success",
        });
      }
    }

    const recentEngineVolume = workouts
      .filter((workout) => workout.date >= last30)
      .flatMap((workout) => workout.workoutExercises)
      .reduce((sum, exercise) => sum + (exercise.distanceMeters ?? 0) + (exercise.timeSeconds ?? 0), 0);
    const previousEngineVolume = workouts
      .filter((workout) => workout.date < last30)
      .flatMap((workout) => workout.workoutExercises)
      .reduce((sum, exercise) => sum + (exercise.distanceMeters ?? 0) + (exercise.timeSeconds ?? 0), 0);

    if (previousEngineVolume > 0) {
      const change = percentageChange(previousEngineVolume, recentEngineVolume);
      if (Math.abs(change) < 5) {
        insights.push({
          title: "Engine volume has plateaued",
          content: `Your engine work changed by only ${change.toFixed(1)}% over the last 30 days. Consider adding one dedicated interval day.`,
          severity: "warning",
        });
      }
    }

    const olympicPrs = personalRecords.filter((record) => record.achievedAt >= last30 && record.exercise.category.toLowerCase().includes("olympic")).length;
    const gymnasticsPrs = personalRecords.filter((record) =>
      record.achievedAt >= last30 &&
      (record.exercise.category.toLowerCase().includes("gymnastics") || record.exercise.category.toLowerCase().includes("bodyweight")),
    ).length;
    if (olympicPrs > gymnasticsPrs) {
      insights.push({
        title: "Olympic lifting is outpacing gymnastics",
        content: `You logged ${olympicPrs} olympic PR signals vs ${gymnasticsPrs} gymnastics PR signals this month.`,
        severity: "info",
      });
    }

    const weekdayVolume = new Map<number, number>();
    for (const workout of workouts.filter((w) => w.date >= last30)) {
      const day = workout.date.getDay();
      const volume = workout.workoutExercises.reduce((sum, item) => sum + (item.weightKg ?? 0) * (item.reps ?? 0), 0);
      weekdayVolume.set(day, (weekdayVolume.get(day) ?? 0) + volume);
    }
    if (weekdayVolume.size > 0) {
      const [bestDay] = Array.from(weekdayVolume.entries()).sort((a, b) => b[1] - a[1])[0];
      insights.push({
        title: "You are strongest on a specific weekday",
        content: `Your highest output day recently has been ${format(new Date(2024, 0, bestDay + 1), "EEEE")} based on training volume.`,
        severity: "info",
      });
    }

    if (recoveries.length > 0 && achievements.length > 0) {
      const averageReadiness = recoveries.reduce((sum, item) => sum + item.readinessScore, 0) / recoveries.length;
      const prDayReadinessSamples: number[] = [];

      for (const achievement of achievements) {
        const nearestRecovery = recoveries
          .filter((entry) => entry.date <= achievement.awardedAt)
          .sort((a, b) => b.date.getTime() - a.date.getTime())[0];
        if (nearestRecovery) {
          prDayReadinessSamples.push(nearestRecovery.readinessScore);
        }
      }

      if (prDayReadinessSamples.length > 0) {
        const prReadinessAverage =
          prDayReadinessSamples.reduce((sum, value) => sum + value, 0) / prDayReadinessSamples.length;
        if (prReadinessAverage < averageReadiness - 5) {
          insights.push({
            title: "Recovery tends to dip before PR attempts",
            content: `Your average readiness around PR days is ${prReadinessAverage.toFixed(0)} vs ${averageReadiness.toFixed(0)} baseline.`,
            severity: "warning",
          });
        }
      }
    }

    const scoreSnapshot = await getAthleteScoreSnapshot(userId);
    if (latestScores.length >= 2) {
      const latest = latestScores[0];
      const previous = latestScores[1];
      const change = latest.overallScore - previous.overallScore;
      if (Math.abs(change) >= 1) {
        insights.push({
          title: "Overall athlete score movement",
          content: `Your overall athlete score moved ${change > 0 ? "up" : "down"} by ${Math.abs(change).toFixed(1)} points, currently at ${scoreSnapshot.overallScore}/100.`,
          severity: change > 0 ? "success" : "warning",
        });
      }
    }

    const uniqueInsights = insights
      .filter((insight, index, self) => self.findIndex((other) => other.title === insight.title) === index)
      .slice(0, 6);

    await prisma.aIInsight.deleteMany({
      where: {
        userId,
        createdAt: {
          gte: startToday,
        },
      },
    });

    if (uniqueInsights.length > 0) {
      await prisma.aIInsight.createMany({
        data: uniqueInsights.map((insight) => ({
          userId,
          title: insight.title,
          content: insight.content,
          severity: insight.severity,
        })),
      });
    }

    return uniqueInsights;
  } catch {
    return [] as InsightCard[];
  }
}
