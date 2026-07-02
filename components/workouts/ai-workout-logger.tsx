"use client";

import { useActionState, useState, useTransition } from "react";
import {
  AlertCircle,
  Brain,
  CheckCircle2,
  Loader2,
  Sparkles,
} from "lucide-react";

import { parseWorkoutTextAction, saveParsedWorkoutAction } from "@/app/actions/workouts";
import { Button } from "@/components/ui/button";
import { CategoryBar } from "@/components/ui/category-bar";
import type { IconName } from "@/lib/icons";
import type { ParsedWorkout } from "@/lib/validations/workout-parser";
import { cn } from "@/lib/utils";

type ActionState = {
  error?: string;
  success?: string;
  parsed?: ParsedWorkout;
};

const EXAMPLES = [
  "Fran today in 4:32, RPE 9. Felt brutal.",
  "Back squat 5x5 @ 100kg, then 2000m row. RPE 7",
  "AMRAP 20: 10 burpees, 15 box jumps, 20 wall balls @ 9kg",
  "Snatch worked up to 70kg, 3 rounds of 400m run + 21 KB swings",
  "Murph with vest yesterday, 45 minutes",
];

const CATEGORY_ICON_MAP: Record<string, IconName> = {
  strength: "dumbbell",
  olympicLifting: "zap",
  engine: "activity",
  gymnastics: "target",
  power: "flame",
  mobility: "brain",
};

const CATEGORY_LABELS: Record<string, string> = {
  strength: "Strength",
  olympicLifting: "Olympic",
  engine: "Engine",
  gymnastics: "Gymnastics",
  power: "Power",
  mobility: "Mobility",
};

const confidenceStyles = {
  high: "bg-lime/10 text-lime border-lime/20",
  medium: "bg-amber-400/10 text-amber-400 border-amber-400/20",
  low: "bg-blue-400/10 text-blue-400 border-blue-400/20",
};

export function AiWorkoutLogger() {
  const [text, setText] = useState("");
  const [parsed, setParsed] = useState<ParsedWorkout | null>(null);
  const [isSaving, startSave] = useTransition();
  const [, startParse] = useTransition();

  const [parseState, parseAction, isParsing] = useActionState<ActionState, FormData>(
    async (prev, formData) => {
      const result = await parseWorkoutTextAction(prev, formData);
      if (result.parsed) setParsed(result.parsed);
      return result;
    },
    {},
  );

  const [saveState, saveAction] = useActionState<ActionState, FormData>(saveParsedWorkoutAction, {});

  const handleInterpret = () => {
    const formData = new FormData();
    formData.set("text", text);
    startParse(() => parseAction(formData));
  };

  const handleSave = () => {
    if (!parsed) return;
    const formData = new FormData();
    formData.set("parsed", JSON.stringify(parsed));
    startSave(() => saveAction(formData));
  };

  const topCategories = parsed
    ? (Object.entries(parsed.categoryImpact) as [string, number][])
        .sort((a, b) => b[1] - a[1])
        .filter(([, score]) => score > 0)
    : [];

  return (
    <div className="space-y-4">
      {/* Input card */}
      <div className="surface p-5 space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-lime/10 ring-1 ring-lime/20">
            <Brain className="h-4 w-4 text-lime" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Describe your session</p>
            <p className="text-xs text-muted-foreground">
              Type naturally — AI interprets movements, loads, and categories
            </p>
          </div>
        </div>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="e.g. Did Fran in 4:32 today, 43kg thrusters. Felt brutal, RPE 9."
          rows={4}
          className="w-full resize-none rounded-xl border border-white/10 bg-white/6 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-lime/40 focus:ring-3 focus:ring-lime/15 transition-all"
        />

        {/* Quick examples */}
        <div className="flex flex-wrap gap-2">
          {EXAMPLES.map((example) => (
            <button
              key={example}
              type="button"
              onClick={() => setText(example)}
              className="rounded-full border border-white/8 bg-white/4 px-3 py-1 text-[11px] text-muted-foreground hover:border-lime/30 hover:text-lime transition-colors"
            >
              {example.slice(0, 40)}…
            </button>
          ))}
        </div>

        {parseState?.error && (
          <div className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/8 px-3 py-2.5">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
            <p className="text-sm text-red-400">{parseState.error}</p>
          </div>
        )}

        <Button
          type="button"
          onClick={handleInterpret}
          disabled={isParsing || text.trim().length < 8}
          className="w-full"
        >
          {isParsing ? (
            <span className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Interpreting…
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              Interpret workout
            </span>
          )}
        </Button>
      </div>

      {/* Interpretation preview */}
      {parsed && (
        <div className="surface p-5 space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                AI Interpretation
              </p>
              <h3 className="mt-1 text-lg font-bold text-foreground">{parsed.name}</h3>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {parsed.type.replaceAll("_", " ")} · {parsed.date}
                {parsed.rpe ? ` · RPE ${parsed.rpe}` : ""}
              </p>
            </div>
            <span
              className={cn(
                "shrink-0 rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
                confidenceStyles[parsed.confidence],
              )}
            >
              {parsed.confidence} confidence
            </span>
          </div>

          <p className="text-sm text-muted-foreground leading-relaxed border-l-2 border-lime/40 pl-3">
            {parsed.interpretation}
          </p>

          {/* Detected movements */}
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-3">
              Detected movements ({parsed.exercises.length})
            </p>
            <div className="space-y-2">
              {parsed.exercises.map((exercise) => (
                <div
                  key={exercise.name}
                  className="flex items-center justify-between rounded-xl border border-white/6 bg-white/3 px-3 py-2.5"
                >
                  <div>
                    <p className="text-sm font-medium text-foreground">{exercise.name}</p>
                    <p className="text-[11px] text-muted-foreground">{exercise.category}</p>
                  </div>
                  <div className="text-right text-xs text-muted-foreground tabular-nums">
                    {exercise.reps && <span>{exercise.reps} reps</span>}
                    {exercise.weightKg && <span className="ml-2">@ {exercise.weightKg}kg</span>}
                    {!exercise.reps && !exercise.weightKg && (
                      <span className="text-lime/70">detected</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Category impact */}
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-3">
              Category impact
            </p>
            <div className="space-y-2.5">
              {topCategories.map(([key, score], i) => (
                <CategoryBar
                  key={key}
                  label={CATEGORY_LABELS[key] ?? key}
                  score={score}
                  iconName={CATEGORY_ICON_MAP[key] ?? "target"}
                  rank={i === 0 ? "strongest" : null}
                  delay={0.04 * i}
                />
              ))}
            </div>
          </div>

          {saveState?.error && (
            <div className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/8 px-3 py-2.5">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
              <p className="text-sm text-red-400">{saveState.error}</p>
            </div>
          )}

          {saveState?.success && (
            <div className="flex items-center gap-2 rounded-xl border border-lime/20 bg-lime/8 px-3 py-2.5">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-lime" />
              <p className="text-sm text-lime">{saveState.success}</p>
            </div>
          )}

          <Button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            size="lg"
            className="w-full"
          >
            {isSaving ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving session…
              </span>
            ) : (
              "Confirm & log session"
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
