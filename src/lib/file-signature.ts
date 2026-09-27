import type { AllowedMimeType } from "@/lib/validations/upload";

const startsWith = (bytes: Uint8Array, sig: number[], offset = 0) => sig.every((b, i) => bytes[offset + i] === b);
const ascii = (s: string) => [...s].map((c) => c.charCodeAt(0));

/**
 * Checks the file's real contents against the declared type.
 * Extensions and Content-Type headers are client-controlled, bytes are not.
 */
export function matchesSignature(type: AllowedMimeType, head: Uint8Array): boolean {
  switch (type) {
    case "image/jpeg":
      return startsWith(head, [0xff, 0xd8, 0xff]);
    case "image/png":
      return startsWith(head, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
    case "image/webp":
      return startsWith(head, ascii("RIFF")) && startsWith(head, ascii("WEBP"), 8);
    case "video/mp4":
      return startsWith(head, ascii("ftyp"), 4);
    case "video/webm":
      return startsWith(head, [0x1a, 0x45, 0xdf, 0xa3]);
    case "application/pdf":
      return startsWith(head, ascii("%PDF-"));
    case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
      return startsWith(head, [0x50, 0x4b, 0x03, 0x04]);
    case "image/svg+xml":
      return isSafeSvg(new TextDecoder().decode(head));
  }
}

/**
 * SVGs are XML and can carry scripts. Uploads are limited to admins, and anything
 * with scripting, event handlers, external references, or embedded HTML is rejected outright.
 */
export function isSafeSvg(text: string): boolean {
  const src = text.replace(/^\uFEFF/, "").trim();
  if (!/<svg[\s>]/i.test(src)) return false;
  const blocked = [
    /<script/i,
    /\son[a-z]+\s*=/i,
    /javascript:/i,
    /<foreignObject/i,
    /<iframe/i,
    /<embed/i,
    /<object/i,
    /xlink:href\s*=\s*["']?(?!#)/i,
    /\shref\s*=\s*["']?(?!#)/i,
    /<!ENTITY/i,
  ];
  return !blocked.some((re) => re.test(src));
}
