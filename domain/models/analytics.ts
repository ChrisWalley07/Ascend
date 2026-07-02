export type ChartPoint = {
  label: string;
  value: number;
};

export type AthleteScoreBreakdown = {
  strength: number;
  olympicLifting: number;
  engine: number;
  gymnastics: number;
  power: number;
  consistency: number;
  recovery: number;
  mobility: number;
};

export type RadarPoint = {
  metric: string;
  current: number;
  previous: number;
};

export type CrossfitAnalyticsData = {
  score: import("./athlete").AthleteScoreSnapshot;
  frequencyData: ChartPoint[];
  volumeData: ChartPoint[];
  rpeData: ChartPoint[];
  prData: ChartPoint[];
  scoreSeries: ChartPoint[];
  radarData: RadarPoint[];
  totalPrs: number;
};

export type HyroxAnalyticsData = {
  score: import("./athlete").HyroxScoreSnapshot;
  weeklyVolume: ChartPoint[];
  monthlyTraining: ChartPoint[];
  rpeData: ChartPoint[];
  racePredictions: Array<ChartPoint & { display?: string }>;
  paceProgression: ChartPoint[];
  stationProgress: Array<{ station: string; bestDisplay: string; attempts: number }>;
  scoreSeries: ChartPoint[];
  radarData: RadarPoint[];
  averageRunPace: string;
  totalRaces: number;
  totalSessions: number;
};

export type DashboardSummary = {
  overallAthleteScore: number;
  trainingStreak: number;
  lastWorkout: string;
  recentPrs: number;
  weakestCategory: string;
  strongestCategory: string;
  weeklyTrainingVolume: number;
  recoveryScore: number;
  upcomingGoals: string[];
};
