import type { Post } from "@/db/schema";
import type { PostFormValues } from "@/lib/validations/post";
import { POST_CHANGE_GROUPS } from "@/config/posts";
import { toManilaInputValue } from "@/lib/dates";

type StoredPost = Pick<
  Post,
  | "title"
  | "slug"
  | "excerpt"
  | "type"
  | "content"
  | "coverMediaId"
  | "coverFocusX"
  | "coverFocusY"
  | "parentId"
  | "eventStartAt"
  | "eventEndAt"
  | "location"
>;

/** A stored post as the edit form sees it. */
export const toPostFormValues = (
  { title, slug, excerpt, type, content, coverMediaId, coverFocusX, coverFocusY, parentId, eventStartAt, eventEndAt, location }: StoredPost,
  attachmentIds: string[],
): PostFormValues => ({
  title,
  slug,
  excerpt: excerpt ?? "",
  type,
  content,
  coverMediaId: coverMediaId ?? "",
  coverFocusX,
  coverFocusY,
  parentId: parentId ?? "",
  eventStartAt: toManilaInputValue(eventStartAt),
  eventEndAt: toManilaInputValue(eventEndAt),
  location: location ?? "",
  attachmentIds,
  intent: "save_draft",
});

const same = (a: unknown, b: unknown) => JSON.stringify(a ?? "") === JSON.stringify(b ?? "");

/** Labels of the parts of a post a proposed edit would change. */
export const describePostChanges = (current: PostFormValues, proposed: PostFormValues): string[] =>
  POST_CHANGE_GROUPS.filter(({ fields }) => fields.some((field) => !same(current[field], proposed[field]))).map(({ label }) => label);
