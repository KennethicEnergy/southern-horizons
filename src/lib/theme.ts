import { DARK_QUERY, THEME_CHOICES, THEME_COOKIE, THEME_COOKIE_MAX_AGE } from "@/config/theme";
import type { Theme, ThemeChoice } from "@/types/theme";

const isThemeChoice = (value: string): value is ThemeChoice => (THEME_CHOICES as readonly string[]).includes(value);

/** The saved choice from a cookie string such as `document.cookie`. Missing or unknown means follow the device. */
export const parseThemeChoice = (cookies: string): ThemeChoice => {
  const match = cookies.match(new RegExp(`(?:^|;\\s*)${THEME_COOKIE}=([^;]*)`));
  const value = match ? decodeURIComponent(match[1] ?? "") : "";
  return isThemeChoice(value) ? value : "system";
};

export const resolveTheme = (choice: ThemeChoice, prefersDark: boolean): Theme =>
  choice === "dark" || (choice === "system" && prefersDark) ? "dark" : "light";

/** The cookie to write for a choice. Match device deletes it, so no cookie always means `system`. */
export const themeCookie = (choice: ThemeChoice): string =>
  choice === "system"
    ? `${THEME_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax`
    : `${THEME_COOKIE}=${choice}; Path=/; Max-Age=${THEME_COOKIE_MAX_AGE}; SameSite=Lax`;

/**
 * Runs in <head> before the first paint (see the root layout): same rules as parseThemeChoice and
 * resolveTheme, written as plain ES5 so it needs no bundling. Tests check the two always agree.
 */
export const themeInitScript = `(function(){try{var m=document.cookie.match(/(?:^|;\\s*)${THEME_COOKIE}=([^;]*)/);var c=m?decodeURIComponent(m[1]):"";var d=c==="dark"||(c!=="light"&&!!window.matchMedia&&window.matchMedia(${JSON.stringify(DARK_QUERY)}).matches);document.documentElement.setAttribute("data-theme",d?"dark":"light")}catch(e){}})()`;
