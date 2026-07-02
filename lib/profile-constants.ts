export const FOCUS_AREAS = [
  { id: "strength", label: "Strength" },
  { id: "olympic", label: "Olympic Lifting" },
  { id: "gymnastics", label: "Gymnastics" },
  { id: "engine", label: "Engine / Conditioning" },
  { id: "power", label: "Power & Speed" },
  { id: "mobility", label: "Mobility" },
  { id: "recovery", label: "Recovery" },
  { id: "bodyweight", label: "Bodyweight Skills" },
] as const;

export const EXPERIENCE_LEVELS = [
  { value: "BEGINNER", label: "Beginner", description: "< 1 year consistent training" },
  { value: "INTERMEDIATE", label: "Intermediate", description: "1–3 years, solid fundamentals" },
  { value: "ADVANCED", label: "Advanced", description: "3–5 years, high work capacity" },
  { value: "ELITE", label: "Elite", description: "5+ years, near-competition level" },
  { value: "COMPETITOR", label: "Competitor", description: "Active CrossFit / sport competitor" },
] as const;

export const TRAINING_GOALS = [
  { value: "GENERAL_FITNESS", label: "General Fitness" },
  { value: "STRENGTH", label: "Build Strength" },
  { value: "ENGINE", label: "Improve Engine" },
  { value: "COMPETITION", label: "Compete" },
  { value: "HYBRID", label: "Balanced Hybrid" },
  { value: "WEIGHT_MANAGEMENT", label: "Weight Management" },
  { value: "SKILL_MASTERY", label: "Skill Mastery" },
] as const;

export const TRAINING_ENVIRONMENTS = [
  { value: "CROSSFIT_AFFILIATE", label: "CrossFit Affiliate" },
  { value: "HOME_GYM", label: "Home Gym" },
  { value: "COMMERCIAL_GYM", label: "Commercial Gym" },
  { value: "HYBRID", label: "Hybrid (multiple locations)" },
] as const;

export const GENDERS = [
  { value: "MALE", label: "Male" },
  { value: "FEMALE", label: "Female" },
  { value: "NON_BINARY", label: "Non-binary" },
  { value: "PREFER_NOT_TO_SAY", label: "Prefer not to say" },
] as const;

export const REQUIRED_PROFILE_FIELDS = [
  "name",
  "age",
  "gender",
  "heightCm",
  "weightKg",
  "trainingAgeMonths",
  "experienceLevel",
  "primaryGoal",
  "trainingDaysPerWeek",
  "trainingEnvironment",
  "focusAreas",
] as const;
