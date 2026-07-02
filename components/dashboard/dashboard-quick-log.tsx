"use client";

import { useActionState, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, CheckCircle2, Loader2, Sparkles } from "lucide-react";

import { parseWorkoutTextAction, saveParsedWorkoutAction } from "@/app/actions/workouts";
import { CategoryBar } from "@/components/ui/category-bar";
import { Button } from "@/components/ui/button";
import type { IconName } from "@/lib/icons";
import { buildWorkoutInsight } from "@/lib/dashboard/build-workout-insight";
import type { ParsedWorkout } from "@/lib/validations/workout-parser";
import type { SportView } from "@/lib/sports/types";
import { cn } from "@/lib/utils";

type ActionState = {
  error?: string;
  success?: string;
  parsed?: ParsedWorkout;
};

const CROSSFIT_EXAMPLES = [
  "Back squat 5x5 @ 100kg, 2000m row. RPE 7",
  "Fran in 4:32 today — felt brutal, RPE 9",
];

const HYROX_EXAMPLES = [
  "8x1km @ 4:15 avg, sled push practice. RPE 8",
  "Race sim: 4 runs + 4 stations in 52 min",
];

const CATEGORY_ICON_MAP: Record<string, IconName> = {
  strength: "dumbbell",
  olympicLifting: "zap",
  engine: "activity",
  gymnastics: "target",
  power: "flame",
  mobility: "brain",
  running: "gauge",
  grip: "dumbbell",
};

const CATEGORY_LABELS: Record<string, string> = {
  strength: "Strength",
  olympicLifting: "Olympic",
  engine: "Engine",
  gymnastics: "Gymnastics",
  power: "Power",
  mobility: "Mobility",
  running: "Running",
  grip: "Grip",
};

type Props = {
  sportView?: SportView;
  focusArea?: string | null;
  className?: string;
};

export function DashboardQuickLog({ sportView = "crossfit", focusArea = null, className }: Props) {
  const router = useRouter();
  const [text, setText] = useState("");
  const [parsed, setParsed] = useState<ParsedWorkout | null>(null);
  const [savedInsight, setSavedInsight] = useState<string | null>(null);
  const [isSaving, startSave] = useTransition();
  const [, startParse] = useTransition();

  const examples = sportView === "hyrox" ? HYROX_EXAMPLES : CROSSFIT_EXAMPLES;
  const logHref = sportView === "hyrox" ? "/workouts/hyrox/new" : "/workouts/new";

  const [parseState, parseAction, isParsing] = useActionState<ActionState, FormData>(
    async (prev, formData) => {
      const result = await parseWorkoutTextAction(prev, formData);
      if (result.parsed) setParsed(result.parsed);
      return result;
    },
    {},
  );

  const [saveState, saveAction] = useActionState<ActionState, FormData>(
    async (prev, formData) => {
      const result = await saveParsedWorkoutAction(prev, formData);
      if (result.success) {
        setParsed(null);
        setText("");
        router.refresh();
      } else {
        setSavedInsight(null);
      }
      return result;
    },
    {},
  );

  const handleAnalyze = () => {
    const formData = new FormData();
    formData.set("text", text);
    startParse(() => parseAction(formData));
  };

  const handleSave = () => {
    if (!parsed) return;
    setSavedInsight(buildWorkoutInsight(parsed, focusArea));
    const formData = new FormData();
    formData.set("parsed", JSON.stringify(parsed));
    startSave(() => saveAction(formData));
  };

  const topCategories = parsed
    ? (Object.entries(parsed.categoryImpact) as [string, number][])
        .sort((a, b) => b[1] - a[1])
        .filter(([, score]) => score > 0)
        .slice(0, 4)
    : [];

  return (
    <section className={cn("rounded-2xl border border-white/8 bg-card p-5", className)}>
      <div className="flex items-center justify-between gap-3 mb-4">
        <div>
          <p className="text-sm font-semibold text-foreground">Log workout</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Describe what you did — AI breaks it down by category
          </p>
        </div>
        <Link
          href={logHref}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors shrink-0"
        >
          Full form →
        </Link>
      </div>

      <textarea
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          if (parsed) setParsed(null);
        }}
        placeholder={
          sportView === "hyrox"
            ? "e.g. 6x800m runs, farmers carry 2x32kg, RPE 8…"
            : "e.g. Fran 4:32, back squat 5x5 @ 100kg, RPE 8…"
        }
        rows={3}
        className="w-full resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-lime/40 focus:ring-2 focus:ring-lime/10 transition-all"
      />

      <div className="mt-2 flex flex-wrap gap-2">
        {examples.map((example) => (
          <button
            key={example}
            type="button"
            onClick={() => {
              setText(example);
              setParsed(null);
            }}
            className="rounded-full border border-white/8 px-2.5 py-1 text-[10px] text-muted-foreground hover:border-lime/30 hover:text-lime transition-colors"
          >
            {example.length > 42 ? `${example.slice(0, 42)}…` : example}
          </button>
        ))}
      </div>

      {(parseState?.error || saveState?.error) && (
        <div className="mt-3 flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/8 px-3 py-2">
          <AlertCircle className="h-3.5 w-3.5 shrink-0 text-red-400" />
          <p className="text-xs text-red-400">{parseState?.error ?? saveState?.error}</p>
        </div>
      )}

      {saveState?.success && savedInsight && (
        <div className="mt-3 rounded-lg border border-lime/20 bg-lime/8 px-3 py-2.5 space-y-1">
          <p className="text-xs font-semibold text-lime">Session saved</p>
          <p className="text-xs text-muted-foreground leading-relaxed">{savedInsight}</p>
        </div>
      )}

      {saveState?.success && !savedInsight && (
        <div className="mt-3 flex items-center gap-2 rounded-lg border border-lime/20 bg-lime/8 px-3 py-2">
          <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-lime" />
          <p className="text-xs text-lime">{saveState.success}</p>
        </div>
      )}

      {!parsed ? (
        <Button
          type="button"
          onClick={handleAnalyze}
          disabled={isParsing || text.trim().length < 8}
          className="mt-4 w-full"
          size="sm"
        >
          {isParsing ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Analyzing…
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              Analyze session
            </>
          )}
        </Button>
      ) : (
        <div className="mt-4 space-y-4 animate-in fade-in duration-200">
          <div className="rounded-xl border border-white/8 bg-white/[0.03] px-3 py-3">
            <p className="text-sm font-semibold text-foreground">{parsed.name}</p>
            <p className="mt-0.5 text-xs text-muted-foreground leading-relaxed">
              {parsed.interpretation}
            </p>
          </div>

          {topCategories.length > 0 && (
            <div className="space-y-2">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Category impact
              </p>
              {topCategories.map(([key, score], i) => (
                <CategoryBar
                  key={key}
                  label={CATEGORY_LABELS[key] ?? key}
                  score={score}
                  iconName={CATEGORY_ICON_MAP[key] ?? "target"}
                  rank={i === 0 ? "strongest" : null}
                  delay={0.03 * i}
                />
              ))}
            </div>
          )}

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => setParsed(null)}
            >
              Edit
            </Button>
            <Button
              type="button"
              size="sm"
              className="flex-1"
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving…
                </>
              ) : (
                "Save session"
              )}
            </Button>
          </div>
        </div>
      )}
    </section>
  );
}
