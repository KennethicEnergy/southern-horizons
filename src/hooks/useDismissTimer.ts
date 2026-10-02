"use client";

import { useEffect, useRef } from "react";
import { createPausableTimer, type PausableTimer } from "@/lib/timer";

type DismissTimerOptions = {
  duration: number;
  /** While true the countdown holds, e.g. when the pointer or keyboard focus is on the toast. */
  paused: boolean;
  onExpire: () => void;
};

export const useDismissTimer = ({ duration, paused, onExpire }: DismissTimerOptions) => {
  const timer = useRef<PausableTimer | null>(null);
  const latest = useRef({ paused, onExpire });

  useEffect(() => {
    latest.current = { paused, onExpire };
  });

  useEffect(() => {
    const created = createPausableTimer(() => latest.current.onExpire(), duration);
    if (latest.current.paused) created.pause();
    timer.current = created;
    return created.clear;
  }, [duration]);

  useEffect(() => {
    if (paused) timer.current?.pause();
    else timer.current?.resume();
  }, [paused]);
};
