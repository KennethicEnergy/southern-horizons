"use client";

/** TEMPORARY: see the note on `suggestions` in src/db/schema.ts. */

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { deleteSuggestion, setSuggestionDone } from "@/actions/suggestions";

export function SuggestionDoneToggle({ suggestionId, title, done, canChange }: { suggestionId: string; title: string; done: boolean; canChange: boolean }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  return (
    <input
      type="checkbox"
      className="mt-1 size-5 shrink-0 accent-sea disabled:cursor-not-allowed"
      checked={done}
      disabled={!canChange || pending}
      aria-label={done ? `Mark "${title}" as not done` : `Mark "${title}" as done`}
      title={canChange ? undefined : "Only the person who added it, or an admin, can tick it off"}
      onChange={(e) =>
        start(async () => {
          const res = await setSuggestionDone({ suggestionId, done: e.target.checked });
          if (!res.ok) alert(res.message);
          router.refresh();
        })
      }
    />
  );
}

export function SuggestionDeleteButton({ suggestionId, title }: { suggestionId: string; title: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      className="text-sm text-ink-soft hover:text-danger disabled:opacity-50"
      onClick={() =>
        start(async () => {
          if (!confirm(`Delete "${title}"?`)) return;
          const res = await deleteSuggestion(suggestionId);
          if (!res.ok) alert(res.message);
          router.refresh();
        })
      }
    >
      Delete<span className="sr-only"> {title}</span>
    </button>
  );
}
