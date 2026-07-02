"use client";

import { useEffect, useRef } from "react";
import { animate } from "framer-motion";

interface CountUpProps {
  value: number;
  duration?: number;
  decimals?: number;
  className?: string;
  prefix?: string;
  suffix?: string;
}

export function CountUp({
  value,
  duration = 1.4,
  decimals = 0,
  className,
  prefix = "",
  suffix = "",
}: CountUpProps) {
  const nodeRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const node = nodeRef.current;
    if (!node) return;

    const controls = animate(0, value, {
      duration,
      ease: [0.25, 0.46, 0.45, 0.94],
      onUpdate(v) {
        node.textContent = prefix + v.toFixed(decimals) + suffix;
      },
    });

    return () => controls.stop();
  }, [value, duration, decimals, prefix, suffix]);

  return (
    <span ref={nodeRef} className={className}>
      {prefix}0{suffix}
    </span>
  );
}
