import type { PbRecordType, ScoreDirection } from "@prisma/client";

/** Parse mm:ss or m:ss or raw seconds into total seconds */
export function parseTimeToSeconds(input: string): number | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  if (trimmed.includes(":")) {
    const parts = trimmed.split(":").map((p) => Number(p.trim()));
    if (parts.some((p) => Number.isNaN(p))) return null;
    if (parts.length === 2) {
      const [min, sec] = parts;
      return min * 60 + sec;
    }
    if (parts.length === 3) {
      const [hr, min, sec] = parts;
      return hr * 3600 + min * 60 + sec;
    }
    return null;
  }

  const seconds = Number(trimmed);
  return Number.isFinite(seconds) ? seconds : null;
}

/** Format seconds as m:ss or h:mm:ss */
export function formatSeconds(totalSeconds: number): string {
  const sec = Math.round(totalSeconds);
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;

  if (h > 0) {
    return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function formatDistance(meters: number): string {
  if (meters >= 1000) {
    return `${(meters / 1000).toFixed(meters % 1000 === 0 ? 0 : 1)} km`;
  }
  return `${Math.round(meters)} m`;
}

export function formatDisplayValue(
  value: number,
  recordType: PbRecordType,
  unit: string,
): string {
  if (recordType === "MILESTONE") return "Achieved ✓";
  if (recordType === "TIME" && unit === "sec") return formatSeconds(value);
  if (recordType === "TIME" && unit === "min") return `${Math.round(value)} min`;
  if (recordType === "DISTANCE" && unit === "m") return formatDistance(value);
  if (recordType === "WEIGHT" && unit === "kg") return `${value} kg`;
  if (recordType === "HEIGHT" && unit === "cm") return `${value} cm`;
  if (recordType === "CALORIES" && unit === "cal") return `${Math.round(value)} cal`;
  if (recordType === "REPS") return `${Math.round(value)} reps`;
  if (recordType === "SCORE") return String(value);
  return `${value} ${unit}`;
}

export function parsePbInput(
  raw: string,
  recordType: PbRecordType,
): { value: number; displayValue: string } | { error: string } {
  const trimmed = raw.trim();
  if (!trimmed) return { error: "Enter a value" };

  if (recordType === "MILESTONE") {
    return { value: 1, displayValue: "Achieved ✓" };
  }

  if (recordType === "TIME") {
    const seconds = parseTimeToSeconds(trimmed);
    if (seconds === null || seconds <= 0) {
      return { error: "Use mm:ss or seconds (e.g. 4:32 or 272)" };
    }
    return { value: seconds, displayValue: formatSeconds(seconds) };
  }

  if (recordType === "SCORE") {
    const timeSeconds = parseTimeToSeconds(trimmed);
    if (timeSeconds !== null && trimmed.includes(":")) {
      return { value: timeSeconds, displayValue: formatSeconds(timeSeconds) };
    }
    const num = Number(trimmed);
    if (!Number.isFinite(num)) return { error: "Enter a numeric score or time" };
    return { value: num, displayValue: trimmed };
  }

  const num = Number(trimmed.replace(/[^\d.]/g, "") || trimmed);
  if (!Number.isFinite(num) || num <= 0) {
    return { error: "Enter a valid number" };
  }

  return { value: num, displayValue: trimmed };
}

export function isPbImprovement(
  newValue: number,
  currentValue: number | null,
  scoreDirection: ScoreDirection,
): boolean {
  if (currentValue === null) return true;
  if (scoreDirection === "HIGHER_IS_BETTER") return newValue > currentValue;
  return newValue < currentValue;
}

export function getInputPlaceholder(recordType: PbRecordType, unit: string): string {
  if (recordType === "MILESTONE") return "Mark as achieved";
  if (recordType === "TIME") return "e.g. 4:32 or 272";
  if (recordType === "WEIGHT") return `e.g. 100 ${unit}`;
  if (recordType === "REPS") return "e.g. 25";
  if (recordType === "DISTANCE") return "e.g. 50";
  if (recordType === "SCORE") return "e.g. 2:51 or 135";
  if (recordType === "HEIGHT") return "e.g. 76";
  if (recordType === "CALORIES") return "e.g. 18";
  return "Enter value";
}

export function getInputHint(recordType: PbRecordType, unit: string): string {
  if (recordType === "MILESTONE") return "No value needed — just save to mark achieved.";
  if (recordType === "TIME") return "Lower is better. Use mm:ss or total seconds.";
  if (recordType === "SCORE") return "Time (mm:ss) or reps/score depending on the WOD.";
  return `Unit: ${unit}`;
}
