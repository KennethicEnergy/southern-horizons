"use client";

import { create } from "zustand";
import { toastDurations } from "@/config/toast";
import type { ActionResult } from "@/lib/errors";
import { enqueueToast, removeToast } from "@/lib/toast";
import type { Toast, ToastTone } from "@/types/toast";

type ToastState = {
  toasts: Toast[];
  push: (toast: Toast) => void;
  dismiss: (id: string) => void;
};

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  push: (toast) => set(({ toasts }) => ({ toasts: enqueueToast(toasts, toast) })),
  dismiss: (id) => set(({ toasts }) => ({ toasts: removeToast(toasts, id) })),
}));

type ToastOptions = { duration?: number };

const show =
  (tone: ToastTone) =>
  (message: string, { duration = toastDurations[tone] }: ToastOptions = {}) => {
    const id = crypto.randomUUID();
    useToastStore.getState().push({ id, tone, message, duration });
    return id;
  };

/** Fire-and-forget feedback from any client component: `toast.success("Saved")`. Returns the toast's id. */
export const toast = {
  success: show("success"),
  error: show("error"),
  info: show("info"),
};

/**
 * Reports a server action's outcome: its error message on failure, its message (or `successMessage`)
 * on success, nothing on a silent success. Returns whether the action succeeded.
 */
export const toastResult = <T>(result: ActionResult<T>, successMessage?: string): result is Extract<ActionResult<T>, { ok: true }> => {
  const { ok, message } = result;
  const text = ok ? (message ?? successMessage) : message;
  if (text) (ok ? toast.success : toast.error)(text);
  return ok;
};
