const STRAVA_AUTH_URL = "https://www.strava.com/oauth/authorize";
const STRAVA_TOKEN_URL = "https://www.strava.com/oauth/token";
const STRAVA_API_BASE = "https://www.strava.com/api/v3";

export const STRAVA_SCOPES = "read,activity:read_all,profile:read_all";

export function isStravaConfigured() {
  return Boolean(process.env.STRAVA_CLIENT_ID && process.env.STRAVA_CLIENT_SECRET);
}

export function getStravaRedirectUri() {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  return `${base.replace(/\/$/, "")}/api/strava/callback`;
}

export function getStravaAuthorizeUrl(state: string) {
  const clientId = process.env.STRAVA_CLIENT_ID;
  if (!clientId) throw new Error("STRAVA_CLIENT_ID is not configured");

  const params = new URLSearchParams({
    client_id: clientId,
    response_type: "code",
    redirect_uri: getStravaRedirectUri(),
    approval_prompt: "auto",
    scope: STRAVA_SCOPES,
    state,
  });

  return `${STRAVA_AUTH_URL}?${params.toString()}`;
}

export { STRAVA_TOKEN_URL, STRAVA_API_BASE };
