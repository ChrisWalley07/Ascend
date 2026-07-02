import type { WorkoutType } from "@prisma/client";

import type { StravaActivitySummary } from "@/lib/strava/types";

const RUN_PB_DISTANCES = [400, 800, 1500, 3000, 5000, 10000, 21097, 42195];
const ROW_PB_DISTANCES = [100, 250, 500, 1000, 2000, 5000, 10000];
const BIKE_PB_DISTANCES = [10000];

const DISTANCE_TOLERANCE = 0.05;

export function snapDistanceForPb(distanceMeters: number, activityType: string): number {
  const type = activityType.toLowerCase();
  const candidates = type.includes("run") || type === "trailrun" || type === "virtualrun"
    ? RUN_PB_DISTANCES
    : type.includes("row") || type.includes("swim")
      ? ROW_PB_DISTANCES
      : type.includes("ride") || type === "virtualride"
        ? BIKE_PB_DISTANCES
        : [];

  for (const target of candidates) {
    if (Math.abs(distanceMeters - target) / target <= DISTANCE_TOLERANCE) {
      return target;
    }
  }

  return distanceMeters;
}

export function mapStravaWorkoutType(activity: StravaActivitySummary): WorkoutType {
  const type = activity.type.toLowerCase();
  if (["weighttraining", "crossfit", "workout", "strength"].some((t) => type.includes(t))) {
    return "STRENGTH";
  }
  if (type.includes("run") || type.includes("ride") || type.includes("swim")) {
    return "INTERVALS";
  }
  return "ACCESSORY";
}

export function mapStravaExerciseName(activity: StravaActivitySummary): string {
  const type = activity.type.toLowerCase();

  if (type.includes("run") || type === "trailrun" || type === "virtualrun") return "Run";
  if (type.includes("ride") || type === "virtualride") return "Bike";
  if (type.includes("swim")) return "Swim";
  if (type.includes("row")) return "Row";
  if (type.includes("crossfit")) return "General Training";
  if (type.includes("weight") || type.includes("workout")) return "General Training";
  if (type.includes("hike") || type.includes("walk")) return "Run";

  return "General Training";
}

export function mapStravaExerciseMeta(name: string) {
  if (name === "Run") {
    return {
      category: "Monostructural",
      movementType: "Cardio",
      primaryMuscles: ["Legs", "Cardio"],
    };
  }
  if (name === "Bike") {
    return {
      category: "Monostructural",
      movementType: "Cardio",
      primaryMuscles: ["Legs", "Cardio"],
    };
  }
  if (name === "Swim" || name === "Row") {
    return {
      category: "Monostructural",
      movementType: "Cardio",
      primaryMuscles: ["Back", "Legs"],
    };
  }
  return {
    category: "Accessories",
    movementType: "Metcon",
    primaryMuscles: ["Full Body"],
  };
}

export function stravaActivityNotes(activity: StravaActivitySummary) {
  const parts = [`Imported from Strava (${activity.type})`];
  if (activity.sport_type) parts.push(`Sport: ${activity.sport_type}`);
  if (activity.average_heartrate) {
    parts.push(`Avg HR: ${Math.round(activity.average_heartrate)} bpm`);
  }
  if (activity.calories) parts.push(`Calories: ${Math.round(activity.calories)}`);
  if (activity.description?.trim()) parts.push(activity.description.trim());
  return parts.join("\n");
}
