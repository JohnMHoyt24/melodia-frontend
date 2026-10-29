import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { ArtistCard } from "../components/ui/ArtistCard";
import { Button } from "../components/ui/Button";
import { DisplayHeading } from "../components/ui/DisplayHeading";
import { api, type LibraryArtist } from "../lib/api";

type LoadState = "loading" | "done" | "error";

export function LibraryPage() {
  const [artists, setArtists] = useState<LibraryArtist[]>([]);
  const [state, setState] = useState<LoadState>("loading");

  useEffect(() => {
    api
      .listLibrary()
      .then((list) => {
        setArtists(list);
        setState("done");
      })
      .catch(() => setState("error"));
  }, []);

  async function remove(artistId: string) {
    await api.removeFromLibrary(artistId).catch(() => undefined);
    setArtists((prev) => prev.filter((artist) => artist.id !== artistId));
  }

  return (
    <section id="library">
      <Link to="/" className="back-link">
        <ArrowLeft size={16} aria-hidden="true" />
        Back to Melodia
      </Link>
      <div className="hero">
        <DisplayHeading ghost="Library" eyebrow="Your collection">
          My library
        </DisplayHeading>
        <p className="tagline">Artists you've saved. They shape your recommendations.</p>
      </div>

      {state === "loading" && <p className="feedback">Loading your library...</p>}
      {state === "error" && (
        <p className="feedback feedback--error">Couldn't load your library.</p>
      )}
      {state === "done" && artists.length === 0 && (
        <p className="feedback">
          Nothing here yet. <Link to="/">Ask for recommendations</Link> and add the ones you
          like.
        </p>
      )}

      <ul className="artist-grid">
        {artists.map((artist) => (
          <li key={artist.id}>
            <ArtistCard
              id={artist.id}
              name={artist.name}
              genres={artist.genres}
              meta={`Added ${new Date(artist.added_at).toLocaleDateString()}`}
              actions={
                <Button
                  variant="secondary"
                  size="sm"
                  aria-label={`Remove ${artist.name} from library`}
                  onClick={() => remove(artist.id)}
                >
                  Remove
                </Button>
              }
            />
          </li>
        ))}
      </ul>
    </section>
  );
}
