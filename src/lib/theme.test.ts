// @vitest-environment happy-dom
import { afterEach, describe, expect, it } from "vitest";
import { THEME_CHOICES } from "@/config/theme";
import type { ThemeChoice } from "@/types/theme";
import { parseThemeChoice, resolveTheme, themeCookie, themeInitScript } from "@/lib/theme";

describe("parseThemeChoice", () => {
  it("reads the saved choice from a cookie string", () => {
    expect(parseThemeChoice("theme=dark")).toBe("dark");
    expect(parseThemeChoice("a=1; theme=light; b=2")).toBe("light");
  });

  it("falls back to following the device when there's no cookie", () => {
    expect(parseThemeChoice("")).toBe("system");
    expect(parseThemeChoice("other=1")).toBe("system");
  });

  it("ignores unknown values and look-alike cookie names", () => {
    expect(parseThemeChoice("theme=purple")).toBe("system");
    expect(parseThemeChoice("mytheme=dark")).toBe("system");
  });
});

describe("resolveTheme", () => {
  it("keeps an explicit choice whatever the device says", () => {
    expect(resolveTheme("light", true)).toBe("light");
    expect(resolveTheme("dark", false)).toBe("dark");
  });

  it("follows the device for system", () => {
    expect(resolveTheme("system", true)).toBe("dark");
    expect(resolveTheme("system", false)).toBe("light");
  });
});

describe("themeCookie", () => {
  it("remembers light or dark for a year, site-wide", () => {
    expect(themeCookie("dark")).toBe("theme=dark; Path=/; Max-Age=31536000; SameSite=Lax");
    expect(themeCookie("light")).toBe("theme=light; Path=/; Max-Age=31536000; SameSite=Lax");
  });

  it("deletes the cookie for Match device", () => {
    expect(themeCookie("system")).toBe("theme=; Path=/; Max-Age=0; SameSite=Lax");
  });
});

describe("themeInitScript", () => {
  const html = document.documentElement;

  // Cookies are written exactly as the app writes them (themeCookie, Path=/), so a later write replaces an earlier one.
  const run = ({ choice, prefersDark }: { choice: ThemeChoice; prefersDark: boolean }) => {
    document.cookie = themeCookie(choice);
    window.matchMedia = ((query: string) => ({ matches: prefersDark && query.includes("dark") })) as typeof window.matchMedia;
    html.removeAttribute("data-theme");
    new Function(themeInitScript)();
    return html.getAttribute("data-theme");
  };

  afterEach(() => {
    document.cookie = themeCookie("system");
    html.removeAttribute("data-theme");
  });

  it("agrees with resolveTheme for every saved choice and device setting", () => {
    for (const choice of THEME_CHOICES as readonly ThemeChoice[]) {
      for (const prefersDark of [true, false]) {
        expect(run({ choice, prefersDark }), `${choice}, device dark=${prefersDark}`).toBe(resolveTheme(choice, prefersDark));
      }
    }
  });

  it("never throws, even when matchMedia is missing", () => {
    document.cookie = themeCookie("system");
    window.matchMedia = undefined as unknown as typeof window.matchMedia;
    expect(() => new Function(themeInitScript)()).not.toThrow();
  });
});
