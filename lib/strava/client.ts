import type { PrismaClient } from "@prisma/client";

import { STRAVA_API_BASE, STRAVA_TOKEN_URL } from "@/lib/strava/config";
import type { StravaActivitySummary, StravaTokenResponse } from "@/lib/strava/types";

async function stravaFetch<T>(accessToken: string, path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${STRAVA_API_BASE}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Strava API ${path} failed (${res.status}): ${body.slice(0, 200)}`);
  }

  return res.json() as Promise<T>;
}

export async function exchangeStravaCode(code: string): Promise<StravaTokenResponse> {
  const clientId = process.env.STRAVA_CLIENT_ID;
  const clientSecret = process.env.STRAVA_CLIENT_SECRET;
  if (!clientId || !clientSecret) throw new Error("Strava is not configured");

  const res = await fetch(STRAVA_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      grant_type: "authorization_code",
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Strava token exchange failed: ${body.slice(0, 200)}`);
  }

  return res.json() as Promise<StravaTokenResponse>;
}

export async function refreshStravaToken(refreshToken: string): Promise<StravaTokenResponse> {
  const clientId = process.env.STRAVA_CLIENT_ID;
  const clientSecret = process.env.STRAVA_CLIENT_SECRET;
  if (!clientId || !clientSecret) throw new Error("Strava is not configured");

  const res = await fetch(STRAVA_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Strava token refresh failed: ${body.slice(0, 200)}`);
  }

  return res.json() as Promise<StravaTokenResponse>;
}

export async function getValidStravaAccessToken(
  prisma: PrismaClient,
  userId: string,
): Promise<string> {
  const connection = await prisma.stravaConnection.findUnique({ where: { userId } });
  if (!connection) throw new Error("Strava is not connected");

  const expiresSoon = connection.expiresAt.getTime() - Date.now() < 5 * 60 * 1000;
  if (!expiresSoon) return connection.accessToken;

  const refreshed = await refreshStravaToken(connection.refreshToken);
  await prisma.stravaConnection.update({
    where: { userId },
    data: {
      accessToken: refreshed.access_token,
      refreshToken: refreshed.refresh_token,
      expiresAt: new Date(refreshed.expires_at * 1000),
    },
  });

  return refreshed.access_token;
}

export async function fetchStravaActivities(
  accessToken: string,
  opts?: { after?: number; page?: number; perPage?: number },
): Promise<StravaActivitySummary[]> {
  const params = new URLSearchParams();
  if (opts?.after) params.set("after", String(opts.after));
  params.set("page", String(opts?.page ?? 1));
  params.set("per_page", String(opts?.perPage ?? 50));

  return stravaFetch<StravaActivitySummary[]>(
    accessToken,
    `/athlete/activities?${params.toString()}`,
  );
}

export async function fetchAllStravaActivitiesSince(
  accessToken: string,
  afterUnix: number,
): Promise<StravaActivitySummary[]> {
  const all: StravaActivitySummary[] = [];
  let page = 1;

  while (page <= 10) {
    const batch = await fetchStravaActivities(accessToken, {
      after: afterUnix,
      page,
      perPage: 50,
    });
    if (batch.length === 0) break;
    all.push(...batch);
    if (batch.length < 50) break;
    page += 1;
  }

  return all;
}
