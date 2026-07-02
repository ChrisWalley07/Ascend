"use client";

import { createContext, useContext } from "react";

import type { SportContext } from "@/lib/sports/types";

const SportContextReact = createContext<SportContext | null>(null);

export function SportProvider({
  value,
  children,
}: {
  value: SportContext;
  children: React.ReactNode;
}) {
  return <SportContextReact.Provider value={value}>{children}</SportContextReact.Provider>;
}

export function useSport() {
  const ctx = useContext(SportContextReact);
  if (!ctx) throw new Error("useSport must be used within SportProvider");
  return ctx;
}
