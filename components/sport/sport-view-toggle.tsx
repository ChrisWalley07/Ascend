"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { setActiveSportViewAction } from "@/app/actions/sport";
import { cn } from "@/lib/utils";
import type { SportView } from "@/lib/sports/types";

type Props = {
  activeView: SportView;
  canSwitch: boolean;
  className?: string;
};

export function SportViewToggle({ activeView, canSwitch, className }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  if (!canSwitch) {
    return (
      <div
        className={cn(
          "inline-flex rounded-xl border border-white/10 bg-white/5 p-1 text-xs font-semibold",
          className,
        )}
      >
        <span className="rounded-lg bg-lime/15 px-3 py-1.5 text-lime capitalize">{activeView}</span>
      </div>
    );
  }

  const setView = (view: SportView) => {
    if (view === activeView || isPending) return;
    startTransition(async () => {
      await setActiveSportViewAction(view);
      router.refresh();
    });
  };

  return (
    <div
      className={cn(
        "inline-flex rounded-xl border border-white/10 bg-white/5 p-1 text-xs font-semibold",
        isPending && "opacity-60",
        className,
      )}
      role="tablist"
      aria-label="Sport dashboard view"
    >
      {(["crossfit", "hyrox"] as SportView[]).map((view) => (
        <button
          key={view}
          type="button"
          role="tab"
          aria-selected={activeView === view}
          onClick={() => setView(view)}
          className={cn(
            "rounded-lg px-3 py-1.5 capitalize transition-colors",
            activeView === view
              ? view === "hyrox"
                ? "bg-orange-500/20 text-orange-300"
                : "bg-lime/15 text-lime"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {view === "crossfit" ? "CrossFit" : "Hyrox"}
        </button>
      ))}
    </div>
  );
}
