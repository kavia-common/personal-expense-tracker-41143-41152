import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { normalizeError } from "../lib/error";

// PUBLIC_INTERFACE
export function useExpenseData() {
  /** Loads and manages expenses and categories for the current user. */
  const { repo, user } = useAuth();
  const userId = user?.id;

  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      const [cats, exps] = await Promise.all([repo.listCategories(userId), repo.listExpenses(userId)]);
      setCategories(cats);
      setExpenses(exps);
    } catch (e) {
      // Store a normalized object so UI can reliably show `error.message`.
      setError(normalizeError(e));
    } finally {
      setLoading(false);
    }
  }, [repo, userId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const categoryById = useMemo(() => {
    const map = new Map();
    for (const c of categories) map.set(c.id, c);
    return map;
  }, [categories]);

  // PUBLIC_INTERFACE
  const addExpense = async (payload) => {
    /** Creates an expense and refreshes state. */
    if (!userId) return null;
    const created = await repo.createExpense(userId, payload);
    await refresh();
    return created;
  };

  // PUBLIC_INTERFACE
  const updateExpense = async (expenseId, payload) => {
    /** Updates an expense and refreshes state. */
    if (!userId) return null;
    const updated = await repo.updateExpense(userId, expenseId, payload);
    await refresh();
    return updated;
  };

  // PUBLIC_INTERFACE
  const deleteExpense = async (expenseId) => {
    /** Deletes an expense and refreshes state. */
    if (!userId) return false;
    const ok = await repo.deleteExpense(userId, expenseId);
    await refresh();
    return ok;
  };

  // PUBLIC_INTERFACE
  const addCategory = async ({ name }) => {
    /** Creates a category and refreshes state. */
    if (!userId) return null;
    const created = await repo.createCategory(userId, { name });
    await refresh();
    return created;
  };

  // PUBLIC_INTERFACE
  const updateCategory = async (categoryId, { name }) => {
    /** Updates a category and refreshes state. */
    if (!userId) return null;
    const updated = await repo.updateCategory(userId, categoryId, { name });
    await refresh();
    return updated;
  };

  // PUBLIC_INTERFACE
  const deleteCategory = async (categoryId) => {
    /** Deletes a category and refreshes state. */
    if (!userId) return false;
    const ok = await repo.deleteCategory(userId, categoryId);
    await refresh();
    return ok;
  };

  return {
    loading,
    error,
    categories,
    expenses,
    categoryById,
    refresh,
    addExpense,
    updateExpense,
    deleteExpense,
    addCategory,
    updateCategory,
    deleteCategory,
  };
}
