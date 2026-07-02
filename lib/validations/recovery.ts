import { z } from "zod";

export const recoveryCheckInSchema = z.object({
  readiness: z.coerce.number().int().min(1).max(10),
  soreness: z.coerce.number().int().min(1).max(10).optional(),
  energy: z.coerce.number().int().min(1).max(10).optional(),
  sleepHours: z.coerce.number().min(0).max(14).optional(),
  hrv: z.coerce.number().int().min(1).max(250).optional(),
});

export type RecoveryCheckInInput = z.infer<typeof recoveryCheckInSchema>;
