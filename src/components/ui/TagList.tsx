interface Props {
  tags: string[];
  limit?: number;
  label?: string;
  className?: string;
}

export function TagList({ tags, limit, label = "Genres", className }: Props) {
  if (tags.length === 0) return null;
  const shown = limit ? tags.slice(0, limit) : tags;
  return (
    <ul className={["tag-list", className].filter(Boolean).join(" ")} aria-label={label}>
      {shown.map((tag) => (
        <li key={tag} className="tag">
          {tag}
        </li>
      ))}
    </ul>
  );
}
