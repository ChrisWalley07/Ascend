"use client";

import { useMemo } from "react";

import { cn } from "@/lib/utils";

type Props = {
  active: boolean;
  variant?: "green" | "gold";
};

const PARTICLE_COUNT = 10;

function buildParticles() {
  return Array.from({ length: PARTICLE_COUNT }, (_, index) => {
    const angle = (index / PARTICLE_COUNT) * Math.PI * 2 + 0.3;
    const distance = 28 + (index % 3) * 10;
    return {
      id: index,
      tx: `${Math.cos(angle) * distance}px`,
      ty: `${Math.sin(angle) * distance - 12}px`,
      delay: index * 0.03,
      size: index % 2 === 0 ? 4 : 3,
    };
  });
}

export function TileConfetti({ active, variant = "green" }: Props) {
  const particles = useMemo(() => buildParticles(), []);

  if (!active) return null;

  return (
    <div
      className="pointer-events-none absolute inset-0 z-20 overflow-hidden rounded-2xl"
      aria-hidden
    >
      {particles.map((particle) => (
        <span
          key={particle.id}
          className={cn(
            "achievement-confetti-particle absolute left-1/2 top-1/2 rounded-full",
            variant === "gold" ? "bg-amber-300" : "bg-lime",
          )}
          style={{
            width: particle.size,
            height: particle.size,
            marginLeft: -particle.size / 2,
            marginTop: -particle.size / 2,
            ["--tx" as string]: particle.tx,
            ["--ty" as string]: particle.ty,
            animationDelay: `${particle.delay}s`,
          }}
        />
      ))}
    </div>
  );
}
