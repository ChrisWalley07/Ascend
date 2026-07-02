import { formatHyroxTime } from "@/lib/hyrox/catalog";

export function formatDurationSeconds(seconds: number): string {
  if (seconds >= 3600) return formatHyroxTime(seconds);
  const mins = Math.floor(seconds / 60);
  const secs = Math.round(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export function formatWeightKg(kg: number): string {
  return `${Math.round(kg)} kg`;
}

export function formatScorePoints(score: number): string {
  return `${Math.round(score)}`;
}

export function formatVo2(value: number): string {
  return `${value.toFixed(1)} ml/kg/min`;
}

export function formatMetricValue(
  value: number,
  unit: string,
): string {
  if (unit === "sec") return formatDurationSeconds(value);
  if (unit === "kg") return formatWeightKg(value);
  if (unit === "ml/kg/min") return formatVo2(value);
  return formatScorePoints(value);
}

export function horizonLabel(days: number): string {
  if (days % 7 === 0) {
    const weeks = days / 7;
    return `${weeks} week${weeks === 1 ? "" : "s"}`;
  }
  return `${days} days`;
}
