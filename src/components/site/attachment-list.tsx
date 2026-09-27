import { HugeiconsIcon } from "@hugeicons/react";
import { Doc01Icon, Download01Icon, Pdf01Icon } from "@hugeicons/core-free-icons";
import Image from "next/image";
import type { Media } from "@/db/schema";

function fileSize(bytes: number) {
  return bytes > 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.ceil(bytes / 1024)} KB`;
}

export function AttachmentList({ items }: { items: Media[] }) {
  if (items.length === 0) return null;
  const images = items.filter((m) => m.kind === "image");
  const videos = items.filter((m) => m.kind === "video");
  const docs = items.filter((m) => m.kind === "document");

  return (
    <div className="space-y-8">
      {images.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
          {images.map((m) => (
            <a key={m.id} href={m.url} className="relative block aspect-square overflow-hidden rounded-lg bg-sky">
              <Image src={m.url} alt={m.alt ?? ""} fill sizes="(min-width: 768px) 22vw, 50vw" className="object-cover" />
            </a>
          ))}
        </div>
      ) : null}

      {videos.map((m) => (
        <video key={m.id} controls preload="metadata" className="w-full rounded-lg bg-ink" aria-label={m.alt ?? m.filename}>
          <source src={m.url} type={m.mimeType} />
        </video>
      ))}

      {docs.length > 0 ? (
        <ul className="divide-y divide-line rounded-xl border border-line">
          {docs.map((m) => (
            <li key={m.id}>
              <a
                href={m.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 px-4 py-3.5 hover:bg-sky"
                download={m.mimeType !== "application/pdf" ? m.filename : undefined}
              >
                <HugeiconsIcon icon={m.mimeType === "application/pdf" ? Pdf01Icon : Doc01Icon} size={24} className="text-sea" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium">{m.alt || m.filename}</span>
                  <span className="text-sm text-ink-soft">
                    {m.mimeType === "application/pdf" ? "PDF" : "Word document"}, {fileSize(m.size)}
                  </span>
                </span>
                <HugeiconsIcon icon={Download01Icon} size={20} className="text-ink-soft" />
              </a>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
