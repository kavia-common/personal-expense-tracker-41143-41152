import React, { useEffect, useMemo, useState } from "react";
import { Button, Input, Select, TextArea } from "../components/ui";
import { toISODateInputValue } from "../lib/utils";
import { getErrorMessage } from "../lib/error";

function validate(payload) {
  const errors = {};
  if (!payload.amount || Number.isNaN(Number(payload.amount)) || Number(payload.amount) <= 0) {
    errors.amount = "Amount must be greater than 0.";
  }
  if (!payload.date) errors.date = "Date is required.";
  return errors;
}

// PUBLIC_INTERFACE
export function ExpenseForm({ categories, initialValue, onSubmit, onCancel, submitLabel = "Add expense" }) {
  /** Form for creating/updating an expense. */
  const [amount, setAmount] = useState(initialValue?.amount ?? "");
  const [categoryId, setCategoryId] = useState(initialValue?.category_id ?? "");
  const [date, setDate] = useState(initialValue?.date ?? toISODateInputValue(new Date()));
  const [note, setNote] = useState(initialValue?.note ?? "");

  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState(null);

  useEffect(() => {
    if (!initialValue) return;
    setAmount(initialValue.amount ?? "");
    setCategoryId(initialValue.category_id ?? "");
    setDate(initialValue.date ?? toISODateInputValue(new Date()));
    setNote(initialValue.note ?? "");
  }, [initialValue]);

  const canSubmit = useMemo(() => {
    const e = validate({ amount, category_id: categoryId || null, date, note });
    return Object.keys(e).length === 0;
  }, [amount, categoryId, date, note]);

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitError(null);

    const payload = { amount: Number(amount), category_id: categoryId || null, date, note: note.trim() };
    const eMap = validate(payload);
    setErrors(eMap);
    if (Object.keys(eMap).length > 0) return;

    setSubmitting(true);
    try {
      await onSubmit(payload);
      if (!initialValue) {
        setAmount("");
        setCategoryId("");
        setNote("");
        setDate(toISODateInputValue(new Date()));
      }
    } catch (err) {
      // Prevent the error from bubbling into a global handler / runtime overlay.
      setSubmitError(getErrorMessage(err, "Failed to save expense."));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="formGrid" onSubmit={handleSubmit}>
      <Input
        label="Amount"
        type="number"
        inputMode="decimal"
        step="0.01"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="0.00"
        hint={errors.amount}
        aria-invalid={Boolean(errors.amount)}
      />

      <Select label="Category" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
        <option value="">Uncategorized</option>
        {categories.map((c) => (
          <option value={c.id} key={c.id}>
            {c.name}
          </option>
        ))}
      </Select>

      <Input
        label="Date"
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        hint={errors.date}
        aria-invalid={Boolean(errors.date)}
      />

      <TextArea label="Note" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Optional note" />

      {submitError && (
        <div className="alert alertError" style={{ gridColumn: "1 / -1" }}>
          {submitError}
        </div>
      )}

      <div className="row formActions">
        <Button type="submit" disabled={!canSubmit || submitting}>
          {submitting ? "Saving…" : submitLabel}
        </Button>
        {onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}
