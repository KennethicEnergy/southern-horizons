import type { ToastTone } from "@/types/toast";

/** How many toasts show at once. A new one pushes the oldest out. */
export const MAX_TOASTS = 3;

/** Errors stay longer: they usually need reading, not just noticing. */
export const toastDurations: Record<ToastTone, number> = {
  success: 5000,
  info: 5000,
  error: 8000,
};

/** Matches the exit transition in components/ui/toaster.tsx. */
export const TOAST_EXIT_MS = 200;
