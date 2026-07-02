"use client";

import { motion } from "framer-motion";

import { usePrefersReducedMotion } from "@/components/achievements/animations/use-prefers-reduced-motion";
import { cn } from "@/lib/utils";

type ConnectorState = "locked" | "active" | "completed";

type Props = {
  state: ConnectorState;
  className?: string;
};

export function SkillTreeConnector({ state, className }: Props) {
  const reducedMotion = usePrefersReducedMotion();
  const isLit = state === "completed" || state === "active";

  return (
    <div className={cn("relative flex flex-col items-center py-1", className)} aria-hidden>
      <div
        className={cn(
          "h-3 w-3 rotate-45 border-2 transition-colors duration-500",
          state === "completed" && "border-lime bg-lime/30",
          state === "active" && "border-lime/70 bg-lime/10",
          state === "locked" && "border-zinc-700 bg-zinc-900",
        )}
      />
      <div className="relative h-10 w-0.5 overflow-hidden rounded-full bg-zinc-800">
        <motion.div
          className={cn(
            "absolute inset-x-0 top-0 w-full origin-top rounded-full",
            isLit ? "bg-gradient-to-b from-lime via-lime/70 to-lime/20" : "bg-zinc-700",
          )}
          initial={{ height: "0%" }}
          animate={{ height: state === "completed" ? "100%" : state === "active" ? "55%" : "0%" }}
          transition={
            reducedMotion
              ? { duration: 0 }
              : { duration: 0.7, ease: [0.22, 1, 0.36, 1] }
          }
        />
        {state === "active" && !reducedMotion && (
          <motion.div
            className="absolute inset-x-0 h-3 w-full bg-lime/60 blur-[2px]"
            animate={{ top: ["0%", "80%", "0%"] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
          />
        )}
      </div>
      <div
        className={cn(
          "h-0 w-0 border-x-[6px] border-t-[8px] border-x-transparent transition-colors duration-500",
          state === "completed" && "border-t-lime",
          state === "active" && "border-t-lime/60",
          state === "locked" && "border-t-zinc-700",
        )}
      />
    </div>
  );
}
