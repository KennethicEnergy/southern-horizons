// @vitest-environment happy-dom
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { act } from "react";
import { renderHook } from "@/test/render-hook";
import { useTheme } from "@/hooks/useTheme";
import { useThemeStore } from "@/stores/theme-store";
import { themeCookie } from "@/lib/theme";

beforeEach(() => {
  window.matchMedia = ((query: string) => ({ matches: query.includes("dark") })) as typeof window.matchMedia;
  useThemeStore.setState({ choice: "system" });
});
afterEach(() => {
  document.cookie = themeCookie("system");
  document.documentElement.removeAttribute("data-theme");
});

describe("useTheme", () => {
  it("returns the current choice once mounted", () => {
    useThemeStore.setState({ choice: "dark" });
    const { result } = renderHook(useTheme, {});
    expect(result.current?.choice).toBe("dark");
  });

  it("re-renders when the choice changes anywhere on the page", () => {
    const { result } = renderHook(useTheme, {});
    act(() => useThemeStore.getState().setChoice("light"));
    expect(result.current?.choice).toBe("light");
  });

  it("exposes setChoice", () => {
    const { result } = renderHook(useTheme, {});
    act(() => result.current?.setChoice("dark"));
    expect(useThemeStore.getState().choice).toBe("dark");
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
  });
});
