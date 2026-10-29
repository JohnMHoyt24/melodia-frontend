import { type InputHTMLAttributes, type ReactNode, type TextareaHTMLAttributes, useId } from "react";

interface ShellProps {
  label: string;
  hint?: ReactNode;
  error?: string | null;
}

// Wires the label, hint and error to the control via htmlFor / aria-describedby.
function useFieldIds(hint: ShellProps["hint"], error: ShellProps["error"]) {
  const id = useId();
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;
  return { id, hintId, errorId, describedBy };
}

function Shell({
  label,
  hint,
  error,
  ids,
  children,
}: ShellProps & { ids: ReturnType<typeof useFieldIds>; children: ReactNode }) {
  return (
    <div className="field">
      <label className="field-label" htmlFor={ids.id}>
        {label}
      </label>
      {children}
      {hint && (
        <p className="field-hint" id={ids.hintId}>
          {hint}
        </p>
      )}
      {error && (
        <p className="field-error" id={ids.errorId} role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export function TextField({
  label,
  hint,
  error,
  className,
  ...rest
}: ShellProps & InputHTMLAttributes<HTMLInputElement>) {
  const ids = useFieldIds(hint, error);
  return (
    <Shell label={label} hint={hint} error={error} ids={ids}>
      <input
        id={ids.id}
        className={["input", className].filter(Boolean).join(" ")}
        aria-describedby={ids.describedBy}
        aria-invalid={error ? true : undefined}
        {...rest}
      />
    </Shell>
  );
}

export function TextAreaField({
  label,
  hint,
  error,
  className,
  ...rest
}: ShellProps & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const ids = useFieldIds(hint, error);
  return (
    <Shell label={label} hint={hint} error={error} ids={ids}>
      <textarea
        id={ids.id}
        className={["input", className].filter(Boolean).join(" ")}
        aria-describedby={ids.describedBy}
        aria-invalid={error ? true : undefined}
        {...rest}
      />
    </Shell>
  );
}
