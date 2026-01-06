import { getEnv } from "../config/env";
import { createLocalRepository } from "./localRepository";
import { createSupabaseRepository } from "./supabaseRepository";

// PUBLIC_INTERFACE
export function createRepository() {
  /**
   * Creates the active repository.
   * - If Supabase env vars are configured, uses Supabase repository.
   * - Otherwise, falls back to a local-storage repository (guest-capable).
   */
  const { isSupabaseConfigured } = getEnv();
  if (isSupabaseConfigured) return createSupabaseRepository();
  return createLocalRepository();
}
