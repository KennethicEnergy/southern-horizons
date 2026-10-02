import { MAX_TOASTS } from "@/config/toast";
import type { Toast } from "@/types/toast";

/** Newest first; anything past `max` (the oldest) falls off. */
export const enqueueToast = (toasts: Toast[], toast: Toast, max = MAX_TOASTS) => [toast, ...toasts].slice(0, max);

export const removeToast = (toasts: Toast[], id: string) => toasts.filter(({ id: toastId }) => toastId !== id);
