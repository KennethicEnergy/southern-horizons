import { z } from "zod";

/**
 * Shared by the Formik form (client) and the server action (server).
 * Form values are kept form-friendly (strings); the server normalizes them.
 */
const optionalText = (max: number) => z.string().trim().max(max, `Keep this under ${max} characters.`).optional();
const optionalId = z.union([z.uuid(), z.literal("")]).optional();

export const POST_TYPES = ["news", "event", "update", "story"] as const;
export const POST_INTENTS = ["save_draft", "submit", "publish"] as const;

export const postFormSchema = z
  .object({
    title: z.string().trim().min(3, "Add a title of at least 3 characters.").max(160),
    slug: z
      .string()
      .trim()
      .max(80)
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers, and hyphens only.")
      .optional()
      .or(z.literal("")),
    excerpt: optionalText(300),
    type: z.enum(POST_TYPES),
    content: z.record(z.string(), z.unknown()).refine((doc) => Array.isArray(doc.content) && doc.content.length > 0, {
      message: "Write something in the body.",
    }),
    coverMediaId: optionalId,
    /** Where the cover is framed when cropped, 0–100 (% from left / top). */
    coverFocusX: z.number().int().min(0).max(100),
    coverFocusY: z.number().int().min(0).max(100),
    parentId: optionalId,
    eventStartAt: optionalText(40),
    eventEndAt: optionalText(40),
    location: optionalText(200),
    attachmentIds: z.array(z.uuid()).max(20),
    intent: z.enum(POST_INTENTS),
  })
  .superRefine((v, ctx) => {
    if (v.type === "event" && !v.eventStartAt) {
      ctx.addIssue({ code: "custom", path: ["eventStartAt"], message: "Events need a start date." });
    }
    if (v.type === "update" && !v.parentId) {
      ctx.addIssue({ code: "custom", path: ["parentId"], message: "Pick the event this update belongs to." });
    }
    if (v.eventStartAt && v.eventEndAt && new Date(v.eventEndAt) < new Date(v.eventStartAt)) {
      ctx.addIssue({ code: "custom", path: ["eventEndAt"], message: "End date must be after the start date." });
    }
  });

export type PostFormValues = z.infer<typeof postFormSchema>;

export const emptyDoc = { type: "doc", content: [] } as Record<string, unknown>;
