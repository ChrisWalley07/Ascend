import type { AchievementMetricKey } from "../types/metrics";

/** PB catalog slugs that feed achievement metric keys. */
export const METRIC_PB_SLUGS: Partial<Record<AchievementMetricKey, readonly string[]>> = {
  fran_time_seconds: ["wod-fran"],
  murph_time_seconds: ["wod-murph"],
  grace_time_seconds: ["wod-grace"],
  isabel_time_seconds: ["wod-isabel"],
  helen_time_seconds: ["wod-helen"],
  cindy_rounds: ["wod-cindy"],
  pullup_max_reps: ["max-pull-ups", "max-strict-pull-ups"],
  strict_pullup_max_reps: ["max-strict-pull-ups"],
  ctb_max_reps: ["max-ctb", "max-strict-ctb"],
  bar_muscle_up_max_reps: ["max-bar-muscle-ups"],
  ring_muscle_up_max_reps: ["max-ring-muscle-ups"],
  toes_to_bar_max_reps: ["max-t2b-unbroken"],
  double_under_max_reps: ["max-du-unbroken"],
  muscle_up_max_reps: ["max-ring-muscle-ups", "max-bar-muscle-ups"],
  handstand_pushup_max_reps: ["max-hspu", "max-strict-hspu"],
  back_squat_1rm_kg: ["back-squat-1rm"],
  clean_1rm_kg: ["clean-1rm"],
  power_clean_1rm_kg: ["power-clean"],
  deadlift_1rm_kg: ["deadlift-1rm"],
  shoulder_press_1rm_kg: ["strict-press-1rm"],
  thruster_1rm_kg: ["max-thrusters-weight"],
  snatch_1rm_kg: ["snatch-1rm"],
  clean_jerk_1rm_kg: ["clean-jerk-1rm"],
  squat_1rm_kg: ["back-squat-1rm", "front-squat-1rm"],
  five_k_time_seconds: ["run-5km"],
  ten_k_time_seconds: ["run-10km"],
  half_marathon_time_seconds: ["run-half-marathon"],
  marathon_time_seconds: ["run-marathon"],
  sled_push_pr: ["hyrox-sled-push-weight"],
  running_split_seconds: ["hyrox-1km-run"],
};

export const HYROX_STATION_PB_PREFIX = "hyrox-";
