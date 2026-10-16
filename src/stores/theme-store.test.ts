// @vitest-environment happy-dom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { themeCookie } from "@/lib/theme";

const html = document.documentElement;

beforeEach(() => {
  vi.resetModules();
  window.matchMedia = ((query: string) => ({ matches: query.includes("dark") })) as typeof window.matchMedia;
});

afterEach(() => {
  document.cookie = themeCookie("system");
  html.removeAttribute("data-theme");
});

const loadStore = async () => (await import("@/stores/theme-store")).useThemeStore;

describe("useThemeStore", () => {
  it("starts from the saved cookie", async () => {
    document.cookie = themeCookie("dark");
    expect((await loadStore()).getState().choice).toBe("dark");
  });

  it("starts on Match device when nothing is saved", async () => {
    expect((await loadStore()).getState().choice).toBe("system");
  });

  it("saves a choice, applies it, and tells subscribers", async () => {
    const store = await loadStore();
    const seen: string[] = [];
    store.subscribe(({ choice }) => seen.push(choice));

    store.getState().setChoice("light");

    expect(document.cookie).toContain("theme=light");
    expect(html.getAttribute("data-theme")).toBe("light");
    expect(store.getState().choice).toBe("light");
    expect(seen).toEqual(["light"]);
  });

  it("forgets the cookie and follows the device for Match device", async () => {
    document.cookie = themeCookie("light");
    const store = await loadStore();
    store.getState().setChoice("system");
    expect(document.cookie).not.toContain("theme=light");
    expect(html.getAttribute("data-theme")).toBe("dark"); // the stubbed device prefers dark
  });
});
