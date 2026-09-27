"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { Cancel01Icon } from "@hugeicons/core-free-icons";
import { useUploadStore } from "@/stores/upload-store";

/** Floating progress list for uploads in flight, backed by the Zustand store. */
export function UploadQueue() {
  const { items, dismiss, clearFinished } = useUploadStore();
  if (items.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 w-80 rounded-xl bg-white p-4 shadow-lg ring-1 ring-line" aria-live="polite">
      <div className="flex items-center justify-between">
        <p className="font-medium">Uploads</p>
        <button type="button" onClick={clearFinished} className="text-sm text-ink-soft hover:text-ink">
          Clear finished
        </button>
      </div>
      <ul className="mt-3 max-h-60 space-y-3 overflow-y-auto">
        {items.map((it) => (
          <li key={it.id}>
            <div className="flex items-center justify-between gap-2 text-sm">
              <span className="truncate">{it.name}</span>
              {it.status !== "uploading" ? (
                <button type="button" aria-label={`Dismiss ${it.name}`} onClick={() => dismiss(it.id)}>
                  <HugeiconsIcon icon={Cancel01Icon} size={16} />
                </button>
              ) : (
                <span className="tabular-nums text-ink-soft">{it.progress}%</span>
              )}
            </div>
            {it.status === "error" ? (
              <p className="mt-1 text-sm text-danger">{it.error}</p>
            ) : (
              <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-sky">
                <div
                  className={`h-full rounded-full ${it.status === "done" ? "bg-leaf" : "bg-sea"}`}
                  style={{ width: `${it.progress}%` }}
                />
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
