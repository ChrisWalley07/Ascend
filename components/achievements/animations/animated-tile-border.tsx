"use client";

import { cn } from "@/lib/utils";

type Props = {
  active: boolean;
  tone?: "yellow" | "gold";
};

export function AnimatedTileBorder({ active, tone = "yellow" }: Props) {
  if (!active) return null;

  return (
    <div
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden rounded-2xl"
      aria-hidden
    >
      <div
        className={cn(
          "achievement-border-spin absolute left-1/2 top-1/2 h-[160%] w-[160%] -translate-x-1/2 -translate-y-1/2",
          tone === "gold"
            ? "bg-[conic-gradient(from_0deg,transparent_0deg,rgba(251,191,36,0.9)_80deg,transparent_160deg,rgba(251,191,36,0.45)_240deg,transparent_320deg)]"
            : "bg-[conic-gradient(from_0deg,transparent_0deg,rgba(234,179,8,0.95)_80deg,transparent_160deg,rgba(234,179,8,0.5)_240deg,transparent_320deg)]",
        )}
      />
    </div>
  );
}
