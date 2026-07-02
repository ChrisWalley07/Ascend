import { DatabaseBackup } from "lucide-react";

import { CsvTools } from "@/components/data/csv-tools";
import { PageHeader } from "@/components/ui/page-header";

export default function DataToolsPage() {
  return (
    <div className="min-h-screen">
      <div className="px-5 py-6 lg:px-8 lg:py-8 space-y-6 max-w-2xl">
        <PageHeader
          title="Data Tools"
          subtitle="Import and export workout data as CSV for migration, backups, and analysis."
          icon={DatabaseBackup}
          accentIcon
        />

        <CsvTools />

        <div className="surface p-5 space-y-3">
          <p className="text-sm font-semibold text-foreground">CSV Format</p>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>
              <strong className="text-foreground">Required columns:</strong>{" "}
              <code className="rounded-md bg-white/6 px-1.5 py-0.5 text-xs font-mono text-lime">workout_name</code>,{" "}
              <code className="rounded-md bg-white/6 px-1.5 py-0.5 text-xs font-mono text-lime">date</code>,{" "}
              <code className="rounded-md bg-white/6 px-1.5 py-0.5 text-xs font-mono text-lime">type</code>,{" "}
              <code className="rounded-md bg-white/6 px-1.5 py-0.5 text-xs font-mono text-lime">exercise_name</code>
            </p>
            <p>
              <strong className="text-foreground">Optional columns:</strong>{" "}
              <code className="rounded-md bg-white/6 px-1.5 py-0.5 text-xs font-mono">weight_kg</code>,{" "}
              <code className="rounded-md bg-white/6 px-1.5 py-0.5 text-xs font-mono">reps</code>,{" "}
              <code className="rounded-md bg-white/6 px-1.5 py-0.5 text-xs font-mono">notes</code>,{" "}
              <code className="rounded-md bg-white/6 px-1.5 py-0.5 text-xs font-mono">rpe</code>
            </p>
            <p>
              <strong className="text-foreground">Workout types:</strong>{" "}
              FOR_TIME, AMRAP, EMOM, STRENGTH, INTERVALS, SKILL, ACCESSORY
            </p>
            <p className="border-t border-white/7 pt-3">
              Dedupe mode compares workout metadata and exercise values and skips entries that already exist in your database, preventing duplicate imports.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
