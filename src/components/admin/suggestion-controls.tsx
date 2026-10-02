"use client";

/** TEMPORARY: see the note on `suggestions` in src/db/schema.ts. */

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { deleteSuggestion, setSuggestionDone } from "@/actions/suggestions";
import { actionIcons } from "@/config/icons";
import { toastResult } from "@/stores/toast-store";
import { Icon } from "@/components/ui/icon";

type SuggestionDoneToggleProps = { suggestionId: string; title: string; done: boolean; canChange: boolean };

export const SuggestionDoneToggle = ({ suggestionId, title, done, canChange }: SuggestionDoneToggleProps) => {
  const router = useRouter();
  const [pending, start] = useTransition();
  return (
    <input
      type="checkbox"
      className="mt-1 size-5 shrink-0 accent-sea disabled:cursor-not-allowed"
      checked={done}
      disabled={!canChange || pending}
      aria-label={done ? `Mark "${title}" as not done` : `Mark "${title}" as done`}
      title={canChange ? undefined : "Only the person who added it, or the President, can tick it off"}
      onChange={({ target: { checked } }) =>
        start(async () => {
          toastResult(await setSuggestionDone({ suggestionId, done: checked }));
          router.refresh();
        })
      }
    />
  );
};

export const SuggestionDeleteButton = ({ suggestionId, title }: { suggestionId: string; title: string }) => {
  const router = useRouter();
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      className="inline-flex items-center gap-1.5 text-sm text-ink-soft hover:text-danger disabled:opacity-50"
      onClick={() =>
        start(async () => {
          if (!confirm(`Delete "${title}"?`)) return;
          toastResult(await deleteSuggestion(suggestionId), "Suggestion deleted.");
          router.refresh();
        })
      }
    >
      <Icon icon={actionIcons.delete} size={16} />
      Delete<span className="sr-only"> {title}</span>
    </button>
  );
};
