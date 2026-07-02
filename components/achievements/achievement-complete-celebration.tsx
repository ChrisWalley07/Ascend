"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Sparkles } from "lucide-react";

type Props = {
  active: boolean;
  title: string;
};

const PARTICLES = Array.from({ length: 12 }, (_, i) => ({
  id: i,
  angle: (i / 12) * Math.PI * 2,
  distance: 48 + (i % 3) * 16,
}));

export function AchievementCompleteCelebration({ active, title }: Props) {
  useEffect(() => {
    if (!active) return;
    const timer = window.setTimeout(() => {}, 2400);
    return () => window.clearTimeout(timer);
  }, [active]);

  return (
    <AnimatePresence>
      {active && (
        <motion.div
          className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center overflow-hidden rounded-2xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          <motion.div
            className="absolute inset-0 bg-black/55 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          <motion.div
            className="absolute h-40 w-40 rounded-full border-2 border-lime/60"
            initial={{ scale: 0.4, opacity: 0.9 }}
            animate={{ scale: 2.2, opacity: 0 }}
            transition={{ duration: 1.1, ease: "easeOut" }}
          />
          <motion.div
            className="absolute h-28 w-28 rounded-full border border-amber-400/70"
            initial={{ scale: 0.5, opacity: 0.8 }}
            animate={{ scale: 2.6, opacity: 0 }}
            transition={{ duration: 1.3, delay: 0.1, ease: "easeOut" }}
          />

          {PARTICLES.map((particle) => (
            <motion.span
              key={particle.id}
              className="absolute h-2 w-2 rounded-full bg-lime"
              initial={{ x: 0, y: 0, scale: 0, opacity: 1 }}
              animate={{
                x: Math.cos(particle.angle) * particle.distance,
                y: Math.sin(particle.angle) * particle.distance,
                scale: [0, 1.2, 0],
                opacity: [1, 1, 0],
              }}
              transition={{ duration: 0.9, ease: "easeOut" }}
            />
          ))}

          <motion.div
            className="relative z-10 flex flex-col items-center gap-2 px-6 text-center"
            initial={{ scale: 0.6, opacity: 0, y: 12 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", stiffness: 320, damping: 22 }}
          >
            <motion.div
              animate={{ rotate: [0, -8, 8, 0] }}
              transition={{ duration: 0.6, delay: 0.15 }}
            >
              <Sparkles className="h-10 w-10 text-lime" />
            </motion.div>
            <p className="text-sm font-bold uppercase tracking-widest text-lime">
              Achievement Unlocked
            </p>
            <p className="max-w-[14rem] text-base font-semibold text-foreground">{title}</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
