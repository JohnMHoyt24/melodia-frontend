import { useState } from "react";
import { Check, Plus, RotateCcw } from "lucide-react";
import { Button } from "./ui/Button";

interface Props {
  inLibrary: boolean;
  onAdd: () => Promise<void>;
  onRemove: () => Promise<void>;
}

export function LibraryButton({ inLibrary, onAdd, onRemove }: Props) {
  const [pending, setPending] = useState(false);
  const [failed, setFailed] = useState(false);

  async function toggle() {
    setPending(true);
    setFailed(false);
    try {
      await (inLibrary ? onRemove() : onAdd());
    } catch {
      setFailed(true);
    } finally {
      setPending(false);
    }
  }

  const Icon = failed ? RotateCcw : inLibrary ? Check : Plus;
  return (
    <Button
      variant={inLibrary ? "secondary" : "primary"}
      size="sm"
      onClick={toggle}
      disabled={pending}
      aria-pressed={inLibrary}
      title={failed ? "Something went wrong - try again" : undefined}
    >
      <Icon size={16} aria-hidden="true" />
      {failed ? "Try again" : inLibrary ? "In library" : "Add to library"}
    </Button>
  );
}
