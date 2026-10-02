import { beforeEach, describe, expect, it } from "vitest";
import { toastDurations } from "@/config/toast";
import { toast, toastResult, useToastStore } from "@/stores/toast-store";

const toasts = () => useToastStore.getState().toasts;

beforeEach(() => useToastStore.setState({ toasts: [] }));

describe("toast", () => {
  it("adds a toast with the tone and that tone's duration", () => {
    toast.success("Saved");
    expect(toasts()).toMatchObject([{ tone: "success", message: "Saved", duration: toastDurations.success }]);
  });

  it("gives errors longer to read", () => {
    toast.error("Couldn't save");
    expect(toasts()[0]?.duration).toBe(toastDurations.error);
    expect(toastDurations.error).toBeGreaterThan(toastDurations.success);
  });

  it("lets a caller override the duration", () => {
    toast.info("Heads up", { duration: 1234 });
    expect(toasts()[0]?.duration).toBe(1234);
  });

  it("returns the new toast's id", () => {
    const id = toast.info("Hello");
    expect(toasts()[0]?.id).toBe(id);
  });

  it("caps the stack at three", () => {
    ["1", "2", "3", "4"].forEach((message) => toast.info(message));
    expect(toasts().map(({ message }) => message)).toEqual(["4", "3", "2"]);
  });
});

describe("toastResult", () => {
  it("shows a failed action's message as an error and returns false", () => {
    expect(toastResult({ ok: false, message: "Not allowed." })).toBe(false);
    expect(toasts()).toMatchObject([{ tone: "error", message: "Not allowed." }]);
  });

  it("shows a successful action's message and returns true", () => {
    expect(toastResult({ ok: true, message: "Approved." })).toBe(true);
    expect(toasts()).toMatchObject([{ tone: "success", message: "Approved." }]);
  });

  it("falls back to the given success text when the action has none", () => {
    toastResult({ ok: true }, "Saved");
    expect(toasts()).toMatchObject([{ tone: "success", message: "Saved" }]);
  });

  it("stays quiet on a silent success", () => {
    expect(toastResult({ ok: true })).toBe(true);
    expect(toasts()).toEqual([]);
  });
});

describe("dismiss", () => {
  it("removes the toast", () => {
    const id = toast.info("Bye");
    useToastStore.getState().dismiss(id);
    expect(toasts()).toEqual([]);
  });
});
