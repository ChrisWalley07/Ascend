import type { WeaknessAttributeCategory } from "./types";

export const ATTRIBUTE_LABELS: Record<WeaknessAttributeCategory, string> = {
  running: "Running",
  grip: "Grip",
  engine: "Engine",
  mobility: "Mobility",
  strength: "Strength",
  recovery: "Recovery",
  work_capacity: "Work Capacity",
  explosiveness: "Explosiveness",
};

export const ATTRIBUTE_ORDER: WeaknessAttributeCategory[] = [
  "running",
  "grip",
  "engine",
  "mobility",
  "strength",
  "recovery",
  "work_capacity",
  "explosiveness",
];

export const WEAKNESS_THRESHOLDS = {
  criticalScore: 45,
  highScore: 55,
  moderateScore: 65,
  weaknessCeiling: 70,
  decliningCeiling: 75,
  minDeclineDelta: -2,
  minImproveDelta: 2,
} as const;

export const SEVERITY_WEIGHT: Record<string, number> = {
  critical: 100,
  high: 75,
  moderate: 50,
  low: 25,
};

export const RECOMMENDATIONS: Record<WeaknessAttributeCategory, string> = {
  running:
    "Add two aerobic sessions per week. Progress to race-pace intervals once base volume is consistent.",
  grip:
    "Program farmers carries, dead hangs, and sled work 2× weekly. Prioritise grip under fatigue after engine sessions.",
  engine:
    "Schedule one dedicated interval or mixed-modal conditioning day. Track RPE to avoid overreaching.",
  mobility:
    "Block 10–15 minutes daily for hip, ankle, and thoracic mobility. Pair with warm-ups before heavy sessions.",
  strength:
    "Run a structured strength block with progressive overload on squat, hinge, and press patterns.",
  recovery:
    "Log readiness daily. Prioritise sleep, hydration, and one full rest day when readiness drops below 55.",
  work_capacity:
    "Increase weekly session frequency with shorter, focused workouts. Consistency beats occasional long sessions.",
  explosiveness:
    "Add plyometrics, Olympic lift variations, or sled accelerations once per week at sub-maximal effort.",
};

export const ICON_BY_ATTRIBUTE: Record<WeaknessAttributeCategory, string> = {
  running: "gauge",
  grip: "dumbbell",
  engine: "activity",
  mobility: "brain",
  strength: "dumbbell",
  recovery: "gauge",
  work_capacity: "bar-chart",
  explosiveness: "zap",
};
