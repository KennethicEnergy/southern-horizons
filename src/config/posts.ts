import type { Post } from "@/db/schema";
import type { PostFormValues } from "@/lib/validations/post";

export const postTypeLabel: Record<Post["type"], string> = { news: "News", event: "Event", update: "Update", story: "Story" };

/** How a proposed edit is summarised for the approver, in form order. */
export const POST_CHANGE_GROUPS: { label: string; fields: (keyof PostFormValues)[] }[] = [
  { label: "Title", fields: ["title"] },
  { label: "Summary", fields: ["excerpt"] },
  { label: "Body", fields: ["content"] },
  { label: "Type", fields: ["type"] },
  { label: "Event", fields: ["parentId"] },
  { label: "Event dates", fields: ["eventStartAt", "eventEndAt"] },
  { label: "Location", fields: ["location"] },
  { label: "Web address", fields: ["slug"] },
  { label: "Cover photo", fields: ["coverMediaId"] },
  { label: "Cover framing", fields: ["coverFocusX", "coverFocusY"] },
  { label: "Attachments", fields: ["attachmentIds"] },
];
