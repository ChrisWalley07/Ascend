"use client";

import { format } from "date-fns";
import { Medal, TrendingUp } from "lucide-react";

import type { PbBoardItem } from "@/app/actions/personal-bests";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { PB_CATEGORY_META } from "@/lib/pb-catalog";
import { HYROX_PB_CATEGORY_META } from "@/lib/hyrox/pb-catalog";
import type { SportView } from "@/lib/sports/types";
import type { PbCategory } from "@prisma/client";

function PbCard({
  item,
  onLog,
  isHyrox,
}: {
  item: PbBoardItem;
  onLog: (id: string) => void;
  isHyrox: boolean;
}) {
  const hasPb = Boolean(item.current);

  return (
    <button
      type="button"
      onClick={() => onLog(item.definitionId)}
      className={cn(
        "group w-full rounded-xl border p-4 text-left transition-all",
        hasPb
          ? isHyrox
            ? "border-orange-500/20 bg-orange-500/5 hover:border-orange-500/40 hover:bg-orange-500/8"
            : "border-lime/20 bg-lime/5 hover:border-lime/40 hover:bg-lime/8"
          : "border-white/8 bg-white/3 hover:border-white/15 hover:bg-white/5",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm font-medium text-foreground truncate">{item.name}</p>
          {item.subcategory && (
            <p className="text-[11px] text-muted-foreground mt-0.5">{item.subcategory}</p>
          )}
        </div>
        {item.isCore && (
          <Badge variant="outline" className="shrink-0 border-lime/30 text-lime text-[10px]">
            Core
          </Badge>
        )}
      </div>

      <div className="mt-3 flex items-end justify-between gap-2">
        <div>
          <p
            className={cn(
              "text-xl font-bold tabular-nums",
              hasPb ? (isHyrox ? "text-orange-300" : "text-lime") : "text-muted-foreground/50",
            )}
          >
            {hasPb ? item.current!.displayValue : "—"}
          </p>
          {hasPb && (
            <p className="text-[10px] text-muted-foreground mt-0.5">
              {format(new Date(item.current!.achievedAt), "MMM d, yyyy")}
              {item.current!.sourceWorkoutId && (
                <span className="text-lime/80"> · from workout</span>
              )}
            </p>
          )}
        </div>
        <span className="text-[10px] text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
          {hasPb ? "Update →" : "Log →"}
        </span>
      </div>
    </button>
  );
}

interface PbBoardProps {
  items: PbBoardItem[];
  filter: "core" | "all" | "logged" | "unlogged";
  categoryFilter: PbCategory | "ALL";
  search: string;
  onLog: (definitionId: string) => void;
  activeView?: SportView;
}

export function PbBoard({
  items,
  filter,
  categoryFilter,
  search,
  onLog,
  activeView = "crossfit",
}: PbBoardProps) {
  const categoryMeta = activeView === "hyrox" ? HYROX_PB_CATEGORY_META : PB_CATEGORY_META;
  const isHyrox = activeView === "hyrox";
  const filtered = items.filter((item) => {
    if (filter === "core" && !item.isCore) return false;
    if (filter === "logged" && !item.current) return false;
    if (filter === "unlogged" && item.current) return false;
    if (categoryFilter !== "ALL" && item.category !== categoryFilter) return false;
    if (search && !item.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const grouped = filtered.reduce<Record<string, PbBoardItem[]>>((acc, item) => {
    const key = item.category;
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});

  const categories = Object.keys(grouped).sort() as PbCategory[];

  if (filtered.length === 0) {
    return (
      <div className="surface p-10 text-center">
        <Medal className="mx-auto h-8 w-8 text-muted-foreground/40" />
        <p className="mt-3 text-sm font-medium text-foreground">No PBs match your filters</p>
        <p className="mt-1 text-xs text-muted-foreground">Try a different category or search term.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {categories.map((category) => {
        const meta = categoryMeta[category];
        if (!meta) return null;
        const categoryItems = grouped[category] ?? [];
        const loggedCount = categoryItems.filter((i) => i.current).length;

        return (
          <section key={category}>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-lg">{meta.emoji}</span>
              <div>
                <h2 className="text-sm font-semibold text-foreground">{meta.label}</h2>
                <p className="text-[11px] text-muted-foreground">
                  {loggedCount}/{categoryItems.length} logged · {meta.description}
                </p>
              </div>
              {loggedCount > 0 && loggedCount === categoryItems.length && (
                <TrendingUp className="ml-auto h-4 w-4 text-lime" />
              )}
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {categoryItems.map((item) => (
                <PbCard key={item.definitionId} item={item} onLog={onLog} isHyrox={isHyrox} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}

export function PbProgressRing({
  logged,
  total,
  label,
}: {
  logged: number;
  total: number;
  label: string;
}) {
  const pct = total > 0 ? Math.round((logged / total) * 100) : 0;
  const circumference = 2 * Math.PI * 36;
  const offset = circumference - (pct / 100) * circumference;

  return (
    <div className="flex items-center gap-4">
      <div className="relative h-20 w-20 shrink-0">
        <svg className="h-20 w-20 -rotate-90" viewBox="0 0 80 80">
          <circle cx="40" cy="40" r="36" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6" />
          <circle
            cx="40"
            cy="40"
            r="36"
            fill="none"
            stroke="#B6FF3B"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-700"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-bold text-lime">{pct}%</span>
        </div>
      </div>
      <div>
        <p className="text-2xl font-bold tabular-nums text-foreground">
          {logged}
          <span className="text-muted-foreground text-lg font-normal">/{total}</span>
        </p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}
