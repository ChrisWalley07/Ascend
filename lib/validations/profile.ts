import { z } from "zod";

export const athleteProfileSchema = z.object({
  name: z.string().min(2, "Name is required"),
  age: z.coerce.number().int().min(13, "Minimum age is 13").max(100),
  gender: z.enum(["MALE", "FEMALE", "NON_BINARY", "PREFER_NOT_TO_SAY"]),
  heightCm: z.coerce.number().min(100, "Enter height in cm").max(250),
  weightKg: z.coerce.number().min(30, "Enter weight in kg").max(300),
  trainingAgeMonths: z.coerce.number().int().min(0).max(600),
  experienceLevel: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED", "ELITE", "COMPETITOR"]),
  primaryGoal: z.enum([
    "GENERAL_FITNESS",
    "STRENGTH",
    "ENGINE",
    "COMPETITION",
    "HYBRID",
    "WEIGHT_MANAGEMENT",
    "SKILL_MASTERY",
  ]),
  trainingDaysPerWeek: z.coerce.number().int().min(1).max(7),
  trainingEnvironment: z.enum(["CROSSFIT_AFFILIATE", "HOME_GYM", "COMMERCIAL_GYM", "HYBRID"]),
  crossfitAffiliate: z.string().optional(),
  injuriesNotes: z.string().optional(),
  focusAreas: z.array(z.string()).min(1, "Select at least one focus area"),
  strongAreas: z.array(z.string()).optional().default([]),
  sleepTargetHours: z.coerce.number().min(4).max(12).optional(),
  competitionTarget: z.string().optional(),
  coachNotes: z.string().optional(),
});

export type AthleteProfileFormValues = z.infer<typeof athleteProfileSchema>;
