import { defineAchievement, achievementId } from "../../types";

export const hyroxAchievements = [
  defineAchievement({
    id: achievementId("hyrox.first-finish"),
    title: "First Finish",
    description: "Complete your first HYROX race.",
    category: "hyrox",
    difficulty: "beginner",
    icon: { name: "flag", library: "lucide" },
    xp: 100,
    prerequisites: [],
    rarity: "common",
    tags: ["race", "milestone"],
    requirements: {
      id: "race-count",
      label: "Finish 1 HYROX race",
      kind: "count",
      metric: "race_finish_count",
      target: 1,
    },
  }),
  defineAchievement({
    id: achievementId("hyrox.sub-70"),
    title: "Sub-70",
    description: "Finish a HYROX race in under 70 minutes.",
    category: "hyrox",
    difficulty: "advanced",
    icon: { name: "medal", library: "lucide" },
    xp: 400,
    prerequisites: [achievementId("hyrox.first-finish")],
    rarity: "rare",
    tags: ["race", "time"],
    requirements: {
      id: "finish-time",
      label: "Finish under 70:00",
      kind: "numeric",
      metric: "race_finish_time_seconds",
      operator: "lte",
      target: 4200,
    },
  }),
] as const;
