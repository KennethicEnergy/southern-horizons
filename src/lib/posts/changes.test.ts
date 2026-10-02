import { describe, expect, it } from "vitest";
import type { PostFormValues } from "@/lib/validations/post";
import { describePostChanges, toPostFormValues } from "@/lib/posts/changes";

const values: PostFormValues = {
  title: "Bag drive",
  slug: "bag-drive",
  excerpt: "",
  type: "news",
  content: { type: "doc", content: [{ type: "paragraph" }] },
  coverMediaId: "",
  coverFocusX: 50,
  coverFocusY: 50,
  parentId: "",
  eventStartAt: "",
  eventEndAt: "",
  location: "",
  attachmentIds: [],
  intent: "publish",
};

describe("describePostChanges", () => {
  it("returns nothing when only the intent differs", () => {
    expect(describePostChanges(values, { ...values, intent: "save_draft" })).toEqual([]);
  });

  it("names each changed part once, in form order", () => {
    const proposed = {
      ...values,
      title: "School bag drive",
      content: { type: "doc", content: [{ type: "paragraph", content: [{ type: "text", text: "Hi" }] }] },
      coverFocusX: 10,
      coverFocusY: 90,
      attachmentIds: ["a"],
    };
    expect(describePostChanges(values, proposed)).toEqual(["Title", "Body", "Cover framing", "Attachments"]);
  });

  it("treats event dates as one change", () => {
    expect(describePostChanges(values, { ...values, eventStartAt: "2026-12-20T10:00", eventEndAt: "2026-12-20T12:00" })).toEqual([
      "Event dates",
    ]);
  });
});

describe("toPostFormValues", () => {
  it("turns a stored post into form values", () => {
    const form = toPostFormValues(
      {
        title: "Bag drive",
        slug: "bag-drive",
        excerpt: null,
        type: "event",
        content: values.content,
        coverMediaId: null,
        coverFocusX: 50,
        coverFocusY: 50,
        parentId: null,
        eventStartAt: new Date("2026-12-20T02:00:00Z"),
        eventEndAt: null,
        location: "Davao",
      },
      ["m1"],
    );
    expect(form).toEqual({
      ...values,
      type: "event",
      eventStartAt: "2026-12-20T10:00",
      location: "Davao",
      attachmentIds: ["m1"],
      intent: "save_draft",
    });
  });
});
