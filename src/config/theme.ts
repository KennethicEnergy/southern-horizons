/** The switcher's options, in the order they appear. `system` (Match device) is the default. */
export const THEME_CHOICES = ["light", "dark", "system"] as const;

/** Cookie holding the choice. It's read by the inline script in <head>, never by the server, so pages stay static. */
export const THEME_COOKIE = "theme";
export const THEME_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export const DARK_QUERY = "(prefers-color-scheme: dark)";

/** Browser toolbar colours, matching --canvas and the brand ink in globals.css. */
export const themeColors = { light: "#023d54", dark: "#01161f" } as const;

/** The switcher's options, with the labels screen readers and tooltips use. */
export const THEME_OPTIONS = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "system", label: "Match device" },
] as const satisfies readonly { value: (typeof THEME_CHOICES)[number]; label: string }[];
