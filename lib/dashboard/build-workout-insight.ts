import type { ParsedWorkout } from "@/lib/validations/workout-parser";

const CATEGORY_LABELS: Record<string, string> = {
  strength: "Strength",
  olympicLifting: "Olympic",
  engine: "Engine",
  gymnastics: "Gymnastics",
  power: "Power",
  mobility: "Mobility",
  running: "Running",
  grip: "Grip",
};

export function buildWorkoutInsight(parsed: ParsedWorkout, focusArea: string | null): string {
  const ranked = (Object.entries(parsed.categoryImpact) as [string, number][])
    .filter(([, score]) => score > 0)
    .sort((a, b) => b[1] - a[1]);

  const [topKey, topScore] = ranked[0] ?? ["engine", 0];
  const topLabel = CATEGORY_LABELS[topKey] ?? topKey;

  const parts = [`This session primarily hit ${topLabel} (${topScore}/100 stimulus).`];

  if (focusArea) {
    const focusKey = Object.entries(CATEGORY_LABELS).find(([, label]) => label === focusArea)?.[0];
    const focusScore = focusKey ? (parsed.categoryImpact as Record<string, number>)[focusKey] : 0;
    if (focusScore && focusScore >= 40) {
      parts.push(`Good overlap with your current focus — ${focusArea}.`);
    } else {
      parts.push(`Your focus is ${focusArea}; consider adding that in your next session.`);
    }
  }

  if (parsed.rpe && parsed.rpe >= 8) {
    parts.push("High RPE — prioritise recovery tomorrow.");
  }

  return parts.join(" ");
}
