import { describe, expect, it } from "vitest";
import { initials } from "@/lib/initials";

describe("initials", () => {
  it("takes the first letter of the first two words", () => {
    expect(initials("Maria Santos")).toBe("MS");
    expect(initials("Juan dela Cruz")).toBe("Jd");
  });

  it("handles a single name", () => {
    expect(initials("Lorem")).toBe("L");
  });

  it("ignores extra spaces", () => {
    expect(initials("  Ana   Reyes ")).toBe("AR");
  });

  it("returns an empty string for a blank name", () => {
    expect(initials("   ")).toBe("");
  });
});
