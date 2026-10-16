"use client";

import { useSyncExternalStore } from "react";
import { useThemeStore } from "@/stores/theme-store";

const subscribeNever = () => () => {};

/**
 * The theme choice for a switcher. `choice` is null during server rendering and hydration: the server
 * can't read the cookie, so showing a choice there would make the server and client HTML disagree.
 */
export const useTheme = () => {
  const hydrated = useSyncExternalStore(
    subscribeNever,
    () => true,
    () => false,
  );
  const choice = useThemeStore(({ choice }) => choice);
  const setChoice = useThemeStore(({ setChoice }) => setChoice);
  return { choice: hydrated ? choice : null, setChoice };
};
