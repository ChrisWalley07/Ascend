"use client";

import { useActionState } from "react";
import { AlertCircle, CheckCircle2, Loader2, Plus } from "lucide-react";

import { createGoalAction } from "@/app/actions/goals";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function CreateGoalForm() {
  const [state, formAction, pending] = useActionState<{ error?: string; success?: string }, FormData>(
    createGoalAction,
    {},
  );

  return (
    <div className="surface p-5 space-y-4">
      <div className="flex items-center gap-2 mb-1">
        <Plus className="h-4 w-4 text-lime" />
        <p className="text-sm font-semibold text-foreground">New Goal</p>
      </div>

      <form action={formAction} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="title">Goal</Label>
          <Input id="title" name="title" placeholder="e.g. 100kg Snatch, Sub-5 Fran, Muscle Up" required />
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="space-y-1.5">
            <Label htmlFor="currentValue">Current value</Label>
            <Input id="currentValue" name="currentValue" type="number" step="0.1" defaultValue={0} required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="targetValue">Target value</Label>
            <Input id="targetValue" name="targetValue" type="number" step="0.1" placeholder="100" required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="unit">Unit</Label>
            <Input id="unit" name="unit" placeholder="kg / sec / reps" required />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="targetDate">
            Target date{" "}
            <span className="normal-case text-muted-foreground/60 tracking-normal">optional</span>
          </Label>
          <Input id="targetDate" name="targetDate" type="date" />
        </div>

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

        <Button type="submit" disabled={pending} size="sm">
          {pending ? (
            <span className="flex items-center gap-2">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Saving…
            </span>
          ) : (
            "Save goal"
          )}
        </Button>
      </form>
    </div>
  );
}
