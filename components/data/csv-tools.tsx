"use client";

import { useActionState } from "react";
import { AlertCircle, CheckCircle2, Download, Loader2, Upload } from "lucide-react";

import { importWorkoutsCsvAction } from "@/app/actions/data-transfer";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export function CsvTools() {
  const [state, formAction, pending] = useActionState<{ error?: string; success?: string }, FormData>(
    importWorkoutsCsvAction,
    {},
  );

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {/* Import */}
      <div className="surface p-5 space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-lime/10">
            <Upload className="h-3.5 w-3.5 text-lime" />
          </div>
          <p className="text-sm font-semibold text-foreground">Import Workouts</p>
        </div>
        <p className="text-xs text-muted-foreground">
          Upload a CSV with one exercise row per line. Dedupe mode skips workouts already in your account.
        </p>

        <form action={formAction} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="file">CSV file</Label>
            <Input id="file" name="file" type="file" accept=".csv,text/csv" required />
          </div>

          <label className="flex cursor-pointer items-center gap-2.5">
            <input
              name="skip_duplicates"
              type="checkbox"
              defaultChecked
              className="h-4 w-4 rounded border-white/20 bg-white/8 accent-lime"
            />
            <span className="text-sm text-muted-foreground">
              Skip duplicate workouts{" "}
              <span className="text-[10px] text-lime font-medium">recommended</span>
            </span>
          </label>

          {state.error && (
            <div className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/8 px-3 py-2.5">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
              <p className="text-sm text-red-400">{state.error}</p>
            </div>
          )}
          {state.success && (
            <div className="flex items-center gap-2 rounded-xl border border-lime/20 bg-lime/8 px-3 py-2.5">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-lime" />
              <p className="text-sm text-lime">{state.success}</p>
            </div>
          )}

          <Button type="submit" size="sm" disabled={pending}>
            {pending ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Importing…
              </span>
            ) : (
              <>
                <Upload className="h-3.5 w-3.5" />
                Import workouts
              </>
            )}
          </Button>
        </form>
      </div>

      {/* Export */}
      <div className="surface p-5 space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/5">
            <Download className="h-3.5 w-3.5 text-muted-foreground" />
          </div>
          <p className="text-sm font-semibold text-foreground">Export Workouts</p>
        </div>
        <p className="text-xs text-muted-foreground">
          Download all workouts and exercise sets in ASCEND import-compatible CSV format. Includes all metadata and values.
        </p>

        <a
          href="/api/export/workouts"
          className={cn(buttonVariants({ variant: "outline", size: "sm" }), "inline-flex")}
        >
          <Download className="h-3.5 w-3.5" />
          Export all workouts
        </a>

        <p className="text-[11px] text-muted-foreground/60">
          Keep this file to migrate data or restore a backup.
        </p>
      </div>
    </div>
  );
}
