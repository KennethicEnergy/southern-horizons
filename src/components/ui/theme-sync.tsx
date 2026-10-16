"use client";

import { useThemeSync } from "@/hooks/useThemeSync";
import { useThemeStore } from "@/stores/theme-store";

/** Mounted once in the root layout: keeps <html data-theme> in step with the saved choice and the device. */
export const ThemeSync = () => {
  const choice = useThemeStore(({ choice }) => choice);
  useThemeSync({ choice });
  return null;
};
