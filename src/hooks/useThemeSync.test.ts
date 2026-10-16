// @vitest-environment happy-dom
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { act } from "react";
import { renderHook } from "@/test/render-hook";
import { useThemeSync } from "@/hooks/useThemeSync";
import type { ThemeChoice } from "@/types/theme";

const html = document.documentElement;

/** A controllable device setting: flip it and the registered "change" listeners fire, like a real MediaQueryList. */
const fakeDevice = () => {
  let dark = false;
  const listeners = new Set<() => void>();
  window.matchMedia = (() => ({
    get matches() {
      return dark;
    },
    addEventListener: (_: string, listener: () => void) => listeners.add(listener),
    removeEventListener: (_: string, listener: () => void) => listeners.delete(listener),
  })) as unknown as typeof window.matchMedia;
  return {
    setDark: (next: boolean) =>
      act(() => {
        dark = next;
        listeners.forEach((listener) => listener());
      }),
    listenerCount: () => listeners.size,
  };
};

let device: ReturnType<typeof fakeDevice>;
beforeEach(() => {
  device = fakeDevice();
});
afterEach(() => html.removeAttribute("data-theme"));

describe("useThemeSync", () => {
  it("applies the choice on mount, restoring an attribute React cleared", () => {
    html.removeAttribute("data-theme");
    renderHook(useThemeSync, { choice: "dark" as ThemeChoice });
    expect(html.getAttribute("data-theme")).toBe("dark");
  });

  it("follows the device live while on Match device", () => {
    renderHook(useThemeSync, { choice: "system" as ThemeChoice });
    expect(html.getAttribute("data-theme")).toBe("light");
    device.setDark(true);
    expect(html.getAttribute("data-theme")).toBe("dark");
  });

  it("ignores the device once a theme is picked", () => {
    renderHook(useThemeSync, { choice: "light" as ThemeChoice });
    device.setDark(true);
    expect(html.getAttribute("data-theme")).toBe("light");
    expect(device.listenerCount()).toBe(0);
  });

  it("stops listening when the choice changes or it unmounts", () => {
    const { rerender, unmount } = renderHook(useThemeSync, { choice: "system" as ThemeChoice });
    expect(device.listenerCount()).toBe(1);
    rerender({ choice: "dark" });
    expect(device.listenerCount()).toBe(0);
    rerender({ choice: "system" });
    unmount();
    expect(device.listenerCount()).toBe(0);
  });
});
