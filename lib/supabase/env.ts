const PLACEHOLDER_MARKERS = [
  "your-project-id",
  "your-anon-key",
  "your-service-role-key",
  "your-project",
];

function readEnv(name: string): string | undefined {
  const value = process.env[name]?.trim();
  return value || undefined;
}

function isPlaceholderValue(value: string): boolean {
  const normalized = value.toLowerCase();
  return PLACEHOLDER_MARKERS.some((marker) => normalized.includes(marker));
}

export function getSupabaseUrl(): string | undefined {
  const url = readEnv("NEXT_PUBLIC_SUPABASE_URL");
  if (!url || isPlaceholderValue(url)) return undefined;
  return url;
}

export function getSupabaseAnonKey(): string | undefined {
  const key = readEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  if (!key || isPlaceholderValue(key)) return undefined;
  return key;
}

export function isSupabaseConfigured(): boolean {
  return Boolean(getSupabaseUrl() && getSupabaseAnonKey());
}

export function getSupabaseSetupMessage(): string {
  if (process.env.VERCEL) {
    return "Supabase is not configured on Vercel. Add NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, DATABASE_URL, and SUPABASE_SERVICE_ROLE_KEY in Project Settings → Environment Variables, then redeploy.";
  }

  return "Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local, then restart the dev server.";
}
