"use client";

import { useActionState, useEffect, useState } from "react";
import { AlertCircle, CheckCircle2, Loader2, Plus, Trophy } from "lucide-react";
import type { PbCategory } from "@prisma/client";

import {
  createCustomPbAction,
  logPersonalBestAction,
  type PbBoardItem,
} from "@/app/actions/personal-bests";
import { PbBoard, PbProgressRing } from "@/components/pbs/pb-board";
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
import { getInputHint, getInputPlaceholder } from "@/lib/pb-format";
import { PB_CATEGORY_META } from "@/lib/pb-catalog";
import { HYROX_PB_CATEGORY_META } from "@/lib/hyrox/pb-catalog";
import type { SportView } from "@/lib/sports/types";

type ActionState = { error?: string; success?: string };
type FilterMode = "core" | "all" | "logged" | "unlogged";

function StatusMessage({ state }: { state: ActionState }) {
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

function LogPbPanel({
  items,
  selectedId,
  onSelectedIdChange,
  activeView,
}: {
  items: PbBoardItem[];
  selectedId?: string;
  onSelectedIdChange: (id: string | undefined) => void;
  activeView: SportView;
}) {
  const categoryMeta = activeView === "hyrox" ? HYROX_PB_CATEGORY_META : PB_CATEGORY_META;
  const isHyrox = activeView === "hyrox";
  const [logState, logAction, logPending] = useActionState<ActionState, FormData>(
    logPersonalBestAction,
    {},
  );
  const [customState, customAction, customPending] = useActionState<ActionState, FormData>(
    createCustomPbAction,
    {},
  );

  const selected = items.find((i) => i.definitionId === selectedId);
  const logOptions = items
    .filter((i) => i.isCore || i.category === "CUSTOM")
    .sort((a, b) => a.name.localeCompare(b.name));

  useEffect(() => {
    if (logState.success) {
      onSelectedIdChange(undefined);
    }
  }, [logState.success, onSelectedIdChange]);

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="surface p-5 space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-lime/10">
            <Trophy className={`h-3.5 w-3.5 ${isHyrox ? "text-orange-400" : "text-lime"}`} />
          </div>
          <p className="text-sm font-semibold text-foreground">
            {isHyrox ? "Log Hyrox PB" : "Log Personal Best"}
          </p>
        </div>

        <StatusMessage state={logState} />

        <form action={logAction} className="space-y-4" key={selectedId ?? "default"}>
          <input type="hidden" name="sportView" value={activeView} />
          <div className="space-y-1.5">
            <Label>PB</Label>
            <Select
              value={selectedId ?? ""}
              onValueChange={(value) => onSelectedIdChange(value || undefined)}
            >
              <SelectTrigger className="h-11 rounded-xl border-white/10 bg-white/6">
                <SelectValue placeholder="Select a PB…" />
              </SelectTrigger>
              <SelectContent className="bg-card border-white/10 max-h-72">
                {logOptions.map((item) => (
                  <SelectItem key={item.definitionId} value={item.definitionId}>
                    {categoryMeta[item.category]?.emoji ?? "📌"} {item.name}
                    {item.current ? ` — ${item.current.displayValue}` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedId && (
            <input type="hidden" name="pbDefinitionId" value={selectedId} />
          )}

          {selected && selected.recordType !== "MILESTONE" && (
            <div className="space-y-1.5">
              <Label htmlFor="pb-value">Result</Label>
              <Input
                id="pb-value"
                name="value"
                placeholder={getInputPlaceholder(selected.recordType, selected.unit)}
                className="h-11 rounded-xl border-white/10 bg-white/6"
                required
              />
              <p className="text-[11px] text-muted-foreground">
                {getInputHint(selected.recordType, selected.unit)}
              </p>
            </div>
          )}

          {selected?.recordType === "MILESTONE" && (
            <p className="text-sm text-muted-foreground rounded-xl border border-white/8 bg-white/3 px-3 py-2.5">
              Mark this skill milestone as achieved — no value needed.
            </p>
          )}

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="pb-date">Date achieved</Label>
              <Input
                id="pb-date"
                name="achievedAt"
                type="date"
                defaultValue={new Date().toISOString().slice(0, 10)}
                className="h-11 rounded-xl border-white/10 bg-white/6"
              />
            </div>
            <div className="space-y-1.5 sm:col-span-1">
              <Label htmlFor="pb-notes">Notes (optional)</Label>
              <Textarea
                id="pb-notes"
                name="notes"
                placeholder="e.g. felt great, competition day"
                className="min-h-[44px] rounded-xl border-white/10 bg-white/6 resize-none"
                rows={1}
              />
            </div>
          </div>

          <Button type="submit" disabled={logPending || !selectedId} className="w-full gap-2">
            {logPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trophy className="h-4 w-4" />}
            {selected?.current ? "Update PB" : "Log PB"}
          </Button>
        </form>
      </div>

      <div className="surface p-5 space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/8">
            <Plus className="h-3.5 w-3.5 text-muted-foreground" />
          </div>
          <p className="text-sm font-semibold text-foreground">Add Custom PB</p>
        </div>

        <StatusMessage state={customState} />

        <form action={customAction} className="space-y-4">
          <input type="hidden" name="sportView" value={activeView} />
          <div className="space-y-1.5">
            <Label htmlFor="custom-name">Name</Label>
            <Input
              id="custom-name"
              name="name"
              placeholder="e.g. 30-min AMRAP score"
              className="h-11 rounded-xl border-white/10 bg-white/6"
              required
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Type</Label>
              <Select name="recordType" defaultValue="SCORE">
                <SelectTrigger className="h-11 rounded-xl border-white/10 bg-white/6">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card border-white/10">
                  <SelectItem value="WEIGHT">Weight</SelectItem>
                  <SelectItem value="REPS">Reps</SelectItem>
                  <SelectItem value="TIME">Time</SelectItem>
                  <SelectItem value="DISTANCE">Distance</SelectItem>
                  <SelectItem value="SCORE">Score</SelectItem>
                  <SelectItem value="MILESTONE">Milestone</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="custom-unit">Unit</Label>
              <Input
                id="custom-unit"
                name="unit"
                defaultValue="score"
                className="h-11 rounded-xl border-white/10 bg-white/6"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Better is…</Label>
            <Select name="scoreDirection" defaultValue="HIGHER_IS_BETTER">
              <SelectTrigger className="h-11 rounded-xl border-white/10 bg-white/6">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-card border-white/10">
                <SelectItem value="HIGHER_IS_BETTER">Higher / more reps</SelectItem>
                <SelectItem value="LOWER_IS_BETTER">Lower time / faster</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button type="submit" variant="outline" disabled={customPending} className="w-full gap-2">
            {customPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            Create custom PB
          </Button>
        </form>
      </div>
    </div>
  );
}

function PbFilters({
  filter,
  onFilterChange,
  categoryFilter,
  onCategoryChange,
  search,
  onSearchChange,
  activeView,
}: {
  filter: FilterMode;
  onFilterChange: (f: FilterMode) => void;
  categoryFilter: string;
  onCategoryChange: (c: string) => void;
  search: string;
  onSearchChange: (s: string) => void;
  activeView: SportView;
}) {
  const categoryMeta = activeView === "hyrox" ? HYROX_PB_CATEGORY_META : PB_CATEGORY_META;
  const tabs: { id: FilterMode; label: string }[] = [
    { id: "core", label: "Core PBs" },
    { id: "all", label: "All" },
    { id: "logged", label: "Logged" },
    { id: "unlogged", label: "To Log" },
  ];

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => onFilterChange(tab.id)}
            className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${
              filter === tab.id
                ? "bg-lime text-background"
                : "bg-white/6 text-muted-foreground hover:bg-white/10 hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        <Input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search PBs…"
          className="h-9 w-full sm:w-44 rounded-full border-white/10 bg-white/6 text-sm"
        />
        <Select value={categoryFilter} onValueChange={(value) => onCategoryChange(value ?? "ALL")}>
          <SelectTrigger className="h-9 w-full sm:w-40 rounded-full border-white/10 bg-white/6 text-sm">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent className="bg-card border-white/10">
            <SelectItem value="ALL">All categories</SelectItem>
            {Object.entries(categoryMeta).map(([key, meta]) => (
              <SelectItem key={key} value={key}>
                {meta?.emoji} {meta?.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

export function PbPageClient({
  items,
  stats,
  activeView,
}: {
  items: PbBoardItem[];
  stats: { totalLogged: number; coreLogged: number; coreTotal: number; recentCount: number };
  activeView: SportView;
}) {
  const isHyrox = activeView === "hyrox";
  const [filter, setFilter] = useState<FilterMode>("core");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | undefined>();

  return (
    <div className="space-y-6">
      <div className="surface p-5 lg:p-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <PbProgressRing
            logged={stats.coreLogged}
            total={stats.coreTotal}
            label="Core PBs logged"
          />
          <div className="grid grid-cols-3 gap-4 lg:gap-8">
            <div>
              <p className="text-2xl font-bold tabular-nums text-foreground">{stats.totalLogged}</p>
              <p className="text-xs text-muted-foreground">Total logged</p>
            </div>
            <div>
              <p className="text-2xl font-bold tabular-nums text-lime">{stats.recentCount}</p>
              <p className="text-xs text-muted-foreground">Updated (30d)</p>
            </div>
            <div>
              <p className="text-2xl font-bold tabular-nums text-foreground">
                {stats.coreTotal - stats.coreLogged}
              </p>
              <p className="text-xs text-muted-foreground">Core to log</p>
            </div>
          </div>
        </div>
      </div>

      <LogPbPanel
        items={items}
        selectedId={selectedId}
        onSelectedIdChange={setSelectedId}
        activeView={activeView}
      />

      <PbFilters
        filter={filter}
        onFilterChange={setFilter}
        categoryFilter={categoryFilter}
        onCategoryChange={setCategoryFilter}
        search={search}
        onSearchChange={setSearch}
        activeView={activeView}
      />

      <PbBoard
        items={items}
        filter={filter}
        categoryFilter={categoryFilter as PbCategory | "ALL"}
        search={search}
        onLog={setSelectedId}
        activeView={activeView}
      />
    </div>
  );
}
