import { z } from "zod";

export const logBenchmarkAttemptSchema = z.object({
  benchmarkId: z.string().min(1, "Benchmark is required"),
  score: z.string().min(1, "Display score is required"),
  scoreValue: z.coerce.number().positive("Numeric score must be greater than zero"),
  date: z.string().min(1, "Date is required"),
});

export const createCustomBenchmarkSchema = z.object({
  name: z.string().min(2, "Benchmark name is required"),
  description: z.string().optional(),
  scoreUnit: z.string().min(1, "Score unit is required"),
  scoringMode: z.enum(["LOWER_IS_BETTER", "HIGHER_IS_BETTER"]),
});
