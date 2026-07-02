"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import type { SportDepartment } from "@prisma/client";

import { requireUser } from "@/lib/auth";
import { getPrismaClient } from "@/lib/prisma";
import { isMissingSchemaError } from "@/lib/prisma/schema-compat";
import { loadSportProfile } from "@/lib/sport/load-profile";
import { getSportConfig, isValidSport } from "@/lib/sports/registry";
import {
  buildSportContext,
  isSportView,
  SPORT_VIEW_COOKIE,
  toSportDepartment,
  type SportContext,
  type SportView,
} from "@/lib/sports/types";

export async function getSportContextForUser(userId: string): Promise<SportContext | null> {
  const prisma = getPrismaClient();
  if (!prisma) return null;

  try {
    const profile = await loadSportProfile(prisma, userId);

    if (!profile?.sportDepartment) return null;

    const cookieStore = await cookies();
    const cookieView = cookieStore.get(SPORT_VIEW_COOKIE)?.value;
    let activeSportView = profile.activeSportView;

    if (
      profile.sportDepartment === "HYBRID" &&
      cookieView &&
      isSportView(cookieView)
    ) {
      activeSportView = toSportDepartment(cookieView);
    }

    return buildSportContext(profile.sportDepartment, activeSportView);
  } catch (error) {
    console.error("[sport] Failed to load sport context:", error);
    return null;
  }
}

export async function getUserSportDepartment(userId: string): Promise<SportDepartment | null> {
  const ctx = await getSportContextForUser(userId);
  return ctx?.athleteType ?? null;
}

export async function selectSportDepartmentAction(
  department: string,
): Promise<{ error?: string }> {
  if (!isValidSport(department)) {
    return { error: "Invalid sport mode." };
  }

  const user = await requireUser();
  const prisma = getPrismaClient();
  if (!prisma) return { error: "Database not configured." };

  const defaultView: SportDepartment | null =
    department === "HYBRID" ? "CROSSFIT" : department === "CROSSFIT" ? "CROSSFIT" : "HYROX";

  const baseData = {
    userId: user.id,
    name: user.email?.split("@")[0] ?? "Athlete",
    sportDepartment: department,
  };

  try {
    await prisma.athleteProfile.upsert({
      where: { userId: user.id },
      create: { ...baseData, activeSportView: defaultView },
      update: { sportDepartment: department, activeSportView: defaultView },
    });
  } catch (error) {
    if (!isMissingSchemaError(error)) throw error;
    await prisma.athleteProfile.upsert({
      where: { userId: user.id },
      create: baseData,
      update: { sportDepartment: department },
    });
  }

  revalidateAll();
  return {};
}

export async function selectSportDepartmentAndRedirect(department: string) {
  const result = await selectSportDepartmentAction(department);
  if (result.error) return result;
  redirect("/onboarding/start");
}

export async function setActiveSportViewAction(view: SportView): Promise<{ error?: string }> {
  const user = await requireUser();
  const prisma = getPrismaClient();
  if (!prisma) return { error: "Database not configured." };

  const profile = await prisma.athleteProfile.findUnique({
    where: { userId: user.id },
    select: { sportDepartment: true },
  });

  if (!profile?.sportDepartment) return { error: "Sport mode not set." };
  if (profile.sportDepartment !== "HYBRID") {
    return { error: "Dashboard switching is only available in Hybrid mode." };
  }

  const activeSportView = toSportDepartment(view);

  try {
    await prisma.athleteProfile.update({
      where: { userId: user.id },
      data: { activeSportView },
    });
  } catch (error) {
    if (!isMissingSchemaError(error)) throw error;
    // Column not migrated yet — cookie-only view switching still works.
  }

  const cookieStore = await cookies();
  cookieStore.set(SPORT_VIEW_COOKIE, view, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365,
    path: "/",
  });

  revalidateAll();
  return {};
}

export async function getDepartmentSummary(userId: string) {
  const ctx = await getSportContextForUser(userId);
  if (!ctx) {
    return {
      department: null,
      config: getSportConfig("CROSSFIT"),
      viewConfig: getSportConfig("CROSSFIT"),
      activeView: "crossfit" as SportView,
      canSwitchViews: false,
    };
  }
  const viewConfig = ctx.activeView === "hyrox" ? getSportConfig("HYROX") : getSportConfig("CROSSFIT");
  return {
    department: ctx.athleteType,
    activeView: ctx.activeView,
    config: getSportConfig(ctx.athleteType),
    viewConfig,
    canSwitchViews: ctx.canSwitchViews,
  };
}

function revalidateAll() {
  revalidatePath("/", "layout");
  revalidatePath("/dashboard");
  revalidatePath("/profile");
  revalidatePath("/analytics");
  revalidatePath("/coach");
}
