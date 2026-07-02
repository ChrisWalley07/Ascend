/**
 * Canonical metric keys used in achievement requirements.
 * Extend per category without loosening requirement typing.
 */
export const CROSSFIT_METRICS = [
  "workout_count",
  "benchmark_count",
  "streak_days",
  "fran_time_seconds",
  "murph_time_seconds",
  "grace_time_seconds",
  "isabel_time_seconds",
  "helen_time_seconds",
  "cindy_rounds",
  "gymnastics_skill_count",
  "pullup_max_reps",
  "strict_pullup_max_reps",
  "ctb_max_reps",
  "bar_muscle_up_max_reps",
  "ring_muscle_up_max_reps",
  "toes_to_bar_max_reps",
  "double_under_max_reps",
  "muscle_up_max_reps",
  "handstand_pushup_max_reps",
  "back_squat_1rm_kg",
  "back_squat_bodyweight_ratio",
  "clean_1rm_kg",
  "power_clean_1rm_kg",
  "deadlift_1rm_kg",
  "shoulder_press_1rm_kg",
  "thruster_1rm_kg",
  "competition_count",
  "quarterfinal_qualified",
  "engine_score",
  "overall_score",
] as const;

export const HYROX_METRICS = [
  "race_finish_count",
  "race_finish_time_seconds",
  "station_pr_count",
  "running_split_seconds",
  "sled_push_pr",
  "work_capacity_score",
  "overall_score",
  "streak_days",
] as const;

export const RUNNING_METRICS = [
  "run_count",
  "total_distance_km",
  "longest_run_km",
  "five_k_time_seconds",
  "ten_k_time_seconds",
  "half_marathon_time_seconds",
  "marathon_time_seconds",
  "streak_days",
  "weekly_mileage_km",
] as const;

export const WEIGHTLIFTING_METRICS = [
  "snatch_1rm_kg",
  "clean_jerk_1rm_kg",
  "squat_1rm_kg",
  "total_kg",
  "session_count",
  "technique_session_count",
  "streak_days",
] as const;

export type CrossfitMetricKey = (typeof CROSSFIT_METRICS)[number];
export type HyroxMetricKey = (typeof HYROX_METRICS)[number];
export type RunningMetricKey = (typeof RUNNING_METRICS)[number];
export type WeightliftingMetricKey = (typeof WEIGHTLIFTING_METRICS)[number];

export type AchievementMetricKey =
  | CrossfitMetricKey
  | HyroxMetricKey
  | RunningMetricKey
  | WeightliftingMetricKey;

export type MetricDirection = "higher_is_better" | "lower_is_better";

export type AchievementMetricMeta = {
  key: AchievementMetricKey;
  label: string;
  unit: string;
  direction: MetricDirection;
  categories: readonly import("./category").AchievementCategory[];
};

export const ACHIEVEMENT_METRIC_META: Record<AchievementMetricKey, AchievementMetricMeta> = {
  workout_count: {
    key: "workout_count",
    label: "Workouts logged",
    unit: "sessions",
    direction: "higher_is_better",
    categories: ["crossfit"],
  },
  benchmark_count: {
    key: "benchmark_count",
    label: "Benchmarks completed",
    unit: "benchmarks",
    direction: "higher_is_better",
    categories: ["crossfit"],
  },
  streak_days: {
    key: "streak_days",
    label: "Training streak",
    unit: "days",
    direction: "higher_is_better",
    categories: ["crossfit", "hyrox", "running", "weightlifting"],
  },
  fran_time_seconds: {
    key: "fran_time_seconds",
    label: "Fran time",
    unit: "s",
    direction: "lower_is_better",
    categories: ["crossfit"],
  },
  murph_time_seconds: {
    key: "murph_time_seconds",
    label: "Murph time",
    unit: "s",
    direction: "lower_is_better",
    categories: ["crossfit"],
  },
  grace_time_seconds: {
    key: "grace_time_seconds",
    label: "Grace time",
    unit: "s",
    direction: "lower_is_better",
    categories: ["crossfit"],
  },
  isabel_time_seconds: {
    key: "isabel_time_seconds",
    label: "Isabel time",
    unit: "s",
    direction: "lower_is_better",
    categories: ["crossfit"],
  },
  helen_time_seconds: {
    key: "helen_time_seconds",
    label: "Helen time",
    unit: "s",
    direction: "lower_is_better",
    categories: ["crossfit"],
  },
  cindy_rounds: {
    key: "cindy_rounds",
    label: "Cindy rounds",
    unit: "rounds",
    direction: "higher_is_better",
    categories: ["crossfit"],
  },
  gymnastics_skill_count: {
    key: "gymnastics_skill_count",
    label: "Gymnastics skills unlocked",
    unit: "skills",
    direction: "higher_is_better",
    categories: ["crossfit"],
  },
  pullup_max_reps: {
    key: "pullup_max_reps",
    label: "Max pull-ups",
    unit: "reps",
    direction: "higher_is_better",
    categories: ["crossfit"],
  },
  strict_pullup_max_reps: {
    key: "strict_pullup_max_reps",
    label: "Max strict pull-ups",
    unit: "reps",
    direction: "higher_is_better",
    categories: ["crossfit"],
  },
  ctb_max_reps: {
    key: "ctb_max_reps",
    label: "Max chest-to-bar",
    unit: "reps",
    direction: "higher_is_better",
    categories: ["crossfit"],
  },
  bar_muscle_up_max_reps: {
    key: "bar_muscle_up_max_reps",
    label: "Max bar muscle-ups",
    unit: "reps",
    direction: "higher_is_better",
    categories: ["crossfit"],
  },
  ring_muscle_up_max_reps: {
    key: "ring_muscle_up_max_reps",
    label: "Max ring muscle-ups",
    unit: "reps",
    direction: "higher_is_better",
    categories: ["crossfit"],
  },
  toes_to_bar_max_reps: {
    key: "toes_to_bar_max_reps",
    label: "Max toes-to-bar",
    unit: "reps",
    direction: "higher_is_better",
    categories: ["crossfit"],
  },
  double_under_max_reps: {
    key: "double_under_max_reps",
    label: "Max double-unders",
    unit: "reps",
    direction: "higher_is_better",
    categories: ["crossfit"],
  },
  muscle_up_max_reps: {
    key: "muscle_up_max_reps",
    label: "Max muscle-ups",
    unit: "reps",
    direction: "higher_is_better",
    categories: ["crossfit"],
  },
  handstand_pushup_max_reps: {
    key: "handstand_pushup_max_reps",
    label: "Max handstand push-ups",
    unit: "reps",
    direction: "higher_is_better",
    categories: ["crossfit"],
  },
  back_squat_1rm_kg: {
    key: "back_squat_1rm_kg",
    label: "Back squat 1RM",
    unit: "kg",
    direction: "higher_is_better",
    categories: ["crossfit"],
  },
  back_squat_bodyweight_ratio: {
    key: "back_squat_bodyweight_ratio",
    label: "Back squat / bodyweight",
    unit: "× BW",
    direction: "higher_is_better",
    categories: ["crossfit"],
  },
  clean_1rm_kg: {
    key: "clean_1rm_kg",
    label: "Clean 1RM",
    unit: "kg",
    direction: "higher_is_better",
    categories: ["crossfit"],
  },
  power_clean_1rm_kg: {
    key: "power_clean_1rm_kg",
    label: "Power clean 1RM",
    unit: "kg",
    direction: "higher_is_better",
    categories: ["crossfit"],
  },
  deadlift_1rm_kg: {
    key: "deadlift_1rm_kg",
    label: "Deadlift 1RM",
    unit: "kg",
    direction: "higher_is_better",
    categories: ["crossfit"],
  },
  shoulder_press_1rm_kg: {
    key: "shoulder_press_1rm_kg",
    label: "Shoulder press 1RM",
    unit: "kg",
    direction: "higher_is_better",
    categories: ["crossfit"],
  },
  thruster_1rm_kg: {
    key: "thruster_1rm_kg",
    label: "Thruster 1RM",
    unit: "kg",
    direction: "higher_is_better",
    categories: ["crossfit"],
  },
  competition_count: {
    key: "competition_count",
    label: "Competitions entered",
    unit: "events",
    direction: "higher_is_better",
    categories: ["crossfit"],
  },
  quarterfinal_qualified: {
    key: "quarterfinal_qualified",
    label: "Quarterfinal qualifier",
    unit: "",
    direction: "higher_is_better",
    categories: ["crossfit"],
  },
  engine_score: {
    key: "engine_score",
    label: "Engine score",
    unit: "pts",
    direction: "higher_is_better",
    categories: ["crossfit"],
  },
  overall_score: {
    key: "overall_score",
    label: "Overall athlete score",
    unit: "pts",
    direction: "higher_is_better",
    categories: ["crossfit", "hyrox"],
  },
  race_finish_count: {
    key: "race_finish_count",
    label: "HYROX races finished",
    unit: "races",
    direction: "higher_is_better",
    categories: ["hyrox"],
  },
  race_finish_time_seconds: {
    key: "race_finish_time_seconds",
    label: "HYROX finish time",
    unit: "s",
    direction: "lower_is_better",
    categories: ["hyrox"],
  },
  station_pr_count: {
    key: "station_pr_count",
    label: "Station PRs",
    unit: "prs",
    direction: "higher_is_better",
    categories: ["hyrox"],
  },
  running_split_seconds: {
    key: "running_split_seconds",
    label: "Best running split",
    unit: "s",
    direction: "lower_is_better",
    categories: ["hyrox"],
  },
  sled_push_pr: {
    key: "sled_push_pr",
    label: "Sled push PR",
    unit: "kg",
    direction: "higher_is_better",
    categories: ["hyrox"],
  },
  work_capacity_score: {
    key: "work_capacity_score",
    label: "Work capacity score",
    unit: "pts",
    direction: "higher_is_better",
    categories: ["hyrox"],
  },
  run_count: {
    key: "run_count",
    label: "Runs logged",
    unit: "runs",
    direction: "higher_is_better",
    categories: ["running"],
  },
  total_distance_km: {
    key: "total_distance_km",
    label: "Total distance",
    unit: "km",
    direction: "higher_is_better",
    categories: ["running"],
  },
  longest_run_km: {
    key: "longest_run_km",
    label: "Longest run",
    unit: "km",
    direction: "higher_is_better",
    categories: ["running"],
  },
  five_k_time_seconds: {
    key: "five_k_time_seconds",
    label: "5K time",
    unit: "s",
    direction: "lower_is_better",
    categories: ["running"],
  },
  ten_k_time_seconds: {
    key: "ten_k_time_seconds",
    label: "10K time",
    unit: "s",
    direction: "lower_is_better",
    categories: ["running"],
  },
  half_marathon_time_seconds: {
    key: "half_marathon_time_seconds",
    label: "Half marathon time",
    unit: "s",
    direction: "lower_is_better",
    categories: ["running"],
  },
  marathon_time_seconds: {
    key: "marathon_time_seconds",
    label: "Marathon time",
    unit: "s",
    direction: "lower_is_better",
    categories: ["running"],
  },
  weekly_mileage_km: {
    key: "weekly_mileage_km",
    label: "Weekly mileage",
    unit: "km",
    direction: "higher_is_better",
    categories: ["running"],
  },
  snatch_1rm_kg: {
    key: "snatch_1rm_kg",
    label: "Snatch 1RM",
    unit: "kg",
    direction: "higher_is_better",
    categories: ["weightlifting"],
  },
  clean_jerk_1rm_kg: {
    key: "clean_jerk_1rm_kg",
    label: "Clean & jerk 1RM",
    unit: "kg",
    direction: "higher_is_better",
    categories: ["weightlifting"],
  },
  squat_1rm_kg: {
    key: "squat_1rm_kg",
    label: "Squat 1RM",
    unit: "kg",
    direction: "higher_is_better",
    categories: ["weightlifting"],
  },
  total_kg: {
    key: "total_kg",
    label: "Olympic total",
    unit: "kg",
    direction: "higher_is_better",
    categories: ["weightlifting"],
  },
  session_count: {
    key: "session_count",
    label: "Lifting sessions",
    unit: "sessions",
    direction: "higher_is_better",
    categories: ["weightlifting"],
  },
  technique_session_count: {
    key: "technique_session_count",
    label: "Technique sessions",
    unit: "sessions",
    direction: "higher_is_better",
    categories: ["weightlifting"],
  },
};

export function isAchievementMetricKey(value: string): value is AchievementMetricKey {
  return value in ACHIEVEMENT_METRIC_META;
}

export type AchievementMetricValue = number | boolean | null;

export type AchievementMetricSnapshot = Partial<
  Record<AchievementMetricKey, AchievementMetricValue>
>;
