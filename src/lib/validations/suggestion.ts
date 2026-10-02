import { z } from "zod";

/** TEMPORARY: see the note on `suggestions` in src/db/schema.ts. */
export const suggestionSchema = z.object({
  title: z.string().trim().min(3, "Add a short title (at least 3 characters).").max(140),
  description: z.string().trim().max(2000).optional(),
});

export type SuggestionValues = z.infer<typeof suggestionSchema>;
