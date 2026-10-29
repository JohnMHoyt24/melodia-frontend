// FNV-1a: stable across sessions so an artist always gets the same art.
export function hashString(value: string) {
  let hash = 0x811c9dc5;
  for (let i = 0; i < value.length; i++) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

export function initialsOf(name: string) {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "?";
  const letters = words.length === 1 ? words[0].slice(0, 2) : words[0][0] + words[1][0];
  return letters.toUpperCase();
}

// Hues stay in the violet -> pink -> orange family so generated art matches the brand.
// Lightness is low enough that the white initials stay >= 4.5:1.
export function artColors(name: string) {
  const hash = hashString(name);
  const hueA = 255 + (hash % 80); // 255..334
  const hueB = (hueA + 20 + ((hash >>> 8) % 30)) % 360; // never past red-orange
  const angle = (hash >>> 16) % 360;
  return {
    a: `hsl(${hueA} 70% 38%)`,
    b: `hsl(${hueB} 75% 40%)`,
    angle: `${angle}deg`,
  };
}
