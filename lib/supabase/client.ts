"use client";

import { createBrowserClient } from "@supabase/ssr";

import { getSupabaseAnonKey, getSupabaseSetupMessage, getSupabaseUrl } from "@/lib/supabase/env";

export function createClient() {
  const supabaseUrl = getSupabaseUrl();
  const supabaseAnonKey = getSupabaseAnonKey();

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(getSupabaseSetupMessage());
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
