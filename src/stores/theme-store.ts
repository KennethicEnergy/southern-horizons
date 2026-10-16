"use client";

import { create } from "zustand";
import { parseThemeChoice, themeCookie } from "@/lib/theme";
import { applyTheme } from "@/lib/theme-dom";
import type { ThemeChoice } from "@/types/theme";

type ThemeState = {
  choice: ThemeChoice;
  /** Saves the choice in the theme cookie and shows it right away. */
  setChoice: (choice: ThemeChoice) => void;
};

/** One store for the page, so every switcher (footer, sidebar, /components) shows the same choice. */
export const useThemeStore = create<ThemeState>((set) => ({
  choice: typeof document === "undefined" ? "system" : parseThemeChoice(document.cookie),
  setChoice: (choice) => {
    document.cookie = themeCookie(choice);
    applyTheme(choice);
    set({ choice });
  },
}));
