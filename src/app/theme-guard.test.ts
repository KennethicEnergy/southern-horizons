import { readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

/**
 * These classes are light-only: they'd stay white or ink in dark mode. Use the role tokens instead
 * (bg-surface / bg-canvas, text-fg, text-fg-soft, bg-panel; see globals.css).
 * Translucent white (bg-white/10) is allowed: it's an overlay on an always-dark ground or a photo.
 */
const LIGHT_ONLY = /(?<![\w-])(bg-white(?!\/)|text-ink|text-ink-soft|bg-sky)(?![\w-])/g;

const SRC = fileURLToPath(new URL("..", import.meta.url));

const tsxFiles = (dir: string): string[] =>
  readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return tsxFiles(path);
    return entry.name.endsWith(".tsx") ? [path] : [];
  });

describe("dark mode guard", () => {
  it("finds no light-only colour classes in components", () => {
    const offenders = tsxFiles(SRC).flatMap((file) =>
      readFileSync(file, "utf8")
        .split("\n")
        .flatMap((line, index) => [...line.matchAll(LIGHT_ONLY)].map(([match]) => `${relative(SRC, file)}:${index + 1} ${match}`)),
    );
    expect(offenders).toEqual([]);
  });
});
