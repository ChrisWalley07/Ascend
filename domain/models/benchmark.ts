import type { BenchmarkType, ScoreDirection } from "@prisma/client";

export type Benchmark = {
  id: string;
  name: string;
  type: BenchmarkType;
  sport: string | null;
  description: string | null;
  scoringMode: ScoreDirection;
  scoreUnit: string;
};

export type BenchmarkAttempt = {
  id: string;
  benchmarkId: string;
  benchmarkName: string;
  score: string;
  scoreValue: number | null;
  date: Date;
  workoutId: string | null;
};
