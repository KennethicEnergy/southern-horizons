"use client";

import { useRef, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Upload01Icon } from "@hugeicons/core-free-icons";
import type { Media } from "@/db/schema";
import { useUploadStore } from "@/stores/upload-store";

export const ACCEPT_ALL =
  "image/jpeg,image/png,image/webp,image/svg+xml,video/mp4,video/webm,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document";
export const ACCEPT_IMAGES = "image/jpeg,image/png,image/webp";

export function UploadDropzone({
  accept = ACCEPT_ALL,
  multiple = true,
  onUploaded,
  label = "Drop files here or choose from your device",
  hint = "Photos (JPEG, PNG, WebP), video (MP4, WebM), PDF, or Word. Photos are converted to WebP automatically.",
}: {
  accept?: string;
  multiple?: boolean;
  onUploaded?: (media: Media[]) => void;
  label?: string;
  hint?: string;
}) {
  const upload = useUploadStore((s) => s.upload);
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const handle = async (list: FileList | null) => {
    const files = Array.from(list ?? []);
    if (files.length === 0) return;
    const done = await upload(multiple ? files : files.slice(0, 1));
    if (done.length) onUploaded?.(done);
  };

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        void handle(e.dataTransfer.files);
      }}
      className={`rounded-xl border-2 border-dashed px-6 py-8 text-center ${dragging ? "border-sea bg-sea-mist" : "border-line bg-white"}`}
    >
      <HugeiconsIcon icon={Upload01Icon} size={28} className="mx-auto text-sea" />
      <p className="mt-3 font-medium">
        <button type="button" className="text-sea underline" onClick={() => inputRef.current?.click()}>
          {label}
        </button>
      </p>
      <p className="mx-auto mt-1 max-w-md text-sm text-ink-soft">{hint}</p>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        className="hidden"
        onChange={(e) => {
          void handle(e.target.files);
          e.target.value = "";
        }}
      />
    </div>
  );
}
