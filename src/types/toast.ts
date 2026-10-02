export type ToastTone = "success" | "error" | "info";

export type Toast = {
  id: string;
  tone: ToastTone;
  message: string;
  /** Milliseconds before it dismisses itself; the countdown pauses while hovered or focused. */
  duration: number;
};
