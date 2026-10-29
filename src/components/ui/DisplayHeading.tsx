import type { ReactNode } from "react";

export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={["eyebrow", className].filter(Boolean).join(" ")}>{children}</p>;
}

interface Props {
  children: ReactNode;
  // Oversized outline word behind the heading. Purely decorative.
  ghost?: string;
  eyebrow?: ReactNode;
  className?: string;
}

export function DisplayHeading({ children, ghost, eyebrow, className }: Props) {
  return (
    <div className={["display-heading", className].filter(Boolean).join(" ")}>
      {ghost && (
        <span className="display-ghost" aria-hidden="true">
          {ghost}
        </span>
      )}
      {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
      <h1 className="display">{children}</h1>
    </div>
  );
}
