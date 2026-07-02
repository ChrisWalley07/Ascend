"use client";

import { useActionState } from "react";
import { AlertCircle, CheckCircle2, Loader2, Plus, Trophy } from "lucide-react";

import { createCustomBenchmarkAction, logBenchmarkAttemptAction } from "@/app/actions/benchmarks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type BenchmarkOption = { id: string; name: string };
type BenchmarkActionState = { error?: string; success?: string };

function StatusMessage({ state }: { state: BenchmarkActionState }) {
  if (state.error) {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/8 px-3 py-2.5">
        <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
        <p className="text-sm text-red-400">{state.error}</p>
      </div>
    );
  }
  if (state.success) {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-lime/20 bg-lime/8 px-3 py-2.5">
        <CheckCircle2 className="h-4 w-4 shrink-0 text-lime" />
        <p className="text-sm text-lime">{state.success}</p>
      </div>
    );
  }
  return null;
}

export function BenchmarkForms({ benchmarks }: { benchmarks: BenchmarkOption[] }) {
  const [attemptState, attemptAction, attemptPending] = useActionState<BenchmarkActionState, FormData>(
    logBenchmarkAttemptAction,
    {},
  );
  const [customState, customAction, customPending] = useActionState<BenchmarkActionState, FormData>(
    createCustomBenchmarkAction,
    {},
  );

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {/* Log attempt */}
      <div className="surface p-5 space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-lime/10">
            <Trophy className="h-3.5 w-3.5 text-lime" />
          </div>
          <p className="text-sm font-semibold text-foreground">Log Attempt</p>
        </div>

        <form action={attemptAction} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Benchmark</Label>
            <Select name="benchmarkId">
              <SelectTrigger className="h-11 rounded-xl border-white/10 bg-white/6">
                <SelectValue placeholder="Select benchmark…" />
              </SelectTrigger>
              <SelectContent className="bg-card border-white/10">
                {benchmarks.map((b) => (
                  <SelectItem key={b.id} value={b.id}>
                    {b.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="score">Display score</Label>
              <Input id="score" name="score" placeholder="e.g. 2:51 or 135 reps" required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="scoreValue">Numeric value</Label>
              <Input id="scoreValue" name="scoreValue" type="number" step="0.01" placeholder="171" required />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="date">Date</Label>
            <Input id="date" name="date" type="date" defaultValue={new Date().toISOString().slice(0, 10)} required />
          </div>

          <StatusMessage state={attemptState} />

          <Button type="submit" size="sm" disabled={attemptPending}>
            {attemptPending ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Saving…
              </span>
            ) : (
              "Save attempt"
            )}
          </Button>
        </form>
      </div>

      {/* Create custom */}
      <div className="surface p-5 space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/5">
            <Plus className="h-3.5 w-3.5 text-muted-foreground" />
          </div>
          <p className="text-sm font-semibold text-foreground">Custom Benchmark</p>
        </div>

        <form action={customAction} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="bname">Name</Label>
            <Input id="bname" name="name" placeholder="Quarterfinals Chipper" required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="description">
              Description{" "}
              <span className="normal-case text-muted-foreground/60 tracking-normal">optional</span>
            </Label>
            <Input id="description" name="description" placeholder="For time: 50 wall balls, 40 T2B…" />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="scoreUnit">Score unit</Label>
              <Input id="scoreUnit" name="scoreUnit" placeholder="seconds / reps / kg" required />
            </div>
            <div className="space-y-1.5">
              <Label>Scoring mode</Label>
              <Select name="scoringMode" defaultValue="LOWER_IS_BETTER">
                <SelectTrigger className="h-11 rounded-xl border-white/10 bg-white/6">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card border-white/10">
                  <SelectItem value="LOWER_IS_BETTER">Lower is better (time)</SelectItem>
                  <SelectItem value="HIGHER_IS_BETTER">Higher is better (reps)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <StatusMessage state={customState} />

          <Button type="submit" variant="outline" size="sm" disabled={customPending}>
            {customPending ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Creating…
              </span>
            ) : (
              "Create benchmark"
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
