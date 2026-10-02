// @vitest-environment happy-dom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act } from "react";
import { renderHook } from "@/test/render-hook";
import { useDismissTimer } from "@/hooks/useDismissTimer";

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

const advance = (ms: number) => act(() => vi.advanceTimersByTime(ms));

describe("useDismissTimer", () => {
  it("calls onExpire after the duration", () => {
    const onExpire = vi.fn();
    renderHook(useDismissTimer, { duration: 1000, paused: false, onExpire });
    advance(999);
    expect(onExpire).not.toHaveBeenCalled();
    advance(1);
    expect(onExpire).toHaveBeenCalledTimes(1);
  });

  it("waits while paused and then finishes the remaining time", () => {
    const onExpire = vi.fn();
    const { rerender } = renderHook(useDismissTimer, { duration: 1000, paused: false, onExpire });
    advance(700);
    rerender({ duration: 1000, paused: true, onExpire });
    advance(5000);
    expect(onExpire).not.toHaveBeenCalled();
    rerender({ duration: 1000, paused: false, onExpire });
    advance(300);
    expect(onExpire).toHaveBeenCalledTimes(1);
  });

  it("does not start counting when it mounts paused", () => {
    const onExpire = vi.fn();
    renderHook(useDismissTimer, { duration: 1000, paused: true, onExpire });
    advance(5000);
    expect(onExpire).not.toHaveBeenCalled();
  });

  it("calls the latest onExpire without restarting the timer", () => {
    const first = vi.fn();
    const second = vi.fn();
    const { rerender } = renderHook(useDismissTimer, { duration: 1000, paused: false, onExpire: first });
    advance(600);
    rerender({ duration: 1000, paused: false, onExpire: second });
    advance(400);
    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledTimes(1);
  });

  it("stops the timer on unmount", () => {
    const onExpire = vi.fn();
    const { unmount } = renderHook(useDismissTimer, { duration: 1000, paused: false, onExpire });
    unmount();
    advance(5000);
    expect(onExpire).not.toHaveBeenCalled();
  });
});
