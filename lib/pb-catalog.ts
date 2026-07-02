import type { PbCategory, PbRecordType, ScoreDirection, SportDepartment } from "@prisma/client";

export type PbCatalogEntry = {
  slug: string;
  name: string;
  category: PbCategory;
  sport?: SportDepartment;
  subcategory?: string;
  unit: string;
  recordType: PbRecordType;
  scoreDirection: ScoreDirection;
  isCore: boolean;
  sortOrder: number;
  description?: string;
};

export const PB_CATEGORY_META: Record<
  PbCategory,
  { label: string; emoji: string; description: string }
> = {
  STRENGTH: { label: "Strength", emoji: "🏋️", description: "1RM lifts & pressing" },
  OLYMPIC: { label: "Olympic Lifting", emoji: "🥇", description: "Snatch, clean & jerk" },
  GYMNASTICS: { label: "Gymnastics", emoji: "💪", description: "Pulling, handstand, core" },
  BODYWEIGHT: { label: "Bodyweight", emoji: "🔥", description: "Push-ups, dips, burpees" },
  ERG: { label: "Erg PBs", emoji: "🚣", description: "Row, SkiErg, bike, assault" },
  RUNNING: { label: "Running", emoji: "🏃", description: "Sprint to marathon" },
  JUMP_ROPE: { label: "Jump Rope", emoji: "🪢", description: "Double & triple unders" },
  STRONGMAN: { label: "Strongman", emoji: "🏋", description: "Carries, sled, stones" },
  POWER: { label: "Power", emoji: "⚡", description: "Jumps, wall balls, thrusters" },
  SKILL_MILESTONE: { label: "Skill Milestones", emoji: "🧗", description: "First-time achievements" },
  BENCHMARK_WOD: { label: "Benchmark WODs", emoji: "🏆", description: "Girls, Heroes, Open" },
  COMPLEX: { label: "Complexes", emoji: "🏋", description: "Multi-movement complexes" },
  TIME_CAPACITY: { label: "Time-Based", emoji: "⏱", description: "Hold & capacity tests" },
  VOLUME: { label: "Volume PBs", emoji: "📈", description: "Session volume records" },
  CUSTOM: { label: "Custom", emoji: "✨", description: "Your own tracked PBs" },
};

function def(
  slug: string,
  name: string,
  category: PbCategory,
  opts: {
    subcategory?: string;
    unit: string;
    recordType: PbRecordType;
    scoreDirection: ScoreDirection;
    isCore?: boolean;
    sortOrder: number;
    description?: string;
  },
): PbCatalogEntry {
  return {
    slug,
    name,
    category,
    subcategory: opts.subcategory,
    unit: opts.unit,
    recordType: opts.recordType,
    scoreDirection: opts.scoreDirection,
    isCore: opts.isCore ?? false,
    sortOrder: opts.sortOrder,
    description: opts.description,
  };
}

/** Full catalog: ~55 core PBs + extended optional entries */
export const PB_CATALOG: PbCatalogEntry[] = [
  // ── Strength (core) ──
  def("back-squat-1rm", "Back Squat (1RM)", "STRENGTH", {
    subcategory: "Squat",
    unit: "kg",
    recordType: "WEIGHT",
    scoreDirection: "HIGHER_IS_BETTER",
    isCore: true,
    sortOrder: 1,
  }),
  def("front-squat-1rm", "Front Squat (1RM)", "STRENGTH", {
    subcategory: "Squat",
    unit: "kg",
    recordType: "WEIGHT",
    scoreDirection: "HIGHER_IS_BETTER",
    isCore: true,
    sortOrder: 2,
  }),
  def("overhead-squat-1rm", "Overhead Squat (1RM)", "STRENGTH", {
    subcategory: "Squat",
    unit: "kg",
    recordType: "WEIGHT",
    scoreDirection: "HIGHER_IS_BETTER",
    isCore: true,
    sortOrder: 3,
  }),
  def("deadlift-1rm", "Deadlift (1RM)", "STRENGTH", {
    subcategory: "Deadlift",
    unit: "kg",
    recordType: "WEIGHT",
    scoreDirection: "HIGHER_IS_BETTER",
    isCore: true,
    sortOrder: 4,
  }),
  def("sumo-deadlift-1rm", "Sumo Deadlift (1RM)", "STRENGTH", {
    subcategory: "Deadlift",
    unit: "kg",
    recordType: "WEIGHT",
    scoreDirection: "HIGHER_IS_BETTER",
    sortOrder: 5,
  }),
  def("romanian-deadlift-1rm", "Romanian Deadlift (1RM)", "STRENGTH", {
    subcategory: "Deadlift",
    unit: "kg",
    recordType: "WEIGHT",
    scoreDirection: "HIGHER_IS_BETTER",
    sortOrder: 6,
  }),
  def("strict-press-1rm", "Strict Press (1RM)", "STRENGTH", {
    subcategory: "Pressing",
    unit: "kg",
    recordType: "WEIGHT",
    scoreDirection: "HIGHER_IS_BETTER",
    isCore: true,
    sortOrder: 10,
  }),
  def("push-press-1rm", "Push Press (1RM)", "STRENGTH", {
    subcategory: "Pressing",
    unit: "kg",
    recordType: "WEIGHT",
    scoreDirection: "HIGHER_IS_BETTER",
    isCore: true,
    sortOrder: 11,
  }),
  def("push-jerk-1rm", "Push Jerk (1RM)", "STRENGTH", {
    subcategory: "Pressing",
    unit: "kg",
    recordType: "WEIGHT",
    scoreDirection: "HIGHER_IS_BETTER",
    isCore: true,
    sortOrder: 12,
  }),
  def("split-jerk-1rm", "Split Jerk (1RM)", "STRENGTH", {
    subcategory: "Pressing",
    unit: "kg",
    recordType: "WEIGHT",
    scoreDirection: "HIGHER_IS_BETTER",
    isCore: true,
    sortOrder: 13,
  }),
  def("bench-press-1rm", "Bench Press (1RM)", "STRENGTH", {
    subcategory: "Pressing",
    unit: "kg",
    recordType: "WEIGHT",
    scoreDirection: "HIGHER_IS_BETTER",
    isCore: true,
    sortOrder: 14,
  }),

  // ── Olympic (core) ──
  def("snatch-1rm", "Snatch (1RM)", "OLYMPIC", {
    subcategory: "Snatch",
    unit: "kg",
    recordType: "WEIGHT",
    scoreDirection: "HIGHER_IS_BETTER",
    isCore: true,
    sortOrder: 20,
  }),
  def("power-snatch", "Power Snatch (1RM)", "OLYMPIC", {
    subcategory: "Snatch",
    unit: "kg",
    recordType: "WEIGHT",
    scoreDirection: "HIGHER_IS_BETTER",
    isCore: true,
    sortOrder: 21,
  }),
  def("hang-snatch", "Hang Snatch (1RM)", "OLYMPIC", {
    subcategory: "Snatch",
    unit: "kg",
    recordType: "WEIGHT",
    scoreDirection: "HIGHER_IS_BETTER",
    isCore: true,
    sortOrder: 22,
  }),
  def("squat-snatch", "Squat Snatch (1RM)", "OLYMPIC", {
    subcategory: "Snatch",
    unit: "kg",
    recordType: "WEIGHT",
    scoreDirection: "HIGHER_IS_BETTER",
    isCore: true,
    sortOrder: 23,
  }),
  def("clean-1rm", "Clean (1RM)", "OLYMPIC", {
    subcategory: "Clean",
    unit: "kg",
    recordType: "WEIGHT",
    scoreDirection: "HIGHER_IS_BETTER",
    isCore: true,
    sortOrder: 30,
  }),
  def("power-clean", "Power Clean (1RM)", "OLYMPIC", {
    subcategory: "Clean",
    unit: "kg",
    recordType: "WEIGHT",
    scoreDirection: "HIGHER_IS_BETTER",
    isCore: true,
    sortOrder: 31,
  }),
  def("hang-clean", "Hang Clean (1RM)", "OLYMPIC", {
    subcategory: "Clean",
    unit: "kg",
    recordType: "WEIGHT",
    scoreDirection: "HIGHER_IS_BETTER",
    isCore: true,
    sortOrder: 32,
  }),
  def("clean-jerk-1rm", "Clean & Jerk (1RM)", "OLYMPIC", {
    subcategory: "Clean & Jerk",
    unit: "kg",
    recordType: "WEIGHT",
    scoreDirection: "HIGHER_IS_BETTER",
    isCore: true,
    sortOrder: 33,
  }),
  def("snatch-balance", "Snatch Balance (1RM)", "OLYMPIC", {
    subcategory: "Derived",
    unit: "kg",
    recordType: "WEIGHT",
    scoreDirection: "HIGHER_IS_BETTER",
    sortOrder: 34,
  }),
  def("clean-pull", "Clean Pull (1RM)", "OLYMPIC", {
    subcategory: "Derived",
    unit: "kg",
    recordType: "WEIGHT",
    scoreDirection: "HIGHER_IS_BETTER",
    sortOrder: 35,
  }),
  def("snatch-pull", "Snatch Pull (1RM)", "OLYMPIC", {
    subcategory: "Derived",
    unit: "kg",
    recordType: "WEIGHT",
    scoreDirection: "HIGHER_IS_BETTER",
    sortOrder: 36,
  }),

  // ── Gymnastics (core) ──
  def("max-pull-ups", "Max Pull-ups", "GYMNASTICS", {
    subcategory: "Pulling",
    unit: "reps",
    recordType: "REPS",
    scoreDirection: "HIGHER_IS_BETTER",
    isCore: true,
    sortOrder: 40,
  }),
  def("max-strict-pull-ups", "Max Strict Pull-ups", "GYMNASTICS", {
    subcategory: "Pulling",
    unit: "reps",
    recordType: "REPS",
    scoreDirection: "HIGHER_IS_BETTER",
    isCore: true,
    sortOrder: 41,
  }),
  def("max-ctb", "Max Chest-to-Bar Pull-ups", "GYMNASTICS", {
    subcategory: "Pulling",
    unit: "reps",
    recordType: "REPS",
    scoreDirection: "HIGHER_IS_BETTER",
    sortOrder: 42,
  }),
  def("max-strict-ctb", "Max Strict Chest-to-Bar", "GYMNASTICS", {
    subcategory: "Pulling",
    unit: "reps",
    recordType: "REPS",
    scoreDirection: "HIGHER_IS_BETTER",
    sortOrder: 43,
  }),
  def("max-bar-muscle-ups", "Max Bar Muscle-ups", "GYMNASTICS", {
    subcategory: "Pulling",
    unit: "reps",
    recordType: "REPS",
    scoreDirection: "HIGHER_IS_BETTER",
    isCore: true,
    sortOrder: 44,
  }),
  def("max-ring-muscle-ups", "Max Ring Muscle-ups", "GYMNASTICS", {
    subcategory: "Pulling",
    unit: "reps",
    recordType: "REPS",
    scoreDirection: "HIGHER_IS_BETTER",
    isCore: true,
    sortOrder: 45,
  }),
  def("longest-handstand-hold", "Longest Handstand Hold", "GYMNASTICS", {
    subcategory: "Handstand",
    unit: "sec",
    recordType: "TIME",
    scoreDirection: "HIGHER_IS_BETTER",
    sortOrder: 50,
  }),
  def("longest-handstand-walk", "Longest Handstand Walk", "GYMNASTICS", {
    subcategory: "Handstand",
    unit: "m",
    recordType: "DISTANCE",
    scoreDirection: "HIGHER_IS_BETTER",
    isCore: true,
    sortOrder: 51,
  }),
  def("max-hspu", "Max Handstand Push-ups", "GYMNASTICS", {
    subcategory: "Handstand",
    unit: "reps",
    recordType: "REPS",
    scoreDirection: "HIGHER_IS_BETTER",
    isCore: true,
    sortOrder: 52,
  }),
  def("max-strict-hspu", "Max Strict HSPUs", "GYMNASTICS", {
    subcategory: "Handstand",
    unit: "reps",
    recordType: "REPS",
    scoreDirection: "HIGHER_IS_BETTER",
    isCore: true,
    sortOrder: 53,
  }),
  def("max-deficit-hspu", "Max Deficit HSPUs", "GYMNASTICS", {
    subcategory: "Handstand",
    unit: "reps",
    recordType: "REPS",
    scoreDirection: "HIGHER_IS_BETTER",
    sortOrder: 54,
  }),
  def("max-t2b-unbroken", "Max Toes-to-Bar (unbroken)", "GYMNASTICS", {
    subcategory: "Core",
    unit: "reps",
    recordType: "REPS",
    scoreDirection: "HIGHER_IS_BETTER",
    isCore: true,
    sortOrder: 60,
  }),
  def("max-k2e", "Max Knees-to-Elbows", "GYMNASTICS", {
    subcategory: "Core",
    unit: "reps",
    recordType: "REPS",
    scoreDirection: "HIGHER_IS_BETTER",
    sortOrder: 61,
  }),
  def("max-ghd-situps", "Max GHD Sit-ups", "GYMNASTICS", {
    subcategory: "Core",
    unit: "reps",
    recordType: "REPS",
    scoreDirection: "HIGHER_IS_BETTER",
    sortOrder: 62,
  }),
  def("l-sit-hold", "L-Sit Hold", "GYMNASTICS", {
    subcategory: "Core",
    unit: "sec",
    recordType: "TIME",
    scoreDirection: "HIGHER_IS_BETTER",
    sortOrder: 63,
  }),
  def("fastest-rope-climb", "Fastest Rope Climb", "GYMNASTICS", {
    subcategory: "Rope",
    unit: "sec",
    recordType: "TIME",
    scoreDirection: "LOWER_IS_BETTER",
    isCore: true,
    sortOrder: 70,
  }),
  def("max-legless-rope", "Max Legless Rope Climbs", "GYMNASTICS", {
    subcategory: "Rope",
    unit: "reps",
    recordType: "REPS",
    scoreDirection: "HIGHER_IS_BETTER",
    isCore: true,
    sortOrder: 71,
  }),

  // ── Bodyweight ──
  def("max-push-ups", "Max Push-ups", "BODYWEIGHT", {
    unit: "reps",
    recordType: "REPS",
    scoreDirection: "HIGHER_IS_BETTER",
    isCore: true,
    sortOrder: 80,
  }),
  def("max-ring-dips", "Max Ring Dips", "BODYWEIGHT", {
    unit: "reps",
    recordType: "REPS",
    scoreDirection: "HIGHER_IS_BETTER",
    sortOrder: 81,
  }),
  def("max-strict-dips", "Max Strict Dips", "BODYWEIGHT", {
    unit: "reps",
    recordType: "REPS",
    scoreDirection: "HIGHER_IS_BETTER",
    sortOrder: 82,
  }),
  def("max-burpees-1min", "Max Burpees in 1 minute", "BODYWEIGHT", {
    unit: "reps",
    recordType: "REPS",
    scoreDirection: "HIGHER_IS_BETTER",
    sortOrder: 83,
  }),
  def("max-air-squats-2min", "Max Air Squats in 2 minutes", "BODYWEIGHT", {
    unit: "reps",
    recordType: "REPS",
    scoreDirection: "HIGHER_IS_BETTER",
    sortOrder: 84,
  }),
  def("max-pistols", "Max Pistols (single leg)", "BODYWEIGHT", {
    unit: "reps",
    recordType: "REPS",
    scoreDirection: "HIGHER_IS_BETTER",
    sortOrder: 85,
  }),

  // ── Erg ──
  def("row-100m", "Row 100m", "ERG", {
    subcategory: "Concept2 Row",
    unit: "sec",
    recordType: "TIME",
    scoreDirection: "LOWER_IS_BETTER",
    sortOrder: 100,
  }),
  def("row-250m", "Row 250m", "ERG", {
    subcategory: "Concept2 Row",
    unit: "sec",
    recordType: "TIME",
    scoreDirection: "LOWER_IS_BETTER",
    sortOrder: 101,
  }),
  def("row-500m", "Row 500m", "ERG", {
    subcategory: "Concept2 Row",
    unit: "sec",
    recordType: "TIME",
    scoreDirection: "LOWER_IS_BETTER",
    isCore: true,
    sortOrder: 102,
  }),
  def("row-1000m", "Row 1000m", "ERG", {
    subcategory: "Concept2 Row",
    unit: "sec",
    recordType: "TIME",
    scoreDirection: "LOWER_IS_BETTER",
    sortOrder: 103,
  }),
  def("row-2000m", "Row 2000m", "ERG", {
    subcategory: "Concept2 Row",
    unit: "sec",
    recordType: "TIME",
    scoreDirection: "LOWER_IS_BETTER",
    isCore: true,
    sortOrder: 104,
  }),
  def("row-5000m", "Row 5000m", "ERG", {
    subcategory: "Concept2 Row",
    unit: "sec",
    recordType: "TIME",
    scoreDirection: "LOWER_IS_BETTER",
    isCore: true,
    sortOrder: 105,
  }),
  def("row-10000m", "Row 10000m", "ERG", {
    subcategory: "Concept2 Row",
    unit: "sec",
    recordType: "TIME",
    scoreDirection: "LOWER_IS_BETTER",
    isCore: true,
    sortOrder: 106,
  }),
  def("row-30min-distance", "Row Longest Distance (30 min)", "ERG", {
    subcategory: "Concept2 Row",
    unit: "m",
    recordType: "DISTANCE",
    scoreDirection: "HIGHER_IS_BETTER",
    sortOrder: 107,
  }),
  def("row-60min-distance", "Row Longest Distance (60 min)", "ERG", {
    subcategory: "Concept2 Row",
    unit: "m",
    recordType: "DISTANCE",
    scoreDirection: "HIGHER_IS_BETTER",
    isCore: true,
    sortOrder: 108,
  }),
  def("skierg-500m", "SkiErg 500m", "ERG", {
    subcategory: "SkiErg",
    unit: "sec",
    recordType: "TIME",
    scoreDirection: "LOWER_IS_BETTER",
    sortOrder: 110,
  }),
  def("skierg-1000m", "SkiErg 1000m", "ERG", {
    subcategory: "SkiErg",
    unit: "sec",
    recordType: "TIME",
    scoreDirection: "LOWER_IS_BETTER",
    sortOrder: 111,
  }),
  def("skierg-2000m", "SkiErg 2000m", "ERG", {
    subcategory: "SkiErg",
    unit: "sec",
    recordType: "TIME",
    scoreDirection: "LOWER_IS_BETTER",
    isCore: true,
    sortOrder: 112,
  }),
  def("skierg-5000m", "SkiErg 5000m", "ERG", {
    subcategory: "SkiErg",
    unit: "sec",
    recordType: "TIME",
    scoreDirection: "LOWER_IS_BETTER",
    isCore: true,
    sortOrder: 113,
  }),
  def("bikeerg-1000m", "BikeErg 1000m", "ERG", {
    subcategory: "BikeErg",
    unit: "sec",
    recordType: "TIME",
    scoreDirection: "LOWER_IS_BETTER",
    sortOrder: 120,
  }),
  def("bikeerg-5000m", "BikeErg 5000m", "ERG", {
    subcategory: "BikeErg",
    unit: "sec",
    recordType: "TIME",
    scoreDirection: "LOWER_IS_BETTER",
    sortOrder: 121,
  }),
  def("bikeerg-10km", "BikeErg 10km", "ERG", {
    subcategory: "BikeErg",
    unit: "sec",
    recordType: "TIME",
    scoreDirection: "LOWER_IS_BETTER",
    isCore: true,
    sortOrder: 122,
  }),
  def("bikeerg-30min-distance", "BikeErg 30 min Distance", "ERG", {
    subcategory: "BikeErg",
    unit: "m",
    recordType: "DISTANCE",
    scoreDirection: "HIGHER_IS_BETTER",
    isCore: true,
    sortOrder: 123,
  }),
  def("assault-10-cal", "Assault Bike Fastest 10 Calories", "ERG", {
    subcategory: "Assault Bike",
    unit: "sec",
    recordType: "TIME",
    scoreDirection: "LOWER_IS_BETTER",
    sortOrder: 130,
  }),
  def("assault-20-cal", "Assault Bike Fastest 20 Calories", "ERG", {
    subcategory: "Assault Bike",
    unit: "sec",
    recordType: "TIME",
    scoreDirection: "LOWER_IS_BETTER",
    sortOrder: 131,
  }),
  def("assault-50-cal", "Assault Bike Fastest 50 Calories", "ERG", {
    subcategory: "Assault Bike",
    unit: "sec",
    recordType: "TIME",
    scoreDirection: "LOWER_IS_BETTER",
    sortOrder: 132,
  }),
  def("assault-max-cals-1min", "Assault Bike Max Calories (1 min)", "ERG", {
    subcategory: "Assault Bike",
    unit: "cal",
    recordType: "CALORIES",
    scoreDirection: "HIGHER_IS_BETTER",
    isCore: true,
    sortOrder: 133,
  }),
  def("assault-max-cals-5min", "Assault Bike Max Calories (5 min)", "ERG", {
    subcategory: "Assault Bike",
    unit: "cal",
    recordType: "CALORIES",
    scoreDirection: "HIGHER_IS_BETTER",
    isCore: true,
    sortOrder: 134,
  }),

  // ── Running ──
  def("run-100m", "100m Sprint", "RUNNING", {
    subcategory: "Sprint",
    unit: "sec",
    recordType: "TIME",
    scoreDirection: "LOWER_IS_BETTER",
    sortOrder: 200,
  }),
  def("run-200m", "200m Sprint", "RUNNING", {
    subcategory: "Sprint",
    unit: "sec",
    recordType: "TIME",
    scoreDirection: "LOWER_IS_BETTER",
    sortOrder: 201,
  }),
  def("run-400m", "400m", "RUNNING", {
    subcategory: "Sprint",
    unit: "sec",
    recordType: "TIME",
    scoreDirection: "LOWER_IS_BETTER",
    isCore: true,
    sortOrder: 202,
  }),
  def("run-800m", "800m", "RUNNING", {
    subcategory: "Middle Distance",
    unit: "sec",
    recordType: "TIME",
    scoreDirection: "LOWER_IS_BETTER",
    sortOrder: 210,
  }),
  def("run-1-mile", "1 Mile", "RUNNING", {
    subcategory: "Middle Distance",
    unit: "sec",
    recordType: "TIME",
    scoreDirection: "LOWER_IS_BETTER",
    isCore: true,
    sortOrder: 211,
  }),
  def("run-1500m", "1500m", "RUNNING", {
    subcategory: "Middle Distance",
    unit: "sec",
    recordType: "TIME",
    scoreDirection: "LOWER_IS_BETTER",
    sortOrder: 212,
  }),
  def("run-3km", "3km", "RUNNING", {
    subcategory: "Longer",
    unit: "sec",
    recordType: "TIME",
    scoreDirection: "LOWER_IS_BETTER",
    sortOrder: 220,
  }),
  def("run-5km", "5km", "RUNNING", {
    subcategory: "Longer",
    unit: "sec",
    recordType: "TIME",
    scoreDirection: "LOWER_IS_BETTER",
    isCore: true,
    sortOrder: 221,
  }),
  def("run-10km", "10km", "RUNNING", {
    subcategory: "Longer",
    unit: "sec",
    recordType: "TIME",
    scoreDirection: "LOWER_IS_BETTER",
    isCore: true,
    sortOrder: 222,
  }),
  def("run-half-marathon", "Half Marathon", "RUNNING", {
    subcategory: "Longer",
    unit: "sec",
    recordType: "TIME",
    scoreDirection: "LOWER_IS_BETTER",
    sortOrder: 223,
  }),
  def("run-marathon", "Marathon", "RUNNING", {
    subcategory: "Longer",
    unit: "sec",
    recordType: "TIME",
    scoreDirection: "LOWER_IS_BETTER",
    isCore: true,
    sortOrder: 224,
  }),

  // ── Jump Rope ──
  def("max-du-unbroken", "Max Double Unders (unbroken)", "JUMP_ROPE", {
    unit: "reps",
    recordType: "REPS",
    scoreDirection: "HIGHER_IS_BETTER",
    isCore: true,
    sortOrder: 300,
  }),
  def("fastest-100-du", "Fastest 100 Double Unders", "JUMP_ROPE", {
    unit: "sec",
    recordType: "TIME",
    scoreDirection: "LOWER_IS_BETTER",
    isCore: true,
    sortOrder: 301,
  }),
  def("fastest-200-du", "Fastest 200 Double Unders", "JUMP_ROPE", {
    unit: "sec",
    recordType: "TIME",
    scoreDirection: "LOWER_IS_BETTER",
    sortOrder: 302,
  }),
  def("fastest-500-du", "Fastest 500 Double Unders", "JUMP_ROPE", {
    unit: "sec",
    recordType: "TIME",
    scoreDirection: "LOWER_IS_BETTER",
    sortOrder: 303,
  }),
  def("first-triple-under", "Triple Under (first successful)", "JUMP_ROPE", {
    unit: "achieved",
    recordType: "MILESTONE",
    scoreDirection: "HIGHER_IS_BETTER",
    sortOrder: 304,
  }),
  def("max-triple-unders", "Max Triple Unders", "JUMP_ROPE", {
    unit: "reps",
    recordType: "REPS",
    scoreDirection: "HIGHER_IS_BETTER",
    sortOrder: 305,
  }),

  // ── Strongman ──
  def("sandbag-carry", "Sandbag Carry", "STRONGMAN", {
    unit: "m",
    recordType: "DISTANCE",
    scoreDirection: "HIGHER_IS_BETTER",
    sortOrder: 400,
  }),
  def("sandbag-over-shoulder", "Sandbag Over Shoulder", "STRONGMAN", {
    unit: "reps",
    recordType: "REPS",
    scoreDirection: "HIGHER_IS_BETTER",
    sortOrder: 401,
  }),
  def("farmer-carry", "Farmer Carry", "STRONGMAN", {
    unit: "m",
    recordType: "DISTANCE",
    scoreDirection: "HIGHER_IS_BETTER",
    isCore: true,
    sortOrder: 402,
  }),
  def("yoke-carry", "Yoke Carry", "STRONGMAN", {
    unit: "m",
    recordType: "DISTANCE",
    scoreDirection: "HIGHER_IS_BETTER",
    sortOrder: 403,
  }),
  def("sled-push", "Sled Push", "STRONGMAN", {
    unit: "m",
    recordType: "DISTANCE",
    scoreDirection: "HIGHER_IS_BETTER",
    isCore: true,
    sortOrder: 404,
  }),
  def("sled-pull", "Sled Pull", "STRONGMAN", {
    unit: "m",
    recordType: "DISTANCE",
    scoreDirection: "HIGHER_IS_BETTER",
    sortOrder: 405,
  }),
  def("tire-flip", "Tire Flip", "STRONGMAN", {
    unit: "reps",
    recordType: "REPS",
    scoreDirection: "HIGHER_IS_BETTER",
    sortOrder: 406,
  }),
  def("atlas-stone", "Atlas Stone", "STRONGMAN", {
    unit: "kg",
    recordType: "WEIGHT",
    scoreDirection: "HIGHER_IS_BETTER",
    sortOrder: 407,
  }),

  // ── Power ──
  def("box-jump-height", "Box Jump Height", "POWER", {
    unit: "cm",
    recordType: "HEIGHT",
    scoreDirection: "HIGHER_IS_BETTER",
    isCore: true,
    sortOrder: 500,
  }),
  def("broad-jump", "Broad Jump", "POWER", {
    unit: "cm",
    recordType: "HEIGHT",
    scoreDirection: "HIGHER_IS_BETTER",
    sortOrder: 501,
  }),
  def("vertical-jump", "Vertical Jump", "POWER", {
    unit: "cm",
    recordType: "HEIGHT",
    scoreDirection: "HIGHER_IS_BETTER",
    sortOrder: 502,
  }),
  def("max-wall-balls-unbroken", "Max Wall Balls (unbroken)", "POWER", {
    unit: "reps",
    recordType: "REPS",
    scoreDirection: "HIGHER_IS_BETTER",
    isCore: true,
    sortOrder: 503,
  }),
  def("max-thrusters-weight", "Max Thrusters (weight)", "POWER", {
    unit: "kg",
    recordType: "WEIGHT",
    scoreDirection: "HIGHER_IS_BETTER",
    sortOrder: 504,
  }),

  // ── Skill Milestones (core) ──
  def("first-pull-up", "First Pull-up", "SKILL_MILESTONE", {
    unit: "achieved",
    recordType: "MILESTONE",
    scoreDirection: "HIGHER_IS_BETTER",
    isCore: true,
    sortOrder: 600,
  }),
  def("first-strict-pull-up", "First Strict Pull-up", "SKILL_MILESTONE", {
    unit: "achieved",
    recordType: "MILESTONE",
    scoreDirection: "HIGHER_IS_BETTER",
    sortOrder: 601,
  }),
  def("first-butterfly-pull-up", "First Butterfly Pull-up", "SKILL_MILESTONE", {
    unit: "achieved",
    recordType: "MILESTONE",
    scoreDirection: "HIGHER_IS_BETTER",
    sortOrder: 602,
  }),
  def("first-muscle-up", "First Muscle-up", "SKILL_MILESTONE", {
    unit: "achieved",
    recordType: "MILESTONE",
    scoreDirection: "HIGHER_IS_BETTER",
    isCore: true,
    sortOrder: 603,
  }),
  def("first-ring-muscle-up", "First Ring Muscle-up", "SKILL_MILESTONE", {
    unit: "achieved",
    recordType: "MILESTONE",
    scoreDirection: "HIGHER_IS_BETTER",
    sortOrder: 604,
  }),
  def("first-bar-muscle-up", "First Bar Muscle-up", "SKILL_MILESTONE", {
    unit: "achieved",
    recordType: "MILESTONE",
    scoreDirection: "HIGHER_IS_BETTER",
    sortOrder: 605,
  }),
  def("first-handstand", "First Handstand", "SKILL_MILESTONE", {
    unit: "achieved",
    recordType: "MILESTONE",
    scoreDirection: "HIGHER_IS_BETTER",
    sortOrder: 606,
  }),
  def("first-handstand-walk", "First Handstand Walk", "SKILL_MILESTONE", {
    unit: "achieved",
    recordType: "MILESTONE",
    scoreDirection: "HIGHER_IS_BETTER",
    isCore: true,
    sortOrder: 607,
  }),
  def("first-hspu", "First HSPU", "SKILL_MILESTONE", {
    unit: "achieved",
    recordType: "MILESTONE",
    scoreDirection: "HIGHER_IS_BETTER",
    isCore: true,
    sortOrder: 608,
  }),
  def("first-strict-hspu", "First Strict HSPU", "SKILL_MILESTONE", {
    unit: "achieved",
    recordType: "MILESTONE",
    scoreDirection: "HIGHER_IS_BETTER",
    sortOrder: 609,
  }),
  def("first-rope-climb", "First Rope Climb", "SKILL_MILESTONE", {
    unit: "achieved",
    recordType: "MILESTONE",
    scoreDirection: "HIGHER_IS_BETTER",
    isCore: true,
    sortOrder: 610,
  }),
  def("first-legless-rope", "First Legless Rope Climb", "SKILL_MILESTONE", {
    unit: "achieved",
    recordType: "MILESTONE",
    scoreDirection: "HIGHER_IS_BETTER",
    sortOrder: 611,
  }),
  def("first-double-under", "First Double Under", "SKILL_MILESTONE", {
    unit: "achieved",
    recordType: "MILESTONE",
    scoreDirection: "HIGHER_IS_BETTER",
    isCore: true,
    sortOrder: 612,
  }),
  def("first-triple-under-milestone", "First Triple Under", "SKILL_MILESTONE", {
    unit: "achieved",
    recordType: "MILESTONE",
    scoreDirection: "HIGHER_IS_BETTER",
    sortOrder: 613,
  }),
  def("first-pistol", "First Pistol Squat", "SKILL_MILESTONE", {
    unit: "achieved",
    recordType: "MILESTONE",
    scoreDirection: "HIGHER_IS_BETTER",
    sortOrder: 614,
  }),

  // ── Benchmark WODs — Girls (core subset) ──
  ...[
    "Fran",
    "Grace",
    "Isabel",
    "Diane",
    "Helen",
    "Cindy",
    "Annie",
    "Karen",
    "Jackie",
    "Nancy",
    "Kelly",
    "Elizabeth",
    "Amanda",
    "Eva",
    "Lynne",
    "Mary",
    "Nicole",
    "Angie",
    "Barbara",
    "Chelsea",
  ].map((name, i) =>
    def(
      `wod-${name.toLowerCase()}`,
      name,
      "BENCHMARK_WOD",
      {
        subcategory: "Girls",
        unit: "score",
        recordType: "SCORE",
        scoreDirection: "LOWER_IS_BETTER",
        isCore: ["Fran", "Grace", "Isabel", "Diane", "Helen", "Cindy", "Jackie"].includes(name),
        sortOrder: 700 + i,
        description: `Benchmark WOD: ${name}`,
      },
    ),
  ),

  // ── Hero WODs ──
  ...[
    "Murph",
    "DT",
    "Randy",
    "JT",
    "Badger",
    "Tommy V",
    "Nate",
    "Roy",
    "Whitten",
    "Holleyman",
    "The Seven",
    "Danny",
    "Michael",
    "Bull",
    "Lumberjack 20",
    "Chad",
    "Clovis",
  ].map((name, i) =>
    def(
      `wod-${name.toLowerCase().replace(/\s+/g, "-")}`,
      name,
      "BENCHMARK_WOD",
      {
        subcategory: "Hero WODs",
        unit: "score",
        recordType: "SCORE",
        scoreDirection: "LOWER_IS_BETTER",
        isCore: ["Murph", "DT", "Chad"].includes(name),
        sortOrder: 750 + i,
        description: `Hero WOD: ${name}`,
      },
    ),
  ),

  // ── CrossFit Open ──
  ...["24.1", "24.2", "24.3", "25.1", "25.2", "25.3"].map((name, i) =>
    def(`open-${name}`, `Open ${name}`, "BENCHMARK_WOD", {
      subcategory: "CrossFit Open",
      unit: "score",
      recordType: "SCORE",
      scoreDirection: "HIGHER_IS_BETTER",
      isCore: name.startsWith("24.") || name.startsWith("25."),
      sortOrder: 800 + i,
      description: `CrossFit Open workout ${name}`,
    }),
  ),

  // ── Complexes ──
  def("bear-complex", "Bear Complex", "COMPLEX", {
    unit: "kg",
    recordType: "WEIGHT",
    scoreDirection: "HIGHER_IS_BETTER",
    isCore: true,
    sortOrder: 900,
  }),
  def("clean-complex", "Clean Complex", "COMPLEX", {
    unit: "kg",
    recordType: "WEIGHT",
    scoreDirection: "HIGHER_IS_BETTER",
    sortOrder: 901,
  }),
  def("snatch-complex", "Snatch Complex", "COMPLEX", {
    unit: "kg",
    recordType: "WEIGHT",
    scoreDirection: "HIGHER_IS_BETTER",
    sortOrder: 902,
  }),
  def("hang-complex", "Hang Complex", "COMPLEX", {
    unit: "kg",
    recordType: "WEIGHT",
    scoreDirection: "HIGHER_IS_BETTER",
    sortOrder: 903,
  }),
  def("thruster-complex", "Thruster Complex", "COMPLEX", {
    unit: "kg",
    recordType: "WEIGHT",
    scoreDirection: "HIGHER_IS_BETTER",
    sortOrder: 904,
  }),

  // ── Time-Based Capacity ──
  def("longest-plank", "Longest Plank", "TIME_CAPACITY", {
    unit: "sec",
    recordType: "TIME",
    scoreDirection: "HIGHER_IS_BETTER",
    isCore: true,
    sortOrder: 1000,
  }),
  def("longest-hollow-hold", "Longest Hollow Hold", "TIME_CAPACITY", {
    unit: "sec",
    recordType: "TIME",
    scoreDirection: "HIGHER_IS_BETTER",
    sortOrder: 1001,
  }),
  def("longest-dead-hang", "Longest Dead Hang", "TIME_CAPACITY", {
    unit: "sec",
    recordType: "TIME",
    scoreDirection: "HIGHER_IS_BETTER",
    sortOrder: 1002,
  }),

  // ── Volume PBs ──
  def("most-squats-workout", "Most Squats in One Workout", "VOLUME", {
    unit: "reps",
    recordType: "REPS",
    scoreDirection: "HIGHER_IS_BETTER",
    sortOrder: 1100,
  }),
  def("most-deadlift-volume", "Most Deadlift Volume", "VOLUME", {
    unit: "kg",
    recordType: "WEIGHT",
    scoreDirection: "HIGHER_IS_BETTER",
    sortOrder: 1101,
  }),
  def("most-snatches-session", "Most Snatches in Session", "VOLUME", {
    unit: "reps",
    recordType: "REPS",
    scoreDirection: "HIGHER_IS_BETTER",
    sortOrder: 1102,
  }),
  def("most-pullups-session", "Most Pull-ups in Session", "VOLUME", {
    unit: "reps",
    recordType: "REPS",
    scoreDirection: "HIGHER_IS_BETTER",
    sortOrder: 1103,
  }),
  def("highest-tonnage", "Highest Total Tonnage", "VOLUME", {
    unit: "kg",
    recordType: "WEIGHT",
    scoreDirection: "HIGHER_IS_BETTER",
    sortOrder: 1104,
  }),
  def("longest-workout", "Longest Workout", "VOLUME", {
    unit: "min",
    recordType: "TIME",
    scoreDirection: "HIGHER_IS_BETTER",
    sortOrder: 1105,
  }),
  def("highest-calories-burned", "Highest Calories Burned", "VOLUME", {
    unit: "cal",
    recordType: "CALORIES",
    scoreDirection: "HIGHER_IS_BETTER",
    sortOrder: 1106,
  }),
];

export const CORE_PB_COUNT = PB_CATALOG.filter((p) => p.isCore).length;

export function getCorePbs() {
  return PB_CATALOG.filter((p) => p.isCore);
}

export function getExtendedPbs() {
  return PB_CATALOG.filter((p) => !p.isCore);
}

export function getPbsByCategory(category: PbCategory) {
  return PB_CATALOG.filter((p) => p.category === category);
}
