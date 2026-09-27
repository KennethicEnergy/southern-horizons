"use client";

import axios, { isAxiosError } from "axios";
import type { Media } from "@/db/schema";

const RASTER_TO_WEBP = new Set(["image/jpeg", "image/png"]);
const MAX_DIMENSION = 2400;

type Prepared = { file: File; width?: number; height?: number };

/**
 * JPEG/PNG are re-encoded to WebP in the browser before upload.
 * Re-encoding through a canvas also strips EXIF data, including GPS
 * coordinates that phones embed in photos.
 */
async function prepare(file: File): Promise<Prepared> {
  if (!file.type.startsWith("image/") || file.type === "image/svg+xml") return { file };

  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  if (!RASTER_TO_WEBP.has(file.type)) {
    bitmap.close();
    return { file, width, height };
  }

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/webp", 0.85));
  if (!blob) return { file, width, height };

  const name = file.name.replace(/\.(jpe?g|png)$/i, "") + ".webp";
  return { file: new File([blob], name, { type: "image/webp" }), width, height };
}

export function errorMessage(err: unknown): string {
  if (isAxiosError(err)) return (err.response?.data as { message?: string } | undefined)?.message ?? err.message;
  return err instanceof Error ? err.message : "Upload failed. Try again.";
}

export async function uploadFile(original: File, onProgress: (pct: number) => void, alt?: string): Promise<Media> {
  const { file, width, height } = await prepare(original);

  const { data: presign } = await axios.post<{ mediaId: string; uploadUrl: string }>("/api/uploads/presign", {
    filename: file.name,
    contentType: file.type,
    size: file.size,
  });

  await axios.put(presign.uploadUrl, file, {
    headers: { "Content-Type": file.type },
    onUploadProgress: (e) => e.total && onProgress(Math.round((e.loaded / e.total) * 95)),
  });

  const { data } = await axios.post<{ media: Media }>("/api/uploads/finalize", {
    mediaId: presign.mediaId,
    alt,
    width,
    height,
  });
  onProgress(100);
  return data.media;
}
