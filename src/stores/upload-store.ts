"use client";

import { create } from "zustand";
import type { Media } from "@/db/schema";
import { errorMessage, uploadFile } from "@/lib/upload-client";

export type UploadItem = {
  id: string;
  name: string;
  progress: number;
  status: "uploading" | "done" | "error";
  error?: string;
  media?: Media;
};

type UploadState = {
  items: UploadItem[];
  /** Uploads files one at a time and resolves with the media that finished successfully. */
  upload: (files: File[]) => Promise<Media[]>;
  dismiss: (id: string) => void;
  clearFinished: () => void;
};

export const useUploadStore = create<UploadState>((set) => {
  const patch = (id: string, changes: Partial<UploadItem>) =>
    set((s) => ({ items: s.items.map((it) => (it.id === id ? { ...it, ...changes } : it)) }));

  return {
    items: [],
    async upload(files) {
      const queued = files.map((f) => ({ id: crypto.randomUUID(), file: f }));
      set((s) => ({
        items: [
          ...s.items,
          ...queued.map(({ id, file }) => ({ id, name: file.name, progress: 0, status: "uploading" as const })),
        ],
      }));

      const done: Media[] = [];
      for (const { id, file } of queued) {
        try {
          const media = await uploadFile(file, (progress) => patch(id, { progress }));
          patch(id, { status: "done", progress: 100, media });
          done.push(media);
        } catch (err) {
          patch(id, { status: "error", error: errorMessage(err) });
        }
      }
      return done;
    },
    dismiss: (id) => set((s) => ({ items: s.items.filter((it) => it.id !== id) })),
    clearFinished: () => set((s) => ({ items: s.items.filter((it) => it.status === "uploading") })),
  };
});
