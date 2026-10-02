import { describe, expect, it } from "vitest";
import { parallaxStyle } from "@/lib/motion";

describe("parallaxStyle", () => {
  it("sets the drift distance in pixels", () => {
    expect(parallaxStyle(40)).toEqual({ "--parallax-shift": "40px" });
  });

  it("keeps the sign, so negative layers float forward", () => {
    expect(parallaxStyle(-24)).toEqual({ "--parallax-shift": "-24px" });
  });
});
