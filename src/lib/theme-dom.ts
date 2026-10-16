import { DARK_QUERY } from "@/config/theme";
import { resolveTheme } from "@/lib/theme";
import type { Theme, ThemeChoice } from "@/types/theme";

/** The device's dark-mode setting. Browsers without matchMedia count as light. */
export const prefersDarkScheme = (): boolean => typeof window !== "undefined" && !!window.matchMedia && window.matchMedia(DARK_QUERY).matches;

/** Shows `choice` by setting data-theme on <html>, which swaps the role colours in globals.css. */
export const applyTheme = (choice: ThemeChoice): Theme => {
  const theme = resolveTheme(choice, prefersDarkScheme());
  document.documentElement.setAttribute("data-theme", theme);
  return theme;
};
