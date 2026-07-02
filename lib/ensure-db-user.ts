import type { User as SupabaseUser } from "@supabase/supabase-js";

import { getPrismaClient } from "@/lib/prisma";

function displayName(user: SupabaseUser): string {
  const meta = user.user_metadata?.name;
  if (typeof meta === "string" && meta.trim()) return meta.trim();
  if (user.email) return user.email.split("@")[0] ?? "Athlete";
  return "Athlete";
}

/** Ensure Supabase auth user exists in Postgres (required for workouts, PBs, etc.) */
export async function ensureDbUser(user: SupabaseUser) {
  const prisma = getPrismaClient();
  if (!prisma) return;

  const email = user.email;
  if (!email) return;

  const name = displayName(user);

  await prisma.user.upsert({
    where: { id: user.id },
    create: {
      id: user.id,
      email,
      athleteProfile: {
        create: { name },
      },
    },
    update: { email },
  });

  const profile = await prisma.athleteProfile.findUnique({
    where: { userId: user.id },
    select: { id: true },
  });

  if (!profile) {
    await prisma.athleteProfile.create({
      data: { userId: user.id, name },
    });
  }
}
