"use client";

import { useActionState, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, ChevronDown, Loader2 } from "lucide-react";

import { logRecoveryCheckInAction, type TodayCheckIn } from "@/app/actions/recovery";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Props = {
  todayCheckIn: TodayCheckIn | null;
  className?: string;
};

function SliderRow({
  label,
  value,
  onChange,
  low,
  high,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  low: string;
  high: string;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
        <span className="text-sm font-bold tabular-nums text-foreground">{value}</span>
      </div>
      <input
        type="range"
        min={1}
        max={10}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-lime h-1.5"
      />
      <div className="flex justify-between mt-1 text-[10px] text-muted-foreground/70">
        <span>{low}</span>
        <span>{high}</span>
      </div>
    </div>
  );
}

export function DailyCheckIn({ todayCheckIn, className }: Props) {
  const router = useRouter();
  const [expanded, setExpanded] = useState(!todayCheckIn);
  const [readiness, setReadiness] = useState(todayCheckIn?.readiness ?? 7);
  const [soreness, setSoreness] = useState(todayCheckIn?.soreness ?? 4);
  const [sleepHours, setSleepHours] = useState(
    todayCheckIn?.sleepHours?.toString() ?? "",
  );
  const [hrv, setHrv] = useState(todayCheckIn?.hrv?.toString() ?? "");

  const [state, action, pending] = useActionState(
    async (prev: { error?: string; success?: string }, formData: FormData) => {
      const result = await logRecoveryCheckInAction(prev, formData);
      if (result.success) {
        router.refresh();
        setExpanded(false);
      }
      return result;
    },
    {},
  );

  const checkedIn = Boolean(todayCheckIn) && !state.success;

  return (
    <section className={cn("rounded-2xl border border-white/8 bg-card p-4", className)}>
      <button
        type="button"
        onClick={() => setExpanded((e) => !e)}
        className="flex w-full items-center justify-between gap-3 text-left"
      >
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-xl",
              checkedIn ? "bg-lime/15 text-lime" : "bg-white/5 text-muted-foreground",
            )}
          >
            {checkedIn ? <Check className="h-4 w-4" /> : <span className="text-xs font-bold">?</span>}
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Daily check-in</p>
            <p className="text-xs text-muted-foreground">
              {checkedIn
                ? `Readiness ${todayCheckIn!.readiness}/10 logged today`
                : "10 seconds · unlocks recovery coaching"}
            </p>
          </div>
        </div>
        <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", expanded && "rotate-180")} />
      </button>

      {expanded && (
        <form action={action} className="mt-4 space-y-4 border-t border-white/6 pt-4 animate-in fade-in duration-200">
          <SliderRow
            label="How ready to train?"
            value={readiness}
            onChange={setReadiness}
            low="Exhausted"
            high="Prime"
          />
          <input type="hidden" name="readiness" value={readiness} />

          <SliderRow
            label="Muscle soreness"
            value={soreness}
            onChange={setSoreness}
            low="None"
            high="Very sore"
          />
          <input type="hidden" name="soreness" value={soreness} />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Sleep (hrs)</label>
              <input
                name="sleepHours"
                type="number"
                step="0.5"
                min="0"
                max="14"
                value={sleepHours}
                onChange={(e) => setSleepHours(e.target.value)}
                placeholder="7.5"
                className="mt-1.5 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none focus:border-lime/40"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">HRV (optional)</label>
              <input
                name="hrv"
                type="number"
                min="1"
                max="250"
                value={hrv}
                onChange={(e) => setHrv(e.target.value)}
                placeholder="ms"
                className="mt-1.5 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none focus:border-lime/40"
              />
            </div>
          </div>

          {state.error && <p className="text-xs text-red-400">{state.error}</p>}
          {state.success && <p className="text-xs text-lime">{state.success}</p>}

          <Button type="submit" size="sm" className="w-full" disabled={pending}>
            {pending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving…
              </>
            ) : (
              "Save check-in"
            )}
          </Button>
        </form>
      )}
    </section>
  );
}
