"use client";

import { useCallback, useEffect, useState, type FocusEvent } from "react";
import { TOAST_EXIT_MS } from "@/config/toast";
import { actionIcons, toastIcons } from "@/config/icons";
import { useDismissTimer } from "@/hooks/useDismissTimer";
import { useToastStore } from "@/stores/toast-store";
import type { Toast, ToastTone } from "@/types/toast";
import { Icon } from "./icon";
import { IconButton } from "./icon-button";

const toneStyles: Record<ToastTone, { chip: string; bar: string }> = {
  success: { chip: "bg-leaf-mist text-leaf", bar: "bg-mint" },
  error: { chip: "bg-danger-mist text-danger", bar: "bg-danger" },
  info: { chip: "bg-sea-mist text-sea", bar: "bg-sea" },
};

const ToastItem = ({ toast: { id, tone, message, duration } }: { toast: Toast }) => {
  const dismiss = useToastStore(({ dismiss }) => dismiss);
  const [leaving, setLeaving] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const paused = hovered || focused;
  const close = useCallback(() => setLeaving(true), []);
  const { chip, bar } = toneStyles[tone];

  useDismissTimer({ duration, paused, onExpire: close });

  // Let the exit transition play, then drop it from the store.
  useEffect(() => {
    if (!leaving) return;
    const handle = setTimeout(() => dismiss(id), TOAST_EXIT_MS);
    return () => clearTimeout(handle);
  }, [leaving, dismiss, id]);

  const onBlur = ({ currentTarget, relatedTarget }: FocusEvent<HTMLLIElement>) => {
    if (!currentTarget.contains(relatedTarget)) setFocused(false);
  };

  return (
    <li
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={onBlur}
      className={`pointer-events-auto relative flex items-start gap-3 overflow-hidden rounded-2xl bg-white/95 p-2.5 pl-3 shadow-lift ring-1 ring-line backdrop-blur transition-[opacity,translate,scale] duration-300 ease-out-soft starting:-translate-y-4 starting:scale-95 starting:opacity-0 ${
        leaving ? "-translate-y-2 scale-95 opacity-0" : ""
      }`}
    >
      <span className={`mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full ${chip}`}>
        <Icon icon={toastIcons[tone]} size={18} />
      </span>
      <p className="min-w-0 flex-1 self-center py-1 text-[0.95rem] leading-snug text-ink">{message}</p>
      <IconButton icon={actionIcons.close} label="Dismiss notification" size="sm" className="-my-0.5 text-ink-soft" onClick={close} />
      {/* Time left before it closes itself; holds while hovered or focused. */}
      <span
        aria-hidden="true"
        className={`animate-toast-countdown absolute inset-x-0 bottom-0 h-0.5 origin-left opacity-60 motion-reduce:hidden ${bar}`}
        style={{ animationDuration: `${duration}ms`, animationPlayState: paused ? "paused" : "running" }}
      />
    </li>
  );
};

/** Toasts drop in at the top centre, newest first, three at most. Mounted once in the root layout; trigger them with `toast.*`. */
export const Toaster = () => {
  const toasts = useToastStore(({ toasts }) => toasts);
  return (
    <section
      aria-label="Notifications"
      className="pointer-events-none fixed inset-x-0 top-0 z-[60] flex justify-center px-4 pt-[max(0.75rem,env(safe-area-inset-top))]"
    >
      <ol aria-live="polite" aria-relevant="additions" className="flex w-full max-w-[26rem] flex-col gap-2">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} />
        ))}
      </ol>
    </section>
  );
};
