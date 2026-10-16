"use client";

import { useLayoutEffect } from "react";
import { DARK_QUERY } from "@/config/theme";
import { applyTheme } from "@/lib/theme-dom";
import type { ThemeChoice } from "@/types/theme";

/**
 * Keeps <html data-theme> right after the inline script in <head> set it:
 * - re-applies on mount, because React's dev-mode remount clears attributes it doesn't manage
 *   (a no-op in production, where the value is already there);
 * - while on Match device, follows the device setting live.
 * Runs before paint, so neither case flashes.
 */
export const useThemeSync = ({ choice }: { choice: ThemeChoice }) => {
  useLayoutEffect(() => {
    applyTheme(choice);
    if (choice !== "system" || !window.matchMedia) return;

    const query = window.matchMedia(DARK_QUERY);
    const follow = () => applyTheme("system");
    query.addEventListener("change", follow);
    return () => query.removeEventListener("change", follow);
  }, [choice]);
};
