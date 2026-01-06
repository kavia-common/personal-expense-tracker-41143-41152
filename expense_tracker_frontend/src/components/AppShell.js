import React from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getEnv } from "../config/env";

// PUBLIC_INTERFACE
export function AppShell({ children }) {
  /** Main application shell with sidebar navigation and header. */
  const { user, signOut, isSupabaseConfigured } = useAuth();
  const env = getEnv();

  return (
    <div className="appRoot">
      <aside className="sidebar" aria-label="Primary">
        <div className="brand">
          <div className="brandMark" aria-hidden="true" />
          <div className="brandText">
            <div className="brandName">Ocean Expenses</div>
            <div className="brandTag">Elegant Tracker</div>
          </div>
        </div>

        <nav className="nav">
          <NavLink to="/" end className={({ isActive }) => (isActive ? "navLink active" : "navLink")}>
            Dashboard
          </NavLink>
          <NavLink to="/expenses" className={({ isActive }) => (isActive ? "navLink active" : "navLink")}>
            Expenses
          </NavLink>
          <NavLink to="/categories" className={({ isActive }) => (isActive ? "navLink active" : "navLink")}>
            Categories
          </NavLink>
          <NavLink to="/analytics" className={({ isActive }) => (isActive ? "navLink active" : "navLink")}>
            Analytics
          </NavLink>
        </nav>

        <div className="sidebarFooter">
          <div className="modePill" title="Persistence mode">
            {isSupabaseConfigured ? "Supabase" : "Local"}
          </div>
          <div className="sidebarMeta">
            <div className="metaLabel">Signed in as</div>
            <div className="metaValue">{user?.email || user?.id || "—"}</div>
          </div>
          <button className="btn btnGhost" onClick={signOut}>
            Sign out
          </button>

          {!env.isSupabaseConfigured && (
            <div className="hint">
              Local mode uses browser storage. Set <code>REACT_APP_SUPABASE_URL</code> and{" "}
              <code>REACT_APP_SUPABASE_KEY</code> to enable Supabase.
            </div>
          )}
        </div>
      </aside>

      <main className="main">
        <header className="header">
          <div className="headerTitle">
            <div className="headerEyebrow">Personal Finance</div>
            <h1 className="headerHeading">Expense Tracker</h1>
          </div>
          <div className="headerActions" />
        </header>

        <section className="content">{children}</section>
      </main>
    </div>
  );
}
