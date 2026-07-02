"use server";

import { revalidatePath } from "next/cache";

import { requireUser } from "@/lib/auth";
import {
  appendAchievementMessage,
  syncAchievementsAfterActivity,
} from "@/lib/achievements/sync-after-activity";
import { getPrismaClient } from "@/lib/prisma";
import { createCustomBenchmarkSchema, logBenchmarkAttemptSchema } from "@/lib/validations/benchmarks";

type ActionState = { error?: string; success?: string };

export async function createCustomBenchmarkAction(_: ActionState, payload: FormData) {
  await requireUser();
  const prisma = getPrismaClient();

  if (!prisma) {
    return { error: "Database is not configured yet. Add DATABASE_URL and Prisma adapter settings." };
  }

  const validated = createCustomBenchmarkSchema.safeParse({
    name: payload.get("name"),
    description: payload.get("description"),
    scoreUnit: payload.get("scoreUnit"),
    scoringMode: payload.get("scoringMode"),
  });

  if (!validated.success) {
    return { error: validated.error.issues[0]?.message ?? "Invalid benchmark data" };
  }

  const existing = await prisma.benchmark.findUnique({
    where: { name: validated.data.name },
  });

  if (existing) {
    return { error: "A benchmark with this name already exists." };
  }

  await prisma.benchmark.create({
    data: {
      name: validated.data.name,
      type: "CUSTOM",
      description: validated.data.description,
      scoreUnit: validated.data.scoreUnit,
      scoringMode: validated.data.scoringMode,
    },
  });

  revalidatePath("/benchmarks");
  return { success: "Custom benchmark created." };
}

export async function logBenchmarkAttemptAction(_: ActionState, payload: FormData) {
  const user = await requireUser();
  const prisma = getPrismaClient();

  if (!prisma) {
    return { error: "Database is not configured yet. Add DATABASE_URL and Prisma adapter settings." };
  }

  const validated = logBenchmarkAttemptSchema.safeParse({
    benchmarkId: payload.get("benchmarkId"),
    score: payload.get("score"),
    scoreValue: payload.get("scoreValue"),
    date: payload.get("date"),
  });

  if (!validated.success) {
    return { error: validated.error.issues[0]?.message ?? "Invalid benchmark attempt" };
  }

  const benchmark = await prisma.benchmark.findUnique({
    where: { id: validated.data.benchmarkId },
    select: { id: true, name: true },
  });

  if (!benchmark) {
    return { error: "Benchmark not found." };
  }

  await prisma.benchmarkAttempt.create({
    data: {
      benchmarkId: benchmark.id,
      userId: user.id,
      score: validated.data.score,
      scoreValue: validated.data.scoreValue,
      date: new Date(validated.data.date),
    },
  });

  await prisma.achievement.create({
    data: {
      userId: user.id,
      type: "BENCHMARK",
      title: `Benchmark logged: ${benchmark.name}`,
      description: `New attempt score: ${validated.data.score}`,
    },
  });

  revalidatePath("/benchmarks");
  revalidatePath("/dashboard");
  const achievementMessage = await syncAchievementsAfterActivity(user.id);
  return {
    success: appendAchievementMessage("Benchmark attempt saved.", achievementMessage),
  };
}
