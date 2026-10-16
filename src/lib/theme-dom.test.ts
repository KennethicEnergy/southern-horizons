// @vitest-environment happy-dom
import { afterEach, describe, expect, it } from "vitest";
import { applyTheme, prefersDarkScheme } from "@/lib/theme-dom";

const setDevice = (dark: boolean | null) => {
  window.matchMedia = (dark === null ? undefined : (query: string) => ({ matches: dark && query.includes("dark") })) as typeof window.matchMedia;
};

afterEach(() => document.documentElement.removeAttribute("data-theme"));

describe("prefersDarkScheme", () => {
  it("reads the device setting", () => {
    setDevice(true);
    expect(prefersDarkScheme()).toBe(true);
    setDevice(false);
    expect(prefersDarkScheme()).toBe(false);
  });

  it("treats a browser without matchMedia as light", () => {
    setDevice(null);
    expect(prefersDarkScheme()).toBe(false);
  });
});

describe("applyTheme", () => {
  it("puts the resolved theme on <html>", () => {
    setDevice(true);
    applyTheme("light");
    expect(document.documentElement.getAttribute("data-theme")).toBe("light");
    applyTheme("system");
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
  });

  it("returns the theme it applied", () => {
    setDevice(false);
    expect(applyTheme("system")).toBe("light");
    expect(applyTheme("dark")).toBe("dark");
  });
});
