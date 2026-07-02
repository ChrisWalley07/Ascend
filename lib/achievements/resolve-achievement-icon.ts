import {
  Activity,
  Crown,
  Dumbbell,
  Flag,
  Flame,
  Footprints,
  Gauge,
  Map,
  Medal,
  Star,
  Target,
  Timer,
  Trophy,
  Weight,
  Zap,
  type LucideIcon,
} from "lucide-react";

import type { AchievementIcon } from "@/features/athlete-achievements/types/icon";

const ACHIEVEMENT_ICONS: Record<string, LucideIcon> = {
  activity: Activity,
  dumbbell: Dumbbell,
  timer: Timer,
  flame: Flame,
  flag: Flag,
  medal: Medal,
  footprints: Footprints,
  gauge: Gauge,
  map: Map,
  weight: Weight,
  trophy: Trophy,
  crown: Crown,
  star: Star,
  target: Target,
  zap: Zap,
};

export function resolveAchievementIcon(icon: AchievementIcon): LucideIcon {
  return ACHIEVEMENT_ICONS[icon.name] ?? Star;
}
