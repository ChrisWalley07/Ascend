const PLACEHOLDER_MARKERS = [
  "your-project-id",
  "your-anon-key",
  "your-publishable-key",
  "your-service-role-key",
  "your-project",
];

function isPlaceholderValue(value: string): boolean {
  const normalized = value.toLowerCase();
  return PLACEHOLDER_MARKERS.some((marker) => normalized.includes(marker));
}

function readEnv(...names: string[]): string | undefined {
  for (const name of names) {
    const value = process.env[name]?.trim();
    if (value) return value;
  }
  return undefined;
}

function readConfiguredEnv(...names: string[]): string | undefined {
  const value = readEnv(...names);
  if (!value || isPlaceholderValue(value)) return undefined;
  return value;
}

export function getSupabaseUrl(): string | undefined {
  return readConfiguredEnv("NEXT_PUBLIC_SUPABASE_URL", "SUPABASE_URL");
}

export function getSupabasePublishableKey(): string | undefined {
  return readConfiguredEnv(
    "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    "SUPABASE_PUBLISHABLE_KEY",
    "SUPABASE_ANON_KEY",
  );
}

/** @deprecated Use getSupabasePublishableKey — kept for existing imports. */
export function getSupabaseAnonKey(): string | undefined {
  return getSupabasePublishableKey();
}

export function getSupabaseServiceRoleKey(): string | undefined {
  return readConfiguredEnv("SUPABASE_SERVICE_ROLE_KEY", "SUPABASE_SECRET_KEY");
}

export function getDatabaseUrl(): string | undefined {
  return readConfiguredEnv("DATABASE_URL", "SUPABASE_DATABASE_URL");
}

export function isSupabaseConfigured(): boolean {
  return Boolean(getSupabaseUrl() && getSupabasePublishableKey());
}

export function getSupabaseSetupMessage(): string {
  if (process.env.VERCEL) {
    return "Supabase is not fully configured on Vercel. Add DATABASE_URL plus NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (or the integration names SUPABASE_URL / SUPABASE_PUBLISHABLE_KEY), then redeploy with cache cleared.";
  }

  return "Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY to .env.local, then restart the dev server.";
}
