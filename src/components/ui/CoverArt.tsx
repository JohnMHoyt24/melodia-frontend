import { useState } from "react";
import { GeneratedArt } from "./GeneratedArt";

interface Props {
  name: string;
  src?: string | null;
  // "" when the image is decorative (the name is visible beside it).
  alt?: string;
  className?: string;
}

export function CoverArt({ name, src, alt = "", className }: Props) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const classes = ["cover-art", className].filter(Boolean).join(" ");

  if (!src || failedSrc === src) {
    return <GeneratedArt name={name} className={classes} />;
  }
  return (
    <img
      className={classes}
      src={src}
      alt={alt}
      loading="lazy"
      decoding="async"
      onError={() => setFailedSrc(src)}
    />
  );
}
