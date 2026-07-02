"use client";

import { useMemo, useState, useTransition } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  Dumbbell,
  Loader2,
  Plus,
  Trash2,
} from "lucide-react";

import { createWorkoutAction } from "@/app/actions/workouts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { workoutSchema, type WorkoutFormValues } from "@/lib/validations/workout";
import { cn } from "@/lib/utils";

type ExerciseOption = { id: string; name: string };

const workoutTypes = [
  { value: "FOR_TIME", label: "For Time", description: "Complete as fast as possible" },
  { value: "AMRAP", label: "AMRAP", description: "As many rounds as possible" },
  { value: "EMOM", label: "EMOM", description: "Every minute on the minute" },
  { value: "STRENGTH", label: "Strength", description: "Heavy lifting focus" },
  { value: "INTERVALS", label: "Intervals", description: "Work / rest cycles" },
  { value: "SKILL", label: "Skill", description: "Technique and capacity" },
  { value: "ACCESSORY", label: "Accessory", description: "Supplemental work" },
] as const;

export function WorkoutForm({ exercises }: { exercises: ExerciseOption[] }) {
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const form = useForm<WorkoutFormValues>({
    resolver: zodResolver(workoutSchema),
    defaultValues: {
      name: "",
      date: new Date().toISOString().slice(0, 10),
      type: "STRENGTH",
      notes: "",
      exercises: [{ exerciseId: "", reps: 0, weightKg: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({ control: form.control, name: "exercises" });
  const disableSubmit = useMemo(() => isPending || fields.length === 0, [fields.length, isPending]);

  const onSubmit = form.handleSubmit((values) => {
    startTransition(async () => {
      setStatus(null);
      const payload = new FormData();
      payload.append("payload", JSON.stringify(values));
      const response = await createWorkoutAction(payload);
      if (response.error) {
        setStatus({ type: "error", message: response.error });
        return;
      }
      setStatus({ type: "success", message: response.success ?? "Workout saved." });
      form.reset({ ...values, name: "", notes: "" });
    });
  });

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {/* Section: Workout Info */}
      <div className="surface p-5 space-y-5">
        <div className="flex items-center gap-2.5 mb-1">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-lime/10">
            <Dumbbell className="h-3.5 w-3.5 text-lime" />
          </div>
          <p className="text-sm font-semibold text-foreground">Session Info</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="name">Workout Name</Label>
            <Input
              id="name"
              {...form.register("name")}
              placeholder="e.g. Friday Night Lights"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="date">Date</Label>
            <Input id="date" type="date" {...form.register("date")} />
          </div>
        </div>

        {/* Type selector */}
        <div className="space-y-1.5">
          <Label>Workout Type</Label>
          <Controller
            control={form.control}
            name="type"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className="h-11 rounded-xl border-white/10 bg-white/6">
                  <SelectValue placeholder="Select type" />
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </SelectTrigger>
                <SelectContent className="bg-card border-white/10">
                  {workoutTypes.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      <div>
                        <p className="font-medium">{t.label}</p>
                        <p className="text-xs text-muted-foreground">{t.description}</p>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="rounds">Rounds / Sets</Label>
            <Input
              id="rounds"
              type="number"
              {...form.register("rounds", { valueAsNumber: true })}
              placeholder="5"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="rpe">
              RPE{" "}
              <span className="normal-case text-muted-foreground/60 tracking-normal">
                (1–10 effort)
              </span>
            </Label>
            <Input
              id="rpe"
              type="number"
              min={1}
              max={10}
              {...form.register("rpe", { valueAsNumber: true })}
              placeholder="8"
            />
          </div>
        </div>
      </div>

      {/* Section: Exercises */}
      <div className="surface p-5 space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-foreground">
            Exercises{" "}
            <span className="ml-1.5 text-xs font-normal text-muted-foreground">
              {fields.length} added
            </span>
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => append({ exerciseId: "", reps: 0, weightKg: 0 })}
          >
            <Plus className="h-3.5 w-3.5" />
            Add exercise
          </Button>
        </div>

        <div className="space-y-3">
          {fields.map((field, index) => (
            <div
              key={field.id}
              className="rounded-xl border border-white/8 bg-white/3 p-4 space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                  Exercise {index + 1}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => remove(index)}
                  className="text-muted-foreground hover:text-red-400"
                  aria-label={`Remove exercise ${index + 1}`}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-1.5 md:col-span-2">
                  <Label>Movement</Label>
                  <Controller
                    control={form.control}
                    name={`exercises.${index}.exerciseId`}
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger className="h-11 rounded-xl border-white/10 bg-white/6">
                          <SelectValue placeholder="Select movement…" />
                        </SelectTrigger>
                        <SelectContent className="bg-card border-white/10 max-h-64">
                          {exercises.map((ex) => (
                            <SelectItem key={ex.id} value={ex.id}>
                              {ex.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label>Weight (kg)</Label>
                  <Input
                    type="number"
                    step="0.5"
                    {...form.register(`exercises.${index}.weightKg`, { valueAsNumber: true })}
                    placeholder="60"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label>Reps</Label>
                  <Input
                    type="number"
                    {...form.register(`exercises.${index}.reps`, { valueAsNumber: true })}
                    placeholder="10"
                  />
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <Label>
                    Notes{" "}
                    <span className="normal-case text-muted-foreground/60 tracking-normal">
                      optional
                    </span>
                  </Label>
                  <Input
                    {...form.register(`exercises.${index}.notes`)}
                    placeholder="Tempo, cues, pacing…"
                  />
                </div>
              </div>
            </div>
          ))}

          {fields.length === 0 && (
            <button
              type="button"
              onClick={() => append({ exerciseId: "", reps: 0, weightKg: 0 })}
              className="w-full rounded-xl border border-dashed border-white/12 py-8 text-center text-sm text-muted-foreground hover:border-white/25 hover:text-foreground transition-colors"
            >
              <Plus className="mx-auto mb-2 h-5 w-5" />
              Add your first exercise
            </button>
          )}
        </div>
      </div>

      {/* Section: Notes */}
      <div className="surface p-5 space-y-3">
        <div className="space-y-1.5">
          <Label htmlFor="notes">Session Notes</Label>
          <Textarea
            id="notes"
            {...form.register("notes")}
            placeholder="How did the session feel? Energy level, technique notes, what went well…"
            className="min-h-[100px] rounded-xl border-white/10 bg-white/6 text-sm placeholder:text-muted-foreground/50 resize-none"
          />
        </div>
      </div>

      {/* Status */}
      {status && (
        <div
          className={cn(
            "flex items-start gap-2.5 rounded-xl border px-4 py-3",
            status.type === "success"
              ? "border-lime/20 bg-lime/8 text-lime"
              : "border-red-500/20 bg-red-500/8 text-red-400",
          )}
        >
          {status.type === "success" ? (
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
          ) : (
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          )}
          <p className="text-sm">{status.message}</p>
        </div>
      )}

      <Button type="submit" size="lg" className="w-full" disabled={disableSubmit}>
        {isPending ? (
          <span className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Saving session…
          </span>
        ) : (
          "Save workout"
        )}
      </Button>
    </form>
  );
}
