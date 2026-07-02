import { COACH_THRESHOLDS } from "../config";
import type { CoachDataContext, CoachRecommendation, CoachRule } from "../types";

function rec(
  partial: Omit<CoachRecommendation, "tags"> & { tags?: string[] },
): CoachRecommendation {
  return { tags: [], ...partial };
}

function domainScore(ctx: CoachDataContext, key: string): number {
  const domain = ctx.intelligence?.domains[key as keyof typeof ctx.intelligence.domains];
  return domain?.score ?? 0;
}

function domainMomentum(ctx: CoachDataContext, key: string): string {
  return ctx.intelligence?.domains[key as keyof typeof ctx.intelligence.domains]?.momentum ?? "insufficient_data";
}

const sharedRules: CoachRule[] = [
  {
    id: "daily-check-in-missing",
    section: "recovery_advice",
    evaluate(ctx) {
      if (ctx.avgReadiness != null) return null;
      return rec({
        id: "daily-check-in-missing",
        section: "recovery_advice",
        title: "Log a daily check-in",
        reason: "No recovery check-ins yet — readiness scores are estimated from training load only.",
        priority: 88,
        confidence: 90,
        action: "Rate readiness 1–10 on your dashboard. Add sleep hours to unlock sleep scoring.",
        tags: ["recovery", "check-in"],
      });
    },
  },
  {
    id: "profile-incomplete",
    section: "todays_recommendation",
    evaluate(ctx) {
      if (ctx.profileComplete) return null;
      return rec({
        id: "profile-incomplete",
        section: "todays_recommendation",
        title: "Complete your athlete profile",
        reason: "Profile data unlocks sport-specific scoring, goal alignment, and higher-confidence recommendations.",
        priority: 85,
        confidence: 95,
        action: "Open Profile and fill in training background, goals, and focus areas.",
        tags: ["profile"],
      });
    },
  },
  {
    id: "low-data",
    section: "todays_recommendation",
    evaluate(ctx) {
      if (ctx.recentWorkoutCount >= COACH_THRESHOLDS.minWorkoutsForCoach) return null;
      return rec({
        id: "low-data",
        section: "todays_recommendation",
        title: "Log your next session",
        reason: `Only ${ctx.recentWorkoutCount} workout(s) logged in the last 30 days — the coach needs more signal to personalise advice.`,
        priority: 90,
        confidence: 88,
        action: "Log a workout or recovery check-in today to improve recommendation accuracy.",
        tags: ["consistency", "data"],
      });
    },
  },
  {
    id: "readiness-low-rest",
    section: "todays_recommendation",
    evaluate(ctx) {
      if (ctx.avgReadiness == null || ctx.avgReadiness >= COACH_THRESHOLDS.lowReadiness) return null;
      return rec({
        id: "readiness-low-rest",
        section: "todays_recommendation",
        title: "Prioritise recovery today",
        reason: `Average readiness is ${Math.round(ctx.avgReadiness)}/100 over the last 30 days — below your productive training threshold.`,
        priority: 92,
        confidence: Math.min(95, 60 + (COACH_THRESHOLDS.lowReadiness - ctx.avgReadiness)),
        action: "Take a light mobility or aerobic flush session. Avoid max-effort lifting today.",
        tags: ["recovery"],
      });
    },
  },
  {
    id: "readiness-high-train",
    section: "todays_recommendation",
    evaluate(ctx) {
      if (ctx.avgReadiness == null || ctx.avgReadiness < 70) return null;
      if (ctx.acwr != null && ctx.acwr > COACH_THRESHOLDS.highAcwr) return null;
      const weakest = ctx.intelligence?.domains.strength_progress.score ?? 50;
      const focus =
        domainScore(ctx, "strength_progress") < domainScore(ctx, "running_progress")
          ? "a strength or skill session"
          : "a conditioning session";
      return rec({
        id: "readiness-high-train",
        section: "todays_recommendation",
        title: "Green light for quality training",
        reason: `Readiness is ${Math.round(ctx.avgReadiness)}/100 with manageable load (ACWR ${ctx.acwr?.toFixed(2) ?? "—"}).`,
        priority: 88,
        confidence: Math.min(92, Math.round(ctx.avgReadiness)),
        action: `Schedule ${focus} while energy is high. Hit your primary movement pattern with intent.`,
        tags: ["recovery", "training"],
      });
    },
  },
  {
    id: "load-spike-deload",
    section: "todays_recommendation",
    evaluate(ctx) {
      if (ctx.acwr == null || ctx.acwr <= COACH_THRESHOLDS.highAcwr) return null;
      return rec({
        id: "load-spike-deload",
        section: "todays_recommendation",
        title: "Reduce intensity today",
        reason: `Acute:chronic load ratio is ${ctx.acwr.toFixed(2)} — above the safe training band (${COACH_THRESHOLDS.optimalAcwrMin}–${COACH_THRESHOLDS.optimalAcwrMax}).`,
        priority: 94,
        confidence: Math.min(96, Math.round(ctx.acwr * 50)),
        action: "Swap heavy work for technique, zone 2 cardio, or a full rest day.",
        tags: ["training_load", "risk"],
      });
    },
  },
  {
    id: "recovery-soreness",
    section: "recovery_advice",
    evaluate(ctx) {
      if (ctx.avgSoreness == null || ctx.avgSoreness < COACH_THRESHOLDS.highSoreness) return null;
      return rec({
        id: "recovery-soreness",
        section: "recovery_advice",
        title: "Manage elevated soreness",
        reason: `Average soreness is ${ctx.avgSoreness.toFixed(1)}/10 — tissue stress is accumulating faster than you're recovering.`,
        priority: 88,
        confidence: Math.min(90, Math.round(ctx.avgSoreness * 10)),
        action: "Prioritise sleep, hydration, and low-impact movement. Delay high-RPE sessions 24–48h.",
        tags: ["recovery"],
      });
    },
  },
  {
    id: "recovery-readiness-trend",
    section: "recovery_advice",
    evaluate(ctx) {
      const momentum = domainMomentum(ctx, "recovery");
      if (momentum !== "declining" || ctx.avgReadiness == null) return null;
      return rec({
        id: "recovery-readiness-trend",
        section: "recovery_advice",
        title: "Readiness is trending down",
        reason: `Recovery domain momentum is declining with avg readiness at ${Math.round(ctx.avgReadiness)}/100.`,
        priority: 82,
        confidence: domainScore(ctx, "recovery"),
        action: "Add one extra rest day this week. Log sleep and soreness daily to track the rebound.",
        tags: ["recovery", "trends"],
      });
    },
  },
  {
    id: "recovery-stable",
    section: "recovery_advice",
    evaluate(ctx) {
      if (ctx.avgReadiness == null || ctx.avgReadiness < 65) return null;
      if (domainMomentum(ctx, "recovery") === "declining") return null;
      return rec({
        id: "recovery-stable",
        section: "recovery_advice",
        title: "Recovery is supporting your training",
        reason: `Readiness averages ${Math.round(ctx.avgReadiness)}/100 with stable recovery signals.`,
        priority: 70,
        confidence: Math.min(88, Math.round(ctx.avgReadiness)),
        action: "Maintain current sleep and mobility habits. Use readiness to modulate session intensity.",
        tags: ["recovery"],
      });
    },
  },
  {
    id: "focus-weakest-domain",
    section: "training_focus",
    evaluate(ctx) {
      if (!ctx.intelligence) return null;
      const domains = Object.values(ctx.intelligence.domains).filter((d) => d.confidence > 30);
      if (domains.length === 0) return null;
      const weakest = [...domains].sort((a, b) => a.score - b.score)[0];
      return rec({
        id: "focus-weakest-domain",
        section: "training_focus",
        title: `Build ${weakest.domain.replace(/_/g, " ")}`,
        reason: `${weakest.summary} (score ${weakest.score}/100, confidence ${weakest.confidence}%).`,
        priority: 86,
        confidence: weakest.confidence,
        action: `Dedicate 1–2 sessions this week to ${weakest.domain.replace(/_/g, " ")} work aligned with your sport.`,
        tags: ["weakness", "training"],
      });
    },
  },
  {
    id: "focus-consistency",
    section: "training_focus",
    evaluate(ctx) {
      if (domainScore(ctx, "consistency") >= COACH_THRESHOLDS.lowConsistencyScore) return null;
      const target = ctx.trainingDaysPerWeek ?? COACH_THRESHOLDS.minSessionsPerWeek;
      return rec({
        id: "focus-consistency",
        section: "training_focus",
        title: "Rebuild training rhythm",
        reason: `You're averaging ${ctx.sessionsPerWeek.toFixed(1)} sessions/week vs a ${target}-day target.`,
        priority: 84,
        confidence: domainScore(ctx, "consistency"),
        action: "Block recurring training slots in your calendar. Shorter sessions beat skipped days.",
        tags: ["consistency"],
      });
    },
  },
  {
    id: "improvement-running",
    section: "biggest_improvement",
    evaluate(ctx) {
      if (domainMomentum(ctx, "running_progress") !== "improving") return null;
      return rec({
        id: "improvement-running",
        section: "biggest_improvement",
        title: "Running pace is improving",
        reason: ctx.intelligence?.domains.running_progress.summary ?? "Running samples show positive pace progression.",
        priority: 80,
        confidence: domainScore(ctx, "running_progress"),
        action: "Continue progressive aerobic work. Add one controlled tempo run per week.",
        tags: ["trends", "running"],
      });
    },
  },
  {
    id: "improvement-strength",
    section: "biggest_improvement",
    evaluate(ctx) {
      if (domainMomentum(ctx, "strength_progress") !== "improving") return null;
      return rec({
        id: "improvement-strength",
        section: "biggest_improvement",
        title: "Strength is trending up",
        reason: ctx.intelligence?.domains.strength_progress.summary ?? "Top-end lifts and strength PBs are moving positively.",
        priority: 78,
        confidence: domainScore(ctx, "strength_progress"),
        action: "Ride the wave with structured progressive overload. Retest a key lift in 2–3 weeks.",
        tags: ["trends", "strength"],
      });
    },
  },
  {
    id: "improvement-pbs",
    section: "biggest_improvement",
    evaluate(ctx) {
      const recentPbs = ctx.intelligence?.domains.personal_bests.metrics.find((m) => m.key === "pbs_30d")?.value ?? 0;
      if (recentPbs < 1) return null;
      return rec({
        id: "improvement-pbs",
        section: "biggest_improvement",
        title: `${recentPbs} new PB${recentPbs === 1 ? "" : "s"} this month`,
        reason: ctx.intelligence?.domains.personal_bests.summary ?? "Personal best velocity is strong.",
        priority: 76,
        confidence: domainScore(ctx, "personal_bests"),
        action: "Document what worked in this block and carry the same structure into your next training phase.",
        tags: ["trends", "pbs"],
      });
    },
  },
  {
    id: "risk-overreach",
    section: "risk_factors",
    evaluate(ctx) {
      if (ctx.acwr == null || ctx.acwr <= COACH_THRESHOLDS.highAcwr) return null;
      if (ctx.avgReadiness != null && ctx.avgReadiness >= COACH_THRESHOLDS.lowReadiness) return null;
      return rec({
        id: "risk-overreach",
        section: "risk_factors",
        title: "Overreach risk detected",
        reason: `High load (ACWR ${ctx.acwr.toFixed(2)}) combined with low readiness (${Math.round(ctx.avgReadiness ?? 0)}/100).`,
        priority: 96,
        confidence: 90,
        action: "Deload for 3–5 days. No max tests until readiness rebounds above 65.",
        tags: ["risk", "recovery", "training_load"],
      });
    },
  },
  {
    id: "risk-inconsistency",
    section: "risk_factors",
    evaluate(ctx) {
      if (ctx.sessionsPerWeek >= (ctx.trainingDaysPerWeek ?? COACH_THRESHOLDS.minSessionsPerWeek)) return null;
      return rec({
        id: "risk-inconsistency",
        section: "risk_factors",
        title: "Inconsistent training pattern",
        reason: `${ctx.sessionsPerWeek.toFixed(1)} sessions/week limits adaptation and increases re-injury risk after layoffs.`,
        priority: 75,
        confidence: domainScore(ctx, "consistency"),
        action: "Set a minimum floor of 2 sessions/week even during busy periods.",
        tags: ["risk", "consistency"],
      });
    },
  },
  {
    id: "milestone-goal",
    section: "next_milestone",
    evaluate(ctx) {
      const goal = ctx.goals.find((g) => g.progressPct >= 50 && g.progressPct < 95);
      if (!goal) return null;
      return rec({
        id: "milestone-goal",
        section: "next_milestone",
        title: `Close in on: ${goal.title}`,
        reason: `You're ${Math.round(goal.progressPct)}% toward ${goal.targetValue} ${goal.unit}.`,
        priority: 82,
        confidence: Math.min(90, Math.round(goal.progressPct)),
        action: "Schedule a retest or progress session this week to push past 75% completion.",
        tags: ["goals"],
      });
    },
  },
  {
    id: "milestone-early-goal",
    section: "next_milestone",
    evaluate(ctx) {
      if (ctx.goals.some((g) => g.progressPct >= 50)) return null;
      const goal = ctx.goals[0];
      if (!goal) return null;
      return rec({
        id: "milestone-early-goal",
        section: "next_milestone",
        title: `Work toward: ${goal.title}`,
        reason: `Currently ${Math.round(goal.progressPct)}% complete (${goal.currentValue}/${goal.targetValue} ${goal.unit}).`,
        priority: 72,
        confidence: 65,
        action: "Break the goal into weekly checkpoints and log progress after each key session.",
        tags: ["goals"],
      });
    },
  },
];

export const crossfitRules: CoachRule[] = [...sharedRules];

export const hyroxRules: CoachRule[] = [
  ...sharedRules,
  {
    id: "hyrox-race-upcoming",
    section: "todays_recommendation",
    evaluate(ctx) {
      if (!ctx.race?.isUpcoming) return null;
      return rec({
        id: "hyrox-race-upcoming",
        section: "todays_recommendation",
        title: "Race week approach",
        reason: `${ctx.race.name} is on ${ctx.race.raceDate.toLocaleDateString("en-GB", { month: "short", day: "numeric" })} — shift to race-specific sharpening.`,
        priority: 93,
        confidence: 92,
        action: "Reduce volume 30–40%. Practice transitions and hit race-pace 1 km repeats.",
        tags: ["race", "goals"],
      });
    },
  },
  {
    id: "hyrox-station-focus",
    section: "training_focus",
    evaluate(ctx) {
      if (!ctx.race?.weakestStation) return null;
      return rec({
        id: "hyrox-station-focus",
        section: "training_focus",
        title: `Attack ${ctx.race.weakestStation}`,
        reason: "Latest race analysis flags this as your limiting station relative to the rest of your profile.",
        priority: 90,
        confidence: domainScore(ctx, "race_results") || 70,
        action: `Add one ${ctx.race.weakestStation} practice block per week for the next 4 weeks.`,
        tags: ["weakness", "race"],
      });
    },
  },
  {
    id: "hyrox-race-improvement",
    section: "biggest_improvement",
    evaluate(ctx) {
      if (domainMomentum(ctx, "race_results") !== "improving") return null;
      return rec({
        id: "hyrox-race-improvement",
        section: "biggest_improvement",
        title: "Race finish time improving",
        reason: ctx.intelligence?.domains.race_results.summary ?? "Recent races show faster finish times.",
        priority: 85,
        confidence: domainScore(ctx, "race_results"),
        action: "Maintain current race simulation frequency. Fine-tune transitions rather than adding volume.",
        tags: ["race", "trends"],
      });
    },
  },
  {
    id: "hyrox-race-milestone",
    section: "next_milestone",
    evaluate(ctx) {
      if (!ctx.race?.finishTimeSeconds) return null;
      const target = ctx.competitionTarget?.toLowerCase() ?? "";
      const sub70 = target.includes("70") || target.includes("sub-70");
      if (!sub70 && ctx.race.finishTimeSeconds <= 4200) return null;
      const gap = ctx.race.finishTimeSeconds - 4200;
      if (gap <= 0) {
        return rec({
          id: "hyrox-sub70-achieved",
          section: "next_milestone",
          title: "Sub-70 achieved — target sub-65",
          reason: `Latest finish is under 70 minutes. Next tier is competitive regional pacing.`,
          priority: 88,
          confidence: 85,
          action: "Shift focus to running economy and station transitions under race fatigue.",
          tags: ["race", "goals"],
        });
      }
      return rec({
        id: "hyrox-sub70-milestone",
        section: "next_milestone",
        title: "Sub-70 finish within reach",
        reason: `Current finish is ${Math.round(gap / 60)} minutes off a sub-70 target.`,
        priority: 86,
        confidence: Math.max(55, 100 - Math.round(gap / 60) * 5),
        action: "Prioritise running pace and your weakest station — they offer the largest time savings.",
        tags: ["race", "goals"],
      });
    },
  },
  {
    id: "hyrox-running-risk",
    section: "risk_factors",
    evaluate(ctx) {
      if (domainScore(ctx, "running_progress") >= 45) return null;
      if (ctx.sportView !== "hyrox") return null;
      return rec({
        id: "hyrox-running-risk",
        section: "risk_factors",
        title: "Running base needs attention",
        reason: `Running score is ${domainScore(ctx, "running_progress")}/100 — 8 × 1 km runs make up a large share of race time.`,
        priority: 80,
        confidence: domainScore(ctx, "running_progress"),
        action: "Add two aerobic runs per week. Progress to race-pace 1 km intervals.",
        tags: ["risk", "running", "weakness"],
      });
    },
  },
];

export function getRulesForView(sportView: "crossfit" | "hyrox"): CoachRule[] {
  return sportView === "hyrox" ? hyroxRules : crossfitRules;
}
