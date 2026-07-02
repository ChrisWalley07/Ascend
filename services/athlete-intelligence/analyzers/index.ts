import type { AnalyzerContext, DomainAnalyzer, DomainSignal } from "../types";
import {
  acuteChronicLoad,
  averageRpe,
  workoutLoadUnits,
} from "../utils/workout-metrics";
import {
  clamp,
  confidenceFromSampleSize,
  momentumFromTrend,
  roundScore,
  trendFromSlope,
  linearTrendSlope,
} from "../utils/math";
import { sessionsPerWeek } from "../utils/dates";

function emptySignal(domain: DomainAnalyzer["domain"], summary: string): DomainSignal {
  return {
    domain,
    score: 0,
    momentum: "insufficient_data",
    confidence: 0,
    metrics: [],
    summary,
  };
}

export const trainingLoadAnalyzer: DomainAnalyzer = {
  domain: "training_load",
  analyze(ctx): DomainSignal {
    const { data, config, now } = ctx;
    const { thresholds } = config;
    const { workouts } = data;

    if (workouts.length < thresholds.minWorkoutsForAnalysis) {
      return emptySignal("training_load", "Not enough sessions to model training load.");
    }

    const { acute, chronic, acwr } = acuteChronicLoad(
      workouts,
      now,
      thresholds.acuteLoadDays,
      thresholds.chronicLoadDays,
      thresholds.defaultRpe,
    );

    const loadSeries = workouts.map((w) => workoutLoadUnits(w, thresholds.defaultRpe));
    const slope = linearTrendSlope(loadSeries.slice(-thresholds.minDataPointsForTrend));
    const trend = trendFromSlope(slope, 0.5, 0.5);

    const optimalMid = (thresholds.optimalAcwrMin + thresholds.optimalAcwrMax) / 2;
    const acwrDistance = Math.abs(acwr - optimalMid);
    const acwrScore = roundScore(100 - acwrDistance * 50);

    const avgRpe = averageRpe(workouts.slice(-thresholds.acuteLoadDays), thresholds.defaultRpe);

    return {
      domain: "training_load",
      score: acwrScore,
      momentum: momentumFromTrend(
        trend,
        loadSeries.length >= thresholds.minDataPointsForTrend,
      ),
      confidence: confidenceFromSampleSize(
        workouts.length,
        thresholds.minWorkoutsForAnalysis,
        thresholds.chronicLoadDays,
      ),
      metrics: [
        { key: "acute_load", label: "Acute load (7d)", value: roundScore(acute), unit: "au" },
        { key: "chronic_load", label: "Chronic load (28d/wk)", value: roundScore(chronic), unit: "au" },
        { key: "acwr", label: "Acute:Chronic ratio", value: Number(acwr.toFixed(2)) },
        { key: "avg_rpe", label: "Recent avg RPE", value: Number(avgRpe.toFixed(1)), unit: "rpe" },
      ],
      summary:
        acwr > thresholds.highFatigueAcwr
          ? "Training load is spiking above your recent baseline."
          : acwr >= thresholds.optimalAcwrMin && acwr <= thresholds.optimalAcwrMax
            ? "Training load is in a productive range."
            : "Training load is below your recent capacity.",
    };
  },
};

export const weeklyVolumeAnalyzer: DomainAnalyzer = {
  domain: "weekly_volume",
  analyze(ctx): DomainSignal {
    const { data, config } = ctx;
    const { thresholds } = config;
    const { workouts } = data;

    if (workouts.length === 0) {
      return emptySignal("weekly_volume", "No training volume recorded in the analysis window.");
    }

    const weeklySeries = (() => {
      const byWeek = new Map<string, number>();
      for (const workout of workouts) {
        const weekStart = new Date(workout.date);
        weekStart.setDate(weekStart.getDate() - weekStart.getDay());
        const key = weekStart.toISOString().slice(0, 10);
        const kg = workout.exercises.reduce(
          (sum, ex) => sum + (ex.weightKg ?? 0) * (ex.reps ?? 0),
          0,
        );
        const minutes = (workout.durationSeconds ?? 0) / 60;
        byWeek.set(key, (byWeek.get(key) ?? 0) + kg + minutes);
      }
      return Array.from(byWeek.values());
    })();

    const recent = weeklySeries.slice(-4);
    const prior = weeklySeries.slice(-8, -4);
    const recentAvg = recent.length > 0 ? recent.reduce((a, b) => a + b, 0) / recent.length : 0;
    const priorAvg = prior.length > 0 ? prior.reduce((a, b) => a + b, 0) / prior.length : recentAvg;
    const changePct = priorAvg > 0 ? ((recentAvg - priorAvg) / priorAvg) * 100 : 0;

    const slope = linearTrendSlope(weeklySeries);
    const trend = trendFromSlope(slope, thresholds.trendImprovementPercent / 10, thresholds.trendDeclinePercent / 10);

    const targetWeekly = (data.profile?.trainingDaysPerWeek ?? thresholds.consistencyTargetSessionsPerWeek) * 1000;
    const volumeScore = roundScore(clamp((recentAvg / Math.max(targetWeekly, 1)) * 100, 0, 100));

    return {
      domain: "weekly_volume",
      score: volumeScore,
      momentum: momentumFromTrend(trend, weeklySeries.length >= thresholds.minDataPointsForTrend),
      confidence: confidenceFromSampleSize(weeklySeries.length, 2, 8),
      metrics: [
        { key: "recent_weekly_avg", label: "Recent weekly volume", value: roundScore(recentAvg) },
        { key: "volume_change_pct", label: "Volume change", value: roundScore(changePct), unit: "%", trend: changePct > 0 ? "up" : changePct < 0 ? "down" : "flat" },
        { key: "weeks_tracked", label: "Weeks tracked", value: weeklySeries.length },
      ],
      summary:
        changePct > thresholds.trendImprovementPercent
          ? "Weekly volume is trending up."
          : changePct < -thresholds.trendDeclinePercent
            ? "Weekly volume has dipped recently."
            : "Weekly volume is holding steady.",
    };
  },
};

export const workoutFrequencyAnalyzer: DomainAnalyzer = {
  domain: "workout_frequency",
  analyze(ctx): DomainSignal {
    const { data, config } = ctx;
    const { thresholds } = config;
    const { workouts } = data;
    const sessionsWeek = sessionsPerWeek(workouts.length, config.analysisWindowDays);
    const target = data.profile?.trainingDaysPerWeek ?? thresholds.consistencyTargetSessionsPerWeek;
    const adherence = target > 0 ? sessionsWeek / target : sessionsWeek / thresholds.consistencyTargetSessionsPerWeek;
    const score = roundScore(clamp(adherence * 100, 0, 100));

    const byWeek = new Map<string, number>();
    for (const workout of workouts) {
      const weekStart = new Date(workout.date);
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      const key = weekStart.toISOString().slice(0, 10);
      byWeek.set(key, (byWeek.get(key) ?? 0) + 1);
    }
    const freqSeries = Array.from(byWeek.values());
    const slope = linearTrendSlope(freqSeries);
    const trend = trendFromSlope(slope, 0.1, 0.1);

    return {
      domain: "workout_frequency",
      score,
      momentum: momentumFromTrend(trend, freqSeries.length >= thresholds.minDataPointsForTrend),
      confidence: confidenceFromSampleSize(workouts.length, thresholds.minWorkoutsForAnalysis, 20),
      metrics: [
        { key: "sessions_per_week", label: "Sessions / week", value: Number(sessionsWeek.toFixed(1)) },
        { key: "target_sessions", label: "Target sessions / week", value: target },
        { key: "adherence_pct", label: "Frequency adherence", value: roundScore(adherence * 100), unit: "%" },
      ],
      summary:
        sessionsWeek >= target
          ? "You are hitting your target training frequency."
          : `Training frequency is below your ${target}-day target.`,
    };
  },
};

export const recoveryAnalyzer: DomainAnalyzer = {
  domain: "recovery",
  analyze(ctx): DomainSignal {
    const { data, config } = ctx;
    const { thresholds } = config;
    const { recoveryLogs } = data;

    if (recoveryLogs.length < thresholds.minRecoveryLogsForAnalysis) {
      return emptySignal("recovery", "Log recovery check-ins to unlock readiness insights.");
    }

    const readiness = recoveryLogs.map((l) => l.readinessScore);
    const avgReadiness = readiness.reduce((a, b) => a + b, 0) / readiness.length;
    const recent = readiness.slice(-7);
    const prior = readiness.slice(-14, -7);
    const recentAvg = recent.length > 0 ? recent.reduce((a, b) => a + b, 0) / recent.length : avgReadiness;
    const priorAvg = prior.length > 0 ? prior.reduce((a, b) => a + b, 0) / prior.length : recentAvg;
    const delta = recentAvg - priorAvg;

    const soreness = recoveryLogs
      .map((l) => l.soreness)
      .filter((v): v is number => v != null);
    const avgSoreness = soreness.length > 0 ? soreness.reduce((a, b) => a + b, 0) / soreness.length : 5;

    const slope = linearTrendSlope(readiness);
    const trend = trendFromSlope(slope, 1, 1);
    const score = roundScore(avgReadiness - Math.max(0, avgSoreness - 5) * 3);

    return {
      domain: "recovery",
      score,
      momentum: momentumFromTrend(trend, readiness.length >= thresholds.minDataPointsForTrend),
      confidence: confidenceFromSampleSize(
        recoveryLogs.length,
        thresholds.minRecoveryLogsForAnalysis,
        14,
      ),
      metrics: [
        { key: "avg_readiness", label: "Avg readiness", value: roundScore(avgReadiness) },
        { key: "readiness_delta", label: "7d readiness change", value: roundScore(delta), trend: delta > 0 ? "up" : delta < 0 ? "down" : "flat" },
        { key: "avg_soreness", label: "Avg soreness", value: Number(avgSoreness.toFixed(1)), unit: "/10" },
      ],
      summary:
        avgReadiness < thresholds.lowReadinessWarning
          ? "Recovery markers suggest you may need more rest."
          : delta > 0
            ? "Readiness is improving over the last week."
            : "Recovery is stable.",
    };
  },
};

export const runningProgressAnalyzer: DomainAnalyzer = {
  domain: "running_progress",
  analyze(ctx): DomainSignal {
    const { data, config } = ctx;
    const { thresholds } = config;

    const workoutPaces = data.workouts
      .flatMap((w) =>
        w.exercises
          .filter((ex) => (ex.distanceMeters ?? 0) >= 800 && (ex.timeSeconds ?? 0) > 0)
          .map((ex) => ({
            date: w.date,
            pacePerKm: (ex.timeSeconds ?? 0) / ((ex.distanceMeters ?? 1) / 1000),
          })),
      )
      .sort((a, b) => a.date.getTime() - b.date.getTime());

    const racePaces = data.races
      .flatMap((race) =>
        race.splits
          .filter((s) => s.pacePerKmSeconds != null)
          .map((s) => ({ date: race.raceDate, pacePerKm: s.pacePerKmSeconds as number })),
      )
      .sort((a, b) => a.date.getTime() - b.date.getTime());

    const paceSamples = [...workoutPaces, ...racePaces].sort(
      (a, b) => a.date.getTime() - b.date.getTime(),
    );

    if (paceSamples.length < thresholds.minDataPointsForTrend) {
      return emptySignal("running_progress", "Not enough running data to assess pace progression.");
    }

    const paces = paceSamples.map((p) => p.pacePerKm);
    const recent = average(paces.slice(-3));
    const prior = average(paces.slice(-6, -3));
    const improvement = prior - recent;
    const slope = linearTrendSlope(paces.map((p) => -p));
    const trend = trendFromSlope(slope, thresholds.runningPaceImprovementSeconds / 10, thresholds.runningPaceImprovementSeconds / 10);
    const score = roundScore(clamp(50 + improvement * 2, 0, 100));

    return {
      domain: "running_progress",
      score,
      momentum: momentumFromTrend(trend, paceSamples.length >= thresholds.minDataPointsForTrend),
      confidence: confidenceFromSampleSize(paceSamples.length, thresholds.minDataPointsForTrend, 12),
      metrics: [
        { key: "recent_pace", label: "Recent pace", value: roundScore(recent), unit: "sec/km" },
        { key: "pace_improvement", label: "Pace improvement", value: roundScore(improvement), unit: "sec", trend: improvement > 0 ? "up" : improvement < 0 ? "down" : "flat" },
        { key: "samples", label: "Running samples", value: paceSamples.length },
      ],
      summary:
        improvement >= thresholds.runningPaceImprovementSeconds
          ? "Running pace is improving."
          : improvement <= -thresholds.runningPaceImprovementSeconds
            ? "Running pace has slowed recently."
            : "Running pace is holding steady.",
    };
  },
};

function average(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

export const strengthProgressAnalyzer: DomainAnalyzer = {
  domain: "strength_progress",
  analyze(ctx): DomainSignal {
    const { data, config } = ctx;
    const { thresholds } = config;

    const strengthPbs = data.personalBests.filter((pb) =>
      ["STRENGTH", "OLYMPIC", "POWER"].includes(pb.category),
    );

    const workoutWeights = data.workouts
      .flatMap((w) =>
        w.exercises
          .filter((ex) => (ex.weightKg ?? 0) > 0)
          .map((ex) => ({ date: w.date, weight: ex.weightKg as number })),
      )
      .sort((a, b) => a.date.getTime() - b.date.getTime());

    const topRecent = workoutWeights.slice(-20).map((w) => w.weight).sort((a, b) => b - a).slice(0, 3);
    const topPrior = workoutWeights.slice(-40, -20).map((w) => w.weight).sort((a, b) => b - a).slice(0, 3);
    const recentAvg = topRecent.length > 0 ? average(topRecent) : 0;
    const priorAvg = topPrior.length > 0 ? average(topPrior) : recentAvg;
    const delta = recentAvg - priorAvg;

    const pbRecent = strengthPbs.filter(
      (pb) => pb.achievedAt >= new Date(ctx.now.getTime() - 30 * 24 * 60 * 60 * 1000),
    ).length;

    const score = roundScore(
      clamp((recentAvg / thresholds.strengthReferenceKg) * 100 + pbRecent * 5, 0, 100),
    );
    const slope = linearTrendSlope(workoutWeights.map((w) => w.weight).slice(-thresholds.minDataPointsForTrend));
    const trend = trendFromSlope(slope, 2, 2);

    return {
      domain: "strength_progress",
      score,
      momentum: momentumFromTrend(
        trend,
        workoutWeights.length >= thresholds.minDataPointsForTrend || strengthPbs.length > 0,
      ),
      confidence: confidenceFromSampleSize(
        workoutWeights.length + strengthPbs.length,
        thresholds.minDataPointsForTrend,
        20,
      ),
      metrics: [
        { key: "top_lift_avg", label: "Recent top-lift avg", value: roundScore(recentAvg), unit: "kg" },
        { key: "strength_delta", label: "Strength delta", value: roundScore(delta), unit: "kg", trend: delta > 0 ? "up" : delta < 0 ? "down" : "flat" },
        { key: "recent_strength_pbs", label: "Strength PBs (30d)", value: pbRecent },
      ],
      summary:
        delta > 0 || pbRecent > 0
          ? "Strength markers are moving in the right direction."
          : workoutWeights.length === 0
            ? "No strength work logged in the analysis window."
            : "Strength output is stable.",
    };
  },
};

export const consistencyAnalyzer: DomainAnalyzer = {
  domain: "consistency",
  analyze(ctx): DomainSignal {
    const freq = workoutFrequencyAnalyzer.analyze(ctx);
    const volume = weeklyVolumeAnalyzer.analyze(ctx);
    const score = roundScore((freq.score * 0.6 + volume.score * 0.4));

    return {
      domain: "consistency",
      score,
      momentum: freq.momentum === volume.momentum ? freq.momentum : "stable",
      confidence: roundScore((freq.confidence + volume.confidence) / 2),
      metrics: [
        ...freq.metrics.filter((m) => m.key === "sessions_per_week"),
        ...volume.metrics.filter((m) => m.key === "volume_change_pct"),
        { key: "consistency_score", label: "Consistency score", value: score },
      ],
      summary:
        score >= 75
          ? "Training consistency is strong."
          : score >= 50
            ? "Consistency is moderate — small habit wins will compound."
            : "Consistency is the biggest lever right now.",
    };
  },
};

export const benchmarksAnalyzer: DomainAnalyzer = {
  domain: "benchmarks",
  analyze(ctx): DomainSignal {
    const { data, config } = ctx;
    const { thresholds } = config;
    const { benchmarkAttempts } = data;

    if (benchmarkAttempts.length === 0) {
      return emptySignal("benchmarks", "No benchmark attempts logged yet.");
    }

    const byBenchmark = new Map<string, typeof benchmarkAttempts>();
    for (const attempt of benchmarkAttempts) {
      const bucket = byBenchmark.get(attempt.benchmarkName) ?? [];
      bucket.push(attempt);
      byBenchmark.set(attempt.benchmarkName, bucket);
    }

    let improvements = 0;
    let tracked = 0;
    for (const attempts of byBenchmark.values()) {
      if (attempts.length < 2) continue;
      tracked += 1;
      const sorted = [...attempts].sort((a, b) => a.date.getTime() - b.date.getTime());
      const first = sorted[0].scoreValue ?? sorted[0].score;
      const last = sorted[sorted.length - 1].scoreValue ?? sorted[sorted.length - 1].score;
      if (last < first) improvements += 1;
    }

    const improvementRate = tracked > 0 ? improvements / tracked : 0;
    const recentCount = benchmarkAttempts.filter(
      (a) => a.date >= new Date(ctx.now.getTime() - 30 * 24 * 60 * 60 * 1000),
    ).length;
    const score = roundScore(improvementRate * 70 + Math.min(recentCount * 10, 30));

    return {
      domain: "benchmarks",
      score,
      momentum: improvementRate > 0.5 ? "improving" : tracked > 0 ? "stable" : "insufficient_data",
      confidence: confidenceFromSampleSize(benchmarkAttempts.length, 1, 10),
      metrics: [
        { key: "benchmark_attempts", label: "Attempts tracked", value: benchmarkAttempts.length },
        { key: "benchmarks_improving", label: "Benchmarks improving", value: improvements },
        { key: "recent_attempts_30d", label: "Attempts (30d)", value: recentCount },
      ],
      summary:
        improvements > 0
          ? `${improvements} benchmark${improvements === 1 ? "" : "s"} trending faster.`
          : "Benchmarks are logged — retest to confirm progress.",
    };
  },
};

export const personalBestsAnalyzer: DomainAnalyzer = {
  domain: "personal_bests",
  analyze(ctx): DomainSignal {
    const { data, config } = ctx;
    const { personalBests } = data;
    const thirtyDaysAgo = new Date(ctx.now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const ninetyDaysAgo = new Date(ctx.now.getTime() - 90 * 24 * 60 * 60 * 1000);

    const recent = personalBests.filter((pb) => pb.achievedAt >= thirtyDaysAgo);
    const prior = personalBests.filter(
      (pb) => pb.achievedAt >= ninetyDaysAgo && pb.achievedAt < thirtyDaysAgo,
    );
    const coreCount = personalBests.length;
    const score = roundScore(clamp(recent.length * 15 + coreCount * 2, 0, 100));

    return {
      domain: "personal_bests",
      score,
      momentum:
        recent.length > prior.length
          ? "improving"
          : recent.length === 0
            ? "insufficient_data"
            : "stable",
      confidence: confidenceFromSampleSize(personalBests.length, 1, 15),
      metrics: [
        { key: "total_pbs", label: "PBs logged", value: coreCount },
        { key: "pbs_30d", label: "PBs (30d)", value: recent.length },
        { key: "pbs_30_90d", label: "PBs (30–90d)", value: prior.length },
      ],
      summary:
        recent.length > 0
          ? `${recent.length} new PB${recent.length === 1 ? "" : "s"} in the last 30 days.`
          : "No recent PBs — target a retest week.",
    };
  },
};

export const raceResultsAnalyzer: DomainAnalyzer = {
  domain: "race_results",
  analyze(ctx): DomainSignal {
    const { data, config } = ctx;
    const { thresholds } = config;
    const finished = data.races.filter((r) => r.finishTimeSeconds != null);

    if (data.sportView !== "hyrox" || finished.length === 0) {
      return emptySignal(
        "race_results",
        data.sportView === "hyrox"
          ? "No completed races logged yet."
          : "Race analysis is available in Hyrox view.",
      );
    }

    const times = finished.map((r) => r.finishTimeSeconds as number);
    const recent = times.slice(-1)[0];
    const best = Math.min(...times);
    const prior = times.length > 1 ? times[times.length - 2] : recent;
    const delta = prior - recent;
    const slope = linearTrendSlope(times.map((t) => -t));
    const trend = trendFromSlope(slope, thresholds.runningPaceImprovementSeconds, thresholds.runningPaceImprovementSeconds);
    const score = roundScore(clamp(100 - ((recent - best) / best) * 100, 0, 100));

    return {
      domain: "race_results",
      score,
      momentum: momentumFromTrend(trend, finished.length >= thresholds.minDataPointsForTrend),
      confidence: confidenceFromSampleSize(finished.length, 1, 5),
      metrics: [
        { key: "races_completed", label: "Races completed", value: finished.length },
        { key: "latest_finish", label: "Latest finish", value: recent, unit: "sec" },
        { key: "race_delta", label: "Race-to-race delta", value: roundScore(delta), unit: "sec", trend: delta > 0 ? "up" : delta < 0 ? "down" : "flat" },
      ],
      summary:
        delta > 0
          ? "Latest race was faster than your previous finish."
          : delta < 0
            ? "Latest race was slower — review station splits."
            : "Race results are stable.",
    };
  },
};

export const DEFAULT_ANALYZERS: DomainAnalyzer[] = [
  trainingLoadAnalyzer,
  weeklyVolumeAnalyzer,
  workoutFrequencyAnalyzer,
  recoveryAnalyzer,
  runningProgressAnalyzer,
  strengthProgressAnalyzer,
  consistencyAnalyzer,
  benchmarksAnalyzer,
  personalBestsAnalyzer,
  raceResultsAnalyzer,
];
