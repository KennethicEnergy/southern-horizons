import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createPausableTimer } from "@/lib/timer";

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

describe("createPausableTimer", () => {
  it("calls onExpire once the duration passes", () => {
    const onExpire = vi.fn();
    createPausableTimer(onExpire, 1000);
    vi.advanceTimersByTime(999);
    expect(onExpire).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(onExpire).toHaveBeenCalledTimes(1);
  });

  it("does not expire while paused", () => {
    const onExpire = vi.fn();
    const timer = createPausableTimer(onExpire, 1000);
    timer.pause();
    vi.advanceTimersByTime(5000);
    expect(onExpire).not.toHaveBeenCalled();
  });

  it("resumes with only the time that was left", () => {
    const onExpire = vi.fn();
    const timer = createPausableTimer(onExpire, 1000);
    vi.advanceTimersByTime(600);
    timer.pause();
    vi.advanceTimersByTime(5000);
    timer.resume();
    vi.advanceTimersByTime(399);
    expect(onExpire).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(onExpire).toHaveBeenCalledTimes(1);
  });

  it("ignores repeated pause and resume calls", () => {
    const onExpire = vi.fn();
    const timer = createPausableTimer(onExpire, 1000);
    vi.advanceTimersByTime(500);
    timer.pause();
    timer.pause();
    timer.resume();
    timer.resume();
    vi.advanceTimersByTime(500);
    expect(onExpire).toHaveBeenCalledTimes(1);
  });

  it("never fires after clear", () => {
    const onExpire = vi.fn();
    const timer = createPausableTimer(onExpire, 1000);
    timer.clear();
    timer.resume();
    vi.advanceTimersByTime(5000);
    expect(onExpire).not.toHaveBeenCalled();
  });
});
