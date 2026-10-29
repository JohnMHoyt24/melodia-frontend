import type { ButtonHTMLAttributes } from "react";
import { LoaderCircle } from "lucide-react";

type Variant = "primary" | "secondary" | "ghost" | "icon";
type Size = "sm" | "md" | "lg";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  // Disables the button and marks it busy; keep the label meaningful ("Saving...").
  loading?: boolean;
}

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  type = "button",
  className,
  disabled,
  children,
  ...rest
}: Props) {
  const classes = ["btn", `btn--${variant}`, `btn--${size}`, className].filter(Boolean).join(" ");
  return (
    <button
      type={type}
      className={classes}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading && <LoaderCircle className="btn-spinner" size={16} aria-hidden="true" />}
      {children}
    </button>
  );
}
