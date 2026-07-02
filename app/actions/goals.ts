"use server";

import { revalidatePath } from "next/cache";

import { requireUser } from "@/lib/auth";
import { getPrismaClient } from "@/lib/prisma";
import { createGoalSchema, updateGoalProgressSchema } from "@/lib/validations/goals";

type ActionState = { error?: string; success?: string };

export async function createGoalAction(_: ActionState, payload: FormData) {
  const user = await requireUser();
  const prisma = getPrismaClient();

  if (!prisma) {
    return { error: "Database is not configured yet. Add DATABASE_URL and Prisma adapter settings." };
  }

  const validated = createGoalSchema.safeParse({
    title: payload.get("title"),
    targetValue: payload.get("targetValue"),
    currentValue: payload.get("currentValue"),
    unit: payload.get("unit"),
    targetDate: payload.get("targetDate"),
  });

  if (!validated.success) {
    return { error: validated.error.issues[0]?.message ?? "Invalid goal data" };
  }

  const targetDate = validated.data.targetDate ? new Date(validated.data.targetDate) : undefined;
  const status = validated.data.currentValue >= validated.data.targetValue ? "COMPLETED" : "ACTIVE";

  await prisma.goal.create({
    data: {
      userId: user.id,
      title: validated.data.title,
      targetValue: validated.data.targetValue,
      currentValue: validated.data.currentValue,
      unit: validated.data.unit,
      targetDate,
      status,
      completedAt: status === "COMPLETED" ? new Date() : null,
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/goals");
  return { success: "Goal created successfully." };
}

export async function updateGoalProgressAction(payload: FormData) {
  const user = await requireUser();
  const prisma = getPrismaClient();

  if (!prisma) {
    return { error: "Database is not configured yet. Add DATABASE_URL and Prisma adapter settings." };
  }

  const validated = updateGoalProgressSchema.safeParse({
    goalId: payload.get("goalId"),
    currentValue: payload.get("currentValue"),
  });

  if (!validated.success) {
    return { error: validated.error.issues[0]?.message ?? "Invalid progress update" };
  }

  const goal = await prisma.goal.findFirst({
    where: {
      id: validated.data.goalId,
      userId: user.id,
    },
  });

  if (!goal) {
    return { error: "Goal not found." };
  }

  const status = validated.data.currentValue >= goal.targetValue ? "COMPLETED" : "ACTIVE";

  await prisma.goal.update({
    where: { id: goal.id },
    data: {
      currentValue: validated.data.currentValue,
      status,
      completedAt: status === "COMPLETED" ? new Date() : null,
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/goals");
  return { success: "Goal progress updated." };
}
