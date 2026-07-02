import type { ParsedExercise, CategoryImpact } from "@/lib/validations/workout-parser";
import type { ScoreCategory } from "@/lib/workout-interpreter/movements";

const CATEGORY_LABELS: Record<keyof CategoryImpact, string> = {
  strength: "Strength",
  olympicLifting: "Olympic",
  engine: "Engine",
  gymnastics: "Gymnastics",
  power: "Power",
  mobility: "Mobility",
};

export function computeCategoryImpact(exercises: ParsedExercise[]): CategoryImpact {
  const totals: Record<keyof CategoryImpact, number> = {
    strength: 0,
    olympicLifting: 0,
    engine: 0,
    gymnastics: 0,
    power: 0,
    mobility: 0,
  };

  for (const exercise of exercises) {
    const volume = estimateVolume(exercise);
    const weights = inferScoreWeights(exercise);

    for (const [category, weight] of Object.entries(weights) as [ScoreCategory, number][]) {
      const key = category === "olympicLifting" ? "olympicLifting" : category;
      if (key in totals) {
        totals[key as keyof CategoryImpact] += weight * volume;
      }
    }
  }

  const max = Math.max(...Object.values(totals), 1);
  return {
    strength: Math.round((totals.strength / max) * 100),
    olympicLifting: Math.round((totals.olympicLifting / max) * 100),
    engine: Math.round((totals.engine / max) * 100),
    gymnastics: Math.round((totals.gymnastics / max) * 100),
    power: Math.round((totals.power / max) * 100),
    mobility: Math.round((totals.mobility / max) * 100),
  };
}

function estimateVolume(exercise: ParsedExercise): number {
  if (exercise.weightKg && exercise.reps) {
    return Math.max(1, exercise.weightKg * exercise.reps);
  }
  if (exercise.reps) return Math.max(1, exercise.reps);
  if (exercise.distanceMeters) return Math.max(1, exercise.distanceMeters / 10);
  if (exercise.timeSeconds) return Math.max(1, exercise.timeSeconds / 5);
  if (exercise.calories) return Math.max(1, exercise.calories);
  return 1;
}

function inferScoreWeights(exercise: ParsedExercise): Partial<Record<ScoreCategory, number>> {
  const cat = exercise.category.toLowerCase();
  const type = exercise.movementType.toLowerCase();

  if (cat.includes("olympic")) return { olympicLifting: 1, power: 0.5, mobility: 0.2 };
  if (cat.includes("power lift")) return { strength: 1, power: 0.4 };
  if (cat.includes("gymnastics") || type.includes("bodyweight")) return { gymnastics: 1, strength: 0.2 };
  if (cat.includes("row") || cat.includes("run") || cat.includes("bike") || cat.includes("cardio") || type.includes("engine")) {
    return { engine: 1 };
  }
  if (cat.includes("plyometric") || type.includes("power")) return { power: 1, engine: 0.3 };
  if (type.includes("metcon")) return { engine: 0.6, strength: 0.3, power: 0.3 };
  return { strength: 0.5, engine: 0.5 };
}

export function buildInterpretation(
  name: string,
  type: string,
  exercises: ParsedExercise[],
  impact: CategoryImpact,
  rpe?: number,
): string {
  const sorted = (Object.entries(impact) as [keyof CategoryImpact, number][])
    .sort((a, b) => b[1] - a[1])
    .filter(([, v]) => v > 15);

  const primary = sorted[0];
  const secondary = sorted[1];

  const movementList = exercises
    .slice(0, 4)
    .map((e) => {
      const parts: string[] = [e.name];
      if (e.reps) parts.push(`${e.reps} reps`);
      if (e.weightKg) parts.push(`@ ${e.weightKg}kg`);
      return parts.join(" ");
    })
    .join(", ");

  let summary = `Interpreted as ${type.replaceAll("_", " ").toLowerCase()} session "${name}". `;
  summary += `Detected ${exercises.length} movement${exercises.length > 1 ? "s" : ""}: ${movementList}. `;

  if (primary) {
    summary += `Primary training stimulus: ${CATEGORY_LABELS[primary[0]]} (${primary[1]}%). `;
  }
  if (secondary) {
    summary += `Secondary: ${CATEGORY_LABELS[secondary[0]]} (${secondary[1]}%). `;
  }
  if (rpe) {
    summary += `Perceived effort RPE ${rpe}/10.`;
  }

  return summary.trim();
}

export function getTopCategories(impact: CategoryImpact, limit = 3): Array<{ key: keyof CategoryImpact; label: string; score: number }> {
  const labels: Record<keyof CategoryImpact, string> = {
    strength: "Strength",
    olympicLifting: "Olympic",
    engine: "Engine",
    gymnastics: "Gymnastics",
    power: "Power",
    mobility: "Mobility",
  };

  return (Object.entries(impact) as [keyof CategoryImpact, number][])
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([key, score]) => ({ key, label: labels[key], score }));
}
