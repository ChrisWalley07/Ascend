"use client";

import { motion, useMotionValueEvent, useSpring } from "framer-motion";
import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

type Props = {
  value: number;
  className?: string;
  suffix?: string;
};

/**
 * Spring-animated counter (Reanimated-style shared value on web).
 * Only triggers text updates — wrapper uses compositor-friendly motion.
 */
export function AnimatedPercentCounter({ value, className, suffix = "%" }: Props) {
  const spring = useSpring(0, { stiffness: 90, damping: 22, mass: 0.8 });
  const [text, setText] = useState(`0${suffix}`);

  useMotionValueEvent(spring, "change", (v) => {
    setText(`${Math.round(v)}${suffix}`);
  });

  useEffect(() => {
    spring.set(value);
  }, [spring, value]);

  return (
    <motion.span
      className={cn("tabular-nums", className)}
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
    >
      {text}
    </motion.span>
  );
}
