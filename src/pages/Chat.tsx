import { type FormEvent, useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Pin, Plus, Send, X } from "lucide-react";
import { LibraryButton } from "../components/LibraryButton";
import { ArtistCard } from "../components/ui/ArtistCard";
import { Button } from "../components/ui/Button";
import { DisplayHeading } from "../components/ui/DisplayHeading";
import { Equalizer } from "../components/ui/Equalizer";
import { useLibrary } from "../lib/useLibrary";
import { api, type ChatMessage, type ChatThreadSummary } from "../lib/api";

const PIN_KEY = "melodia.sidebarPinned";

const DEFAULT_PROMPTS = [
  "Recommend some artists I might like",
  "Help me discover new music",
  "Find artists similar to my library",
  "Surprise me with something different",
];

function readPinned() {
  try {
    return localStorage.getItem(PIN_KEY) === "true";
  } catch {
    return false;
  }
}

type SendState = "idle" | "sending";
type ThreadLoadState = "idle" | "loading" | "error";

export function Chat() {
  const { threadId } = useParams<{ threadId: string }>();
  const navigate = useNavigate();
  
  const library = useLibrary();
  const [pinned, setPinned] = useState(readPinned);
  const [threads, setThreads] = useState<ChatThreadSummary[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [threadLoadState, setThreadLoadState] = useState<ThreadLoadState>("idle");
  const [prompt, setPrompt] = useState("");
  const [sendState, setSendState] = useState<SendState>("idle");
  const [error, setError] = useState<string | null>(null);
  const promptRef = useRef<HTMLTextAreaElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  function togglePinned() {
    const next = !pinned;
    setPinned(next);
    try {
      localStorage.setItem(PIN_KEY, String(next));
    } catch {
      // ignore storage failures; pin state just won't persist
    }
  }

  function refreshThreads() {
    api.listThreads().then(setThreads).catch(() => undefined);
  }

  useEffect(() => {
    refreshThreads();
  }, []);

  useEffect(() => {
    if (!threadId) {
      setMessages([]);
      return;
    }
    setThreadLoadState("loading");
    api
      .getThread(threadId)
      .then((thread) => {
        setMessages(thread.messages);
        setThreadLoadState("idle");
      })
      .catch(() => setThreadLoadState("error"));
  }, [threadId]);

  useEffect(() => {
    if (messages.length === 0) return;
    formRef.current?.scrollIntoView({ block: "end" });
  }, [messages]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const trimmed = prompt.trim();
    if (trimmed.length === 0 || sendState === "sending") return;

    setError(null);
    setSendState("sending");
    setPrompt("");

    const optimisticUserMessage: ChatMessage = {
      id: `pending-${Date.now()}`,
      role: "user",
      content: trimmed,
      recommended_artists: null,
      sources: null,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimisticUserMessage]);

    try {
      if (!threadId) {
        const thread = await api.createThread(trimmed);
        setMessages(thread.messages);
        navigate(`/chat/${thread.id}`);
      } else {
        const assistantMessage = await api.postMessage(threadId, trimmed);
        setMessages((prev) => [...prev, assistantMessage]);
      }
      refreshThreads();
    } catch {
      setError("Couldn't get a reply. Is the backend running?");
      setMessages((prev) => prev.filter((m) => m.id !== optimisticUserMessage.id));
      setPrompt(trimmed);
    } finally {
      setSendState("idle");
    }
  }

  async function handleDelete(id: string) {
    await api.deleteThread(id).catch(() => undefined);
    refreshThreads();
    if (id === threadId) navigate("/");
  }

  return (
    <div id="chat-layout">
      <div className={`sidebar-slot${pinned ? " sidebar-slot--pinned" : ""}`}>
      <aside id="chat-sidebar" className={pinned ? "pinned" : undefined}>
        <div className="sidebar-header">
          <Button size="sm" onClick={() => navigate("/")}>
            <Plus size={16} aria-hidden="true" />
            New chat
          </Button>
          <Button
            variant="icon"
            className="pin-button"
            aria-pressed={pinned}
            aria-label={pinned ? "Unpin sidebar" : "Pin sidebar open"}
            title={pinned ? "Unpin sidebar" : "Pin sidebar open"}
            onClick={togglePinned}
          >
            <Pin size={18} aria-hidden="true" />
          </Button>
        </div>
        <nav className="thread-list" aria-label="Conversations">
          {threads.map((thread) => (
            <div key={thread.id} className={`thread-item${thread.id === threadId ? " thread-item--active" : ""}`}>
              <Link to={`/chat/${thread.id}`} aria-current={thread.id === threadId ? "page" : undefined}>
                {thread.title ?? "New chat"}
              </Link>
              <Button
                variant="icon"
                size="sm"
                className="thread-delete"
                aria-label={`Delete "${thread.title ?? "New chat"}"`}
                onClick={() => handleDelete(thread.id)}
              >
                <X size={16} aria-hidden="true" />
              </Button>
            </div>
          ))}
        </nav>
      </aside>
      </div>

      <section id="chat-main">
        {messages.length === 0 && threadLoadState !== "loading" && (
          <div className="hero">
            <DisplayHeading ghost="Discover" eyebrow="AI-powered music discovery">
              Find your next obsession
            </DisplayHeading>
            <p className="tagline">
              Tell Melodia what you love. It learns from your library and finds the artists you
              haven't met yet.
            </p>
            <Equalizer bars={12} className="hero-equalizer" />
            <div className="prompt-pills">
              {DEFAULT_PROMPTS.map((text) => (
                <button
                  key={text}
                  type="button"
                  className="prompt-pill"
                  onClick={() => {
                    setPrompt(text);
                    promptRef.current?.focus();
                  }}
                >
                  {text}
                </button>
              ))}
            </div>
          </div>
        )}

        {threadLoadState === "loading" && messages.length === 0 && (
          <p className="feedback">Loading conversation...</p>
        )}
        {threadLoadState === "error" && (
          <p className="feedback feedback--error">Couldn't load that conversation.</p>
        )}

        {messages.length > 0 && (
          <div className="message-list">
            {messages.map((message) => (
              <div key={message.id} className={`message message--${message.role}`}>
                <p className="message-content">{message.content}</p>
                {message.recommended_artists && message.recommended_artists.length > 0 && (
                  <ul className="artist-grid">
                    {message.recommended_artists.map((artist) => (
                      <li key={artist.id}>
                        <ArtistCard
                          id={artist.id}
                          name={artist.name}
                          genres={artist.genres}
                          coverUrl={artist.cover_url}
                          reason={artist.reason}
                          actions={
                            <LibraryButton
                              inLibrary={library.ids.has(artist.id)}
                              onAdd={() => library.add(artist.id)}
                              onRemove={() => library.remove(artist.id)}
                            />
                          }
                        />
                      </li>
                    ))}
                  </ul>
                )}
                {message.sources && message.sources.length > 0 && (
                  <div className="message-sources">
                    <span className="message-sources-label">From your library</span>
                    <ul className="source-chips">
                      {message.sources.map((source) => (
                        <li key={source.id}>
                          <Link to={`/artists/${source.id}`} className="source-chip">
                            {source.name}
                            <span className="source-chip-match">
                              {Math.round(source.similarity * 100)}%
                            </span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
            {sendState === "sending" && (
              <p className="feedback thinking" role="status">
                <Equalizer />
                Melodia is listening...
              </p>
            )}
          </div>
        )}

        {error && <p className="feedback feedback--error">{error}</p>}

        <form ref={formRef} onSubmit={handleSubmit} id="prompt-form" className="card">
          <textarea
            ref={promptRef}
            placeholder="Ask for recommendations, or follow up on what you already got..."
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            aria-label="Message"
            className="input prompt-input"
            rows={3}
          />
          <Button type="submit" loading={sendState === "sending"}>
            {sendState === "sending" ? "Listening..." : (
              <>
                Ask Melodia
                <Send size={16} aria-hidden="true" />
              </>
            )}
          </Button>
        </form>
      </section>
    </div>
  );
}
