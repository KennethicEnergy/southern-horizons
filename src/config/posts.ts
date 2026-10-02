import type { Post } from "@/db/schema";

export const postTypeLabel: Record<Post["type"], string> = { news: "News", event: "Event", update: "Update", story: "Story" };
