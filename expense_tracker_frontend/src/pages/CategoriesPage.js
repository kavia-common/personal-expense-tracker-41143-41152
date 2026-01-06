import React, { useMemo, useState } from "react";
import { Card, Button, Input, EmptyState } from "../components/ui";
import { useExpenseData } from "../hooks/useExpenseData";
import { getErrorMessage } from "../lib/error";

// PUBLIC_INTERFACE
export function CategoriesPage() {
  /** Category management: add, rename, delete. */
  const { loading, error, categories, addCategory, updateCategory, deleteCategory } = useExpenseData();

  const [newName, setNewName] = useState("");
  const [renamingId, setRenamingId] = useState(null);
  const [renameValue, setRenameValue] = useState("");

  const [actionError, setActionError] = useState(null);

  const canAdd = useMemo(() => newName.trim().length > 0, [newName]);

  async function handleAdd(e) {
    e.preventDefault();
    if (!canAdd) return;
    setActionError(null);
    try {
      await addCategory({ name: newName.trim() });
      setNewName("");
    } catch (err) {
      setActionError(getErrorMessage(err, "Failed to add category."));
    }
  }

  const loadErrorMessage = error?.message || null;

  return (
    <div className="stackLg">
      <Card title="Add category" subtitle="Keep your spending organized">
        <form onSubmit={handleAdd} className="row">
          <Input label="Name" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="e.g., Groceries" />
          <div className="row">
            <Button type="submit" disabled={!canAdd}>
              Add
            </Button>
          </div>
        </form>

        {actionError && (
          <div className="alert alertError" style={{ marginTop: 12 }}>
            {actionError}
          </div>
        )}
      </Card>

      <Card title="Categories" subtitle="Rename or delete">
        {loading ? (
          <div className="muted">Loading…</div>
        ) : loadErrorMessage ? (
          <div className="alert alertError">
            {loadErrorMessage}
            <div className="hint" style={{ marginTop: 10 }}>
              If you're using Supabase, confirm tables <code>categories</code> and <code>expenses</code> exist and RLS
              policies allow access for <code>auth.uid() = user_id</code>.
            </div>
          </div>
        ) : categories.length === 0 ? (
          <EmptyState title="No categories" description="Add your first category above." />
        ) : (
          <div className="list">
            {categories.map((c) => {
              const isRenaming = renamingId === c.id;
              return (
                <div key={c.id} className="listRow">
                  <div className="listLeft">
                    <div className="dot dotSecondary" />
                    {isRenaming ? (
                      <input
                        className="input inlineInput"
                        value={renameValue}
                        onChange={(e) => setRenameValue(e.target.value)}
                        aria-label={`Rename ${c.name}`}
                      />
                    ) : (
                      <div className="listTitle">{c.name}</div>
                    )}
                  </div>

                  <div className="row rowTight">
                    {isRenaming ? (
                      <>
                        <Button
                          variant="primary"
                          onClick={async () => {
                            setActionError(null);
                            try {
                              await updateCategory(c.id, { name: renameValue.trim() || c.name });
                              setRenamingId(null);
                              setRenameValue("");
                            } catch (err) {
                              setActionError(getErrorMessage(err, "Failed to rename category."));
                            }
                          }}
                        >
                          Save
                        </Button>
                        <Button
                          variant="ghost"
                          onClick={() => {
                            setRenamingId(null);
                            setRenameValue("");
                          }}
                        >
                          Cancel
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          variant="ghost"
                          onClick={() => {
                            setRenamingId(c.id);
                            setRenameValue(c.name);
                          }}
                        >
                          Rename
                        </Button>
                        <Button
                          variant="danger"
                          onClick={async () => {
                            setActionError(null);
                            try {
                              await deleteCategory(c.id);
                            } catch (err) {
                              setActionError(getErrorMessage(err, "Failed to delete category."));
                            }
                          }}
                        >
                          Delete
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {actionError && !loading && (
          <div className="alert alertError" style={{ marginTop: 12 }}>
            {actionError}
          </div>
        )}
      </Card>
    </div>
  );
}
