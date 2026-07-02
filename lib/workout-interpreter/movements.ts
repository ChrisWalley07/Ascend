export type ScoreCategory =
  | "strength"
  | "olympicLifting"
  | "engine"
  | "gymnastics"
  | "power"
  | "mobility";

export type MovementDefinition = {
  name: string;
  aliases: RegExp[];
  category: string;
  movementType: string;
  primaryMuscles: string[];
  /** How much this movement contributes to each athlete score category (0–1) */
  scoreWeights: Partial<Record<ScoreCategory, number>>;
};

export const BENCHMARK_WODS: Record<string, { type: "FOR_TIME" | "AMRAP"; exercises: string[] }> = {
  fran: { type: "FOR_TIME", exercises: ["Thruster", "Pull Up"] },
  grace: { type: "FOR_TIME", exercises: ["Clean and Jerk"] },
  helen: { type: "FOR_TIME", exercises: ["Run 400m", "Kettlebell Swing", "Pull Up"] },
  murph: { type: "FOR_TIME", exercises: ["Run 400m", "Pull Up", "Push Up", "Air Squat"] },
  diane: { type: "FOR_TIME", exercises: ["Deadlift", "Handstand Push Up"] },
  elizabeth: { type: "FOR_TIME", exercises: ["Clean", "Ring Dip"] },
  isabel: { type: "FOR_TIME", exercises: ["Snatch"] },
  jackie: { type: "FOR_TIME", exercises: ["Row", "Thruster", "Pull Up"] },
  karen: { type: "FOR_TIME", exercises: ["Wall Ball"] },
  nancy: { type: "FOR_TIME", exercises: ["Run 400m", "Overhead Squat"] },
  annie: { type: "FOR_TIME", exercises: ["Double Under", "Sit Up"] },
  cindy: { type: "AMRAP", exercises: ["Pull Up", "Push Up", "Air Squat"] },
  mary: { type: "AMRAP", exercises: ["Handstand Push Up", "Pistol", "Pull Up"] },
};

export const MOVEMENTS: MovementDefinition[] = [
  {
    name: "Back Squat",
    aliases: [/back\s*squats?/i, /\bbs\b/i, /backsquat/i],
    category: "Power Lifts",
    movementType: "Strength",
    primaryMuscles: ["Quads", "Glutes"],
    scoreWeights: { strength: 1, power: 0.4 },
  },
  {
    name: "Front Squat",
    aliases: [/front\s*squats?/i, /\bfs\b/i],
    category: "Power Lifts",
    movementType: "Strength",
    primaryMuscles: ["Quads", "Core"],
    scoreWeights: { strength: 0.9, olympicLifting: 0.3, power: 0.3 },
  },
  {
    name: "Overhead Squat",
    aliases: [/overhead\s*squats?/i, /\bohs\b/i],
    category: "Power Lifts",
    movementType: "Strength",
    primaryMuscles: ["Quads", "Shoulders"],
    scoreWeights: { strength: 0.7, olympicLifting: 0.5, mobility: 0.4 },
  },
  {
    name: "Air Squat",
    aliases: [/air\s*squats?/i, /bodyweight\s*squats?/i],
    category: "Gymnastics",
    movementType: "Bodyweight",
    primaryMuscles: ["Quads", "Glutes"],
    scoreWeights: { gymnastics: 0.5, engine: 0.3 },
  },
  {
    name: "Deadlift",
    aliases: [/deadlifts?/i, /\bdl\b/i],
    category: "Power Lifts",
    movementType: "Strength",
    primaryMuscles: ["Hamstrings", "Back"],
    scoreWeights: { strength: 1, power: 0.5 },
  },
  {
    name: "Bench Press",
    aliases: [/bench\s*press/i, /\bbp\b/i],
    category: "Power Lifts",
    movementType: "Strength",
    primaryMuscles: ["Chest", "Triceps"],
    scoreWeights: { strength: 1 },
  },
  {
    name: "Strict Press",
    aliases: [/strict\s*press/i, /shoulder\s*press/i, /press\b/i],
    category: "Power Lifts",
    movementType: "Strength",
    primaryMuscles: ["Shoulders", "Triceps"],
    scoreWeights: { strength: 0.9 },
  },
  {
    name: "Push Press",
    aliases: [/push\s*press/i],
    category: "Power Lifts",
    movementType: "Strength",
    primaryMuscles: ["Shoulders"],
    scoreWeights: { strength: 0.7, power: 0.6, olympicLifting: 0.2 },
  },
  {
    name: "Snatch",
    aliases: [/snatches?/i, /power\s*snatch/i, /squat\s*snatch/i],
    category: "Olympic Lifts",
    movementType: "Skill",
    primaryMuscles: ["Posterior Chain", "Shoulders"],
    scoreWeights: { olympicLifting: 1, power: 0.5, mobility: 0.3 },
  },
  {
    name: "Clean",
    aliases: [/power\s*clean/i, /squat\s*clean/i, /cleans?\b/i],
    category: "Olympic Lifts",
    movementType: "Skill",
    primaryMuscles: ["Full Body"],
    scoreWeights: { olympicLifting: 1, power: 0.5 },
  },
  {
    name: "Clean and Jerk",
    aliases: [/clean\s*(?:and|&)\s*jerks?/i, /\bc&j\b/i],
    category: "Olympic Lifts",
    movementType: "Skill",
    primaryMuscles: ["Full Body"],
    scoreWeights: { olympicLifting: 1, power: 0.6 },
  },
  {
    name: "Thruster",
    aliases: [/thrusters?/i],
    category: "Accessories",
    movementType: "Metcon",
    primaryMuscles: ["Quads", "Shoulders"],
    scoreWeights: { strength: 0.5, engine: 0.5, power: 0.4 },
  },
  {
    name: "Pull Up",
    aliases: [/pull[\s-]?ups?/i, /strict\s*pull/i, /kipping\s*pull/i],
    category: "Gymnastics",
    movementType: "Bodyweight",
    primaryMuscles: ["Lats", "Biceps"],
    scoreWeights: { gymnastics: 1, strength: 0.2 },
  },
  {
    name: "Chest to Bar",
    aliases: [/chest[\s-]?to[\s-]?bar/i, /\bctb\b/i],
    category: "Gymnastics",
    movementType: "Bodyweight",
    primaryMuscles: ["Lats", "Core"],
    scoreWeights: { gymnastics: 1 },
  },
  {
    name: "Muscle Up",
    aliases: [/muscle[\s-]?ups?/i, /\bmu\b/i],
    category: "Gymnastics",
    movementType: "Bodyweight",
    primaryMuscles: ["Full Body"],
    scoreWeights: { gymnastics: 1, strength: 0.3, power: 0.3 },
  },
  {
    name: "Bar Muscle Up",
    aliases: [/bar\s*muscle[\s-]?ups?/i, /\bbmu\b/i],
    category: "Gymnastics",
    movementType: "Bodyweight",
    primaryMuscles: ["Full Body"],
    scoreWeights: { gymnastics: 1, strength: 0.3 },
  },
  {
    name: "Handstand Push Up",
    aliases: [/handstand\s*push[\s-]?ups?/i, /\bhspu\b/i],
    category: "Gymnastics",
    movementType: "Bodyweight",
    primaryMuscles: ["Shoulders"],
    scoreWeights: { gymnastics: 1, strength: 0.2 },
  },
  {
    name: "Toes to Bar",
    aliases: [/toes[\s-]?to[\s-]?bar/i, /\bt2b\b/i, /\bttb\b/i],
    category: "Gymnastics",
    movementType: "Bodyweight",
    primaryMuscles: ["Core", "Hip Flexors"],
    scoreWeights: { gymnastics: 0.9, mobility: 0.3 },
  },
  {
    name: "Ring Dip",
    aliases: [/ring\s*dips?/i],
    category: "Gymnastics",
    movementType: "Bodyweight",
    primaryMuscles: ["Chest", "Triceps"],
    scoreWeights: { gymnastics: 0.9, strength: 0.2 },
  },
  {
    name: "Push Up",
    aliases: [/push[\s-]?ups?/i],
    category: "Gymnastics",
    movementType: "Bodyweight",
    primaryMuscles: ["Chest", "Triceps"],
    scoreWeights: { gymnastics: 0.7, strength: 0.2 },
  },
  {
    name: "Burpee",
    aliases: [/burpees?/i],
    category: "Accessories",
    movementType: "Metcon",
    primaryMuscles: ["Full Body"],
    scoreWeights: { engine: 0.8, gymnastics: 0.3, power: 0.3 },
  },
  {
    name: "Box Jump",
    aliases: [/box\s*jumps?/i],
    category: "Plyometrics",
    movementType: "Power",
    primaryMuscles: ["Legs"],
    scoreWeights: { power: 1, engine: 0.3 },
  },
  {
    name: "Wall Ball",
    aliases: [/wall\s*balls?/i],
    category: "Accessories",
    movementType: "Metcon",
    primaryMuscles: ["Quads", "Shoulders"],
    scoreWeights: { engine: 0.6, strength: 0.3, power: 0.3 },
  },
  {
    name: "Kettlebell Swing",
    aliases: [/kb\s*swings?/i, /kettlebell\s*swings?/i],
    category: "Accessories",
    movementType: "Metcon",
    primaryMuscles: ["Posterior Chain"],
    scoreWeights: { power: 0.6, engine: 0.5 },
  },
  {
    name: "Row",
    aliases: [/row(?:ing)?/i, /\b2k\s*row/i, /\b500m\s*row/i],
    category: "Rowing",
    movementType: "Engine",
    primaryMuscles: ["Full Body"],
    scoreWeights: { engine: 1 },
  },
  {
    name: "Bike Erg",
    aliases: [/bike(?:\s*erg)?/i, /assault\s*bike/i, /echo\s*bike/i],
    category: "Bike",
    movementType: "Engine",
    primaryMuscles: ["Legs"],
    scoreWeights: { engine: 1 },
  },
  {
    name: "Ski Erg",
    aliases: [/ski(?:\s*erg)?/i],
    category: "Ski",
    movementType: "Engine",
    primaryMuscles: ["Upper Body"],
    scoreWeights: { engine: 1 },
  },
  {
    name: "Run 400m",
    aliases: [/run(?:ning)?/i, /\b\d+\s*m\s*run/i, /sprint/i],
    category: "Running",
    movementType: "Engine",
    primaryMuscles: ["Full Body"],
    scoreWeights: { engine: 1 },
  },
  {
    name: "Double Under",
    aliases: [/double[\s-]?unders?/i, /\bdu\b/i, /jump\s*rope/i],
    category: "Cardio",
    movementType: "Skill",
    primaryMuscles: ["Full Body"],
    scoreWeights: { engine: 0.7, gymnastics: 0.3 },
  },
  {
    name: "Sit Up",
    aliases: [/sit[\s-]?ups?/i, /ghd\s*sit[\s-]?ups?/i],
    category: "Accessories",
    movementType: "Metcon",
    primaryMuscles: ["Core"],
    scoreWeights: { gymnastics: 0.4, engine: 0.3 },
  },
  {
    name: "Rope Climb",
    aliases: [/rope\s*climbs?/i],
    category: "Gymnastics",
    movementType: "Bodyweight",
    primaryMuscles: ["Arms", "Core"],
    scoreWeights: { gymnastics: 0.8, strength: 0.4 },
  },
  {
    name: "Pistol",
    aliases: [/pistols?/i, /single[\s-]?leg\s*squat/i],
    category: "Gymnastics",
    movementType: "Bodyweight",
    primaryMuscles: ["Quads"],
    scoreWeights: { gymnastics: 0.8, mobility: 0.5, strength: 0.3 },
  },
];

export function matchMovement(text: string): MovementDefinition | null {
  const normalized = text.trim();
  for (const movement of MOVEMENTS) {
    if (movement.aliases.some((pattern) => pattern.test(normalized))) {
      return movement;
    }
    if (normalized.toLowerCase().includes(movement.name.toLowerCase())) {
      return movement;
    }
  }
  return null;
}
