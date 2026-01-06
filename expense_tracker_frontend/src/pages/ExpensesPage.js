import React, { useMemo, useState } from "react";
import { Card, Button, EmptyState, Select, Input } from "../components/ui";
import { useExpenseData } from "../hooks/useExpenseData";
import { ExpenseForm } from "./ExpenseForm";
import { formatCurrency } from "../lib/utils";

// PUBLIC_INTERFACE
export function ExpensesPage() {
  /** Expenses list with filters, sort, edit and delete. */
  const { loading, error, categories, expenses, addExpense, updateExpense, deleteExpense, categoryById } = useExpenseData();

  const [filterCategory, setFilterCategory] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [sortKey, setSortKey] = useState("date_desc"); // date_desc | date_asc | amount_desc | amount_asc

  const [editingId, setEditingId] = useState(null);

  const filtered = useMemo(() => {
    let rows = expenses.slice();

    if (filterCategory) rows = rows.filter((e) => (e.category_id || "") === filterCategory);
    if (from) rows = rows.filter((e) => (e.date || "") >= from);
    if (to) rows = rows.filter((e) => (e.date || "") <= to);

    rows.sort((a, b) => {
      if (sortKey === "date_asc") return (a.date || "").localeCompare(b.date || "");
      if (sortKey === "amount_desc") return Number(b.amount || 0) - Number(a.amount || 0);
      if (sortKey === "amount_asc") return Number(a.amount || 0) - Number(b.amount || 0);
      return (b.date || "").localeCompare(a.date || "");
    });

    return rows;
  }, [expenses, filterCategory, from, to, sortKey]);

  const editingExpense = useMemo(() => expenses.find((e) => e.id === editingId) || null, [expenses, editingId]);

  return (
    <div className="stackLg">
      <Card title="Add expense" subtitle="Record a transaction">
        <ExpenseForm categories={categories} onSubmit={addExpense} />
      </Card>

      <Card
        title="Expenses"
        subtitle="View, filter, sort, edit, and delete"
        right={
          <div className="filters">
            <Select label="Category" value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
              <option value="">All</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
            <Input label="From" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
            <Input label="To" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
            <Select label="Sort" value={sortKey} onChange={(e) => setSortKey(e.target.value)}>
              <option value="date_desc">Date ↓</option>
              <option value="date_asc">Date ↑</option>
              <option value="amount_desc">Amount ↓</option>
              <option value="amount_asc">Amount ↑</option>
            </Select>
          </div>
        }
      >
        {loading ? (
          <div className="muted">Loading…</div>
        ) : error ? (
          <div className="alert alertError">{error.message || "Failed to load."}</div>
        ) : filtered.length === 0 ? (
          <EmptyState title="No expenses" description="Add an expense or adjust your filters." />
        ) : (
          <div className="tableWrap" role="region" aria-label="Expenses table">
            <table className="table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Category</th>
                  <th className="right">Amount</th>
                  <th>Note</th>
                  <th className="right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((e) => (
                  <tr key={e.id}>
                    <td className="mono">{e.date}</td>
                    <td>{e.category_id ? categoryById.get(e.category_id)?.name || "Unknown" : "Uncategorized"}</td>
                    <td className="right strong">{formatCurrency(e.amount)}</td>
                    <td className="muted">{e.note || "—"}</td>
                    <td className="right">
                      <div className="row rowTight">
                        <Button variant="ghost" onClick={() => setEditingId(e.id)}>
                          Edit
                        </Button>
                        <Button variant="danger" onClick={() => deleteExpense(e.id)}>
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {editingExpense && (
        <Card
          title="Edit expense"
          subtitle="Update and save"
          right={
            <Button variant="ghost" onClick={() => setEditingId(null)}>
              Close
            </Button>
          }
        >
          <ExpenseForm
            categories={categories}
            initialValue={editingExpense}
            submitLabel="Save changes"
            onCancel={() => setEditingId(null)}
            onSubmit={async (payload) => {
              await updateExpense(editingExpense.id, payload);
              setEditingId(null);
            }}
          />
        </Card>
      )}
    </div>
  );
}
