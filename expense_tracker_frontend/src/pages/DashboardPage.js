import React, { useMemo } from "react";
import { useExpenseData } from "../hooks/useExpenseData";
import { Card, EmptyState } from "../components/ui";
import { formatCurrency, startOfMonth, endOfMonth, toISODateInputValue } from "../lib/utils";
import { ExpenseForm } from "./ExpenseForm";

// PUBLIC_INTERFACE
export function DashboardPage() {
  /** Dashboard summary with monthly totals and category breakdown. */
  const { loading, error, categories, expenses, addExpense, categoryById } = useExpenseData();

  const now = new Date();
  const from = startOfMonth(now);
  const to = endOfMonth(now);
  const fromISO = toISODateInputValue(from);
  const toISO = toISODateInputValue(to);

  const monthExpenses = useMemo(() => {
    return expenses.filter((e) => (e.date || "") >= fromISO && (e.date || "") <= toISO);
  }, [expenses, fromISO, toISO]);

  const monthTotal = useMemo(() => monthExpenses.reduce((sum, e) => sum + Number(e.amount || 0), 0), [monthExpenses]);

  const byCategory = useMemo(() => {
    const map = new Map();
    for (const e of monthExpenses) {
      const key = e.category_id || "uncategorized";
      map.set(key, (map.get(key) || 0) + Number(e.amount || 0));
    }
    const rows = [...map.entries()].map(([categoryId, total]) => ({
      categoryId,
      total,
      name: categoryId === "uncategorized" ? "Uncategorized" : categoryById.get(categoryId)?.name || "Unknown",
    }));
    rows.sort((a, b) => b.total - a.total);
    return rows;
  }, [monthExpenses, categoryById]);

  return (
    <div className="grid2">
      <div className="stackLg">
        <div className="grid3">
          <Card title="This month" subtitle={`${fromISO} → ${toISO}`}>
            <div className="bigNumber">{formatCurrency(monthTotal)}</div>
            <div className="muted">Total spending for the current month.</div>
          </Card>

          <Card title="Transactions" subtitle="This month">
            <div className="bigNumber">{monthExpenses.length}</div>
            <div className="muted">Number of expenses recorded.</div>
          </Card>

          <Card title="Top category" subtitle="This month">
            <div className="bigNumber">{byCategory[0]?.name || "—"}</div>
            <div className="muted">{byCategory[0] ? formatCurrency(byCategory[0].total) : "No data yet."}</div>
          </Card>
        </div>

        <Card title="Add expense" subtitle="Quickly record a transaction">
          <ExpenseForm categories={categories} onSubmit={addExpense} />
        </Card>
      </div>

      <div className="stackLg">
        <Card title="Breakdown by category" subtitle="This month">
          {loading ? (
            <div className="muted">Loading…</div>
          ) : error ? (
            <div className="alert alertError">{error.message || "Failed to load."}</div>
          ) : byCategory.length === 0 ? (
            <EmptyState title="No expenses yet" description="Add an expense to see a by-category breakdown." />
          ) : (
            <div className="list">
              {byCategory.map((row) => (
                <div className="listRow" key={row.categoryId}>
                  <div className="listLeft">
                    <div className="dot" />
                    <div className="listTitle">{row.name}</div>
                  </div>
                  <div className="listRight">{formatCurrency(row.total)}</div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card title="Tips" subtitle="Keep it tidy">
          <ul className="tips">
            <li>Use categories to understand where your money goes.</li>
            <li>Add a note for unusual purchases.</li>
            <li>Review Analytics for trend and category insights.</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
