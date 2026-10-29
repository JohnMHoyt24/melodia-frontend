// Decorative animated bars. Pair with visible or visually-hidden text for meaning.
export function Equalizer({ bars = 5, className }: { bars?: number; className?: string }) {
  return (
    <span className={["equalizer", className].filter(Boolean).join(" ")} aria-hidden="true">
      {Array.from({ length: bars }, (_, i) => (
        <i key={i} />
      ))}
    </span>
  );
}
