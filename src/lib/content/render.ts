import "server-only";
import { generateHTML } from "@tiptap/html/server";
import type { JSONContent } from "@tiptap/core";
import { tiptapExtensions } from "./extensions";

/**
 * Tiptap JSON is rendered through the schema, so only known nodes and marks
 * make it into the HTML. Arbitrary markup pasted into the editor is dropped.
 */
export function renderContent(doc: Record<string, unknown> | null | undefined): string {
  if (!doc) return "";
  try {
    return generateHTML(doc as JSONContent, tiptapExtensions);
  } catch (err) {
    console.error("Failed to render content", err);
    return "";
  }
}

export function plainTextExcerpt(doc: Record<string, unknown>, max = 200): string {
  const parts: string[] = [];
  const walk = (node: unknown) => {
    if (!node || typeof node !== "object") return;
    const n = node as { text?: string; content?: unknown[] };
    if (n.text) parts.push(n.text);
    n.content?.forEach(walk);
  };
  walk(doc);
  const text = parts.join(" ").replace(/\s+/g, " ").trim();
  return text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text;
}
