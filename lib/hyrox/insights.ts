import { format, subDays } from "date-fns";

import { analyzeRaceSplits, predictFinishFromSessions } from "@/lib/hyrox/predictor";
import { formatHyroxTime, formatPace, HYROX_STATIONS } from "@/lib/hyrox/catalog";
import { getHyroxScoreSnapshot } from "@/lib/hyrox/score";
import type { InsightCard } from "@/lib/ai-coach";
import type { PrismaClient } from "@prisma/client";

import { hyroxWorkoutWhere } from "@/lib/sport/workout-filter";

export async function generateHyroxInsights(
  userId: string,
  prisma: PrismaClient,
): Promise<InsightCard[]> {
  const insights: InsightCard[] = [];
  const thirtyDaysAgo = subDays(new Date(), 30);

  const workoutWhere = await hyroxWorkoutWhere(prisma, userId);

  const [races, workouts, score] = await Promise.all([
    prisma.hyroxRace.findMany({
      where: { userId },
      orderBy: { raceDate: "desc" },
      take: 5,
      include: { splits: { orderBy: { sequence: "asc" } } },
    }).catch(() => [] as Awaited<
      ReturnType<
        typeof prisma.hyroxRace.findMany<{
          include: { splits: { orderBy: { sequence: "asc" } } };
        }>
      >
    >),
    prisma.workout.findMany({
      where: { ...workoutWhere, date: { gte: thirtyDaysAgo } },
      orderBy: { date: "desc" },
    }),
    getHyroxScoreSnapshot(prisma, userId),
  ]);

  const latestRace = races.find((r) => r.finishTimeSeconds);
  const upcomingRace = races.find((r) => r.raceDate >= new Date() && !r.finishTimeSeconds);

  if (upcomingRace) {
    insights.push({
      title: "Race on the horizon",
      content: `${upcomingRace.name ?? "Your next race"} is on ${format(upcomingRace.raceDate, "MMM d")}. Taper station volume and sharpen running pace this week.`,
      severity: "info",
    });
  }

  if (latestRace?.splits.length) {
    const analysis = analyzeRaceSplits(latestRace.splits);
    if (analysis.weakestStation) {
      insights.push({
        title: `${analysis.weakestStation.name} is limiting your race`,
        content: `Your latest race data shows ${analysis.weakestStation.name} as the slowest station relative to your profile. Add one focused station session per week.`,
        severity: "warning",
      });
    }
    if (analysis.strongestStation) {
      insights.push({
        title: `${analysis.strongestStation.name} is your strongest station`,
        content: `Keep this station on maintenance — your efficiency here is giving you margin elsewhere in the race.`,
        severity: "success",
      });
    }
    if (analysis.averageRunPaceSeconds) {
      insights.push({
        title: "Running pace snapshot",
        content: `Average race running pace: ${formatPace(analysis.averageRunPaceSeconds)}. Consistent sub-5:00/km splits typically unlock sub-70 finishes.`,
        severity: "info",
      });
    }
  }

  if (races.length >= 2) {
    const finished = races.filter((r) => r.finishTimeSeconds);
    if (finished.length >= 2) {
      const latest = finished[0].finishTimeSeconds!;
      const previous = finished[1].finishTimeSeconds!;
      const delta = previous - latest;
      if (delta > 30) {
        insights.push({
          title: "Race finish time is improving",
          content: `You dropped ${formatHyroxTime(delta)} between your last two races (${formatHyroxTime(previous)} → ${formatHyroxTime(latest)}).`,
          severity: "success",
        });
      } else if (delta < -60) {
        insights.push({
          title: "Recent race was slower than expected",
          content: `Your last finish (${formatHyroxTime(latest)}) was ${formatHyroxTime(Math.abs(delta))} slower than the race before. Review pacing and station transitions.`,
          severity: "warning",
        });
      }
    }
  }

  const weeklySessions = workouts.length / 4.3;
  if (weeklySessions < 2 && !upcomingRace) {
    insights.push({
      title: "Increase Hyrox training frequency",
      content: `You're averaging ${weeklySessions.toFixed(1)} Hyrox sessions/week. Aim for 3–4 to build race-specific capacity.`,
      severity: "warning",
    });
  }

  if (score.runningScore >= 70) {
    insights.push({
      title: "Running score is trending up",
      content: `Your running score is ${Math.round(score.runningScore)}/100 — keep building aerobic base with controlled 1 km repeats.`,
      severity: "success",
    });
  }

  if (score.gripScore < 55) {
    insights.push({
      title: "Grip fatigue risk after mid-race stations",
      content: `Grip score is ${Math.round(score.gripScore)}/100. Farmers carry and sled pull work will pay off after Station 6.`,
      severity: "warning",
    });
  }

  const recentFinish = latestRace?.finishTimeSeconds;
  if (recentFinish && weeklySessions >= 2) {
    const prediction = predictFinishFromSessions([recentFinish], weeklySessions);
    if (prediction && recentFinish > 4200) {
      insights.push({
        title: "Sub-70 projection",
        content: `Based on current progress you could achieve ${prediction.targetDisplay} in approximately ${prediction.weeks} weeks with consistent training.`,
        severity: "info",
      });
    }
  }

  if (score.powerScore >= 75 && latestRace?.splits.length) {
    const sledStations = latestRace.splits.filter((s) =>
      ["sled-push", "sled-pull"].includes(s.stationSlug),
    );
    if (sledStations.length > 0) {
      insights.push({
        title: "Sled work is a competitive advantage",
        content: "Sled push/pull scores are strong — maintain heavy sled sessions without over-fatiguing legs before race day.",
        severity: "success",
      });
    }
  }

  // Station 6+ grip fatigue pattern
  if (latestRace?.splits.length) {
    const stationMap = Object.fromEntries(HYROX_STATIONS.map((s) => [s.slug, s.sequence]));
    const postSix = latestRace.splits.filter(
      (s) => (stationMap[s.stationSlug] ?? 0) >= 6 && s.timeSeconds,
    );
    const preSix = latestRace.splits.filter(
      (s) => (stationMap[s.stationSlug] ?? 0) < 6 && s.timeSeconds && !HYROX_STATIONS.find((st) => st.slug === s.stationSlug)?.isRun,
    );
    if (postSix.length > 0 && preSix.length > 0) {
      const avgPost =
        postSix.reduce((sum, s) => sum + (s.timeSeconds ?? 0), 0) / postSix.length;
      const avgPre =
        preSix.reduce((sum, s) => sum + (s.timeSeconds ?? 0), 0) / preSix.length;
      if (avgPost > avgPre * 1.15) {
        insights.push({
          title: "Grip fatigue increases after Station 6",
          content:
            "Station times slow noticeably in the second half of your race. Prioritise grip endurance and carry work in fatigued states.",
          severity: "warning",
        });
      }
    }
  }

  return insights
    .filter((insight, index, self) => self.findIndex((o) => o.title === insight.title) === index)
    .slice(0, 8);
}
