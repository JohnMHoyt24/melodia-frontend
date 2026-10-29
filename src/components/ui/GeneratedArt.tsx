import type { CSSProperties } from "react";
import { artColors, initialsOf } from "./art";

interface Props {
  name: string;
  className?: string;
  showInitials?: boolean;
}

// Decorative: the name is always rendered next to it, so it's hidden from assistive tech.
export function GeneratedArt({ name, className, showInitials = true }: Props) {
  const colors = artColors(name);
  const style = {
    "--art-a": colors.a,
    "--art-b": colors.b,
    "--art-angle": colors.angle,
  } as CSSProperties;
  return (
    <span className={["generated-art", className].filter(Boolean).join(" ")} style={style} aria-hidden="true">
      {showInitials && initialsOf(name)}
    </span>
  );
}
