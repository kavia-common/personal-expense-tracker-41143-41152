import React, { useMemo } from "react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { Card, EmptyState } from "../components/ui";
import { useExpenseData } from "../hooks/useExpenseData";
import { formatCurrency } from "../lib/utils";

const COLORS = ["#F472B6", "#F59E0B", "#10B981", "#60A5FA", "#A78BFA", "#FCA5A5", "#34D399", "#FBBF24"];

// PUBLIC_INTERFACE
export function AnalyticsPage() {
  /** Analytics with simple charts (category pie + daily bar). */
  const { loading, error, categories, expenses, categoryById } = useExpenseData();

  const pieData = useMemo(() => {
    const map = new Map();
    for (const e of expenses) {
      const key = e.category_id || "uncategorized";
      map.set(key, (map.get(key) || 0) + Number(e.amount || 0));
    }
    return [...map.entries()]
      .map(([categoryId, value]) => ({
        categoryId,
        name: categoryId === "uncategorized" ? "Uncategorized" : categoryById.get(categoryId)?.name || "Unknown",
        value,
      }))
      .filter((d) => d.value > 0)
      .sort((a, b) => b.value - a.value);
  }, [expenses, categoryById]);

  const dailyData = useMemo(() => {
    const map = new Map();
    for (const e of expenses) {
      const d = e.date;
      if (!d) continue;
      map.set(d, (map.get(d) || 0) + Number(e.amount || 0));
    }
    const rows = [...map.entries()].map(([date, total]) => ({ date, total }));
    rows.sort((a, b) => (a.date || "").localeCompare(b.date || ""));
    // keep last 14 points for a simple, readable chart
    return rows.slice(Math.max(0, rows.length - 14));
  }, [expenses]);

  const hasData = expenses.length > 0;

  return (
    <div className="grid2">
      <Card title="Spending by category" subtitle="All time">
        {loading ? (
          <div className="muted">Loading…</div>
        ) : error ? (
          <div className="alert alertError">{error.message || "Failed to load."}</div>
        ) : !hasData ? (
          <EmptyState title="No data yet" description="Add expenses to see analytics." />
        ) : (
          <div className="chartWrap">
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={70} outerRadius={110} paddingAngle={2}>
                  {pieData.map((entry, idx) => (
                    <Cell key={entry.categoryId} fill={COLORS[idx % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => formatCurrency(v)} />
              </PieChart>
            </ResponsiveContainer>

            <div className="legend">
              {pieData.slice(0, 8).map((d, idx) => (
                <div className="legendRow" key={d.categoryId}>
                  <span className="legendSwatch" style={{ background: COLORS[idx % COLORS.length] }} />
                  <span className="legendName">{d.name}</span>
                  <span className="legendValue">{formatCurrency(d.value)}</span>
                </div>
              ))}
              {pieData.length === 0 && (
                <div className="muted">Create some categories (optional) to improve breakdown clarity.</div>
              )}
            </div>
          </div>
        )}
      </Card>

      <Card title="Daily totals" subtitle="Last 14 days (based on recorded dates)">
        {loading ? (
          <div className="muted">Loading…</div>
        ) : error ? (
          <div className="alert alertError">{error.message || "Failed to load."}</div>
        ) : !hasData ? (
          <EmptyState title="No data yet" description="Add expenses to see daily totals." />
        ) : (
          <div className="chartWrap">
            <ResponsiveContainer width="100%" height={340}>
              <BarChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(55,65,81,0.12)" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={(v) => formatCurrency(v)} />
                <Bar dataKey="total" fill="#F472B6" radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </Card>
    </div>
  );
}
