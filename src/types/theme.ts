import type { THEME_CHOICES } from "@/config/theme";

/** What the person picked in the switcher. `system` follows the device setting. */
export type ThemeChoice = (typeof THEME_CHOICES)[number];

/** What the page actually shows: a choice of `system` resolves to one of these. */
export type Theme = "light" | "dark";
