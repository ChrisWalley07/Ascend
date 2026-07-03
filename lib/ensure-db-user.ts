import type { User as SupabaseUser } from "@supabase/supabase-js";

import { getPrismaClient } from "@/lib/prisma";
import { isMissingSchemaError } from "@/lib/prisma/schema-compat";

export function displayName(user: SupabaseUser): string {
  const meta = user.user_metadata?.name;
  if (typeof meta === "string" && meta.trim()) return meta.trim();
  if (user.email) return user.email.split("@")[0] ?? "Athlete";
  return "Athlete";
}

/** Ensure Supabase auth user exists in Postgres (required for workouts, PBs, etc.) */
export async function ensureDbUser(user: SupabaseUser): Promise<boolean> {
  const prisma = getPrismaClient();
  if (!prisma) return false;

  const email = user.email;
  if (!email) return false;

  const name = displayName(user);

  try {
    const existingByEmail = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (existingByEmail && existingByEmail.id !== user.id) {
      console.error("[auth] ensureDbUser email conflict", {
        authUserId: user.id,
        existingUserId: existingByEmail.id,
      });
      return false;
    }

    await prisma.user.upsert({
      where: { id: user.id },
      create: { id: user.id, email },
      update: { email },
    });

    await prisma.athleteProfile.upsert({
      where: { userId: user.id },
      create: { userId: user.id, name },
      update: { name },
    });

    return true;
  } catch (error) {
    if (isMissingSchemaError(error)) {
      try {
        await prisma.user.upsert({
          where: { id: user.id },
          create: { id: user.id, email },
          update: { email },
        });
        await prisma.athleteProfile.upsert({
          where: { userId: user.id },
          create: { userId: user.id, name },
          update: { name },
        });
        return true;
      } catch (retryError) {
        console.error("[auth] ensureDbUser retry failed", retryError);
        return false;
      }
    }

    console.error("[auth] ensureDbUser failed", error);
    return false;
  }
}
