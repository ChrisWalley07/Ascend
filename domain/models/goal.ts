import type { GoalStatus } from "@prisma/client";

export type Goal = {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  targetValue: number;
  currentValue: number;
  unit: string;
  status: GoalStatus;
  deadline: Date | null;
  sport: string | null;
  createdAt: Date;
};
