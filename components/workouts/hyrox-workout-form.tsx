"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { Flame } from "lucide-react";

import { saveHyroxWorkoutAction } from "@/app/actions/hyrox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  HYROX_EXERCISES,
  HYROX_WORKOUT_TYPES,
  type HyroxExerciseCategory,
} from "@/lib/hyrox/catalog";
import { cn } from "@/lib/utils";

const CATEGORIES: HyroxExerciseCategory[] = [
  "Running",
  "Machines",
  "Carries",
  "Sleds",
  "Functional",
  "Strength",
  "Mobility",
  "Recovery",
];

const initialState = { error: undefined as string | undefined, success: undefined as string | undefined };

export function HyroxWorkoutForm() {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(
    async (_prev: typeof initialState, formData: FormData) => {
      const result = await saveHyroxWorkoutAction(formData);
      if (result.error) return { error: result.error, success: undefined };
      router.push("/dashboard");
      router.refresh();
      return { success: result.success, error: undefined };
    },
    initialState,
  );

  return (
    <form action={formAction} className="space-y-6">
      <div className="surface p-5 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Session name</Label>
          <Input
            id="name"
            name="name"
            placeholder="e.g. Station practice — sled + wall balls"
            defaultValue="Hyrox Session"
            required
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="hyroxType">Workout type</Label>
            <select
              id="hyroxType"
              name="hyroxType"
              className="flex h-10 w-full rounded-xl border border-white/10 bg-white/5 px-3 text-sm"
              defaultValue="STATION_PRACTICE"
            >
              {HYROX_WORKOUT_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="durationMinutes">Duration (minutes)</Label>
            <Input
              id="durationMinutes"
              name="durationMinutes"
              type="number"
              min={1}
              placeholder="60"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            name="notes"
            placeholder="Pacing, weights, how it felt…"
            rows={3}
          />
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <p className="text-sm font-semibold text-foreground">Stations & exercises</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Select every station you trained in this session.
          </p>
        </div>

        {CATEGORIES.map((category) => {
          const exercises = HYROX_EXERCISES.filter((e) => e.category === category);
          if (exercises.length === 0) return null;

          return (
            <div key={category} className="surface p-4">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-3">
                {category}
              </p>
              <div className="flex flex-wrap gap-2">
                {exercises.map((exercise) => (
                  <label
                    key={exercise.name}
                    className={cn(
                      "inline-flex cursor-pointer items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium transition-colors",
                      "has-[:checked]:border-orange-500/40 has-[:checked]:bg-orange-500/10 has-[:checked]:text-orange-200",
                    )}
                  >
                    <input
                      type="checkbox"
                      name="stations"
                      value={exercise.name}
                      className="sr-only"
                    />
                    <Flame className="h-3 w-3 opacity-60" />
                    {exercise.name}
                  </label>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {state.error && (
        <p className="text-sm text-red-400" role="alert">
          {state.error}
        </p>
      )}

      <Button type="submit" disabled={isPending} className="w-full sm:w-auto">
        {isPending ? "Saving…" : "Log Hyrox session"}
      </Button>
    </form>
  );
}
