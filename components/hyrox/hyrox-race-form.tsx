"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Flag } from "lucide-react";

import { saveHyroxRaceAction } from "@/app/actions/hyrox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  HYROX_AGE_GROUPS,
  HYROX_DIVISIONS,
  HYROX_STATIONS,
} from "@/lib/hyrox/catalog";
import { cn } from "@/lib/utils";

const initialState = { error: undefined as string | undefined, success: undefined as string | undefined };

export function HyroxRaceForm() {
  const router = useRouter();
  const [mode, setMode] = useState<"completed" | "upcoming">("completed");
  const [state, formAction, isPending] = useActionState(
    async (_prev: typeof initialState, formData: FormData) => {
      const result = await saveHyroxRaceAction(formData);
      if (result.error) return { error: result.error, success: undefined };
      router.push("/hyrox/races");
      router.refresh();
      return { success: result.success, error: undefined };
    },
    initialState,
  );

  const today = new Date().toISOString().slice(0, 10);

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="mode" value={mode} />

      <div className="inline-flex rounded-xl border border-white/10 bg-white/5 p-1 text-xs font-semibold">
        {(
          [
            { id: "completed" as const, label: "Log completed race" },
            { id: "upcoming" as const, label: "Schedule upcoming" },
          ] as const
        ).map(({ id, label }) => (
          <button
            key={id}
            type="button"
            onClick={() => setMode(id)}
            className={cn(
              "rounded-lg px-3 py-1.5 transition-colors",
              mode === id
                ? "bg-orange-500/20 text-orange-300"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="surface p-5 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Race name</Label>
          <Input
            id="name"
            name="name"
            placeholder="e.g. London Excel 2026"
            defaultValue="Hyrox Race"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="raceDate">Race date</Label>
            <Input id="raceDate" name="raceDate" type="date" defaultValue={today} required />
          </div>
          {mode === "completed" && (
            <div className="space-y-2">
              <Label htmlFor="finishTime">Finish time</Label>
              <Input
                id="finishTime"
                name="finishTime"
                placeholder="1:12:30 or 72:30"
              />
              <p className="text-[10px] text-muted-foreground">
                Format: H:MM:SS, M:SS, or total seconds. Auto-calculated from splits if blank.
              </p>
            </div>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="division">Division</Label>
            <select
              id="division"
              name="division"
              className="flex h-10 w-full rounded-xl border border-white/10 bg-white/5 px-3 text-sm"
              defaultValue="Open"
            >
              {HYROX_DIVISIONS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="ageGroup">Age group</Label>
            <select
              id="ageGroup"
              name="ageGroup"
              className="flex h-10 w-full rounded-xl border border-white/10 bg-white/5 px-3 text-sm"
            >
              <option value="">—</option>
              {HYROX_AGE_GROUPS.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="gender">Gender</Label>
            <select
              id="gender"
              name="gender"
              className="flex h-10 w-full rounded-xl border border-white/10 bg-white/5 px-3 text-sm"
            >
              <option value="">—</option>
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
              <option value="NON_BINARY">Non-binary</option>
              <option value="PREFER_NOT_TO_SAY">Prefer not to say</option>
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">Notes</Label>
          <Textarea id="notes" name="notes" rows={2} placeholder="Race conditions, pacing notes…" />
        </div>
      </div>

      {mode === "completed" && (
        <div className="space-y-3">
          <div>
            <p className="text-sm font-semibold text-foreground">Station & run splits</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Enter times in M:SS format. Leave blank for stations you don&apos;t have data for.
            </p>
          </div>
          <div className="grid gap-2">
            {HYROX_STATIONS.map((station) => (
              <div
                key={station.slug}
                className="flex items-center gap-3 rounded-xl border border-white/8 bg-white/3 px-3 py-2.5"
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-orange-500/10 text-[10px] font-bold text-orange-300">
                  {station.sequence}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground">{station.name}</p>
                  {station.distanceMeters ? (
                    <p className="text-[10px] text-muted-foreground">
                      {station.distanceMeters >= 1000
                        ? `${station.distanceMeters / 1000} km`
                        : `${station.distanceMeters} m`}
                    </p>
                  ) : null}
                </div>
                <Input
                  name={`split-${station.slug}`}
                  placeholder="4:32"
                  className="w-24 h-9 text-center tabular-nums"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {state.error && (
        <p className="text-sm text-red-400" role="alert">
          {state.error}
        </p>
      )}

      <Button type="submit" disabled={isPending} className="gap-2">
        <Flag className="h-4 w-4" />
        {isPending ? "Saving…" : mode === "upcoming" ? "Schedule race" : "Log race result"}
      </Button>
    </form>
  );
}
