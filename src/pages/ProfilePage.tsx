import { type ChangeEvent, type FormEvent, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "../components/ui/Button";
import { TextAreaField, TextField } from "../components/ui/Field";
import { AVATAR_EXTENSIONS, AVATAR_MAX_BYTES, type Profile, useAuth } from "../lib/auth";

type SaveState = "idle" | "saving" | "saved" | "error";

export function ProfilePage() {
  const { user, profile, updateProfile, uploadAvatar } = useAuth();
  const [form, setForm] = useState<Profile>(profile);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarError, setAvatarError] = useState<string | null>(null);

  useEffect(() => {
    if (!avatarFile) return;
    const url = URL.createObjectURL(avatarFile);
    setAvatarPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [avatarFile]);

  function setField<K extends keyof Profile>(key: K, value: Profile[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setSaveState("idle");
  }

  function handleAvatarChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!(file.type in AVATAR_EXTENSIONS)) {
      setAvatarError("Please choose a .png, .jpg, or .gif file.");
      return;
    }
    if (file.size > AVATAR_MAX_BYTES) {
      setAvatarError("That image is over 2 MB. Please choose a smaller one.");
      return;
    }
    setAvatarError(null);
    setAvatarFile(file);
    setSaveState("idle");
  }

  function handleAvatarRemove() {
    setAvatarFile(null);
    setAvatarPreview(null);
    setAvatarError(null);
    setField("avatarUrl", "");
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSaveState("saving");
    setError(null);

    let avatarUrl = form.avatarUrl;
    if (avatarFile) {
      const upload = await uploadAvatar(avatarFile);
      if (upload.error || !upload.url) {
        setError(`Couldn't upload avatar: ${upload.error}`);
        setSaveState("error");
        return;
      }
      avatarUrl = upload.url;
    }

    const result = await updateProfile({ ...form, avatarUrl });
    if (result.error) {
      setError(result.error);
      setSaveState("error");
    } else {
      setForm((prev) => ({ ...prev, avatarUrl }));
      setAvatarFile(null);
      setSaveState("saved");
    }
  }

  const shownAvatar = avatarFile ? avatarPreview : form.avatarUrl;
  const initial = (form.displayName || user?.email || "?").charAt(0).toUpperCase();

  return (
    <div id="profile">
      <Link to="/" className="back-link">
        <ArrowLeft size={16} aria-hidden="true" />
        Back to chat
      </Link>
      <h1>Your profile</h1>
      <p className="tagline">Tell Melodia a little about yourself.</p>

      <form id="profile-form" className="card" onSubmit={handleSubmit}>
        <TextField label="Email" type="email" value={user?.email ?? ""} disabled />
        <TextField
          label="Display name"
          type="text"
          value={form.displayName}
          maxLength={60}
          onChange={(event) => setField("displayName", event.target.value)}
        />

        <div className="avatar-field">
          {shownAvatar ? (
            <img className="avatar avatar--large" src={shownAvatar} alt="Your avatar" />
          ) : (
            <span className="avatar avatar--large avatar--initial" aria-hidden="true">
              {initial}
            </span>
          )}
          <div className="avatar-actions">
            <label className="file-button">
              {shownAvatar ? "Change photo" : "Upload photo"}
              <input
                type="file"
                accept="image/png,image/jpeg,image/gif,.png,.jpg,.jpeg,.gif"
                onChange={handleAvatarChange}
              />
            </label>
            {shownAvatar && (
              <button type="button" className="link-button" onClick={handleAvatarRemove}>
                Remove
              </button>
            )}
            <span className="hint">PNG, JPG, or GIF, up to 2 MB.</span>
            {avatarError && (
              <span className="feedback feedback--error" role="alert">
                {avatarError}
              </span>
            )}
          </div>
        </div>

        <TextField
          label="Favorite genres"
          hint="Separate genres with commas."
          type="text"
          placeholder="indie rock, jazz, synthwave"
          value={form.favoriteGenres}
          maxLength={200}
          onChange={(event) => setField("favoriteGenres", event.target.value)}
        />
        <TextAreaField
          label="Bio"
          rows={4}
          maxLength={500}
          value={form.bio}
          onChange={(event) => setField("bio", event.target.value)}
        />

        {error && (
          <p className="feedback feedback--error" role="alert">
            {error}
          </p>
        )}
        {saveState === "saved" && (
          <p className="feedback" role="status">
            Profile saved.
          </p>
        )}

        <Button type="submit" loading={saveState === "saving"}>
          {saveState === "saving" ? "Saving..." : "Save profile"}
        </Button>
      </form>
    </div>
  );
}
