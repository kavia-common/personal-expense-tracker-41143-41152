import { toISODateInputValue } from "../lib/utils";

const LS_KEYS = {
  session: "pet.session.v1",
  expenses: "pet.expenses.v1",
  categories: "pet.categories.v1",
};

function safeParse(json, fallback) {
  try {
    return JSON.parse(json);
  } catch {
    return fallback;
  }
}

function load(key, fallback) {
  return safeParse(window.localStorage.getItem(key) || "", fallback);
}

function save(key, value) {
  window.localStorage.setItem(key, JSON.stringify(value));
}

function randomId(prefix) {
  return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now()}`;
}

function ensureSeed() {
  const existing = load(LS_KEYS.categories, null);
  if (existing && Array.isArray(existing) && existing.length > 0) return;

  const defaultCats = [
    { id: randomId("cat"), user_id: "guest", name: "Food" },
    { id: randomId("cat"), user_id: "guest", name: "Transport" },
    { id: randomId("cat"), user_id: "guest", name: "Shopping" },
    { id: randomId("cat"), user_id: "guest", name: "Bills" },
  ];
  save(LS_KEYS.categories, defaultCats);

  const existingExpenses = load(LS_KEYS.expenses, null);
  if (!existingExpenses) {
    const today = toISODateInputValue(new Date());
    save(LS_KEYS.expenses, [
      {
        id: randomId("exp"),
        user_id: "guest",
        amount: 18.5,
        category_id: defaultCats[0].id,
        date: today,
        note: "Lunch",
        created_at: new Date().toISOString(),
      },
    ]);
  }
}

/**
 * Local repository implements the same methods as the Supabase repository.
 * It provides a "guest session mode" when Supabase is not configured.
 */

// PUBLIC_INTERFACE
export function createLocalRepository() {
  /** Creates a local-storage-backed repository with auth + CRUD. */
  ensureSeed();

  return {
    mode: "local",

    // PUBLIC_INTERFACE
    async getSession() {
      /** Returns current session or null. */
      return load(LS_KEYS.session, null);
    },

    // PUBLIC_INTERFACE
    async signUp({ email }) {
      /** In local mode, signUp creates a guest-like local session (no password storage). */
      const user = { id: randomId("user"), email };
      const session = { user };
      save(LS_KEYS.session, session);
      return { session, user };
    },

    // PUBLIC_INTERFACE
    async signIn({ email }) {
      /** In local mode, signIn creates a guest-like local session (no password verification). */
      const user = { id: randomId("user"), email };
      const session = { user };
      save(LS_KEYS.session, session);
      return { session, user };
    },

    // PUBLIC_INTERFACE
    async signInGuest() {
      /** Creates a guest session. */
      const session = { user: { id: "guest", email: "guest@local" } };
      save(LS_KEYS.session, session);
      return session;
    },

    // PUBLIC_INTERFACE
    async signOut() {
      /** Clears local session. */
      window.localStorage.removeItem(LS_KEYS.session);
    },

    // PUBLIC_INTERFACE
    async listCategories(userId) {
      /** Returns categories for a user. */
      const all = load(LS_KEYS.categories, []);
      return all.filter((c) => c.user_id === userId);
    },

    // PUBLIC_INTERFACE
    async createCategory(userId, { name }) {
      /** Creates a category. */
      const all = load(LS_KEYS.categories, []);
      const created = { id: randomId("cat"), user_id: userId, name: String(name || "").trim() };
      save(LS_KEYS.categories, [created, ...all]);
      return created;
    },

    // PUBLIC_INTERFACE
    async updateCategory(userId, categoryId, { name }) {
      /** Updates a category. */
      const all = load(LS_KEYS.categories, []);
      const next = all.map((c) =>
        c.id === categoryId && c.user_id === userId ? { ...c, name: String(name || "").trim() } : c
      );
      save(LS_KEYS.categories, next);
      return next.find((c) => c.id === categoryId) || null;
    },

    // PUBLIC_INTERFACE
    async deleteCategory(userId, categoryId) {
      /** Deletes a category and unsets it from expenses. */
      const allCats = load(LS_KEYS.categories, []);
      save(
        LS_KEYS.categories,
        allCats.filter((c) => !(c.id === categoryId && c.user_id === userId))
      );

      const allExpenses = load(LS_KEYS.expenses, []);
      const updatedExpenses = allExpenses.map((e) =>
        e.user_id === userId && e.category_id === categoryId ? { ...e, category_id: null } : e
      );
      save(LS_KEYS.expenses, updatedExpenses);
      return true;
    },

    // PUBLIC_INTERFACE
    async listExpenses(userId) {
      /** Lists expenses newest-first. */
      const all = load(LS_KEYS.expenses, []);
      return all
        .filter((e) => e.user_id === userId)
        .sort((a, b) => (b.date || "").localeCompare(a.date || ""));
    },

    // PUBLIC_INTERFACE
    async createExpense(userId, payload) {
      /** Creates an expense record. */
      const all = load(LS_KEYS.expenses, []);
      const created = {
        id: randomId("exp"),
        user_id: userId,
        amount: Number(payload.amount),
        category_id: payload.category_id || null,
        date: payload.date,
        note: payload.note || "",
        created_at: new Date().toISOString(),
      };
      save(LS_KEYS.expenses, [created, ...all]);
      return created;
    },

    // PUBLIC_INTERFACE
    async updateExpense(userId, expenseId, payload) {
      /** Updates an expense record. */
      const all = load(LS_KEYS.expenses, []);
      const next = all.map((e) =>
        e.id === expenseId && e.user_id === userId
          ? {
              ...e,
              amount: Number(payload.amount),
              category_id: payload.category_id || null,
              date: payload.date,
              note: payload.note || "",
            }
          : e
      );
      save(LS_KEYS.expenses, next);
      return next.find((e) => e.id === expenseId) || null;
    },

    // PUBLIC_INTERFACE
    async deleteExpense(userId, expenseId) {
      /** Deletes an expense record. */
      const all = load(LS_KEYS.expenses, []);
      save(
        LS_KEYS.expenses,
        all.filter((e) => !(e.id === expenseId && e.user_id === userId))
      );
      return true;
    },
  };
}
