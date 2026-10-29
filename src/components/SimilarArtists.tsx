import { useEffect, useState } from "react";
import { api, type SimilarArtist } from "../lib/api";
import { ArtistCard } from "./ui/ArtistCard";

type LoadState = "loading" | "done" | "error";

export function SimilarArtists({ artistId }: { artistId: string }) {
  const [artists, setArtists] = useState<SimilarArtist[]>([]);
  const [state, setState] = useState<LoadState>("loading");

  // Mounted with key={artistId} by the page, so state starts fresh per artist.
  useEffect(() => {
    api
      .similarInLibrary(artistId)
      .then((found) => {
        setArtists(found);
        setState("done");
      })
      .catch(() => setState("error"));
  }, [artistId]);

  if (state === "loading") return <p className="feedback">Finding similar artists...</p>;
  if (state === "error") {
    return <p className="feedback feedback--error">Couldn't load similar artists.</p>;
  }
  if (artists.length === 0) {
    return (
      <p className="feedback">
        Nothing similar in your library yet - add more artists to see matches here.
      </p>
    );
  }

  return (
    <div className="similar-artists">
      <h2>Similar in your library</h2>
      <ul className="similar-strip">
        {artists.map((artist) => (
          <li key={artist.id}>
            <ArtistCard
              id={artist.id}
              name={artist.name}
              coverUrl={artist.cover_url}
              layout="tile"
              meta={`${Math.round(artist.similarity * 100)}% match`}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
