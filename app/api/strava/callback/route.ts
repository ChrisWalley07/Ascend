import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { exchangeStravaCode } from "@/lib/strava/client";
import { isStravaConfigured } from "@/lib/strava/config";
import { syncStravaActivities } from "@/lib/strava/sync";
import { getPrismaClient } from "@/lib/prisma";

function redirectWithStatus(status: "connected" | "error", message?: string) {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const url = new URL("/integrations", base);
  url.searchParams.set(status === "connected" ? "connected" : "error", message ?? status);
  return NextResponse.redirect(url);
}

export async function GET(request: Request) {
  if (!isStravaConfigured()) {
    return redirectWithStatus("error", "strava_not_configured");
  }

  const prisma = getPrismaClient();
  if (!prisma) {
    return redirectWithStatus("error", "database_unavailable");
  }

  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  if (error) {
    return redirectWithStatus("error", error);
  }

  if (!code || !state) {
    return redirectWithStatus("error", "missing_code");
  }

  const cookieStore = await cookies();
  const savedState = cookieStore.get("strava_oauth_state")?.value;
  const userId = cookieStore.get("strava_oauth_user")?.value;

  cookieStore.delete("strava_oauth_state");
  cookieStore.delete("strava_oauth_user");

  if (!savedState || savedState !== state || !userId) {
    return redirectWithStatus("error", "invalid_state");
  }

  try {
    const token = await exchangeStravaCode(code);

    await prisma.stravaConnection.upsert({
      where: { userId },
      create: {
        userId,
        stravaAthleteId: String(token.athlete.id),
        accessToken: token.access_token,
        refreshToken: token.refresh_token,
        expiresAt: new Date(token.expires_at * 1000),
        scope: "read,activity:read_all,profile:read_all",
      },
      update: {
        stravaAthleteId: String(token.athlete.id),
        accessToken: token.access_token,
        refreshToken: token.refresh_token,
        expiresAt: new Date(token.expires_at * 1000),
      },
    });

    try {
      await syncStravaActivities(prisma, userId, { daysBack: 90 });
    } catch {
      // Initial sync failure shouldn't block connection
    }

    return redirectWithStatus("connected");
  } catch (err) {
    const message = err instanceof Error ? err.message : "token_exchange_failed";
    return redirectWithStatus("error", message.slice(0, 120));
  }
}
