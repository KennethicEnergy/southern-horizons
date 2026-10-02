import { describe, expect, it } from "vitest";
import { getOgCoverUrl, getOgPostEyebrow } from "@/lib/og";

const cover = {
  url: "https://media.example.com/cover.jpg",
  mimeType: "image/jpeg",
  verified: true,
  deletedAt: null,
};

describe("getOgCoverUrl", () => {
  it("returns the url of a verified JPEG or PNG", () => {
    expect(getOgCoverUrl(cover)).toBe(cover.url);
    expect(getOgCoverUrl({ ...cover, mimeType: "image/png" })).toBe(cover.url);
  });

  it("returns null when there is no cover", () => {
    expect(getOgCoverUrl(null)).toBeNull();
  });

  it("returns null for formats the OG renderer can't decode", () => {
    expect(getOgCoverUrl({ ...cover, mimeType: "image/webp" })).toBeNull();
    expect(getOgCoverUrl({ ...cover, mimeType: "image/svg+xml" })).toBeNull();
  });

  it("returns null for unverified or deleted media", () => {
    expect(getOgCoverUrl({ ...cover, verified: false })).toBeNull();
    expect(getOgCoverUrl({ ...cover, deletedAt: new Date() })).toBeNull();
  });
});

describe("getOgPostEyebrow", () => {
  it("labels a post by its type", () => {
    expect(getOgPostEyebrow({ type: "news", eventStartAt: null })).toBe("News");
    expect(getOgPostEyebrow({ type: "story", eventStartAt: null })).toBe("Story");
  });

  it("adds the start date to events", () => {
    const eventStartAt = new Date("2026-12-20T02:00:00Z");
    expect(getOgPostEyebrow({ type: "event", eventStartAt })).toBe("Event · December 20, 2026");
  });

  it("falls back to the label for an event without a date", () => {
    expect(getOgPostEyebrow({ type: "event", eventStartAt: null })).toBe("Event");
  });
});
