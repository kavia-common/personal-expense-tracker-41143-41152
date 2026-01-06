import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { createRepository } from "../data/repository";
import { getEnv } from "../config/env";

const AuthContext = createContext(null);

// PUBLIC_INTERFACE
export function AuthProvider({ children }) {
  /** Provides auth state and actions across the app. */
  const repo = useMemo(() => createRepository(), []);
  const { isSupabaseConfigured } = getEnv();

  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);
  const user = session?.user || null;

  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        const s = await repo.getSession();
        if (!cancelled) setSession(s);

        // In local mode, if no session exists, start a guest session automatically for smoother UX.
        if (!isSupabaseConfigured && !s) {
          const guest = await repo.signInGuest();
          if (!cancelled) setSession(guest);
        }
      } catch {
        // If Supabase is configured but session fetch fails, stay unauthenticated.
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    init();
    return () => {
      cancelled = true;
    };
  }, [repo, isSupabaseConfigured]);

  // PUBLIC_INTERFACE
  const signUp = async ({ email, password }) => {
    /** Signs up user (Supabase) or creates local session. */
    const res = await repo.signUp({ email, password });
    setSession(res.session || (res.user ? { user: res.user } : null));
    return res;
  };

  // PUBLIC_INTERFACE
  const signIn = async ({ email, password }) => {
    /** Signs in user (Supabase) or creates local session. */
    const res = await repo.signIn({ email, password });
    setSession(res.session || (res.user ? { user: res.user } : null));
    return res;
  };

  // PUBLIC_INTERFACE
  const signInGuest = async () => {
    /** Starts local guest session when available. */
    const s = await repo.signInGuest();
    setSession(s);
    return s;
  };

  // PUBLIC_INTERFACE
  const signOut = async () => {
    /** Signs out and clears session. */
    await repo.signOut();
    setSession(null);

    if (!isSupabaseConfigured) {
      const guest = await repo.signInGuest();
      setSession(guest);
    }
  };

  const value = useMemo(
    () => ({
      repo,
      loading,
      session,
      user,
      isSupabaseConfigured,
      signUp,
      signIn,
      signInGuest,
      signOut,
    }),
    [repo, loading, session, user, isSupabaseConfigured]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// PUBLIC_INTERFACE
export function useAuth() {
  /** Hook to access auth context. */
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
