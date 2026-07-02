"use client";

import { useTransition } from "react";
import { differenceInDays, format } from "date-fns";
import { Calendar, CheckCircle2, Flag, Loader2, Target } from "lucide-react";

import { updateGoalProgressAction } from "@/app/actions/goals";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type GoalItem = {
  id: string;
  title: string;
  currentValue: number;
  targetValue: number;
  unit: string;
  status: string;
  createdAt: Date;
  targetDate: Date | null;
};

function estimateEta(goal: GoalItem): string {
  const elapsedDays = Math.max(1, differenceInDays(new Date(), goal.createdAt));
  const velocityPerDay = goal.currentValue / elapsedDays;
  const remaining = Math.max(0, goal.targetValue - goal.currentValue);

  if (remaining === 0) return "Completed";
  if (velocityPerDay <= 0) return "Insufficient data";

  const etaDays = Math.ceil(remaining / velocityPerDay);
  const etaDate = new Date();
  etaDate.setDate(etaDate.getDate() + etaDays);
  return format(etaDate, "MMM d, yyyy");
}

export function GoalsList({ goals }: { goals: GoalItem[] }) {
  const [isPending, startTransition] = useTransition();

  if (goals.length === 0) {
    return (
      <EmptyState
        icon={Flag}
        title="No goals set"
        description="Create your first performance goal to start tracking progress toward it."
      />
    );
  }

  const active = goals.filter((g) => g.status === "ACTIVE");
  const completed = goals.filter((g) => g.status !== "ACTIVE");

  function GoalCard({ goal }: { goal: GoalItem }) {
    const pct = Math.max(0, Math.min(100, (goal.currentValue / goal.targetValue) * 100));
    const isDone = goal.status !== "ACTIVE";

    return (
      <div
        className={cn(
          "surface p-5 space-y-4 transition-all",
          isDone && "opacity-60",
        )}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "flex h-8 w-8 shrink-0 items-center justify-center rounded-xl",
                isDone ? "bg-lime/10" : "bg-white/5",
              )}
            >
              {isDone ? (
                <CheckCircle2 className="h-4 w-4 text-lime" />
              ) : (
                <Target className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">{goal.title}</p>
              <p className="text-xs text-muted-foreground">
                {goal.currentValue} / {goal.targetValue} {goal.unit}
              </p>
            </div>
          </div>

          <div className="text-right shrink-0">
            <p
              className={cn(
                "text-lg font-bold tabular-nums",
                pct >= 100 ? "text-lime" : pct >= 70 ? "text-amber-400" : "text-foreground",
              )}
            >
              {Math.round(pct)}%
            </p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-1.5 w-full rounded-full bg-white/6 overflow-hidden">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-700",
              pct >= 100 ? "bg-lime" : pct >= 70 ? "bg-amber-400" : "bg-blue-500",
            )}
            style={{ width: `${pct}%` }}
          />
        </div>

        {/* Metadata */}
        <div className="flex flex-wrap gap-x-5 gap-y-1">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Target className="h-3 w-3" />
            ETA: {estimateEta(goal)}
          </div>
          {goal.targetDate && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              Deadline: {format(goal.targetDate, "MMM d, yyyy")}
            </div>
          )}
        </div>

        {/* Update form */}
        {!isDone && (
          <form
            action={(formData) => {
              startTransition(async () => {
                await updateGoalProgressAction(formData);
              });
            }}
            className="flex gap-2"
          >
            <input type="hidden" name="goalId" value={goal.id} />
            <Input
              name="currentValue"
              type="number"
              step="0.1"
              defaultValue={goal.currentValue}
              className="max-w-[160px]"
              required
            />
            <Button type="submit" variant="outline" size="sm" disabled={isPending}>
              {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Update"}
            </Button>
          </form>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {active.length > 0 && (
        <div className="space-y-3">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
            Active ({active.length})
          </p>
          <div className="grid gap-3">
            {active.map((goal) => (
              <GoalCard key={goal.id} goal={goal} />
            ))}
          </div>
        </div>
      )}

      {completed.length > 0 && (
        <div className="space-y-3">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
            Completed ({completed.length})
          </p>
          <div className="grid gap-3">
            {completed.map((goal) => (
              <GoalCard key={goal.id} goal={goal} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
