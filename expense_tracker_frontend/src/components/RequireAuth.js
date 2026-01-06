import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// PUBLIC_INTERFACE
export function RequireAuth({ children }) {
  /** Redirects to /auth when Supabase is enabled and user isn't authenticated. */
  const { loading, user, isSupabaseConfigured } = useAuth();

  if (loading) return <div className="pageCenter muted">Loading…</div>;

  if (isSupabaseConfigured && !user) {
    return <Navigate to="/auth" replace />;
  }

  // In local mode, guest sessions are allowed and auto-started by AuthProvider.
  return children;
}
