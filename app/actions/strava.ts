"use server";

import { revalidatePath } from "next/cache";

import { requireUser } from "@/lib/auth";
import { getPrismaClient } from "@/lib/prisma";
import { isStravaConfigured } from "@/lib/strava/config";
import { getStravaIntegrationStatus, syncStravaActivities } from "@/lib/strava/sync";
import type { StravaSyncResult } from "@/lib/strava/types";

type ActionResult = { error?: string; success?: string; sync?: StravaSyncResult };

export type StravaStatusDTO =
  | { connected: false; configured: boolean }
  | {
      connected: true;
      configured: boolean;
      stravaAthleteId: string;
      lastSyncedAt: string | null;
      connectedAt: string;
      activityCount: number;
      recentActivities: Array<{
        id: string;
        name: string;
        activityType: string;
        startDate: string;
        distanceMeters: number | null;
        movingTimeSeconds: number | null;
      }>;
    };

export async function getStravaStatus(userId: string): Promise<StravaStatusDTO> {
  const configured = isStravaConfigured();
  const prisma = getPrismaClient();
  if (!prisma) return { connected: false, configured };

  const status = await getStravaIntegrationStatus(prisma, userId);
  if (!status.connected) return { connected: false, configured };

  return { ...status, configured };
}

function revalidateAfterSync() {
  revalidatePath("/integrations");
  revalidatePath("/dashboard");
  revalidatePath("/pbs");
  revalidatePath("/analytics");
  revalidatePath("/coach");
}

export async function syncStravaAction(): Promise<ActionResult> {
  const user = await requireUser();
  const prisma = getPrismaClient();
  if (!prisma) return { error: "Database is not configured." };
  if (!isStravaConfigured()) return { error: "Strava is not configured on this server." };

  try {
    const result = await syncStravaActivities(prisma, user.id, { daysBack: 90 });
    revalidateAfterSync();

    const parts = [
      `Imported ${result.imported} activities`,
      result.skipped > 0 ? `${result.skipped} already synced` : null,
      result.pbsUpdated > 0 ? `${result.pbsUpdated} PB updates` : null,
    ].filter(Boolean);

    return {
      success: parts.join(" · "),
      sync: result,
    };
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : "Strava sync failed.",
    };
  }
}

export async function disconnectStravaAction(): Promise<ActionResult> {
  const user = await requireUser();
  const prisma = getPrismaClient();
  if (!prisma) return { error: "Database is not configured." };

  await prisma.stravaConnection.deleteMany({ where: { userId: user.id } });
  revalidatePath("/integrations");

  return { success: "Strava disconnected. Imported workouts are kept in your log." };
}
