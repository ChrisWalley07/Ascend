"use server";

import { revalidatePath } from "next/cache";

import type { SportDepartment } from "@prisma/client";

import {
  analyzeAthleteProfile,
  getProfileCompleteness,
  toProfileInput,
  type ProfileAnalysis,
} from "@/lib/athlete-analysis";
import { getAthleteScoreSnapshot } from "@/lib/athlete-score";
import { requireUser } from "@/lib/auth";
import { getPrismaClient } from "@/lib/prisma";
import { athleteProfileSchema } from "@/lib/validations/profile";

type ActionResult = { error?: string; success?: string };

export type AthleteProfileDTO = {
  name: string;
  age: number | null;
  gender: string | null;
  heightCm: number | null;
  weightKg: number | null;
  trainingAgeMonths: number | null;
  experienceLevel: string | null;
  primaryGoal: string | null;
  trainingDaysPerWeek: number | null;
  trainingEnvironment: string | null;
  crossfitAffiliate: string | null;
  injuriesNotes: string | null;
  focusAreas: string[];
  strongAreas: string[];
  sleepTargetHours: number | null;
  competitionTarget: string | null;
  coachNotes: string | null;
  sportDepartment: SportDepartment | null;
  profileCompleted: boolean;
};

export async function getAthleteProfileData(userId: string): Promise<{
  profile: AthleteProfileDTO | null;
  analysis: ProfileAnalysis | null;
}> {
  const prisma = getPrismaClient();
  if (!prisma) return { profile: null, analysis: null };

  try {
    const row = await prisma.athleteProfile.findUnique({ where: { userId } });
    if (!row) return { profile: null, analysis: null };

    const profile: AthleteProfileDTO = {
      name: row.name,
      age: row.age,
      gender: row.gender,
      heightCm: row.heightCm,
      weightKg: row.weightKg,
      trainingAgeMonths: row.trainingAgeMonths,
      experienceLevel: row.experienceLevel,
      primaryGoal: row.primaryGoal,
      trainingDaysPerWeek: row.trainingDaysPerWeek,
      trainingEnvironment: row.trainingEnvironment,
      crossfitAffiliate: row.crossfitAffiliate,
      injuriesNotes: row.injuriesNotes,
      focusAreas: row.focusAreas ?? [],
      strongAreas: row.strongAreas ?? [],
      sleepTargetHours: row.sleepTargetHours,
      competitionTarget: row.competitionTarget,
      coachNotes: row.coachNotes,
      sportDepartment: row.sportDepartment,
      profileCompleted: row.profileCompleted,
    };

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [workoutCount, pbCount, scoreSnapshot] = await Promise.all([
      prisma.workout.count({ where: { userId, date: { gte: thirtyDaysAgo } } }),
      prisma.personalBest.count({ where: { userId } }),
      getAthleteScoreSnapshot(userId),
    ]);

    const analysis = analyzeAthleteProfile(toProfileInput(row), {
      workoutsPerWeek: workoutCount / 4.3,
      recentWorkoutCount: workoutCount,
      pbCount,
      categoryScores: {
        strengthScore: scoreSnapshot.strengthScore,
        olympicLiftingScore: scoreSnapshot.olympicLiftingScore,
        engineScore: scoreSnapshot.engineScore,
        gymnasticsScore: scoreSnapshot.gymnasticsScore,
        powerScore: scoreSnapshot.powerScore,
        consistencyScore: scoreSnapshot.consistencyScore,
        recoveryScore: scoreSnapshot.recoveryScore,
        mobilityScore: scoreSnapshot.mobilityScore,
      },
    });

    return { profile, analysis };
  } catch (error) {
    console.error("[profile] athlete profile data failed", error);
    return { profile: null, analysis: null };
  }
}

export async function saveAthleteProfileAction(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  try {
    const user = await requireUser();
    const prisma = getPrismaClient();
    if (!prisma) return { error: "Database not configured." };

    const focusAreas = formData.getAll("focusAreas").map(String);
    const strongAreas = formData.getAll("strongAreas").map(String);
    const sleepRaw = String(formData.get("sleepTargetHours") ?? "").trim();

    const parsed = athleteProfileSchema.safeParse({
      name: formData.get("name"),
      age: formData.get("age"),
      gender: formData.get("gender"),
      heightCm: formData.get("heightCm"),
      weightKg: formData.get("weightKg"),
      trainingAgeMonths: formData.get("trainingAgeMonths"),
      experienceLevel: formData.get("experienceLevel"),
      primaryGoal: formData.get("primaryGoal"),
      trainingDaysPerWeek: formData.get("trainingDaysPerWeek"),
      trainingEnvironment: formData.get("trainingEnvironment"),
      crossfitAffiliate: formData.get("crossfitAffiliate"),
      injuriesNotes: formData.get("injuriesNotes"),
      focusAreas,
      strongAreas,
      sleepTargetHours: sleepRaw ? Number(sleepRaw) : undefined,
      competitionTarget: formData.get("competitionTarget"),
      coachNotes: formData.get("coachNotes"),
    });

    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message ?? "Invalid profile data" };
    }

    const data = parsed.data;

    const existing = await prisma.athleteProfile.findUnique({
      where: { userId: user.id },
      select: { sportDepartment: true },
    });

    const completeness = getProfileCompleteness({
      ...data,
      injuriesNotes: data.injuriesNotes ?? null,
      competitionTarget: data.competitionTarget ?? null,
      coachNotes: data.coachNotes ?? null,
      sleepTargetHours: data.sleepTargetHours ?? null,
      sportDepartment: existing?.sportDepartment ?? null,
      profileCompleted: false,
    });

    await prisma.athleteProfile.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        name: data.name,
        age: data.age,
        gender: data.gender,
        heightCm: data.heightCm,
        weightKg: data.weightKg,
        trainingAgeMonths: data.trainingAgeMonths,
        experienceLevel: data.experienceLevel,
        primaryGoal: data.primaryGoal,
        trainingDaysPerWeek: data.trainingDaysPerWeek,
        trainingEnvironment: data.trainingEnvironment,
        crossfitAffiliate: data.crossfitAffiliate || null,
        injuriesNotes: data.injuriesNotes || null,
        focusAreas: data.focusAreas,
        strongAreas: data.strongAreas ?? [],
        sleepTargetHours: data.sleepTargetHours ?? null,
        competitionTarget: data.competitionTarget || null,
        coachNotes: data.coachNotes || null,
        profileCompleted: completeness.completenessPercent === 100,
      },
      update: {
        name: data.name,
        age: data.age,
        gender: data.gender,
        heightCm: data.heightCm,
        weightKg: data.weightKg,
        trainingAgeMonths: data.trainingAgeMonths,
        experienceLevel: data.experienceLevel,
        primaryGoal: data.primaryGoal,
        trainingDaysPerWeek: data.trainingDaysPerWeek,
        trainingEnvironment: data.trainingEnvironment,
        crossfitAffiliate: data.crossfitAffiliate || null,
        injuriesNotes: data.injuriesNotes || null,
        focusAreas: data.focusAreas,
        strongAreas: data.strongAreas ?? [],
        sleepTargetHours: data.sleepTargetHours ?? null,
        competitionTarget: data.competitionTarget || null,
        coachNotes: data.coachNotes || null,
        profileCompleted: completeness.completenessPercent === 100,
      },
    });

    revalidatePath("/profile");
    revalidatePath("/profile/edit");
    revalidatePath("/dashboard");
    revalidatePath("/coach");
    revalidatePath("/analytics");

    return {
      success:
        completeness.completenessPercent === 100
          ? "Profile saved — your scores and coaching are now personalised."
          : `Profile saved (${completeness.completenessPercent}% complete). Fill remaining fields for full analysis.`,
    };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Failed to save profile" };
  }
}

export async function isProfileComplete(userId: string): Promise<boolean> {
  const prisma = getPrismaClient();
  if (!prisma) return false;
  const row = await prisma.athleteProfile.findUnique({
    where: { userId },
    select: { profileCompleted: true },
  });
  return row?.profileCompleted ?? false;
}
