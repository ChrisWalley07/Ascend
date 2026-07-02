import { format, subDays } from "date-fns";

import type { ParsedExercise, ParsedWorkout } from "@/lib/validations/workout-parser";
import { buildInterpretation, computeCategoryImpact } from "@/lib/workout-interpreter/categories";
import { extractWorkoutDurationSeconds } from "@/lib/pb-auto-detect";
import { BENCHMARK_WODS, matchMovement, MOVEMENTS, type MovementDefinition } from "@/lib/workout-interpreter/movements";

function parseTimeToSeconds(raw: string): number | undefined {
  const trimmed = raw.trim();
  const colon = trimmed.match(/^(\d+):(\d{1,2})(?::(\d{1,2}))?$/);
  if (colon) {
    const h = colon[3] ? Number(colon[1]) : 0;
    const m = colon[3] ? Number(colon[2]) : Number(colon[1]);
    const s = colon[3] ? Number(colon[3]) : Number(colon[2]);
    return h * 3600 + m * 60 + s;
  }
  const minutes = trimmed.match(/(\d+(?:\.\d+)?)\s*(?:min(?:ute)?s?|m)\b/i);
  if (minutes) return Math.round(Number(minutes[1]) * 60);
  const seconds = trimmed.match(/(\d+)\s*(?:sec(?:ond)?s?|s)\b/i);
  if (seconds) return Number(seconds[1]);
  return undefined;
}

function parseWeightKg(text: string): number | undefined {
  const kg = text.match(/(?:@|at)\s*(\d+(?:\.\d+)?)\s*kg/i) ?? text.match(/(\d+(?:\.\d+)?)\s*kg/i);
  if (kg) return Number(kg[1]);
  const lbs = text.match(/(?:@|at)\s*(\d+(?:\.\d+)?)\s*(?:lb|lbs|#)/i) ?? text.match(/(\d+(?:\.\d+)?)\s*(?:lb|lbs|#)/i);
  if (lbs) return Math.round(Number(lbs[1]) * 0.453592 * 10) / 10;
  return undefined;
}

function parseSetsReps(text: string): { sets?: number; reps?: number } {
  const setsReps = text.match(/(\d+)\s*[x×]\s*(\d+)/i);
  if (setsReps) return { sets: Number(setsReps[1]), reps: Number(setsReps[2]) };
  const repsOnly = text.match(/\b(\d+)\s*reps?\b/i);
  if (repsOnly) return { reps: Number(repsOnly[1]) };
  const scheme = text.match(/\b(\d+)-(\d+)-(\d+)\b/);
  if (scheme) {
    const total = Number(scheme[1]) + Number(scheme[2]) + Number(scheme[3]);
    return { reps: total };
  }
  return {};
}

function parseDistanceMeters(text: string): number | undefined {
  const km = text.match(/(\d+(?:\.\d+)?)\s*km/i);
  if (km) return Math.round(Number(km[1]) * 1000);
  const m = text.match(/(\d+)\s*m(?:eter)?s?\b/i);
  if (m) return Number(m[1]);
  const cal = text.match(/(\d+)\s*cal(?:orie)?s?\b/i);
  if (cal) return undefined; // handled separately
  return undefined;
}

function parseDate(text: string): string {
  const lower = text.toLowerCase();
  if (/\byesterday\b/.test(lower)) return format(subDays(new Date(), 1), "yyyy-MM-dd");
  if (/\blast week\b/.test(lower)) return format(subDays(new Date(), 7), "yyyy-MM-dd");
  const iso = text.match(/\b(20\d{2}-\d{2}-\d{2})\b/);
  if (iso) return iso[1];
  return format(new Date(), "yyyy-MM-dd");
}

function parseRpe(text: string): number | undefined {
  const rpe = text.match(/\brpe\s*(\d{1,2})\b/i) ?? text.match(/\b(\d{1,2})\s*\/\s*10\b/);
  if (rpe) {
    const value = Number(rpe[1]);
    if (value >= 1 && value <= 10) return value;
  }
  const feel = text.match(/\b(felt\s+)?(easy|moderate|hard|brutal|destroyed)\b/i);
  if (feel) {
    const map: Record<string, number> = { easy: 5, moderate: 6, hard: 8, brutal: 9, destroyed: 10 };
    return map[feel[2]?.toLowerCase() ?? ""] ?? undefined;
  }
  return undefined;
}

function detectWorkoutType(text: string): ParsedWorkout["type"] {
  const lower = text.toLowerCase();
  if (/\bamrap\b/.test(lower)) return "AMRAP";
  if (/\bemom\b/.test(lower)) return "EMOM";
  if (/\bfor\s*time\b|\bft\b|\bfinished\s+in\b|\btook\s+\d/i.test(lower)) return "FOR_TIME";
  if (/\binterval|\btabata\b/i.test(lower)) return "INTERVALS";
  if (/\bskill|\bpractice\b/i.test(lower)) return "SKILL";
  if (/\baccessory\b/i.test(lower)) return "ACCESSORY";
  if (/\b\d+\s*[x×]\s*\d+|\bsets?\b|@\s*\d+\s*kg/i.test(lower)) return "STRENGTH";
  return "STRENGTH";
}

function detectBenchmarkName(text: string): string | null {
  const lower = text.toLowerCase();
  for (const name of Object.keys(BENCHMARK_WODS)) {
    if (new RegExp(`\\b${name}\\b`, "i").test(lower)) {
      return name.charAt(0).toUpperCase() + name.slice(1);
    }
  }
  return null;
}

function extractSegments(text: string): string[] {
  return text
    .split(/[,;]|\band\b|\bthen\b|\bplus\b|\bfollowed\s+by\b/i)
    .map((s) => s.trim())
    .filter((s) => s.length > 2);
}

function buildExerciseFromMovement(
  movement: MovementDefinition,
  segment: string,
  sets?: number,
): ParsedExercise {
  const weightKg = parseWeightKg(segment);
  const { reps } = parseSetsReps(segment);
  const distanceMeters = parseDistanceMeters(segment);
  const calMatch = segment.match(/(\d+)\s*cal(?:orie)?s?\b/i);

  return {
    name: movement.name,
    category: movement.category,
    movementType: movement.movementType,
    primaryMuscles: movement.primaryMuscles,
    weightKg,
    reps: reps ? (sets ? reps * sets : reps) : undefined,
    distanceMeters,
    calories: calMatch ? Number(calMatch[1]) : undefined,
    timeSeconds: parseTimeToSeconds(segment),
    notes: segment.length > 60 ? segment.slice(0, 120) : undefined,
  };
}

function parseExercises(text: string): ParsedExercise[] {
  const exercises: ParsedExercise[] = [];
  const seen = new Set<string>();

  const benchmark = detectBenchmarkName(text);
  if (benchmark) {
    const wod = BENCHMARK_WODS[benchmark.toLowerCase()];
    for (const exName of wod.exercises) {
      const movement = MOVEMENTS.find((m) => m.name === exName) ?? matchMovement(exName);
      if (movement && !seen.has(movement.name)) {
        seen.add(movement.name);
        exercises.push(buildExerciseFromMovement(movement, text));
      }
    }
    if (exercises.length > 0) return exercises;
  }

  const segments = extractSegments(text);
  const searchText = segments.length > 0 ? segments : [text];

  for (const segment of searchText) {
    const movement = matchMovement(segment);
    if (movement && !seen.has(movement.name)) {
      seen.add(movement.name);
      const { sets } = parseSetsReps(segment);
      exercises.push(buildExerciseFromMovement(movement, segment, sets));
    }
  }

  if (exercises.length === 0) {
    for (const movement of MOVEMENTS) {
      if (movement.aliases.some((p) => p.test(text)) && !seen.has(movement.name)) {
        seen.add(movement.name);
        exercises.push(buildExerciseFromMovement(movement, text));
      }
    }
  }

  if (exercises.length === 0) {
    exercises.push({
      name: "General Training",
      category: "Accessories",
      movementType: "Metcon",
      primaryMuscles: ["Full Body"],
      notes: text.slice(0, 200),
    });
  }

  return exercises;
}

function deriveWorkoutName(text: string, exercises: ParsedExercise[]): string {
  const benchmark = detectBenchmarkName(text);
  if (benchmark) return benchmark;

  const lower = text.toLowerCase();
  if (/\bstrength\b/.test(lower)) return "Strength Session";
  if (/\bmetcon\b|\bwod\b/.test(lower)) return "Metcon";

  if (exercises.length === 1) return exercises[0].name;
  if (exercises.length === 2) return `${exercises[0].name} + ${exercises[1].name}`;
  return `${exercises[0].name} & ${exercises.length - 1} more`;
}

function assessConfidence(text: string, exercises: ParsedExercise[]): ParsedWorkout["confidence"] {
  const matched = exercises.filter((e) => e.name !== "General Training").length;
  if (matched >= 2 && text.length > 20) return "high";
  if (matched >= 1) return "medium";
  return "low";
}

export function interpretWorkoutText(rawText: string): ParsedWorkout {
  const text = rawText.trim();
  const exercises = parseExercises(text);
  const benchmark = detectBenchmarkName(text);
  const workoutType = benchmark
    ? BENCHMARK_WODS[benchmark.toLowerCase()].type
    : detectWorkoutType(text);
  const name = deriveWorkoutName(text, exercises);
  const date = parseDate(text);
  const rpe = parseRpe(text);
  const durationSeconds = extractWorkoutDurationSeconds(text) ?? undefined;
  const roundsMatch = text.match(/\b(\d+)\s*rounds?\b/i);
  const rounds = roundsMatch ? Number(roundsMatch[1]) : undefined;
  const categoryImpact = computeCategoryImpact(exercises);
  const confidence = assessConfidence(text, exercises);
  const interpretation = buildInterpretation(name, workoutType, exercises, categoryImpact, rpe);

  return {
    name,
    date,
    type: workoutType,
    rounds,
    durationSeconds,
    rpe,
    notes: text,
    exercises,
    categoryImpact,
    interpretation,
    confidence,
  };
}
