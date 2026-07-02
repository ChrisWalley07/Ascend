import { defineAchievement } from "../types/definition";
import { achievementId } from "../types/ids";

/** Inline catalog fixture for Node test runner (avoids barrel directory imports). */
export const crossfitTestAchievements = [
  defineAchievement({
    id: achievementId("crossfit.first-wod"),
    title: "First WOD",
    description: "Log your first CrossFit workout.",
    category: "crossfit",
    difficulty: "beginner",
    icon: { name: "dumbbell", library: "lucide" },
    xp: 50,
    prerequisites: [],
    rarity: "common",
    tags: ["onboarding", "consistency"],
    requirements: {
      id: "workout-count",
      label: "Log 1 workout",
      kind: "count",
      metric: "workout_count",
      target: 1,
    },
  }),
  defineAchievement({
    id: achievementId("crossfit.fran-sub-5"),
    title: "Fran Sub-5",
    description: "Complete Fran in under 5 minutes.",
    category: "crossfit",
    difficulty: "advanced",
    icon: { name: "timer", library: "lucide" },
    xp: 380,
    prerequisites: [achievementId("crossfit.first-wod")],
    rarity: "epic",
    tags: ["benchmark", "engine"],
    requirements: {
      id: "fran-time",
      label: "Fran under 5:00",
      kind: "numeric",
      metric: "fran_time_seconds",
      operator: "lte",
      target: 300,
    },
  }),
  defineAchievement({
    id: achievementId("crossfit.week-streak"),
    title: "7-Day Streak",
    description: "Train at least once per day for 7 consecutive days.",
    category: "crossfit",
    difficulty: "intermediate",
    icon: { name: "flame", library: "lucide" },
    xp: 150,
    prerequisites: [achievementId("crossfit.first-wod")],
    rarity: "uncommon",
    tags: ["consistency", "streak"],
    requirements: {
      id: "streak",
      label: "7-day training streak",
      kind: "streak",
      metric: "streak_days",
      targetDays: 7,
    },
  }),
] as const;
