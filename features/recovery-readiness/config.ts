import type { ReadinessZone } from "./types";

export const READINESS_THRESHOLDS = {
  greenMin: 70,
  yellowMin: 50,
  fatigueGreenMax: 40,
  fatigueYellowMax: 65,
  optimalAcwrMin: 0.8,
  optimalAcwrMax: 1.3,
  highAcwr: 1.5,
  lowAcwr: 0.6,
  highSorenessWarning: 7,
  optimalSleepHoursMin: 7,
  optimalSleepHoursMax: 9,
  minRecoveryLogs: 1,
  recentReadinessDays: 7,
  defaultRpe: 6,
} as const;

export const ZONE_COLORS = {
  green: "oklch(0.93 0.24 128)",
  yellow: "oklch(0.75 0.17 60)",
  red: "oklch(0.62 0.22 25)",
  neutral: "oklch(0.65 0.15 250)",
} as const;

export function zoneForHigherIsBetter(score: number): ReadinessZone {
  if (score >= READINESS_THRESHOLDS.greenMin) return "green";
  if (score >= READINESS_THRESHOLDS.yellowMin) return "yellow";
  return "red";
}

/** Fatigue: lower is better (0 = fresh, 100 = exhausted) */
export function zoneForFatigue(score: number): ReadinessZone {
  if (score <= READINESS_THRESHOLDS.fatigueGreenMax) return "green";
  if (score <= READINESS_THRESHOLDS.fatigueYellowMax) return "yellow";
  return "red";
}

export function zoneForAcwr(acwr: number): ReadinessZone {
  if (
    acwr >= READINESS_THRESHOLDS.optimalAcwrMin &&
    acwr <= READINESS_THRESHOLDS.optimalAcwrMax
  ) {
    return "green";
  }
  if (acwr > READINESS_THRESHOLDS.highAcwr || acwr < READINESS_THRESHOLDS.lowAcwr) {
    return "red";
  }
  return "yellow";
}

export function acwrStressScore(acwr: number): number {
  const optimalMid =
    (READINESS_THRESHOLDS.optimalAcwrMin + READINESS_THRESHOLDS.optimalAcwrMax) / 2;
  const distance = Math.abs(acwr - optimalMid);
  return Math.round(Math.max(0, Math.min(100, 100 - distance * 50)));
}

export const TRAINING_RECOMMENDATIONS: Record<
  ReadinessZone,
  { title: string; summary: string; actions: string[] }
> = {
  green: {
    title: "Green — Train as planned",
    summary: "Recovery and load signals support your scheduled session at full intent.",
    actions: [
      "Execute your planned workout at target intensity.",
      "Include a thorough warm-up and cooldown.",
      "Log RPE after the session to refine future readiness scores.",
    ],
  },
  yellow: {
    title: "Yellow — Modify intensity",
    summary: "You can train, but one or more markers suggest pulling back slightly today.",
    actions: [
      "Reduce volume or intensity by 10–20%.",
      "Favour technique work over max efforts.",
      "Prioritise hydration, mobility, and an earlier bedtime tonight.",
    ],
  },
  red: {
    title: "Red — Prioritise recovery",
    summary: "Fatigue or readiness markers indicate you should not push hard today.",
    actions: [
      "Take a rest day or active recovery (walk, swim, easy bike).",
      "Skip high-intensity intervals and heavy strength tests.",
      "Log a recovery check-in and reassess tomorrow before hard training.",
    ],
  },
};
