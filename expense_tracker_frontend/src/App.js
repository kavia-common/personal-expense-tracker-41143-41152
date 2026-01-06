import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";

import { AuthProvider } from "./context/AuthContext";
import { RequireAuth } from "./components/RequireAuth";
import { AppShell } from "./components/AppShell";

import { AuthPage } from "./pages/AuthPage";
import { DashboardPage } from "./pages/DashboardPage";
import { ExpensesPage } from "./pages/ExpensesPage";
import { CategoriesPage } from "./pages/CategoriesPage";
import { AnalyticsPage } from "./pages/AnalyticsPage";

// PUBLIC_INTERFACE
function App() {
  /** Root app component with providers and routes. */
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/auth" element={<AuthPage />} />
          <Route
            path="/*"
            element={
              <RequireAuth>
                <AppShell>
                  <Routes>
                    <Route path="/" element={<DashboardPage />} />
                    <Route path="/expenses" element={<ExpensesPage />} />
                    <Route path="/categories" element={<CategoriesPage />} />
                    <Route path="/analytics" element={<AnalyticsPage />} />
                  </Routes>
                </AppShell>
              </RequireAuth>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
