"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import type { SportDepartment } from "@prisma/client";

import { ensureDbUser } from "@/lib/ensure-db-user";
import { isValidDepartment } from "@/lib/departments";
import { getPrismaClient } from "@/lib/prisma";
import { isSupabaseConfigured, SUPABASE_SETUP_MESSAGE } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import { forgotPasswordSchema, loginSchema, signUpSchema } from "@/lib/validations/auth";

async function getSupabaseOrError() {
  if (!isSupabaseConfigured()) {
    return { error: SUPABASE_SETUP_MESSAGE } as const;
  }

  const supabase = await createClient();
  if (!supabase) {
    return { error: SUPABASE_SETUP_MESSAGE } as const;
  }

  return { supabase } as const;
}

export async function signUpAction(payload: FormData) {
  return signUpActionWithState(undefined, payload);
}

export async function signUpActionWithState(_: { error?: string; success?: string } | undefined, payload: FormData) {
  const validated = signUpSchema.safeParse({
    name: payload.get("name"),
    email: payload.get("email"),
    password: payload.get("password"),
  });

  if (!validated.success) {
    return { error: validated.error.issues[0]?.message ?? "Invalid signup data" };
  }

  const supabaseResult = await getSupabaseOrError();
  if ("error" in supabaseResult) {
    return { error: supabaseResult.error };
  }
  const { supabase } = supabaseResult;

  const { data, error } = await supabase.auth.signUp({
    email: validated.data.email,
    password: validated.data.password,
    options: {
      data: {
        name: validated.data.name,
      },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/auth/callback`,
    },
  });

  if (error) {
    return { error: error.message };
  }

  if (data.user) {
    await ensureDbUser(data.user);

    const departmentRaw = payload.get("department");
    if (departmentRaw && isValidDepartment(String(departmentRaw))) {
      const prisma = getPrismaClient();
      if (prisma) {
        await prisma.athleteProfile.update({
          where: { userId: data.user.id },
          data: { sportDepartment: departmentRaw as SportDepartment },
        });
      }
    }
  }

  return { success: "Account created. Check your email to verify." };
}

export async function loginAction(payload: FormData) {
  return loginActionWithState(undefined, payload);
}

export async function loginActionWithState(_: { error?: string; success?: string } | undefined, payload: FormData) {
  const validated = loginSchema.safeParse({
    email: payload.get("email"),
    password: payload.get("password"),
  });

  if (!validated.success) {
    return { error: validated.error.issues[0]?.message ?? "Invalid login data" };
  }

  const supabaseResult = await getSupabaseOrError();
  if ("error" in supabaseResult) {
    return { error: supabaseResult.error };
  }
  const { supabase } = supabaseResult;

  const { data, error } = await supabase.auth.signInWithPassword({
    email: validated.data.email,
    password: validated.data.password,
  });

  if (error) {
    return { error: error.message };
  }

  if (data.user) {
    await ensureDbUser(data.user);
  }

  revalidatePath("/dashboard");
  redirect("/dashboard");
}

export async function forgotPasswordAction(payload: FormData) {
  return forgotPasswordActionWithState(undefined, payload);
}

export async function forgotPasswordActionWithState(
  _: { error?: string; success?: string } | undefined,
  payload: FormData,
) {
  const validated = forgotPasswordSchema.safeParse({
    email: payload.get("email"),
  });

  if (!validated.success) {
    return { error: validated.error.issues[0]?.message ?? "Invalid email" };
  }

  const supabaseResult = await getSupabaseOrError();
  if ("error" in supabaseResult) {
    return { error: supabaseResult.error };
  }
  const { supabase } = supabaseResult;

  const { error } = await supabase.auth.resetPasswordForEmail(validated.data.email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/auth/reset-password`,
  });

  if (error) {
    return { error: error.message };
  }

  return { success: "Password reset link sent." };
}

export async function signOutAction() {
  const supabase = await createClient();
  if (supabase) {
    await supabase.auth.signOut();
  }
  redirect("/login");
}
