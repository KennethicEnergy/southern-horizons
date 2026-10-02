import { describe, expect, it } from "vitest";
import type { Toast } from "@/types/toast";
import { enqueueToast, removeToast } from "@/lib/toast";

const make = (id: string): Toast => ({ id, tone: "info", message: `Toast ${id}`, duration: 5000 });

describe("enqueueToast", () => {
  it("puts the newest toast first", () => {
    expect(enqueueToast([make("a")], make("b")).map(({ id }) => id)).toEqual(["b", "a"]);
  });

  it("keeps at most three, dropping the oldest", () => {
    const stack = [make("c"), make("b"), make("a")];
    expect(enqueueToast(stack, make("d")).map(({ id }) => id)).toEqual(["d", "c", "b"]);
  });

  it("accepts a custom cap", () => {
    expect(enqueueToast([make("a")], make("b"), 1).map(({ id }) => id)).toEqual(["b"]);
  });

  it("does not change the list it was given", () => {
    const stack = [make("a")];
    enqueueToast(stack, make("b"));
    expect(stack.map(({ id }) => id)).toEqual(["a"]);
  });
});

describe("removeToast", () => {
  it("removes the toast with that id", () => {
    expect(removeToast([make("a"), make("b")], "a").map(({ id }) => id)).toEqual(["b"]);
  });

  it("leaves the list alone when the id is unknown", () => {
    expect(removeToast([make("a")], "zzz").map(({ id }) => id)).toEqual(["a"]);
  });
});
