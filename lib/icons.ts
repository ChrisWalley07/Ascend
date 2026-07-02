import {
  Activity,
  BarChart3,
  Brain,
  Dumbbell,
  Flag,
  Flame,
  Gauge,
  Medal,
  Target,
  Trophy,
  Zap,
  type LucideIcon,
} from "lucide-react";

export const ICONS = {
  activity: Activity,
  "bar-chart": BarChart3,
  brain: Brain,
  dumbbell: Dumbbell,
  flag: Flag,
  flame: Flame,
  gauge: Gauge,
  medal: Medal,
  target: Target,
  trophy: Trophy,
  zap: Zap,
} as const;

export type IconName = keyof typeof ICONS;

export function getIcon(name: IconName): LucideIcon {
  return ICONS[name];
}

/** Maps athlete score category keys to icon names */
export const CATEGORY_ICON_NAMES: Record<string, IconName> = {
  strengthScore: "dumbbell",
  engineScore: "activity",
  olympicScore: "zap",
  gymnasticsScore: "target",
  powerScore: "flame",
  consistencyScore: "bar-chart",
  recoveryScore: "gauge",
  mobilityScore: "brain",
};
