import { relations, sql } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  type AnyPgColumn,
} from "drizzle-orm/pg-core";
import { APPROVAL_STATUSES, CONTENT_ACTIONS, DEFAULT_ROLE, ROLE_KEYS } from "../config/roles";

/* ------------------------------------------------------------------ */
/* Enums                                                               */
/* ------------------------------------------------------------------ */

/** Organisational positions; see src/config/roles.ts for what each may do. */
export const roleEnum = pgEnum("role", ROLE_KEYS);
export const postTypeEnum = pgEnum("post_type", ["news", "event", "update", "story"]);
export const postStatusEnum = pgEnum("post_status", ["draft", "in_review", "published", "archived"]);
export const mediaKindEnum = pgEnum("media_kind", ["image", "video", "document"]);
export const campaignStatusEnum = pgEnum("campaign_status", ["draft", "active", "closed"]);
export const donationChannelEnum = pgEnum("donation_channel", ["qrph_static", "gateway", "cash", "in_kind"]);
export const donationStatusEnum = pgEnum("donation_status", ["pending", "confirmed", "rejected"]);
export const ledgerKindEnum = pgEnum("ledger_kind", ["income", "expense"]);
export const applicationStatusEnum = pgEnum("application_status", ["pending", "approved", "rejected"]);
export const approvalActionEnum = pgEnum("approval_action", CONTENT_ACTIONS);
export const approvalStatusEnum = pgEnum("approval_status", APPROVAL_STATUSES);

const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
};

/** Soft delete: rows are hidden, never removed. Supports the audit trail. */
const softDelete = {
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
};

/* ------------------------------------------------------------------ */
/* Users                                                               */
/* ------------------------------------------------------------------ */

export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    email: text("email").notNull(),
    /** Null for invited members who sign in with Google only. */
    passwordHash: text("password_hash"),
    role: roleEnum("role").notNull().default(DEFAULT_ROLE),
    avatarMediaId: uuid("avatar_media_id"),
    isActive: boolean("is_active").notNull().default(true),
    lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
    ...timestamps,
    ...softDelete,
  },
  (t) => [
    uniqueIndex("users_email_idx").on(sql`lower(${t.email})`),
    // One Super Admin and one President at a time; deactivated members keep their seat until moved.
    // role_is_single_holder() is a database function (created in drizzle/0006_super_admin.sql) listing
    // SINGLE_HOLDER_ROLES; keep the two in step. See that migration for why it's a function.
    uniqueIndex("users_single_holder_idx")
      .on(t.role)
      .where(sql`role_is_single_holder(${t.role}) and ${t.deletedAt} is null`),
  ],
);

/* ------------------------------------------------------------------ */
/* Media (stored in Cloudflare R2)                                     */
/* ------------------------------------------------------------------ */

export const media = pgTable(
  "media",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    key: text("key").notNull().unique(),
    url: text("url").notNull(),
    filename: text("filename").notNull(),
    mimeType: text("mime_type").notNull(),
    size: integer("size").notNull(),
    kind: mediaKindEnum("kind").notNull(),
    alt: text("alt"),
    width: integer("width"),
    height: integer("height"),
    /** False until /api/uploads/finalize confirms the object exists and its bytes match the declared type. */
    verified: boolean("verified").notNull().default(false),
    uploadedById: uuid("uploaded_by_id").references(() => users.id),
    ...timestamps,
    ...softDelete,
  },
  (t) => [index("media_kind_idx").on(t.kind)],
);

/* ------------------------------------------------------------------ */
/* Posts: news, events, event updates (threads), stories               */
/* ------------------------------------------------------------------ */

export const posts = pgTable(
  "posts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: text("slug").notNull(),
    title: text("title").notNull(),
    excerpt: text("excerpt"),
    type: postTypeEnum("type").notNull().default("news"),
    status: postStatusEnum("status").notNull().default("draft"),
    /** Tiptap JSON document */
    content: jsonb("content").$type<Record<string, unknown>>().notNull(),
    coverMediaId: uuid("cover_media_id").references(() => media.id),
    /** Point of the cover photo to keep in frame when it's cropped (0–100, % from left / top). Used as CSS object-position. */
    coverFocusX: integer("cover_focus_x").notNull().default(50),
    coverFocusY: integer("cover_focus_y").notNull().default(50),
    /** An `update` post points at its parent `event`, which turns the event page into a thread. */
    parentId: uuid("parent_id").references((): AnyPgColumn => posts.id),
    eventStartAt: timestamp("event_start_at", { withTimezone: true }),
    eventEndAt: timestamp("event_end_at", { withTimezone: true }),
    location: text("location"),
    authorId: uuid("author_id")
      .notNull()
      .references(() => users.id),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    ...timestamps,
    ...softDelete,
  },
  (t) => [
    uniqueIndex("posts_slug_idx").on(t.slug),
    index("posts_status_published_idx").on(t.status, t.publishedAt),
    index("posts_parent_idx").on(t.parentId),
  ],
);

/** Attachments: PDFs, DOCX, videos, extra images on a post. */
export const postMedia = pgTable(
  "post_media",
  {
    postId: uuid("post_id")
      .notNull()
      .references(() => posts.id, { onDelete: "cascade" }),
    mediaId: uuid("media_id")
      .notNull()
      .references(() => media.id, { onDelete: "cascade" }),
    sortOrder: integer("sort_order").notNull().default(0),
  },
  (t) => [primaryKey({ columns: [t.postId, t.mediaId] })],
);

/* ------------------------------------------------------------------ */
/* Campaigns & donations                                               */
/* ------------------------------------------------------------------ */

export const campaigns = pgTable(
  "campaigns",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: text("slug").notNull(),
    title: text("title").notNull(),
    summary: text("summary").notNull(),
    content: jsonb("content").$type<Record<string, unknown>>(),
    status: campaignStatusEnum("status").notNull().default("draft"),
    /** The event this campaign funds, if any. */
    eventPostId: uuid("event_post_id").references(() => posts.id),
    coverMediaId: uuid("cover_media_id").references(() => media.id),
    /** Static QR Ph image from the org's bank / e-wallet account. */
    qrMediaId: uuid("qr_media_id").references(() => media.id),
    qrAccountName: text("qr_account_name"),
    startsAt: timestamp("starts_at", { withTimezone: true }),
    endsAt: timestamp("ends_at", { withTimezone: true }),
    ...timestamps,
    ...softDelete,
  },
  (t) => [uniqueIndex("campaigns_slug_idx").on(t.slug)],
);

/** "₱250 = 1 Bag of Hope" — the unit donors buy on behalf of a beneficiary. */
export const donationItems = pgTable("donation_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  campaignId: uuid("campaign_id")
    .notNull()
    .references(() => campaigns.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  /** Amounts are stored in centavos to avoid floating point errors. */
  unitAmount: integer("unit_amount").notNull(),
  goalQuantity: integer("goal_quantity").notNull(),
  /** e.g. ["6 notebooks", "2 pencils", "1 ruler"] */
  contents: jsonb("contents").$type<string[]>().notNull().default([]),
  imageMediaId: uuid("image_media_id").references(() => media.id),
  sortOrder: integer("sort_order").notNull().default(0),
  ...timestamps,
});

export const donations = pgTable(
  "donations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    campaignId: uuid("campaign_id")
      .notNull()
      .references(() => campaigns.id),
    itemId: uuid("item_id").references(() => donationItems.id),
    quantity: integer("quantity").notNull().default(1),
    amount: integer("amount").notNull(),
    donorName: text("donor_name"),
    donorEmail: text("donor_email"),
    isAnonymous: boolean("is_anonymous").notNull().default(false),
    message: text("message"),
    /** Reference number from the donor's bank / e-wallet receipt. */
    referenceNumber: text("reference_number"),
    /** Gateway payment id once a payment gateway is integrated. */
    externalId: text("external_id"),
    channel: donationChannelEnum("channel").notNull().default("qrph_static"),
    status: donationStatusEnum("status").notNull().default("pending"),
    reviewedById: uuid("reviewed_by_id").references(() => users.id),
    reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
    reviewNote: text("review_note"),
    ...timestamps,
  },
  (t) => [
    index("donations_campaign_status_idx").on(t.campaignId, t.status),
    uniqueIndex("donations_external_id_idx").on(t.externalId),
  ],
);

/** Public ledger for transparency: money in, money out, with receipts. */
export const ledgerEntries = pgTable(
  "ledger_entries",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    campaignId: uuid("campaign_id").references(() => campaigns.id),
    kind: ledgerKindEnum("kind").notNull(),
    description: text("description").notNull(),
    amount: integer("amount").notNull(),
    occurredAt: timestamp("occurred_at", { withTimezone: true }).notNull(),
    receiptMediaId: uuid("receipt_media_id").references(() => media.id),
    createdById: uuid("created_by_id")
      .notNull()
      .references(() => users.id),
    ...timestamps,
    ...softDelete,
  },
  (t) => [index("ledger_campaign_idx").on(t.campaignId, t.occurredAt)],
);

/* ------------------------------------------------------------------ */
/* Contact messages & audit log                                        */
/* ------------------------------------------------------------------ */

export const contactMessages = pgTable("contact_messages", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  subject: text("subject").notNull(),
  message: text("message").notNull(),
  isRead: boolean("is_read").notNull().default(false),
  ...timestamps,
});

/** Public "Apply to join" form. Approving one invites the applicant (see actions/applications.ts). */
export const memberApplications = pgTable(
  "member_applications",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    /** The Google account they will sign in with. */
    email: text("email").notNull(),
    phone: text("phone"),
    message: text("message").notNull(),
    status: applicationStatusEnum("status").notNull().default("pending"),
    reviewedById: uuid("reviewed_by_id").references(() => users.id),
    reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
    ...timestamps,
  },
  (t) => [index("member_applications_status_idx").on(t.status, t.createdAt)],
);

/**
 * TEMPORARY: the Backoffice "Suggestions" to-do list.
 * To remove: delete this table, src/app/admin/suggestions, src/actions/suggestions.ts,
 * src/lib/validations/suggestion.ts, src/components/admin/suggestion-*.tsx and its sidebar entry,
 * then run `pnpm db:generate` and `pnpm db:migrate` to drop the table.
 */
export const suggestions = pgTable(
  "suggestions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    title: text("title").notNull(),
    description: text("description").notNull().default(""),
    isDone: boolean("is_done").notNull().default(false),
    createdById: uuid("created_by_id")
      .notNull()
      .references(() => users.id),
    ...timestamps,
  },
  (t) => [index("suggestions_done_idx").on(t.isDone, t.createdAt)],
);

export const suggestionsRelations = relations(suggestions, ({ one }) => ({
  author: one(users, { fields: [suggestions.createdById], references: [users.id] }),
}));

/**
 * A change that waits for an approver before it takes effect. The row is also its audit record:
 * who asked, in which position, who could approve, and who decided, when and why.
 */
export const approvalRequests = pgTable(
  "approval_requests",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    /** An ApprovalResource, e.g. "post". */
    resourceType: text("resource_type").notNull(),
    resourceId: uuid("resource_id").notNull(),
    action: approvalActionEnum("action").notNull(),
    /** What to apply on approval, e.g. the edited post form. Null for add and delete. */
    payload: jsonb("payload").$type<Record<string, unknown>>(),
    status: approvalStatusEnum("status").notNull().default("pending"),
    requestedById: uuid("requested_by_id")
      .notNull()
      .references(() => users.id),
    /** The requester's position when they asked. */
    requestedRole: roleEnum("requested_role").notNull(),
    /** Positions allowed to approve when it was requested. */
    approverRoles: roleEnum("approver_roles").array().notNull(),
    reviewedById: uuid("reviewed_by_id").references(() => users.id),
    reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
    /** Why it was rejected. */
    reason: text("reason"),
    ...timestamps,
  },
  (t) => [
    index("approval_requests_status_idx").on(t.status, t.createdAt),
    index("approval_requests_resource_idx").on(t.resourceType, t.resourceId),
  ],
);

export const auditLogs = pgTable(
  "audit_logs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    actorId: uuid("actor_id").references(() => users.id),
    action: text("action").notNull(),
    entityType: text("entity_type").notNull(),
    entityId: text("entity_id").notNull(),
    changes: jsonb("changes").$type<Record<string, unknown>>(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("audit_entity_idx").on(t.entityType, t.entityId)],
);

/* ------------------------------------------------------------------ */
/* Relations                                                           */
/* ------------------------------------------------------------------ */

export const usersRelations = relations(users, ({ many }) => ({
  posts: many(posts),
}));

export const postsRelations = relations(posts, ({ one, many }) => ({
  author: one(users, { fields: [posts.authorId], references: [users.id] }),
  cover: one(media, { fields: [posts.coverMediaId], references: [media.id] }),
  parent: one(posts, { fields: [posts.parentId], references: [posts.id], relationName: "thread" }),
  updates: many(posts, { relationName: "thread" }),
  attachments: many(postMedia),
}));

export const postMediaRelations = relations(postMedia, ({ one }) => ({
  post: one(posts, { fields: [postMedia.postId], references: [posts.id] }),
  media: one(media, { fields: [postMedia.mediaId], references: [media.id] }),
}));

export const campaignsRelations = relations(campaigns, ({ one, many }) => ({
  items: many(donationItems),
  donations: many(donations),
  ledger: many(ledgerEntries),
  cover: one(media, { fields: [campaigns.coverMediaId], references: [media.id], relationName: "campaign_cover" }),
  qr: one(media, { fields: [campaigns.qrMediaId], references: [media.id], relationName: "campaign_qr" }),
  event: one(posts, { fields: [campaigns.eventPostId], references: [posts.id] }),
}));

export const donationItemsRelations = relations(donationItems, ({ one }) => ({
  campaign: one(campaigns, { fields: [donationItems.campaignId], references: [campaigns.id] }),
  image: one(media, { fields: [donationItems.imageMediaId], references: [media.id] }),
}));

export const donationsRelations = relations(donations, ({ one }) => ({
  campaign: one(campaigns, { fields: [donations.campaignId], references: [campaigns.id] }),
  item: one(donationItems, { fields: [donations.itemId], references: [donationItems.id] }),
}));

export const ledgerEntriesRelations = relations(ledgerEntries, ({ one }) => ({
  campaign: one(campaigns, { fields: [ledgerEntries.campaignId], references: [campaigns.id] }),
  receipt: one(media, { fields: [ledgerEntries.receiptMediaId], references: [media.id] }),
}));

export type { Role } from "../types/rbac";
export type PostType = (typeof postTypeEnum.enumValues)[number];
export type PostStatus = (typeof postStatusEnum.enumValues)[number];
export type MediaKind = (typeof mediaKindEnum.enumValues)[number];
export type User = typeof users.$inferSelect;
export type Post = typeof posts.$inferSelect;
export type Media = typeof media.$inferSelect;
export type ApprovalRequest = typeof approvalRequests.$inferSelect;
