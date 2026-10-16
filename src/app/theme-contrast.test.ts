import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { contrastRatio, readCssBlock } from "@/test/contrast";

/** Every text colour must reach WCAG AA (4.5:1) on every background it's used on, in both themes. */
const AA = 4.5;
const css = readFileSync(new URL("./globals.css", import.meta.url), "utf8");
const themes = {
  light: readCssBlock(css, ":root"),
  dark: { ...readCssBlock(css, ":root"), ...readCssBlock(css, ':root[data-theme="dark"]') },
};

const TEXT_ON_BACKGROUND = [
  ...["fg", "fg-soft", "accent"].flatMap((text) => ["canvas", "surface", "panel"].map((background) => [text, background] as const)),
  ["sea-deep", "sea-mist"],
  ["leaf", "leaf-mist"],
  ["sun-ink", "sun-mist"],
  ["danger", "danger-mist"],
] as const;

describe("contrastRatio", () => {
  it("matches the WCAG reference values", () => {
    expect(contrastRatio("#000000", "#ffffff")).toBeCloseTo(21, 1);
    expect(contrastRatio("#777777", "#777777")).toBe(1);
  });
});

describe.each(Object.entries(themes))("%s theme", (_, tokens) => {
  it.each(TEXT_ON_BACKGROUND)("%s on %s reaches AA", (text, background) => {
    expect(tokens[text], `--${text} is defined`).toBeDefined();
    expect(tokens[background], `--${background} is defined`).toBeDefined();
    expect(contrastRatio(tokens[text]!, tokens[background]!)).toBeGreaterThanOrEqual(AA);
  });

  it("keeps fixed brand pairs readable: ink on sun, white on the solid danger and sea fills", () => {
    expect(contrastRatio(tokens["on-sun"]!, "#fdfd68")).toBeGreaterThanOrEqual(AA);
    expect(contrastRatio("#ffffff", tokens["danger-solid"]!)).toBeGreaterThanOrEqual(AA);
    expect(contrastRatio("#ffffff", "#0c6980")).toBeGreaterThanOrEqual(AA);
  });
});
