import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { CoverArt } from "./CoverArt";
import { TagList } from "./TagList";

interface Props {
  id: string;
  name: string;
  genres?: string[];
  coverUrl?: string | null;
  meta?: ReactNode;
  reason?: string;
  // Rendered outside the card's link so buttons are never nested inside it.
  actions?: ReactNode;
  layout?: "row" | "tile";
}

export function ArtistCard({
  id,
  name,
  genres = [],
  coverUrl,
  meta,
  reason,
  actions,
  layout = "row",
}: Props) {
  return (
    <div className={`artist-card artist-card--${layout} card`}>
      <CoverArt className="artist-card-art" name={name} src={coverUrl} />
      <div className="artist-card-body">
        <p className="artist-card-name">
          <Link to={`/artists/${id}`} className="stretched-link">
            {name}
          </Link>
        </p>
        {meta && <p className="artist-card-meta">{meta}</p>}
        <TagList tags={genres} limit={layout === "tile" ? 2 : 6} />
        {reason && <p className="artist-card-reason">{reason}</p>}
      </div>
      {actions && <div className="artist-card-actions">{actions}</div>}
    </div>
  );
}
