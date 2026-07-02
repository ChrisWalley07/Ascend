import { Flag } from "lucide-react";

import { CreateGoalForm } from "@/components/goals/create-goal-form";
import { GoalsList } from "@/components/goals/goals-list";
import { PageHeader } from "@/components/ui/page-header";
import { requireUser } from "@/lib/auth";
import { getPrismaClient } from "@/lib/prisma";

async function getGoals(userId: string) {
  const prisma = getPrismaClient();
  if (!prisma) return [];

  return prisma.goal.findMany({
    where: { userId },
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    select: {
      id: true,
      title: true,
      currentValue: true,
      targetValue: true,
      unit: true,
      status: true,
      createdAt: true,
      targetDate: true,
    },
  });
}

export default async function GoalsPage() {
  const user = await requireUser();
  const goals = await getGoals(user.id);

  const active = goals.filter((g) => g.status === "ACTIVE");
  const completed = goals.filter((g) => g.status !== "ACTIVE");

  return (
    <div className="min-h-screen">
      <div className="px-5 py-6 lg:px-8 lg:py-8 space-y-6">
        <PageHeader
          title="Goals"
          subtitle={`${active.length} active · ${completed.length} completed`}
          icon={Flag}
          accentIcon
        />
        <CreateGoalForm />
        <GoalsList goals={goals} />
      </div>
    </div>
  );
}
