"use client";

import { useIsMobile } from "@/lib/hooks/use-is-mobile";
import { usePrefersReducedMotion } from "@/components/achievements/animations/use-prefers-reduced-motion";

/** True when we should skip heavy Framer Motion work (mobile or reduced-motion). */
export function useLightMotion(): boolean {
  const reduced = usePrefersReducedMotion();
  const isMobile = useIsMobile();
  return reduced || isMobile;
}
