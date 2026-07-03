"use server";

import { revalidatePath } from "next/cache";

import { requireUser } from "@/lib/auth";
import { getPrismaClient } from "@/lib/prisma";
import { recoveryCheckInSchema } from "@/lib/validations/recovery";

export type TodayCheckIn = {
  readiness: number;
  soreness: number | null;
  energy: number | null;
  sleepHours: number | null;
  hrv: number | null;
  loggedAt: string;
};

function startOfToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

export async function getTodayRecoveryCheckIn(): Promise<TodayCheckIn | null> {
  const user = await requireUser();
  const prisma = getPrismaClient();
  if (!prisma) return null;

  const log = await prisma.recoveryLog
    .findFirst({
      where: { userId: user.id, date: { gte: startOfToday() } },
      orderBy: { date: "desc" },
    })
    .catch((error) => {
      console.error("[recovery] today check-in load failed", error);
      return null;
    });

  if (!log) return null;

  return {
    readiness: Math.round(log.readinessScore / 10),
    soreness: log.soreness,
    energy: log.energy,
    sleepHours: log.sleepHours,
    hrv: log.hrv,
    loggedAt: log.date.toISOString(),
  };
}

export async function logRecoveryCheckInAction(
  _: { error?: string; success?: string } | undefined,
  formData: FormData,
): Promise<{ error?: string; success?: string }> {
  const user = await requireUser();
  const prisma = getPrismaClient();
  if (!prisma) return { error: "Database not configured" };

  const raw = {
    readiness: formData.get("readiness"),
    soreness: formData.get("soreness") || undefined,
    energy: formData.get("energy") || undefined,
    sleepHours: formData.get("sleepHours") || undefined,
    hrv: formData.get("hrv") || undefined,
  };

  const validated = recoveryCheckInSchema.safeParse(raw);
  if (!validated.success) {
    return { error: validated.error.issues[0]?.message ?? "Invalid check-in" };
  }

  const { readiness, soreness, energy, sleepHours, hrv } = validated.data;
  const readinessScore = readiness * 10;

  try {
    const existing = await prisma.recoveryLog.findFirst({
      where: { userId: user.id, date: { gte: startOfToday() } },
      orderBy: { date: "desc" },
    });

    if (existing) {
      await prisma.recoveryLog.update({
        where: { id: existing.id },
        data: {
          readinessScore,
          soreness: soreness ?? null,
          energy: energy ?? null,
          sleepHours: sleepHours ?? null,
          hrv: hrv ?? null,
          date: new Date(),
        },
      });
    } else {
      await prisma.recoveryLog.create({
        data: {
          userId: user.id,
          readinessScore,
          soreness: soreness ?? null,
          energy: energy ?? null,
          sleepHours: sleepHours ?? null,
          hrv: hrv ?? null,
        },
      });
    }

    revalidatePath("/dashboard");
    revalidatePath("/profile");
    revalidatePath("/coach");
    revalidatePath("/analytics");

    return { success: "Check-in saved" };
  } catch {
    return { error: "Could not save check-in. Try again." };
  }
}
