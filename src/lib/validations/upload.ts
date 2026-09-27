import { z } from "zod";
import type { MediaKind } from "@/db/schema";

const MB = 1024 * 1024;

export const UPLOAD_RULES = {
  "image/jpeg": { kind: "image", maxBytes: 10 * MB, ext: "jpg" },
  "image/png": { kind: "image", maxBytes: 10 * MB, ext: "png" },
  "image/webp": { kind: "image", maxBytes: 10 * MB, ext: "webp" },
  "image/svg+xml": { kind: "image", maxBytes: 512 * 1024, ext: "svg" },
  "video/mp4": { kind: "video", maxBytes: 250 * MB, ext: "mp4" },
  "video/webm": { kind: "video", maxBytes: 250 * MB, ext: "webm" },
  "application/pdf": { kind: "document", maxBytes: 25 * MB, ext: "pdf" },
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": {
    kind: "document",
    maxBytes: 25 * MB,
    ext: "docx",
  },
} as const satisfies Record<string, { kind: MediaKind; maxBytes: number; ext: string }>;

export type AllowedMimeType = keyof typeof UPLOAD_RULES;
export const ALLOWED_MIME_TYPES = Object.keys(UPLOAD_RULES) as AllowedMimeType[];

export const presignSchema = z
  .object({
    filename: z.string().trim().min(1).max(200),
    contentType: z.enum(ALLOWED_MIME_TYPES as [AllowedMimeType, ...AllowedMimeType[]], {
      message: "This file type isn't supported. Use JPEG, PNG, WebP, SVG, MP4, WebM, PDF, or DOCX.",
    }),
    size: z.number().int().positive(),
  })
  .superRefine((v, ctx) => {
    const rule = UPLOAD_RULES[v.contentType];
    if (v.size > rule.maxBytes) {
      ctx.addIssue({
        code: "custom",
        path: ["size"],
        message: `This file is too large. The limit for ${rule.ext.toUpperCase()} is ${Math.round(rule.maxBytes / MB) || 0.5} MB.`,
      });
    }
  });

export const finalizeSchema = z.object({
  mediaId: z.uuid(),
  alt: z.string().trim().max(300).optional(),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
});
