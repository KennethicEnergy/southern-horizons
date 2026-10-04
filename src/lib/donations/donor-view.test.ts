import { describe, expect, it } from "vitest";
import { toDonorView } from "@/lib/donations/donor-view";

const ana = { isAnonymous: false, donorName: "Ana Cruz", donorEmail: "ana@example.com", message: "Para sa mga bata!" };

describe("toDonorView", () => {
  it("carries nothing about the donor without donor access", () => {
    expect(toDonorView(ana, false)).toStrictEqual({ visibility: "hidden" });
  });

  it("shows the name, email, and message with donor access", () => {
    expect(toDonorView(ana, true)).toStrictEqual({ visibility: "shown", name: "Ana Cruz", email: "ana@example.com", message: "Para sa mga bata!" });
  });

  it("leaves out an anonymous donor's name even when one is stored", () => {
    expect(toDonorView({ ...ana, isAnonymous: true }, true)).toStrictEqual({ visibility: "shown", name: null, email: "ana@example.com", message: "Para sa mga bata!" });
  });

  it("returns null for a missing email or message", () => {
    expect(toDonorView({ ...ana, donorEmail: null, message: null }, true)).toStrictEqual({ visibility: "shown", name: "Ana Cruz", email: null, message: null });
  });

  it("treats blank text as missing", () => {
    expect(toDonorView({ isAnonymous: false, donorName: " ", donorEmail: "", message: "  " }, true)).toStrictEqual({ visibility: "shown", name: null, email: null, message: null });
  });
});
