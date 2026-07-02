import { roundScore, weightedAverage } from "@/shared/utils/math";

import {
  acwrStressScore,
  READINESS_THRESHOLDS,
  TRAINING_RECOMMENDATIONS,
  zoneForAcwr,
  zoneForFatigue,
  zoneForHigherIsBetter,
} from "./config";
import type { RecoveryReadinessContext } from "./collectors/data-collector";
import type {
  ReadinessZone,
  RecoveryReadinessReport,
  ScoreExplanation,
  TrainingRecommendation,
} from "./types";

function metricValue(
  ctx: RecoveryReadinessContext,
  domain: keyof typeof ctx.intelligence.domains,
  key: string,
): number | null {
  const metric = ctx.intelligence.domains[domain].metrics.find((m) => m.key === key);
  return metric?.value ?? null;
}

function buildRecoveryScore(ctx: RecoveryReadinessContext): ScoreExplanation {
  const { recoveryLogs } = ctx.raw;
  const domain = ctx.intelligence.domains.recovery;
  const reasons: string[] = [];

  if (recoveryLogs.length < READINESS_THRESHOLDS.minRecoveryLogs) {
    const estimated = roundScore(ctx.intelligence.readiness * 0.85);
    reasons.push("No recovery check-ins logged — score is estimated from training load patterns.");
    reasons.push(`Estimated recovery capacity: ${estimated}/100 based on recent session balance.`);
    return {
      key: "recovery",
      label: "Recovery Score",
      score: estimated,
      zone: zoneForHigherIsBetter(estimated),
      confidence: Math.max(25, domain.confidence - 30),
      reasons,
      supported: false,
    };
  }

  const avgReadiness = metricValue(ctx, "recovery", "avg_readiness") ?? domain.score;
  const readinessDelta = metricValue(ctx, "recovery", "readiness_delta") ?? 0;
  const avgSoreness = metricValue(ctx, "recovery", "avg_soreness");

  reasons.push(
    `Average readiness over ${recoveryLogs.length} check-in${recoveryLogs.length === 1 ? "" : "s"}: ${Math.round(avgReadiness)}/100.`,
  );

  if (avgSoreness != null) {
    reasons.push(`Reported soreness averages ${avgSoreness.toFixed(1)}/10.`);
    if (avgSoreness >= READINESS_THRESHOLDS.highSorenessWarning) {
      reasons.push("Elevated soreness reduced your recovery score.");
    }
  }

  if (readinessDelta > 2) {
    reasons.push(`Readiness improved ${Math.round(readinessDelta)} points vs the prior week.`);
  } else if (readinessDelta < -2) {
    reasons.push(`Readiness dropped ${Math.abs(Math.round(readinessDelta))} points vs the prior week.`);
  } else {
    reasons.push("Readiness has been stable over the last 7 days.");
  }

  reasons.push(domain.summary);

  const score = roundScore(domain.score);

  return {
    key: "recovery",
    label: "Recovery Score",
    score,
    zone: zoneForHigherIsBetter(score),
    confidence: domain.confidence,
    reasons,
    supported: true,
  };
}

function buildReadinessScore(ctx: RecoveryReadinessContext): ScoreExplanation {
  const { recoveryLogs } = ctx.raw;
  const reasons: string[] = [];
  const latest = recoveryLogs.at(-1);
  const recent = recoveryLogs.slice(-READINESS_THRESHOLDS.recentReadinessDays);

  let baseReadiness = ctx.intelligence.readiness;
  if (latest) {
    baseReadiness = latest.readinessScore;
    reasons.push(`Latest check-in readiness: ${Math.round(latest.readinessScore)}/100.`);
  } else if (recent.length > 0) {
    const avg = recent.reduce((sum, log) => sum + log.readinessScore, 0) / recent.length;
    baseReadiness = avg;
    reasons.push(`No check-in today — using ${recent.length}-day average: ${Math.round(avg)}/100.`);
  } else {
    reasons.push("No recovery logs — readiness estimated from load and consistency signals.");
  }

  const loadPenalty =
    ctx.acwr > READINESS_THRESHOLDS.highAcwr
      ? 12
      : ctx.acwr > READINESS_THRESHOLDS.optimalAcwrMax
        ? 6
        : 0;

  if (loadPenalty > 0) {
    reasons.push(
      `Acute:chronic load ratio is ${ctx.acwr.toFixed(2)} — applied a ${loadPenalty}-point readiness adjustment.`,
    );
  } else if (ctx.acwr >= READINESS_THRESHOLDS.optimalAcwrMin) {
    reasons.push(`Training load ratio (${ctx.acwr.toFixed(2)}) is within your productive band.`);
  }

  if (latest?.energy != null) {
    reasons.push(`Self-reported energy: ${latest.energy}/10.`);
  }

  const score = roundScore(Math.max(0, baseReadiness - loadPenalty));

  return {
    key: "readiness",
    label: "Readiness Score",
    score,
    zone: zoneForHigherIsBetter(score),
    confidence: latest
      ? Math.min(95, ctx.intelligence.confidence + 10)
      : Math.max(30, ctx.intelligence.confidence - 15),
    reasons,
    supported: recoveryLogs.length >= READINESS_THRESHOLDS.minRecoveryLogs,
  };
}

function buildFatigueScore(ctx: RecoveryReadinessContext): ScoreExplanation {
  const reasons: string[] = [];
  const fatigue = ctx.intelligence.fatigue;
  const loadDomain = ctx.intelligence.domains.training_load;

  reasons.push(`Composite fatigue index: ${fatigue}/100 (higher = more fatigued).`);
  reasons.push(`7-day acute load: ${Math.round(ctx.acuteLoad)} arbitrary units.`);
  reasons.push(`Recent average RPE: ${ctx.avgRpe.toFixed(1)}/10.`);

  if (ctx.acwr > READINESS_THRESHOLDS.highAcwr) {
    reasons.push(
      `ACWR ${ctx.acwr.toFixed(2)} exceeds ${READINESS_THRESHOLDS.highAcwr} — load spike is driving fatigue up.`,
    );
  }

  const avgSoreness = metricValue(ctx, "recovery", "avg_soreness");
  if (avgSoreness != null && avgSoreness >= READINESS_THRESHOLDS.highSorenessWarning) {
    reasons.push(`Muscle soreness (${avgSoreness.toFixed(1)}/10) is contributing to accumulated fatigue.`);
  }

  reasons.push(loadDomain.summary);

  return {
    key: "fatigue",
    label: "Fatigue Score",
    score: fatigue,
    zone: zoneForFatigue(fatigue),
    confidence: roundScore((loadDomain.confidence + ctx.intelligence.domains.recovery.confidence) / 2),
    reasons,
    supported: ctx.raw.workouts.length >= 2,
  };
}

function buildSleepScore(ctx: RecoveryReadinessContext): ScoreExplanation {
  const { recoveryLogs } = ctx.raw;
  const sleepLogs = recoveryLogs
    .map((log) => log.sleepHours)
    .filter((hours): hours is number => hours != null && hours > 0);

  if (sleepLogs.length === 0) {
    return {
      key: "sleep",
      label: "Sleep Score",
      score: null,
      zone: "yellow",
      confidence: 0,
      reasons: [
        "Sleep tracking is not yet active — log sleep hours in recovery check-ins to unlock this score.",
        "Future integrations (wearables, WHOOP, Oura) will feed this automatically.",
      ],
      supported: false,
    };
  }

  const recent = sleepLogs.slice(-7);
  const avgHours = recent.reduce((sum, h) => sum + h, 0) / recent.length;
  const reasons: string[] = [
    `Average sleep over ${recent.length} logged night${recent.length === 1 ? "" : "s"}: ${avgHours.toFixed(1)} hours.`,
  ];

  let score: number;
  if (
    avgHours >= READINESS_THRESHOLDS.optimalSleepHoursMin &&
    avgHours <= READINESS_THRESHOLDS.optimalSleepHoursMax
  ) {
    score = 95;
    reasons.push("Sleep duration is in the optimal 7–9 hour range.");
  } else if (avgHours >= 6 && avgHours < READINESS_THRESHOLDS.optimalSleepHoursMin) {
    score = roundScore(55 + (avgHours - 6) * 20);
    reasons.push("Sleep is slightly below the optimal range — aim for 7+ hours.");
  } else if (avgHours > READINESS_THRESHOLDS.optimalSleepHoursMax) {
    score = 80;
    reasons.push("Sleep duration is above 9 hours — monitor for oversleep-related grogginess.");
  } else {
    score = roundScore(Math.max(20, avgHours * 12));
    reasons.push("Sleep is under 6 hours — this materially limits recovery and readiness.");
  }

  return {
    key: "sleep",
    label: "Sleep Score",
    score,
    zone: zoneForHigherIsBetter(score),
    confidence: Math.min(90, recent.length * 15),
    reasons,
    supported: true,
  };
}

function buildTrainingStressScore(ctx: RecoveryReadinessContext): ScoreExplanation {
  const score = acwrStressScore(ctx.acwr);
  const zone = zoneForAcwr(ctx.acwr);
  const reasons: string[] = [
    `Acute:chronic workload ratio (ACWR): ${ctx.acwr.toFixed(2)}.`,
    `Optimal training band: ${READINESS_THRESHOLDS.optimalAcwrMin}–${READINESS_THRESHOLDS.optimalAcwrMax}.`,
  ];

  if (zone === "green") {
    reasons.push("Training stress is balanced — load matches your recent capacity.");
  } else if (zone === "yellow") {
    reasons.push("Training stress is slightly outside the optimal band — monitor recovery closely.");
  } else if (ctx.acwr > READINESS_THRESHOLDS.highAcwr) {
    reasons.push("Acute load is spiking — injury and burnout risk increase above 1.5 ACWR.");
  } else {
    reasons.push("Training stress is very low relative to recent weeks — capacity may be underused.");
  }

  reasons.push(ctx.intelligence.domains.training_load.summary);

  return {
    key: "training_stress",
    label: "Training Stress",
    score,
    zone,
    confidence: ctx.intelligence.domains.training_load.confidence,
    reasons,
    supported: ctx.raw.workouts.length >= 3,
  };
}

function buildWorkoutLoadScore(ctx: RecoveryReadinessContext): ScoreExplanation {
  const chronicWeekly = ctx.chronicLoad;
  const acute = ctx.acuteLoad;
  const relativeLoad =
    chronicWeekly > 0 ? (acute / chronicWeekly) * 100 : acute > 0 ? 150 : 50;
  const score = roundScore(Math.min(100, relativeLoad));
  const zone =
    relativeLoad > 130 ? "red" : relativeLoad > 110 ? "yellow" : relativeLoad >= 70 ? "green" : "yellow";

  const reasons: string[] = [
    `7-day workout load: ${Math.round(acute)} units (duration × RPE weighted).`,
    `28-day weekly average: ${Math.round(chronicWeekly)} units/week.`,
    `Current week is at ${Math.round(relativeLoad)}% of your recent weekly baseline.`,
  ];

  if (ctx.avgRpe >= 8) {
    reasons.push(`High session intensity (avg RPE ${ctx.avgRpe.toFixed(1)}) is adding to cumulative load.`);
  }

  return {
    key: "workout_load",
    label: "Workout Load",
    score,
    zone,
    confidence: ctx.intelligence.domains.training_load.confidence,
    reasons,
    supported: ctx.raw.workouts.length >= 2,
  };
}

function resolveOverallZone(
  readiness: ScoreExplanation,
  fatigue: ScoreExplanation,
  trainingStress: ScoreExplanation,
): ReadinessZone {
  const readinessScore = readiness.score ?? 50;
  const fatigueScore = fatigue.score ?? 50;

  const composite = roundScore(
    weightedAverage([
      { value: readinessScore, weight: 0.45 },
      { value: 100 - fatigueScore, weight: 0.35 },
      { value: trainingStress.score ?? 50, weight: 0.2 },
    ]),
  );

  return zoneForHigherIsBetter(composite);
}

function buildRecommendation(zone: ReadinessZone, scores: RecoveryReadinessReport["scores"]): TrainingRecommendation {
  const base = TRAINING_RECOMMENDATIONS[zone];
  const actions = [...base.actions];

  if (scores.readiness.zone === "red" && zone !== "red") {
    actions.unshift("Readiness is low — consider downgrading today's session even if load is manageable.");
  }
  if (scores.fatigue.zone === "red") {
    actions.unshift("Fatigue is elevated — avoid max-effort work until markers improve.");
  }
  if (scores.trainingStress.zone === "red" && scores.trainingStress.score != null) {
    actions.unshift("Training stress is spiking — deload before adding more volume.");
  }

  return {
    zone,
    title: base.title,
    summary: base.summary,
    actions,
  };
}

export function analyzeRecoveryReadiness(ctx: RecoveryReadinessContext): RecoveryReadinessReport {
  const recovery = buildRecoveryScore(ctx);
  const readiness = buildReadinessScore(ctx);
  const fatigue = buildFatigueScore(ctx);
  const sleep = buildSleepScore(ctx);
  const trainingStress = buildTrainingStressScore(ctx);
  const workoutLoad = buildWorkoutLoadScore(ctx);

  const scores = {
    recovery,
    readiness,
    fatigue,
    sleep,
    trainingStress,
    workoutLoad,
  };

  const overallZone = resolveOverallZone(readiness, fatigue, trainingStress);
  const overallConfidence = roundScore(
    weightedAverage([
      { value: readiness.confidence, weight: 0.35 },
      { value: fatigue.confidence, weight: 0.25 },
      { value: trainingStress.confidence, weight: 0.2 },
      { value: recovery.confidence, weight: 0.2 },
    ]),
  );

  return {
    generatedAt: ctx.collectedAt.toISOString(),
    sportView: ctx.sportView,
    overallZone,
    overallConfidence,
    recommendation: buildRecommendation(overallZone, scores),
    scores,
  };
}
