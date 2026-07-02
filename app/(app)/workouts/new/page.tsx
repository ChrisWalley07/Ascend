import { Sparkles } from "lucide-react";

import { AiWorkoutLogger } from "@/components/workouts/ai-workout-logger";
import { ManualWorkoutToggle } from "@/components/workouts/manual-workout-toggle";
import { PageHeader } from "@/components/ui/page-header";
import { requireUser } from "@/lib/auth";
import { getPrismaClient } from "@/lib/prisma";

const fallbackExercises = [
  { name: "Back Squat", category: "Power Lifts", movementType: "Strength", primaryMuscles: ["Quads", "Glutes"] },
  { name: "Snatch", category: "Olympic Lifts", movementType: "Skill", primaryMuscles: ["Posterior Chain", "Shoulders"] },
  { name: "Clean and Jerk", category: "Olympic Lifts", movementType: "Skill", primaryMuscles: ["Full Body"] },
  { name: "Clean", category: "Olympic Lifts", movementType: "Skill", primaryMuscles: ["Full Body"] },
  { name: "Thruster", category: "Accessories", movementType: "Metcon", primaryMuscles: ["Quads", "Shoulders"] },
  { name: "Deadlift", category: "Power Lifts", movementType: "Strength", primaryMuscles: ["Hamstrings", "Back"] },
  { name: "Front Squat", category: "Power Lifts", movementType: "Strength", primaryMuscles: ["Quads", "Core"] },
  { name: "Pull Up", category: "Gymnastics", movementType: "Bodyweight", primaryMuscles: ["Lats", "Biceps"] },
  { name: "Row", category: "Rowing", movementType: "Engine", primaryMuscles: ["Full Body"] },
  { name: "Wall Ball", category: "Accessories", movementType: "Metcon", primaryMuscles: ["Quads", "Shoulders"] },
];

async function getExerciseOptions() {
  const prisma = getPrismaClient();
  if (!prisma) {
    return fallbackExercises.map((exercise, index) => ({ id: `fallback-${index}`, name: exercise.name }));
  }

  const count = await prisma.exercise.count();
  if (count === 0) {
    await prisma.exercise.createMany({ data: fallbackExercises, skipDuplicates: true });
  }

  return prisma.exercise.findMany({
    orderBy: [{ category: "asc" }, { name: "asc" }],
    select: { id: true, name: true },
  });
}

export default async function NewWorkoutPage() {
  await requireUser();
  const exercises = await getExerciseOptions();

  return (
    <div className="min-h-screen">
      <div className="px-5 py-6 lg:px-8 lg:py-8 max-w-3xl space-y-6">
        <PageHeader
          title="Log Workout"
          subtitle="Describe what you did — AI handles the rest."
          icon={Sparkles}
          accentIcon
        />
        <AiWorkoutLogger />
        <ManualWorkoutToggle exercises={exercises} />
      </div>
    </div>
  );
}
