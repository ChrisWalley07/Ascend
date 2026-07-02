import { AlertTriangle } from "lucide-react";

import { isSupabaseConfigured } from "@/lib/supabase/env";

export function SupabaseSetupNotice() {
  if (isSupabaseConfigured()) {
    return null;
  }

  return (
    <div className="mb-6 flex items-start gap-2.5 rounded-xl border border-amber-500/25 bg-amber-500/8 px-4 py-3">
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
      <div className="text-sm text-amber-200/90">
        <p className="font-medium text-amber-300">Supabase not configured</p>
        <p className="mt-1 text-xs leading-relaxed text-amber-200/70">
          Add your project URL and anon key to{" "}
          <code className="rounded bg-black/30 px-1 py-0.5 font-mono text-[11px]">.env.local</code>,
          then restart the dev server. Get values from{" "}
          <a
            href="https://supabase.com/dashboard/project/_/settings/api"
            target="_blank"
            rel="noreferrer"
            className="underline underline-offset-2 hover:text-amber-200"
          >
            Supabase API settings
          </a>
          .
        </p>
      </div>
    </div>
  );
}
