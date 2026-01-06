import React, { useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Card, Button, Input } from "../components/ui";

// PUBLIC_INTERFACE
export function AuthPage() {
  /** Auth page for sign-in/sign-up (Supabase) or local guest mode when Supabase isn't configured. */
  const { user, isSupabaseConfigured, signIn, signUp, signInGuest } = useAuth();

  const [mode, setMode] = useState("signIn"); // signIn | signUp
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const canSubmit = useMemo(() => {
    if (!email.trim()) return false;
    if (isSupabaseConfigured) return password.length >= 6;
    return true;
  }, [email, password, isSupabaseConfigured]);

  if (user && (!isSupabaseConfigured || user.id !== "guest")) {
    return <Navigate to="/" replace />;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      if (!isSupabaseConfigured) {
        // local mode ignores password
        if (mode === "signUp") await signUp({ email, password });
        else await signIn({ email, password });
        return;
      }

      if (mode === "signUp") await signUp({ email, password });
      else await signIn({ email, password });
    } catch (err) {
      setError(err?.message || "Failed to authenticate.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="authRoot">
      <div className="authPanel">
        <div className="authBrand">
          <div className="authMark" aria-hidden="true" />
          <div>
            <div className="authTitle">Ocean Expenses</div>
            <div className="authSubtitle">Elegant personal expense tracking</div>
          </div>
        </div>

        <Card
          title={isSupabaseConfigured ? (mode === "signIn" ? "Sign in" : "Create account") : "Continue locally"}
          subtitle={
            isSupabaseConfigured
              ? "Use your email and password."
              : "Supabase is not configured. Continue with a local session (stored in this browser)."
          }
          right={
            isSupabaseConfigured ? (
              <div className="segmented" role="tablist" aria-label="Auth mode">
                <button
                  className={mode === "signIn" ? "segBtn active" : "segBtn"}
                  onClick={() => setMode("signIn")}
                  type="button"
                >
                  Sign in
                </button>
                <button
                  className={mode === "signUp" ? "segBtn active" : "segBtn"}
                  onClick={() => setMode("signUp")}
                  type="button"
                >
                  Sign up
                </button>
              </div>
            ) : null
          }
        >
          <form onSubmit={handleSubmit} className="stack">
            <Input
              label="Email"
              type="email"
              value={email}
              autoComplete="email"
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />

            {isSupabaseConfigured && (
              <Input
                label="Password"
                type="password"
                value={password}
                autoComplete={mode === "signUp" ? "new-password" : "current-password"}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                required
              />
            )}

            {error && <div className="alert alertError">{error}</div>}

            <div className="row">
              <Button type="submit" disabled={!canSubmit || submitting}>
                {submitting ? "Please wait..." : isSupabaseConfigured ? (mode === "signIn" ? "Sign in" : "Sign up") : "Start"}
              </Button>

              {!isSupabaseConfigured && (
                <Button type="button" variant="ghost" onClick={signInGuest}>
                  Continue as Guest
                </Button>
              )}
            </div>

            {!isSupabaseConfigured && (
              <div className="fineprint">
                To enable Supabase auth + cloud sync, set <code>REACT_APP_SUPABASE_URL</code> and{" "}
                <code>REACT_APP_SUPABASE_KEY</code>.
              </div>
            )}
          </form>
        </Card>
      </div>
    </div>
  );
}
