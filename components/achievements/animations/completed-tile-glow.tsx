"use client";

import { cn } from "@/lib/utils";

type Props = {
  active: boolean;
  variant?: "green" | "gold";
};

export function CompletedTileGlow({ active, variant = "green" }: Props) {
  if (!active) return null;

  return (
    <div
      className={cn(
        "achievement-glow-pulse pointer-events-none absolute inset-0 rounded-2xl",
        variant === "gold"
          ? "bg-[radial-gradient(circle_at_50%_40%,rgba(251,191,36,0.35),transparent_68%)]"
          : "bg-[radial-gradient(circle_at_50%_40%,rgba(182,255,59,0.32),transparent_68%)]",
      )}
      aria-hidden
    />
  );
}
