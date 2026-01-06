import React from "react";

// PUBLIC_INTERFACE
export function Card({ title, subtitle, children, right }) {
  /** Elevated surface card for dashboard sections. */
  return (
    <div className="card">
      {(title || subtitle || right) && (
        <div className="cardHeader">
          <div>
            {title && <div className="cardTitle">{title}</div>}
            {subtitle && <div className="cardSubtitle">{subtitle}</div>}
          </div>
          {right && <div className="cardRight">{right}</div>}
        </div>
      )}
      <div className="cardBody">{children}</div>
    </div>
  );
}

// PUBLIC_INTERFACE
export function Button({ variant = "primary", className = "", ...props }) {
  /** Themed button variants: primary, secondary, ghost, danger. */
  const cls =
    variant === "secondary"
      ? "btn btnSecondary"
      : variant === "ghost"
      ? "btn btnGhost"
      : variant === "danger"
      ? "btn btnDanger"
      : "btn btnPrimary";
  return <button className={`${cls} ${className}`.trim()} {...props} />;
}

// PUBLIC_INTERFACE
export function Input({ label, hint, ...props }) {
  /** Labeled input. */
  return (
    <label className="field">
      {label && <div className="fieldLabel">{label}</div>}
      <input className="input" {...props} />
      {hint && <div className="fieldHint">{hint}</div>}
    </label>
  );
}

// PUBLIC_INTERFACE
export function Select({ label, hint, children, ...props }) {
  /** Labeled select. */
  return (
    <label className="field">
      {label && <div className="fieldLabel">{label}</div>}
      <select className="input" {...props}>
        {children}
      </select>
      {hint && <div className="fieldHint">{hint}</div>}
    </label>
  );
}

// PUBLIC_INTERFACE
export function TextArea({ label, hint, ...props }) {
  /** Labeled textarea. */
  return (
    <label className="field">
      {label && <div className="fieldLabel">{label}</div>}
      <textarea className="input textarea" {...props} />
      {hint && <div className="fieldHint">{hint}</div>}
    </label>
  );
}

// PUBLIC_INTERFACE
export function EmptyState({ title, description, action }) {
  /** Friendly empty state. */
  return (
    <div className="empty">
      <div className="emptyTitle">{title}</div>
      {description && <div className="emptyDesc">{description}</div>}
      {action && <div className="emptyAction">{action}</div>}
    </div>
  );
}
