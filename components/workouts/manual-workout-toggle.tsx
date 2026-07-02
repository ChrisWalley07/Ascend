"use client";

import { useState } from "react";
import { ChevronDown, PencilLine } from "lucide-react";

import { WorkoutForm } from "@/components/workouts/workout-form";
import { cn } from "@/lib/utils";

type ExerciseOption = { id: string; name: string };

export function ManualWorkoutToggle({ exercises }: { exercises: ExerciseOption[] }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="surface overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between px-5 py-4 text-left hover:bg-white/3 transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <PencilLine className="h-4 w-4 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium text-foreground">Manual entry</p>
            <p className="text-xs text-muted-foreground">Log sets, reps, and weights by hand</p>
          </div>
        </div>
        <ChevronDown
          className={cn(
            "h-4 w-4 text-muted-foreground transition-transform duration-200",
            open && "rotate-180",
          )}
        />
      </button>

      {open && (
        <div className="border-t border-white/7 px-5 py-5">
          <WorkoutForm exercises={exercises} />
        </div>
      )}
    </div>
  );
}
