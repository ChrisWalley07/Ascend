"use client";

import { useEffect } from "react";

type Props = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function DashboardError({ error, reset }: Props) {
  useEffect(() => {
    console.error("[dashboard] render error", error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
      <h1 className="text-lg font-semibold text-foreground">Dashboard couldn&apos;t load</h1>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        This is usually a database setup issue on production. If you just connected Supabase, make sure{" "}
        <code className="rounded bg-white/8 px-1 py-0.5 text-xs">DATABASE_URL</code> is set in Vercel and
        redeploy with cache cleared.
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-6 rounded-lg bg-lime px-4 py-2 text-sm font-semibold text-black hover:bg-lime/90"
      >
        Try again
      </button>
      {error.digest && (
        <p className="mt-4 text-[11px] text-muted-foreground/70">Error {error.digest}</p>
      )}
    </div>
  );
}
