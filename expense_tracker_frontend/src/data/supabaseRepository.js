import { getSupabaseClient } from "../lib/supabaseClient";

/**
 * Expected Supabase tables (Postgres)
 *
 * 1) users
 *    - This is typically handled by Supabase Auth (auth.users). You do not need a public "users" table,
 *      but you may optionally create one if you want profile fields.
 *
 * 2) categories
 *    - id: uuid (primary key) default gen_random_uuid()
 *    - user_id: uuid (references auth.users.id) not null
 *    - name: text not null
 *    - created_at: timestamptz default now()
 *
 * 3) expenses
 *    - id: uuid (primary key) default gen_random_uuid()
 *    - user_id: uuid (references auth.users.id) not null
 *    - amount: numeric not null
 *    - category_id: uuid (references categories.id) null
 *    - date: date not null
 *    - note: text null
 *    - created_at: timestamptz default now()
 *
 * RLS policies (suggested):
 *  - Enable RLS on categories and expenses.
 *  - Allow select/insert/update/delete where auth.uid() = user_id.
 */

function requireClient() {
  const client = getSupabaseClient();
  if (!client) {
    throw new Error("Supabase is not configured. Expected REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_KEY.");
  }
  return client;
}

function mapAuthSession(session) {
  if (!session) return null;
  return { user: session.user };
}

// PUBLIC_INTERFACE
export function createSupabaseRepository() {
  /** Creates a Supabase-backed repository. Throws if Supabase is not configured. */
  const supabase = requireClient();

  return {
    mode: "supabase",

    // PUBLIC_INTERFACE
    async getSession() {
      /** Returns current session or null. */
      const { data, error } = await supabase.auth.getSession();
      if (error) throw error;
      return mapAuthSession(data.session);
    },

    // PUBLIC_INTERFACE
    async signUp({ email, password }) {
      /** Signs up a user via Supabase Auth. */
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;
      return { session: mapAuthSession(data.session), user: data.user };
    },

    // PUBLIC_INTERFACE
    async signIn({ email, password }) {
      /** Signs in via Supabase Auth. */
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      return { session: mapAuthSession(data.session), user: data.user };
    },

    // PUBLIC_INTERFACE
    async signInGuest() {
      /** Supabase mode does not support guest sessions. */
      throw new Error("Guest session is only available when Supabase is not configured.");
    },

    // PUBLIC_INTERFACE
    async signOut() {
      /** Signs out via Supabase Auth. */
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    },

    // PUBLIC_INTERFACE
    async listCategories(userId) {
      /** Lists categories for the user. */
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },

    // PUBLIC_INTERFACE
    async createCategory(userId, { name }) {
      /** Creates a category for the user. */
      const { data, error } = await supabase
        .from("categories")
        .insert([{ user_id: userId, name }])
        .select("*")
        .single();

      if (error) throw error;
      return data;
    },

    // PUBLIC_INTERFACE
    async updateCategory(userId, categoryId, { name }) {
      /** Updates a category. */
      const { data, error } = await supabase
        .from("categories")
        .update({ name })
        .eq("id", categoryId)
        .eq("user_id", userId)
        .select("*")
        .single();

      if (error) throw error;
      return data;
    },

    // PUBLIC_INTERFACE
    async deleteCategory(userId, categoryId) {
      /** Deletes a category (expenses keep category_id null if FK is set to SET NULL). */
      const { error } = await supabase.from("categories").delete().eq("id", categoryId).eq("user_id", userId);
      if (error) throw error;
      return true;
    },

    // PUBLIC_INTERFACE
    async listExpenses(userId) {
      /** Lists expenses newest-first. */
      const { data, error } = await supabase
        .from("expenses")
        .select("*")
        .eq("user_id", userId)
        .order("date", { ascending: false });

      if (error) throw error;
      return data || [];
    },

    // PUBLIC_INTERFACE
    async createExpense(userId, payload) {
      /** Creates an expense. */
      const { data, error } = await supabase
        .from("expenses")
        .insert([
          {
            user_id: userId,
            amount: payload.amount,
            category_id: payload.category_id || null,
            date: payload.date,
            note: payload.note || null,
          },
        ])
        .select("*")
        .single();

      if (error) throw error;
      return data;
    },

    // PUBLIC_INTERFACE
    async updateExpense(userId, expenseId, payload) {
      /** Updates an expense. */
      const { data, error } = await supabase
        .from("expenses")
        .update({
          amount: payload.amount,
          category_id: payload.category_id || null,
          date: payload.date,
          note: payload.note || null,
        })
        .eq("id", expenseId)
        .eq("user_id", userId)
        .select("*")
        .single();

      if (error) throw error;
      return data;
    },

    // PUBLIC_INTERFACE
    async deleteExpense(userId, expenseId) {
      /** Deletes an expense. */
      const { error } = await supabase.from("expenses").delete().eq("id", expenseId).eq("user_id", userId);
      if (error) throw error;
      return true;
    },
  };
}
