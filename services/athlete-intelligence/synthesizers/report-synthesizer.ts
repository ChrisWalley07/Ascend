import type {
  AnalyzerContext,
  AthleteIntelligenceReport,
  DomainSignal,
  IntelligenceDomain,
  IntelligencePrediction,
  IntelligenceRecommendation,
  IntelligenceWarning,
  MomentumDirection,
} from "../types";
import { roundScore, weightedSum } from "../utils/math";

function overallMomentum(domains: Record<IntelligenceDomain, DomainSignal>): MomentumDirection {
  const values = Object.values(domains).map((d) => d.momentum);
  const improving = values.filter((v) => v === "improving").length;
  const declining = values.filter((v) => v === "declining").length;
  const known = values.filter((v) => v !== "insufficient_data").length;
  if (known < 3) return "insufficient_data";
  if (improving > declining + 1) return "improving";
  if (declining > improving + 1) return "declining";
  return "stable";
}

function overallConfidence(domains: Record<IntelligenceDomain, DomainSignal>): number {
  const confidences = Object.values(domains).map((d) => d.confidence);
  return roundScore(
    confidences.reduce((sum, value) => sum + value, 0) / Math.max(confidences.length, 1),
  );
}

export function synthesizeCompositeScores(
  domains: Record<IntelligenceDomain, DomainSignal>,
  ctx: AnalyzerContext,
): Pick<AthleteIntelligenceReport, "readiness" | "fitness" | "fatigue" | "momentum" | "confidence"> {
  const weights = ctx.config.compositeWeights;
  const fatigueInverse = roundScore(100 - domains.training_load.score);

  const readiness = roundScore(
    weightedSum([
      { value: domains.recovery.score, weight: weights.readiness.recovery },
      { value: fatigueInverse, weight: weights.readiness.fatigueInverse },
      { value: domains.consistency.score, weight: weights.readiness.consistency },
    ]),
  );

  const fitness = roundScore(
    weightedSum([
      { value: domains.strength_progress.score, weight: weights.fitness.strength },
      { value: domains.running_progress.score, weight: weights.fitness.running },
      { value: domains.benchmarks.score, weight: weights.fitness.benchmarks },
      { value: domains.consistency.score, weight: weights.fitness.consistency },
      { value: domains.personal_bests.score, weight: weights.fitness.personalBests },
    ]),
  );

  const fatigue = roundScore(
    weightedSum([
      { value: domains.training_load.score, weight: weights.fatigue.trainingLoad },
      { value: roundScore(100 - domains.recovery.score), weight: weights.fatigue.recoveryInverse },
      {
        value: roundScore(
          (domains.training_load.metrics.find((m) => m.key === "avg_rpe")?.value ??
            ctx.config.thresholds.defaultRpe) * 10,
        ),
        weight: weights.fatigue.rpe,
      },
    ]),
  );

  return {
    readiness,
    fitness,
    fatigue,
    momentum: overallMomentum(domains),
    confidence: overallConfidence(domains),
  };
}

export function buildRecommendations(
  domains: Record<IntelligenceDomain, DomainSignal>,
  ctx: AnalyzerContext,
): IntelligenceRecommendation[] {
  const { thresholds } = ctx.config;
  const recs: IntelligenceRecommendation[] = [];

  if (domains.workout_frequency.score < 60) {
    recs.push({
      id: "freq-below-target",
      domain: "workout_frequency",
      title: "Protect your training rhythm",
      message: `Aim for ${ctx.data.profile?.trainingDaysPerWeek ?? thresholds.consistencyTargetSessionsPerWeek} sessions per week to build momentum.`,
      severity: "warning",
      priority: 90,
    });
  }

  if (domains.recovery.score < thresholds.lowReadinessWarning) {
    recs.push({
      id: "recovery-low",
      domain: "recovery",
      title: "Prioritise recovery",
      message: "Readiness is below your baseline. Consider a lighter session or active recovery day.",
      severity: "warning",
      priority: 95,
    });
  }

  const acwr = domains.training_load.metrics.find((m) => m.key === "acwr")?.value ?? 0;
  if (acwr > thresholds.highFatigueAcwr) {
    recs.push({
      id: "load-spike",
      domain: "training_load",
      title: "Manage the load spike",
      message: "Acute training load is elevated. Deload or reduce intensity before your next hard block.",
      severity: "warning",
      priority: 92,
    });
  }

  if (domains.personal_bests.score < 40 && domains.workout_frequency.score >= 60) {
    recs.push({
      id: "pb-retest",
      domain: "personal_bests",
      title: "Schedule a PB retest",
      message: "You are training consistently — pick 1–2 target lifts or efforts to retest this week.",
      severity: "info",
      priority: 70,
    });
  }

  if (domains.running_progress.momentum === "improving") {
    recs.push({
      id: "running-continue",
      domain: "running_progress",
      title: "Running is responding",
      message: "Pace trends are positive. Maintain your current run frequency and progress gradually.",
      severity: "success",
      priority: 50,
    });
  }

  return recs.sort((a, b) => b.priority - a.priority);
}

export function buildWarnings(
  domains: Record<IntelligenceDomain, DomainSignal>,
  ctx: AnalyzerContext,
): IntelligenceWarning[] {
  const { thresholds } = ctx.config;
  const warnings: IntelligenceWarning[] = [];

  const avgSoreness = domains.recovery.metrics.find((m) => m.key === "avg_soreness")?.value;
  if (avgSoreness != null && avgSoreness >= thresholds.highSorenessWarning) {
    warnings.push({
      id: "high-soreness",
      domain: "recovery",
      title: "Elevated soreness",
      message: "Soreness is running high. Monitor movement quality and sleep before pushing intensity.",
      severity: "warning",
      priority: 88,
    });
  }

  const acwr = domains.training_load.metrics.find((m) => m.key === "acwr")?.value ?? 0;
  if (acwr > thresholds.highFatigueAcwr && domains.recovery.score < thresholds.lowReadinessWarning) {
    warnings.push({
      id: "overreach-risk",
      domain: "training_load",
      title: "Overreach risk",
      message: "High load combined with low readiness increases injury and burnout risk.",
      severity: "critical",
      priority: 99,
    });
  }

  if (domains.consistency.score < 40) {
    warnings.push({
      id: "consistency-gap",
      domain: "consistency",
      title: "Consistency gap",
      message: "Irregular training is limiting adaptation. Shorter, more frequent sessions may help.",
      severity: "warning",
      priority: 80,
    });
  }

  return warnings.sort((a, b) => b.priority - a.priority);
}

export function buildPredictions(
  domains: Record<IntelligenceDomain, DomainSignal>,
  ctx: AnalyzerContext,
): IntelligencePrediction[] {
  const predictions: IntelligencePrediction[] = [];

  if (ctx.data.sportView === "hyrox" && domains.race_results.score > 0) {
    const latest = domains.race_results.metrics.find((m) => m.key === "latest_finish")?.value;
    const delta = domains.race_results.metrics.find((m) => m.key === "race_delta")?.value ?? 0;
    if (latest != null && delta > 0) {
      predictions.push({
        id: "hyrox-finish-trend",
        domain: "race_results",
        title: "Race finish projection",
        message: `At your current race-to-race trend, you could shave ~${Math.round(delta)}s off your next finish within 4–6 weeks.`,
        horizonDays: 42,
        confidence: domains.race_results.confidence,
      });
    }
  }

  if (domains.strength_progress.momentum === "improving") {
    predictions.push({
      id: "strength-gain",
      domain: "strength_progress",
      title: "Strength trajectory",
      message: "Top-end lifts are trending up. A structured strength block could yield further gains in 6–8 weeks.",
      horizonDays: 56,
      confidence: domains.strength_progress.confidence,
    });
  }

  if (domains.running_progress.momentum === "improving") {
    predictions.push({
      id: "running-pace",
      domain: "running_progress",
      title: "Running pace outlook",
      message: "Pace samples are improving. Sustained aerobic work should continue to lower race splits.",
      horizonDays: 28,
      confidence: domains.running_progress.confidence,
    });
  }

  return predictions.sort((a, b) => b.confidence - a.confidence);
}
