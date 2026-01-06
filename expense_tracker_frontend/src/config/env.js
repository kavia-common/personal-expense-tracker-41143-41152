/**
 * Environment variable access for the frontend.
 * IMPORTANT: Do not read .env directly. CRA exposes env vars prefixed with REACT_APP_ at build time.
 */

// PUBLIC_INTERFACE
export function getEnv() {
  /** Returns relevant environment configuration for the app. */
  const supabaseUrl = (process.env.REACT_APP_SUPABASE_URL || "").trim();
  const supabaseAnonKey = (process.env.REACT_APP_SUPABASE_KEY || "").trim();

  return {
    supabaseUrl,
    supabaseAnonKey,
    isSupabaseConfigured: Boolean(supabaseUrl) && Boolean(supabaseAnonKey),
  };
}
