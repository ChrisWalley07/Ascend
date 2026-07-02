import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { requireUser } from "@/lib/auth";
import { getStravaAuthorizeUrl, isStravaConfigured } from "@/lib/strava/config";

export async function GET() {
  if (!isStravaConfigured()) {
    return NextResponse.redirect(new URL("/integrations?error=strava_not_configured", process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"));
  }

  const user = await requireUser();
  const state = crypto.randomUUID();

  const cookieStore = await cookies();
  cookieStore.set("strava_oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 600,
    path: "/",
  });
  cookieStore.set("strava_oauth_user", user.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 600,
    path: "/",
  });

  const authorizeUrl = getStravaAuthorizeUrl(state);
  return NextResponse.redirect(authorizeUrl);
}
