import { z } from "zod";

export const createGoalSchema = z.object({
  title: z.string().min(3, "Goal title is required"),
  targetValue: z.coerce.number().positive("Target must be greater than zero"),
  currentValue: z.coerce.number().min(0, "Current progress cannot be negative").default(0),
  unit: z.string().min(1, "Unit is required"),
  targetDate: z.string().optional(),
});

export const updateGoalProgressSchema = z.object({
  goalId: z.string().min(1, "Goal ID is required"),
  currentValue: z.coerce.number().min(0, "Current value must be zero or higher"),
});
