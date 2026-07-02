import type {
  CrossfitScoreInput,
  HyroxScoreInput,
  WeaknessAttributeCategory,
} from "../types";
import { ATTRIBUTE_ORDER } from "../config";
import { roundScore } from "@/shared/utils/math";

function blend(...parts: Array<{ value: number; weight: number }>): number {
  const total = parts.reduce((sum, p) => sum + p.weight, 0);
  if (total === 0) return 50;
  return parts.reduce((sum, p) => sum + p.value * p.weight, 0) / total;
}

export function mapCrossfitToAttributes(scores: CrossfitScoreInput): Record<WeaknessAttributeCategory, number> {
  return {
    running: roundScore(blend(
      { value: scores.engineScore, weight: 0.7 },
      { value: scores.powerScore, weight: 0.3 },
    )),
    grip: roundScore(blend(
      { value: scores.strengthScore, weight: 0.55 },
      { value: scores.powerScore, weight: 0.45 },
    )),
    engine: roundScore(scores.engineScore),
    mobility: roundScore(scores.mobilityScore),
    strength: roundScore(scores.strengthScore),
    recovery: roundScore(scores.recoveryScore),
    work_capacity: roundScore(blend(
      { value: scores.consistencyScore, weight: 0.65 },
      { value: scores.engineScore, weight: 0.35 },
    )),
    explosiveness: roundScore(blend(
      { value: scores.powerScore, weight: 0.55 },
      { value: scores.olympicLiftingScore, weight: 0.45 },
    )),
  };
}

export function mapHyroxToAttributes(scores: HyroxScoreInput): Record<WeaknessAttributeCategory, number> {
  return {
    running: roundScore(scores.runningScore),
    grip: roundScore(scores.gripScore),
    engine: roundScore(scores.engineScore),
    mobility: roundScore(scores.mobilityScore),
    strength: roundScore(scores.strengthScore),
    recovery: roundScore(scores.recoveryScore),
    work_capacity: roundScore(scores.workCapacityScore),
    explosiveness: roundScore(scores.powerScore),
  };
}

export function emptyAttributeScores(defaultScore = 50): Record<WeaknessAttributeCategory, number> {
  return Object.fromEntries(
    ATTRIBUTE_ORDER.map((category) => [category, defaultScore]),
  ) as Record<WeaknessAttributeCategory, number>;
}

export function mapHyroxHistoryRow(row: {
  runningScore: number;
  engineScore: number;
  strengthScore: number;
  powerScore: number;
  gripScore: number;
  recoveryScore: number;
  workCapacityScore: number;
  mobilityScore: number;
}): Record<WeaknessAttributeCategory, number> {
  return mapHyroxToAttributes(row);
}

export function mapCrossfitHistoryRow(row: {
  strengthScore: number;
  olympicLiftingScore: number;
  engineScore: number;
  gymnasticsScore: number;
  powerScore: number;
  consistencyScore: number;
  recoveryScore: number;
  mobilityScore: number;
}): Record<WeaknessAttributeCategory, number> {
  return mapCrossfitToAttributes(row);
}
