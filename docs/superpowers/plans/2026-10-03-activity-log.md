# Activity Log Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A backoffice Activity page where every position can see who did what and when. The Super Admin can hide entries quietly, or delete them, which leaves a permanent record of the deletion.

**Architecture:**
- This builds on the existing `audit_logs` table and `audit()` helper.
- One typed catalog in `src/config/audit.ts` lists every action code with its sentence template and kind.
- Pure helpers in `src/lib/audit/` turn raw entries into sentences, parse the page's query string, and check selections. Each is unit-tested.
- A server-rendered page lists entries. A client component adds selection and the Hide/Delete toolbar for whoever holds `audit:manage`.

**Tech Stack:** Next.js 16 (App Router, server actions), Drizzle ORM on Neon (`neon-http`, `db.batch`), Zod 4, Vitest 5 (happy-dom for hooks), Tailwind 4, Hugeicons.

**Spec:** `docs/superpowers/specs/2026-10-03-activity-log-design.md`

## Global Constraints

- Use `const` arrow functions only, including page components: `const ActivityPage = async (…) => {…}; export default ActivityPage;`. Functions this plan edits in place become `const` arrows too.
- Destructure props, params, and hook returns.
- Pure helpers go in `src/lib/`, constants in `src/config/`, shared types in `src/types/`, and hooks in `src/hooks/useXxx.ts`.
- Check permissions with `can(role, permission)` or `requirePermission(permission)`, never with position names (DEV-02).
- Page size is **50**. A hide or delete request takes **1–50** IDs. The deletion reason is trimmed and **3–200** characters.
- Show times in Philippine time with `formatDateTime` and `formatDate` from `src/lib/dates.ts`.
- Never write passwords, donor names or emails, or contact-message content to the log.
- Write the test first for every new helper, hook, and lib function.
- Commit messages use `[TYPE] : <message>`. Never add AI co-author or attribution lines.
- Work on branch `feat/activity-log`. Nothing reaches `main` until `pnpm lint`, `pnpm test`, and `pnpm build` all pass.

## Review Focus

1. **Stale selection after paging or filtering.** The toolbar must never send IDs that aren't on the current page. `useSelection` prunes to the available IDs (Task 7 test).
2. **Tampered query strings.** `?page=-1`, `?page=abc`, `?kind=junk`, `?actor=x`, and `?hidden=1` from a non-Super Admin all fall back to safe defaults (Task 4 test).
3. **A crafted request that targets a deletion record.** The server refuses the whole request (Task 7 test).
4. **A log write fails mid-action or mid-sign-in.** The action still succeeds and the error is only reported in the server log (Task 3 test).
5. **Old or odd entries.** Entries with no label, an action code the catalog doesn't know, or no actor still render a readable sentence (Task 2 test).

---

### Task 1: Permissions

**Files:**
- Modify: `src/config/roles.ts` (`PERMISSIONS`, `BASE`, `ROLES.superAdmin` comment, `ROLES.president`)
- Test: `src/lib/rbac.test.ts` (the `describe("can")` block)

**Interfaces:**
- Produces: permission `"audit:view"`, which every role has, and `"audit:manage"`, which only `superAdmin` has.

- [ ] **Step 1: Create the branch**

Run: `git checkout -b feat/activity-log`
Expected: `Switched to a new branch 'feat/activity-log'`

- [ ] **Step 2: Write the failing tests** (inside `describe("can")`)

```ts
it("lets every position view the activity log", () => {
  for (const role of [...OFFICERS, "member" as const]) expect(can(role, "audit:view")).toBe(true);
});

it("keeps managing the activity log with the Super Admin alone", () => {
  expect(can("superAdmin", "audit:manage")).toBe(true);
  for (const role of [...OFFICERS.filter((r) => r !== "superAdmin"), "member" as const]) expect(can(role, "audit:manage")).toBe(false);
});
```

- [ ] **Step 3: Run them to make sure they fail**

Run: `pnpm test src/lib/rbac.test.ts`
Expected: FAIL in both new tests.

- [ ] **Step 4: Update `src/config/roles.ts`**

- Append `"audit:manage"` to `PERMISSIONS`.
- Add `"audit:view"` to `BASE`.
- Change the President's permissions to `PERMISSIONS.filter((permission) => permission !== "audit:manage")`.
- Change the Super Admin comment to say it holds everything the President can do, plus managing the activity log.

- [ ] **Step 5: Run the tests to make sure they pass**

Run: `pnpm test src/lib/rbac.test.ts`
Expected: PASS, including the existing "gives the Super Admin every permission" test.

- [ ] **Step 6: Commit**

```bash
git add src/config/roles.ts src/lib/rbac.test.ts
git commit -m "[FEAT] : Let every position view the activity log and only the Super Admin manage it"
```

---

### Task 2: Action catalog and readable sentences

**Files:**
- Create: `src/types/audit.ts`, `src/config/audit.ts`, `src/lib/audit/catalog.ts`, `src/lib/audit/describe.ts`
- Test: `src/lib/audit/catalog.test.ts`, `src/lib/audit/describe.test.ts`

**Interfaces:**
- Produces, in `src/types/audit.ts` (type-only imports from `../config/audit`, the same pattern as `src/types/rbac.ts`):
  - `AuditAction = keyof typeof AUDIT_ACTIONS`
  - `AuditEntityType = keyof typeof AUDIT_ENTITIES`
  - `AuditKind = (typeof AUDIT_KINDS)[number]["value"]`
  - `AuditActionConfig = { kind: AuditKind; template: string; detail?: { key: string; label: string } }`
  - `AuditEntityConfig = { prefix: string; quoted: boolean; unnamed: string }`
  - `SignInMethod = "google" | "password"`
  - `AuditEntry = { actorId: string | null; action: AuditAction; entityType: AuditEntityType; entityId: string; entityLabel?: string | null; changes?: Record<string, unknown> }`
  - `AuditListItem = { id: string; action: string; entityType: string; entityLabel: string | null; changes: Record<string, unknown> | null; createdAt: Date; actorName: string | null; hiddenAt: Date | null }`
  - `AuditDescription = { sentence: string; details: string | null }`
  - `ActivityRow = { id: string; actorName: string | null; sentence: string; details: string | null; at: string; hidden: boolean; locked: boolean }`
  - `AuditQuery = { page: number; actorId?: string; kind?: AuditKind; includeHidden: boolean }`
- Produces, in `src/config/audit.ts`:
  - `AUDIT_PAGE_SIZE = 50`
  - `AUDIT_DELETE_ACTION = "audit.delete" as const`
  - `AUDIT_KINDS`, `AUDIT_ENTITIES`, `AUDIT_ACTIONS`, each `as const satisfies …`
- Produces, in `src/lib/audit/catalog.ts`:
  - `isAuditAction(value: string): value is AuditAction`
  - `isAuditKind(value: string): value is AuditKind`
  - `actionsOfKind(kind: AuditKind): AuditAction[]`
- Produces, in `src/lib/audit/describe.ts`:
  - `describeAuditEntry(entry: Pick<AuditListItem, "action" | "entityType" | "entityLabel" | "changes" | "actorName">): AuditDescription`
  - `toActivityRow(item: AuditListItem): ActivityRow`
  - `formatEntryCount(count: number): string`

**Catalog values.** These are fixed copy.

`AUDIT_KINDS` (in this order), as `{ value, label }`:
- `posts` Posts
- `members` Members
- `applications` Applications
- `approvals` Approvals
- `donations` Donations
- `uploads` Uploads
- `signIns` Sign-ins
- `suggestions` Suggestions
- `messages` Messages
- `deletions` Deletions

`AUDIT_ENTITIES`:

| Key | prefix | quoted | unnamed |
| --- | --- | --- | --- |
| `post` | `"the post "` | true | `"a post"` |
| `approval_request` | `"the post "` | true | `"a post"` |
| `user` | `""` | false | `"a member"` |
| `member_application` | `""` | false | `"an applicant"` |
| `donation` | `"a "` | false | `"a donation"` |
| `media` | `"the file "` | true | `"a file"` |
| `suggestion` | `"the suggestion "` | true | `"a suggestion"` |
| `contact_message` | `""` | false | `"a contact message"` |
| `audit_log` | `""` | false | `"log entries"` |

`AUDIT_ACTIONS` (code → kind, template, detail):

| Code | Kind | Template | Detail |
| --- | --- | --- | --- |
| `post.create.draft` | posts | `started {subject} as a draft` | |
| `post.create.in_review` | posts | `wrote {subject} and sent it for approval` | |
| `post.create.published` | posts | `published {subject}` | |
| `post.update.draft` | posts | `edited the draft of {subject}` | |
| `post.update.in_review` | posts | `sent {subject} for approval` | |
| `post.update.published` | posts | `published changes to {subject}` | |
| `post.delete` | posts | `deleted {subject}` | |
| `user.invite` | members | `added {subject} as {role}` | |
| `user.role` | members | `changed {subject} from {from} to {to}` | |
| `user.deactivate` | members | `deactivated {subject}'s account` | |
| `user.reactivate` | members | `reactivated {subject}'s account` | |
| `application.approved` | applications | `approved the membership application from {subject}` | |
| `application.rejected` | applications | `rejected the membership application from {subject}` | |
| `approval.request.add` | approvals | `asked for approval to publish {subject}` | |
| `approval.request.edit` | approvals | `asked for approval to edit {subject}` | |
| `approval.request.delete` | approvals | `asked for approval to delete {subject}` | |
| `approval.update` | approvals | `updated their pending request for {subject}` | |
| `approval.approved` | approvals | `approved a requested change to {subject}` | |
| `approval.rejected` | approvals | `rejected a requested change to {subject}` | `reason` / `Reason` |
| `donation.confirmed` | donations | `confirmed {subject}` | |
| `donation.rejected` | donations | `rejected {subject}` | `note` / `Note` |
| `media.upload` | uploads | `uploaded {subject}` | |
| `auth.sign_in` | signIns | `signed in with {method}` | |
| `suggestion.create` | suggestions | `added {subject}` | |
| `suggestion.done` | suggestions | `ticked off {subject}` | |
| `suggestion.reopen` | suggestions | `reopened {subject}` | |
| `suggestion.delete` | suggestions | `deleted {subject}` | |
| `message.read` | messages | `marked {subject} as read` | |
| `message.unread` | messages | `marked {subject} as unread` | |
| `audit.delete` | deletions | `deleted {entries} from {range}` | `reason` / `Reason` |

**Placeholder values,** computed in `describeAuditEntry`:

| Placeholder | Value |
| --- | --- |
| `{subject}` | With a label: `prefix` + the label, in curly quotes `“…”` when `quoted`. Without one: `unnamed`. For an unknown entity type: the label, or `"something"`. |
| `{role}` | `roleLabel(changes.role)` |
| `{from}` | `roleLabel(changes.from)` |
| `{to}` | `roleLabel(changes.to)` |
| `{method}` | `"Google"` when `changes.method === "google"`, otherwise `"a password"` |
| `{entries}` | `formatEntryCount(changes.count)` |
| `{range}` | `formatDate(from)`, or `` `${formatDate(from)} to ${formatDate(to)}` `` when the two fall on different Manila days |

The sentence is `` `${actorName ?? "Someone"} ${filledTemplate}` ``.

`details` is `` `${detail.label}: ${value}` `` when `changes[detail.key]` is a non-blank string. Otherwise it's `null`.

An action code that isn't in the catalog produces `` `${actor} did “${action}”` `` with `details: null`.

- [ ] **Step 1: Write the failing catalog tests** (`src/lib/audit/catalog.test.ts`)

```ts
import { describe, expect, it } from "vitest";
import { AUDIT_ACTIONS, AUDIT_KINDS } from "@/config/audit";
import { actionsOfKind, isAuditAction, isAuditKind } from "@/lib/audit/catalog";

const PLACEHOLDERS = ["subject", "role", "from", "to", "method", "entries", "range"];

describe("audit catalog", () => {
  it("files every action under a listed kind, and every kind has an action", () => {
    const kinds = AUDIT_KINDS.map(({ value }) => value);
    for (const { kind } of Object.values(AUDIT_ACTIONS)) expect(kinds).toContain(kind);
    for (const kind of kinds) expect(actionsOfKind(kind).length).toBeGreaterThan(0);
  });

  it("uses only placeholders the describer fills in", () => {
    for (const { template } of Object.values(AUDIT_ACTIONS)) {
      for (const [, name] of template.matchAll(/\{(\w+)\}/g)) expect(PLACEHOLDERS).toContain(name);
    }
  });

  it("lists the exact actions of a kind", () => {
    expect(actionsOfKind("signIns")).toEqual(["auth.sign_in"]);
    expect(actionsOfKind("deletions")).toEqual(["audit.delete"]);
  });

  it("recognises only catalogued actions and kinds", () => {
    expect(isAuditAction("post.delete")).toBe(true);
    expect(isAuditAction("post.archive")).toBe(false);
    expect(isAuditKind("posts")).toBe(true);
    expect(isAuditKind("nope")).toBe(false);
  });
});
```

- [ ] **Step 2: Run them to make sure they fail**

Run: `pnpm test src/lib/audit/catalog.test.ts`
Expected: FAIL, because `@/config/audit` can't be resolved.

- [ ] **Step 3: Create `src/types/audit.ts`, `src/config/audit.ts`, and `src/lib/audit/catalog.ts`**

Use the interfaces and catalog values above. `isAuditAction` and `isAuditKind` use `Object.hasOwn` and `.some`, the same way `isApprovalResource` does.

- [ ] **Step 4: Run the tests to make sure they pass**

Run: `pnpm test src/lib/audit/catalog.test.ts`
Expected: PASS

- [ ] **Step 5: Write the failing describe tests** (`src/lib/audit/describe.test.ts`)

```ts
import { describe, expect, it } from "vitest";
import { formatDate, formatDateTime } from "@/lib/dates";
import { describeAuditEntry, formatEntryCount, toActivityRow } from "@/lib/audit/describe";

const post = { action: "post.create.published", entityType: "post", entityLabel: "Bags of Hope", changes: null, actorName: "Ana Cruz" };

describe("describeAuditEntry", () => {
  it("names the actor and quotes a title", () => {
    expect(describeAuditEntry(post)).toEqual({ sentence: "Ana Cruz published the post “Bags of Hope”", details: null });
  });

  it("falls back to a noun when the entry has no label", () => {
    expect(describeAuditEntry({ ...post, action: "post.delete", entityLabel: null }).sentence).toBe("Ana Cruz deleted a post");
  });

  it("reads 'Someone' when the actor is unknown", () => {
    expect(describeAuditEntry({ ...post, actorName: null }).sentence).toBe("Someone published the post “Bags of Hope”");
  });

  it("leaves names unquoted and spells out positions", () => {
    const base = { entityType: "user", entityLabel: "Mark Reyes", actorName: "Ken" };
    expect(describeAuditEntry({ ...base, action: "user.role", changes: { from: "member", to: "bookkeeper" } }).sentence).toBe(
      "Ken changed Mark Reyes from Member to Bookkeeper",
    );
    expect(describeAuditEntry({ ...base, action: "user.invite", changes: { role: "communications" } }).sentence).toBe(
      "Ken added Mark Reyes as Communications",
    );
  });

  it("says how someone signed in", () => {
    const base = { action: "auth.sign_in", entityType: "user", entityLabel: "Ana Cruz", actorName: "Ana Cruz" };
    expect(describeAuditEntry({ ...base, changes: { method: "google" } }).sentence).toBe("Ana Cruz signed in with Google");
    expect(describeAuditEntry({ ...base, changes: { method: "password" } }).sentence).toBe("Ana Cruz signed in with a password");
  });

  it("shows donation amounts unquoted, with the reviewer's note", () => {
    const entry = { action: "donation.rejected", entityType: "donation", entityLabel: "₱500 donation", changes: { note: "No matching transfer" }, actorName: "Ken" };
    expect(describeAuditEntry(entry)).toEqual({ sentence: "Ken rejected a ₱500 donation", details: "Note: No matching transfer" });
  });

  it("shows a rejection reason and skips a blank one", () => {
    const entry = { action: "approval.rejected", entityType: "approval_request", entityLabel: "Bags of Hope", actorName: "Ken" };
    expect(describeAuditEntry({ ...entry, changes: { reason: "Wrong date" } }).details).toBe("Reason: Wrong date");
    expect(describeAuditEntry({ ...entry, changes: { reason: "  " } }).details).toBeNull();
  });

  it("describes a deletion by count, date range, and reason", () => {
    const from = "2026-01-03T02:00:00.000Z";
    const to = "2026-03-14T09:00:00.000Z";
    const entry = { action: "audit.delete", entityType: "audit_log", entityLabel: null, actorName: "Ken", changes: { count: 12, from, to, reason: "Test data" } };
    expect(describeAuditEntry(entry)).toEqual({
      sentence: `Ken deleted 12 log entries from ${formatDate(from)} to ${formatDate(to)}`,
      details: "Reason: Test data",
    });
  });

  it("uses one date and the singular for a single deleted entry", () => {
    const at = "2026-01-03T02:00:00.000Z";
    const entry = { action: "audit.delete", entityType: "audit_log", entityLabel: null, actorName: "Ken", changes: { count: 1, from: at, to: at, reason: "Typo" } };
    expect(describeAuditEntry(entry).sentence).toBe(`Ken deleted 1 log entry from ${formatDate(at)}`);
  });

  it("still says something for an action it doesn't know", () => {
    expect(describeAuditEntry({ ...post, action: "post.archive" })).toEqual({ sentence: "Ana Cruz did “post.archive”", details: null });
  });
});

describe("formatEntryCount", () => {
  it("counts entries in plain words", () => {
    expect(formatEntryCount(1)).toBe("1 log entry");
    expect(formatEntryCount(12)).toBe("12 log entries");
  });
});

describe("toActivityRow", () => {
  const item = { ...post, id: "e1", createdAt: new Date("2026-10-03T01:00:00Z"), hiddenAt: null };

  it("carries the sentence and the Manila time", () => {
    expect(toActivityRow(item)).toEqual({
      id: "e1",
      actorName: "Ana Cruz",
      sentence: "Ana Cruz published the post “Bags of Hope”",
      details: null,
      at: formatDateTime(item.createdAt),
      hidden: false,
      locked: false,
    });
  });

  it("marks hidden entries and locks deletion records", () => {
    expect(toActivityRow({ ...item, hiddenAt: new Date() }).hidden).toBe(true);
    expect(toActivityRow({ ...item, action: "audit.delete", entityType: "audit_log", changes: { count: 2, from: item.createdAt.toISOString(), to: item.createdAt.toISOString() } }).locked).toBe(true);
  });
});
```

- [ ] **Step 6: Run them to make sure they fail**

Run: `pnpm test src/lib/audit/describe.test.ts`
Expected: FAIL, because `@/lib/audit/describe` can't be resolved.

- [ ] **Step 7: Implement `src/lib/audit/describe.ts`**

Follow the placeholder rules above. Fill the template with `template.replace(/\{(\w+)\}/g, (_, name) => values[name] ?? "")`. Compare Manila days for `{range}` with `formatDate(from) === formatDate(to)`. `locked` is `action === AUDIT_DELETE_ACTION`.

- [ ] **Step 8: Run the tests to make sure they pass**

Run: `pnpm test src/lib/audit`
Expected: PASS

- [ ] **Step 9: Commit**

```bash
git add src/types/audit.ts src/config/audit.ts src/lib/audit
git commit -m "[FEAT] : Add activity log action catalog and readable entry sentences"
```

---

### Task 3: Schema, migration, and a writer that never fails an action

**Files:**
- Modify: `src/db/schema.ts` (`auditLogs`)
- Create: `drizzle/0007_activity_log.sql` and its `drizzle/meta` snapshot (generated)
- Create: `src/lib/audit/write.ts`
- Test: `src/lib/audit/write.test.ts`
- Delete: `src/lib/audit.ts`
- Modify (import path only): `src/actions/applications.ts`, `src/actions/approvals.ts`, `src/actions/donations.ts`, `src/actions/posts.ts`, `src/actions/users.ts`, `src/lib/approvals/requests.ts`, `src/app/api/uploads/finalize/route.ts`

**Interfaces:**
- Consumes: `AuditEntry` (Task 2).
- Produces: `audit(entry: AuditEntry): Promise<void>` in `src/lib/audit/write.ts`. It never throws. Also new `auditLogs` columns `entityLabel`, `hiddenAt`, and `hiddenById`.

- [ ] **Step 1: Write the failing tests** (`src/lib/audit/write.test.ts`)

```ts
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
const { values } = vi.hoisted(() => ({ values: vi.fn() }));
vi.mock("@/db", () => ({ getDb: () => ({ insert: () => ({ values }) }), schema: { auditLogs: {} } }));

import { audit } from "@/lib/audit/write";

const entry = { actorId: "u1", action: "post.delete", entityType: "post", entityId: "p1", entityLabel: "Bags of Hope" } as const;

describe("audit", () => {
  beforeEach(() => vi.restoreAllMocks());

  it("inserts the entry as given", async () => {
    values.mockResolvedValue(undefined);
    await audit(entry);
    expect(values).toHaveBeenCalledWith(entry);
  });

  it("reports a failed insert instead of throwing, so the action still succeeds", async () => {
    values.mockRejectedValue(new Error("db down"));
    const report = vi.spyOn(console, "error").mockImplementation(() => {});
    await expect(audit(entry)).resolves.toBeUndefined();
    expect(report).toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run them to make sure they fail**

Run: `pnpm test src/lib/audit/write.test.ts`
Expected: FAIL, because `@/lib/audit/write` can't be resolved.

- [ ] **Step 3: Add the columns and indexes to `auditLogs` in `src/db/schema.ts`**

```ts
entityLabel: text("entity_label"),
hiddenAt: timestamp("hidden_at", { withTimezone: true }),
hiddenById: uuid("hidden_by_id").references(() => users.id),
```

Add `index("audit_created_idx").on(t.createdAt)` and `index("audit_actor_idx").on(t.actorId)` beside `audit_entity_idx`. Update the table's doc comment to say that entries are hidden or deleted only through `src/actions/audit.ts`.

- [ ] **Step 4: Create `src/lib/audit/write.ts` and delete `src/lib/audit.ts`**

`import "server-only"`. Then `export const audit = async (entry: AuditEntry): Promise<void>` wraps the insert in `try/catch` and calls `console.error("Couldn't write the activity log entry", entry.action, err)`. Delete the old file with `git rm src/lib/audit.ts`. Change `@/lib/audit` to `@/lib/audit/write` in the seven files listed above.

- [ ] **Step 5: Narrow the post status so the action code typechecks**

In `src/actions/posts.ts`, annotate `const status` as `Exclude<PostStatus, "archived">`. `post.*.archived` isn't a catalogued action, and saving never produces it.

- [ ] **Step 6: Run the tests and typecheck**

Run: `pnpm test src/lib/audit && pnpm typecheck`
Expected: PASS. No type errors, which means every existing `audit()` call already uses a catalogued action and entity type.

- [ ] **Step 7: Generate the migration**

Run: `pnpm db:generate --name activity_log`
Expected: `drizzle/0007_activity_log.sql`, containing three `ADD COLUMN` statements, one foreign key on `hidden_by_id`, and two `CREATE INDEX` statements. Nothing else.

- [ ] **Step 8: Apply the migration** *(ask Ken first)*

The migration only adds nullable columns and indexes, so it's safe on a live database. Still, confirm which database `DATABASE_URL` in `.env.local` points to before running anything.
Run: `pnpm db:migrate`
Expected: it completes with no errors.

- [ ] **Step 9: Commit**

```bash
git add src/db/schema.ts drizzle src/lib/audit src/actions src/lib/approvals/requests.ts src/app/api/uploads/finalize/route.ts
git commit -m "[FEAT] : Add activity log columns and stop failed log writes from failing actions"
```

---

### Task 4: Read-only Activity page

**Files:**
- Create: `src/lib/audit/params.ts`, `src/lib/audit/queries.ts`, `src/components/admin/activity-list.tsx`, `src/components/admin/activity-filters.tsx`, `src/app/admin/activity/page.tsx`
- Modify: `src/components/admin/admin-sidebar.tsx`
- Test: `src/lib/audit/params.test.ts`

**Interfaces:**
- Consumes: `actionsOfKind`, `isAuditKind` (Task 2), `toActivityRow` (Task 2), `AUDIT_PAGE_SIZE`, `AUDIT_KINDS`.
- Produces:
  - `AuditSearchParams = { page?: string; actor?: string; kind?: string; hidden?: string }`. Add it to `src/types/audit.ts`.
  - `parseAuditSearchParams(params: AuditSearchParams, { canManage }: { canManage: boolean }): AuditQuery`
  - `auditPageHref(query: AuditQuery, page: number): string`
  - `listAuditEntries(query: AuditQuery): Promise<{ entries: AuditListItem[]; totalPages: number }>` (server-only)
  - `listAuditActors(): Promise<{ id: string; name: string }[]>` (server-only)
  - `ActivityList = ({ rows, selection }: { rows: ActivityRow[]; selection?: { isSelected: (id: string) => boolean; toggle: (id: string) => void } })`. No `"use client"`, so both the server page and a client wrapper can render it.
  - `ActivityFilters = ({ query, actors }: { query: AuditQuery; actors: { id: string; name: string }[] })`. Task 7 adds `canManage`.

- [ ] **Step 1: Write the failing tests** (`src/lib/audit/params.test.ts`)

```ts
import { describe, expect, it } from "vitest";
import { auditPageHref, parseAuditSearchParams } from "@/lib/audit/params";

const actor = "7f2c1a52-4d1e-4c8b-9a51-2b0f3c9d8e11";
const viewer = { canManage: false };

describe("parseAuditSearchParams", () => {
  it("defaults to the first page, everyone, every kind, hidden left out", () => {
    expect(parseAuditSearchParams({}, viewer)).toEqual({ page: 1, includeHidden: false });
  });

  it("accepts a positive whole page number and nothing else", () => {
    expect(parseAuditSearchParams({ page: "3" }, viewer).page).toBe(3);
    for (const page of ["0", "-2", "abc", "2.5", ""]) expect(parseAuditSearchParams({ page }, viewer).page).toBe(1);
  });

  it("keeps a valid member and kind, and drops junk", () => {
    expect(parseAuditSearchParams({ actor, kind: "posts" }, viewer)).toMatchObject({ actorId: actor, kind: "posts" });
    const junk = parseAuditSearchParams({ actor: "x", kind: "nope" }, viewer);
    expect(junk.actorId).toBeUndefined();
    expect(junk.kind).toBeUndefined();
  });

  it("shows hidden entries only to someone who can manage the log", () => {
    expect(parseAuditSearchParams({ hidden: "1" }, { canManage: true }).includeHidden).toBe(true);
    expect(parseAuditSearchParams({ hidden: "1" }, viewer).includeHidden).toBe(false);
  });
});

describe("auditPageHref", () => {
  it("leaves defaults out of the URL", () => {
    expect(auditPageHref({ page: 1, includeHidden: false }, 1)).toBe("/admin/activity");
  });

  it("keeps the filters when changing page", () => {
    expect(auditPageHref({ page: 1, actorId: actor, kind: "posts", includeHidden: true }, 2)).toBe(
      `/admin/activity?page=2&actor=${actor}&kind=posts&hidden=1`,
    );
  });
});
```

- [ ] **Step 2: Run them to make sure they fail**

Run: `pnpm test src/lib/audit/params.test.ts`
Expected: FAIL, because `@/lib/audit/params` can't be resolved.

- [ ] **Step 3: Implement `src/lib/audit/params.ts`**

- Validate the actor with `z.uuid().safeParse`.
- Build the page with `Number`, then `Number.isInteger(n) && n > 0`.
- Build the URL with `URLSearchParams`, in this order: `page`, `actor`, `kind`, `hidden`.

- [ ] **Step 4: Run the tests to make sure they pass**

Run: `pnpm test src/lib/audit/params.test.ts`
Expected: PASS

- [ ] **Step 5: Implement `src/lib/audit/queries.ts`** (`import "server-only"`)

`listAuditEntries`:
- `leftJoin(users)` on `actorId` to get `actorName`. Users are soft-deleted, so a former member's name still resolves.
- Filters, combined with `and(...)`: `isNull(hiddenAt)` unless `includeHidden`; `eq(actorId)` when given; `inArray(action, actionsOfKind(kind))` when given.
- Order by `desc(createdAt), desc(id)`, with limit `AUDIT_PAGE_SIZE` and offset `(page - 1) * AUDIT_PAGE_SIZE`.
- Run a `count()` with the same filters in parallel. `totalPages = Math.max(1, Math.ceil(n / AUDIT_PAGE_SIZE))`.

`listAuditActors`: `selectDistinct({ id, name })` from `auditLogs`, `innerJoin(users)`, ordered by name.

- [ ] **Step 6: Build `ActivityList` and `ActivityFilters`**

`ActivityList` renders a `<ul className="divide-y divide-line …">`. Each row shows:
- A checkbox, only when `selection` is set and the row isn't `locked`. Its `aria-label` is `` `Select: ${sentence}` ``.
- `<Avatar size="sm" name={actorName} />`.
- The sentence, in semibold.
- The `details` line, in `text-ink-soft`.
- The `at` time, in small text.
- A "Hidden" pill when `hidden`.
- For `locked` rows only: a `bg-sky` tint and the note "Permanent record".

`ActivityFilters` is a plain `<form method="get" action="/admin/activity">` with:
- A "Member" `NativeSelect name="actor"`, with "Everyone" as `value=""`, then the actors.
- A "Kind" `NativeSelect name="kind"`, with "Every kind" as `value=""`, then `AUDIT_KINDS`.
- A submit button labelled "Filter".

- [ ] **Step 7: Build `src/app/admin/activity/page.tsx`**

`const ActivityPage = async ({ searchParams }: { searchParams: Promise<AuditSearchParams> }) => {…}; export default ActivityPage;`

1. `requirePermission("audit:view")`.
2. `canManage = can(role, "audit:manage")`.
3. Parse the params.
4. `Promise.all([listAuditEntries(query), listAuditActors()])`.
5. `rows = entries.map(toActivityRow)`.

Copy:
- Header title: "Activity". Description: "Every change made in the backoffice: who did it and when. Newest first."
- Empty state: "Nothing here yet." when there are no filters, or "No activity matches these filters." when there are.

Below the list:
- A "Newer" link when `page > 1`.
- "Page N of M".
- An "Older" link when `page < totalPages`.

Both links use `auditPageHref`. A page number past the end shows the empty state, and the "Newer" link takes you back.

- [ ] **Step 8: Add the sidebar item**

In `admin-sidebar.tsx`, add `{ href: "/admin/activity", label: "Activity", icon: WorkHistoryIcon, visible: (role) => can(role, "audit:view") }` just before the Suggestions entry. Import `WorkHistoryIcon` from `@hugeicons/core-free-icons`.

- [ ] **Step 9: Check it in the running app**

Run: `pnpm dev`. Then sign in and open `/admin/activity`. Expected:
- Existing entries appear, newest first, with sentences. Older entries fall back to nouns such as "a post".
- Changing the filters updates the URL, and the URL can be reloaded.
- `?page=999` shows the empty state with a working "Newer" link.

- [ ] **Step 10: Commit**

```bash
git add src/lib/audit src/types/audit.ts src/components/admin/activity-list.tsx src/components/admin/activity-filters.tsx src/app/admin/activity src/components/admin/admin-sidebar.tsx
git commit -m "[FEAT] : Add the Activity page so every position can see who did what"
```

---

### Task 5: Labels on existing log calls

**Files:**
- Modify: `src/actions/posts.ts`, `src/lib/approvals/requests.ts`, `src/actions/approvals.ts`, `src/actions/applications.ts`, `src/actions/users.ts`, `src/actions/donations.ts`, `src/app/api/uploads/finalize/route.ts`

**Interfaces:**
- Consumes: `audit()` with `entityLabel` (Task 3).
- Produces: `submitApprovalRequest` takes an optional `label?: string | null` and passes it on as `entityLabel`.

Each call's `entityLabel`:

| Call | `entityLabel` |
| --- | --- |
| `savePost` | `data.title` |
| `deletePost` | `post.title` |
| `submitApprovalRequest` from `savePost`, edit | `existing.title` |
| `submitApprovalRequest` from `savePost`, add | `data.title` |
| `submitApprovalRequest` from `deletePost` | `post.title` |
| `reviewApprovalRequest` | `(await handler.summarize([request])).get(request.id)?.title ?? null`, computed before `handler.apply`, because applying a delete removes the post |
| `reviewApplication`, `user.invite` and `application.approved` | `application.name` |
| `reviewApplication`, `application.rejected` | No label. Rejected applicants stay unnamed, since only the President sees applications. |
| `inviteUser` | `data.name` |
| `setUserRole` | `before.name` |
| `setUserActive` | `target.name` |
| `reviewDonation` | `` `${formatPeso(row.amount)} donation` `` (import `formatPeso` from `@/lib/money`) |
| `/api/uploads/finalize` | `row.filename` |

- [ ] **Step 1: Add the labels and the `label` parameter as listed above**

- [ ] **Step 2: Typecheck and run the tests**

Run: `pnpm typecheck && pnpm test`
Expected: PASS

- [ ] **Step 3: Check it in the running app**

As the President, change a member's position, then save a draft post. Expected: `/admin/activity` shows "… changed Mark Reyes from Member to Bookkeeper" and "… started the post “…” as a draft".

- [ ] **Step 4: Commit**

```bash
git add src/actions src/lib/approvals/requests.ts src/app/api/uploads/finalize/route.ts
git commit -m "[FEAT] : Record what each activity log entry is about"
```

---

### Task 6: Log sign-ins, suggestions, and message reads

**Files:**
- Create: `src/lib/record-sign-in.ts`
- Test: `src/lib/record-sign-in.test.ts`
- Modify: `src/auth.ts`, `src/actions/suggestions.ts`, `src/actions/messages.ts`

**Interfaces:**
- Consumes: `audit()` (Task 3), `SignInMethod` (Task 2).
- Produces: `recordSignIn({ userId, name, method }: { userId: string; name: string; method: SignInMethod }): Promise<void>` (server-only).

- [ ] **Step 1: Write the failing test** (`src/lib/record-sign-in.test.ts`)

```ts
import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
const { audit, set, where } = vi.hoisted(() => ({ audit: vi.fn(), set: vi.fn(), where: vi.fn() }));
vi.mock("@/lib/audit/write", () => ({ audit }));
vi.mock("@/db", () => ({ getDb: () => ({ update: () => ({ set }) }), schema: { users: { id: "id" } } }));

import { recordSignIn } from "@/lib/record-sign-in";

describe("recordSignIn", () => {
  it("stamps the last sign-in and logs how they signed in", async () => {
    set.mockReturnValue({ where });
    where.mockResolvedValue(undefined);
    await recordSignIn({ userId: "u1", name: "Ana Cruz", method: "google" });
    expect(set).toHaveBeenCalledWith({ lastLoginAt: expect.any(Date) });
    expect(audit).toHaveBeenCalledWith({
      actorId: "u1",
      action: "auth.sign_in",
      entityType: "user",
      entityId: "u1",
      entityLabel: "Ana Cruz",
      changes: { method: "google" },
    });
  });
});
```

- [ ] **Step 2: Run it to make sure it fails**

Run: `pnpm test src/lib/record-sign-in.test.ts`
Expected: FAIL, because `@/lib/record-sign-in` can't be resolved.

- [ ] **Step 3: Implement `recordSignIn` and use it in `src/auth.ts`**

Replace both `lastLoginAt` updates:
- In the Credentials `authorize`, call `recordSignIn({ userId: user.id, name: user.name, method: "password" })`.
- In the Google branch of `jwt`, call it with `method: "google"`.

- [ ] **Step 4: Run the test to make sure it passes**

Run: `pnpm test src/lib/record-sign-in.test.ts`
Expected: PASS

- [ ] **Step 5: Log suggestions and message reads**

`src/actions/suggestions.ts` (convert the functions you touch to `const` arrows):
- `addSuggestion` inserts with `.returning({ id })` and logs `suggestion.create`.
- `ownSuggestion` also selects and returns `title`.
- `setSuggestionDone` logs `suggestion.done` or `suggestion.reopen`.
- `deleteSuggestion` logs `suggestion.delete`.
- All four use `entityType: "suggestion"` and the title as the label.

`src/actions/messages.ts`:
- Keep the user that `requirePermission("message:view")` returns.
- After the update, log `message.read` or `message.unread` with `entityType: "contact_message"`.
- **Don't add a label.** Not every position can read messages.

- [ ] **Step 6: Typecheck, test, and check it in the running app**

Run: `pnpm typecheck && pnpm test`
Expected: PASS

Then in `pnpm dev`:
1. Sign out, then sign in again. Expected: "… signed in with a password" (or "with Google").
2. Add a suggestion and tick it off. Expected: two entries.
3. Mark a message read. Expected: "… marked a contact message as read".

- [ ] **Step 7: Commit**

```bash
git add src/lib/record-sign-in.ts src/lib/record-sign-in.test.ts src/auth.ts src/actions/suggestions.ts src/actions/messages.ts
git commit -m "[FEAT] : Log sign-ins, suggestion changes, and message reads"
```

---

### Task 7: Super Admin hide, unhide, and delete

**Files:**
- Create: `src/lib/validations/audit.ts`, `src/lib/audit/manage.ts`, `src/actions/audit.ts`, `src/hooks/useSelection.ts`, `src/components/admin/activity-toolbar.tsx`, `src/components/admin/activity-manager.tsx`
- Modify: `src/config/icons.ts`, `src/components/admin/activity-filters.tsx`, `src/app/admin/activity/page.tsx`
- Test: `src/lib/validations/audit.test.ts`, `src/lib/audit/manage.test.ts`, `src/hooks/useSelection.test.ts`

**Interfaces:**
- Consumes: `AUDIT_PAGE_SIZE`, `AUDIT_DELETE_ACTION`, `formatEntryCount`, `ActivityList`, `ActivityRow` (earlier tasks).
- Produces:
  - `hideAuditEntriesSchema` (`{ ids, hidden: boolean }`), `deletionReasonSchema`, `deleteAuditEntriesSchema` (`{ ids, reason }`), and types `HideAuditEntriesInput` and `DeleteAuditEntriesInput`.
  - `checkAuditSelection(rows: { action: string }[]): string | null`
  - `summarizeDeletion(createdAts: Date[]): { count: number; from: string; to: string }`, with ISO strings.
  - Server actions `hideAuditEntries(input: HideAuditEntriesInput): Promise<ActionResult>` and `deleteAuditEntries(input: DeleteAuditEntriesInput): Promise<ActionResult>`.
  - `useSelection(availableIds: readonly string[]): { selected: string[]; isSelected: (id: string) => boolean; toggle: (id: string) => void; clear: () => void }`
  - `actionIcons.hide` (`ViewOffIcon`) and `actionIcons.unhide` (`ViewIcon`).

- [ ] **Step 1: Write the failing validation and manage tests**

`src/lib/validations/audit.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { deleteAuditEntriesSchema, hideAuditEntriesSchema } from "@/lib/validations/audit";

const id = "7f2c1a52-4d1e-4c8b-9a51-2b0f3c9d8e11";
const ids = (n: number) => Array.from({ length: n }, () => id);

describe("audit selection inputs", () => {
  it("takes one to fifty well-formed ids", () => {
    expect(hideAuditEntriesSchema.safeParse({ ids: ids(1), hidden: true }).success).toBe(true);
    expect(hideAuditEntriesSchema.safeParse({ ids: ids(50), hidden: false }).success).toBe(true);
    expect(hideAuditEntriesSchema.safeParse({ ids: [], hidden: true }).success).toBe(false);
    expect(hideAuditEntriesSchema.safeParse({ ids: ids(51), hidden: true }).success).toBe(false);
    expect(hideAuditEntriesSchema.safeParse({ ids: ["x"], hidden: true }).success).toBe(false);
  });

  it("needs a real reason to delete", () => {
    expect(deleteAuditEntriesSchema.safeParse({ ids: ids(1), reason: "  " }).success).toBe(false);
    expect(deleteAuditEntriesSchema.safeParse({ ids: ids(1), reason: "ab" }).success).toBe(false);
    expect(deleteAuditEntriesSchema.safeParse({ ids: ids(1), reason: "x".repeat(201) }).success).toBe(false);
    expect(deleteAuditEntriesSchema.parse({ ids: ids(1), reason: "  Test data  " }).reason).toBe("Test data");
  });
});
```

`src/lib/audit/manage.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { checkAuditSelection, summarizeDeletion } from "@/lib/audit/manage";

describe("checkAuditSelection", () => {
  it("refuses when nothing selected still exists", () => {
    expect(checkAuditSelection([])).toBe("Those entries no longer exist. Refresh the page.");
  });

  it("refuses the whole request if it includes a deletion record", () => {
    expect(checkAuditSelection([{ action: "post.delete" }, { action: "audit.delete" }])).toBe("Deletion records can't be hidden or deleted.");
  });

  it("allows ordinary entries", () => {
    expect(checkAuditSelection([{ action: "post.delete" }, { action: "auth.sign_in" }])).toBeNull();
  });
});

describe("summarizeDeletion", () => {
  it("counts entries and spans oldest to newest, whatever the order", () => {
    const [a, b, c] = [new Date("2026-01-03T02:00:00Z"), new Date("2026-02-01T00:00:00Z"), new Date("2026-03-14T09:00:00Z")];
    expect(summarizeDeletion([b, c, a])).toEqual({ count: 3, from: a.toISOString(), to: c.toISOString() });
  });

  it("uses the same date at both ends for one entry", () => {
    const a = new Date("2026-01-03T02:00:00Z");
    expect(summarizeDeletion([a])).toEqual({ count: 1, from: a.toISOString(), to: a.toISOString() });
  });
});
```

- [ ] **Step 2: Run them to make sure they fail**

Run: `pnpm test src/lib/validations/audit.test.ts src/lib/audit/manage.test.ts`
Expected: FAIL, because the modules can't be resolved.

- [ ] **Step 3: Implement `src/lib/validations/audit.ts` and `src/lib/audit/manage.ts`**

Validation:
- IDs: `z.array(z.uuid()).min(1, "Pick at least one entry.").max(AUDIT_PAGE_SIZE, "Pick at most 50 entries at a time.")`.
- Reason: `z.string().trim().min(3, "Say why, so everyone understands what was removed.").max(200, "Keep the reason under 200 characters.")`.

`checkAuditSelection` returns the exact messages the tests assert.

- [ ] **Step 4: Run the tests to make sure they pass**

Run: `pnpm test src/lib/validations/audit.test.ts src/lib/audit/manage.test.ts`
Expected: PASS

- [ ] **Step 5: Write the failing hook tests** (`src/hooks/useSelection.test.ts`)

```ts
// @vitest-environment happy-dom
import { describe, expect, it } from "vitest";
import { act } from "react";
import { renderHook } from "@/test/render-hook";
import { useSelection } from "@/hooks/useSelection";

describe("useSelection", () => {
  it("toggles ids on and off, and clears", () => {
    const { result } = renderHook(({ ids }) => useSelection(ids), { ids: ["a", "b"] });
    act(() => result.current!.toggle("a"));
    expect(result.current!.selected).toEqual(["a"]);
    expect(result.current!.isSelected("a")).toBe(true);
    act(() => result.current!.toggle("a"));
    expect(result.current!.selected).toEqual([]);
    act(() => result.current!.toggle("b"));
    act(() => result.current!.clear());
    expect(result.current!.selected).toEqual([]);
  });

  it("drops ids that are no longer on the page, so a stale pick is never sent", () => {
    const { result, rerender } = renderHook(({ ids }) => useSelection(ids), { ids: ["a", "b"] });
    act(() => result.current!.toggle("a"));
    act(() => result.current!.toggle("b"));
    rerender({ ids: ["b", "c"] });
    expect(result.current!.selected).toEqual(["b"]);
    expect(result.current!.isSelected("a")).toBe(false);
  });
});
```

- [ ] **Step 6: Run them to make sure they fail**

Run: `pnpm test src/hooks/useSelection.test.ts`
Expected: FAIL, because `@/hooks/useSelection` can't be resolved.

- [ ] **Step 7: Implement `useSelection`**

Keep the picked IDs in `useState<string[]>`. Return `selected` as `picked.filter((id) => availableIds.includes(id))`. `isSelected` and `toggle` work on that filtered list.

- [ ] **Step 8: Run the tests to make sure they pass**

Run: `pnpm test src/hooks/useSelection.test.ts`
Expected: PASS

- [ ] **Step 9: Implement the server actions in `src/actions/audit.ts`** (`"use server"`)

Both actions run inside `runAction`:
1. `requirePermission("audit:manage")`.
2. Parse the input.
3. Load the rows with `select({ id, action, createdAt }).where(inArray(id, ids))`.
4. Return `{ ok: false, message }` if `checkAuditSelection(rows)` returns a refusal.

The two actions share one private loader, so this code isn't written twice.

`hideAuditEntries`:
- Sets `{ hiddenAt: hidden ? new Date() : null, hiddenById: hidden ? user.id : null }` on the found IDs.
- Writes no log entry.
- Message: `` `${formatEntryCount(n)} hidden.` `` or `` `${formatEntryCount(n)} unhidden.` ``

`deleteAuditEntries`:
- Sets `const recordId = crypto.randomUUID()`.
- Runs, in one `getDb().batch([...])`:
  - `delete(auditLogs).where(inArray(id, foundIds))`
  - an insert of `{ id: recordId, actorId: user.id, action: AUDIT_DELETE_ACTION, entityType: "audit_log", entityId: recordId, changes: { ...summarizeDeletion(createdAts), reason } }`.
- This writes directly, not through `audit()`, so the delete and the record succeed or fail together.
- Message: `` `${formatEntryCount(n)} deleted. A record of the deletion stays in the log.` ``

Both actions call `revalidatePath("/admin/activity")`.

- [ ] **Step 10: Build the toolbar, the manager, and the page wiring**

Icons: add `hide: ViewOffIcon` and `unhide: ViewIcon` to `actionIcons`.

`ActivityToolbar = ({ ids, allHidden, onDone }: { ids: string[]; allHidden: boolean; onDone: () => void })` (`"use client"`):
- Shows "**N selected**".
- A **Hide** button (or **Unhide** when `allHidden`) calls `hideAuditEntries({ ids, hidden: !allHidden })`.
- A **Delete…** button (`variant="danger"`, `actionIcons.delete`):
  1. Calls `prompt(\`Why are you deleting ${formatEntryCount(ids.length)}? Everyone will see this reason.\`)`.
  2. If that returns `null`, does nothing.
  3. Checks the reason with `deletionReasonSchema.safeParse`. On failure, calls `toast.error(firstIssueMessage)`.
  4. Otherwise calls `deleteAuditEntries`.
- After any action: `toastResult(result)`, `onDone()`, `router.refresh()`. Run them inside `useTransition`, and disable the buttons while pending.

`ActivityManager = ({ rows }: { rows: ActivityRow[] })` (`"use client"`):
- Calls `useSelection(rows.filter(({ locked }) => !locked).map(({ id }) => id))`.
- When anything is selected, renders the toolbar above the list. `allHidden` is true when every selected row is `hidden`.
- Renders `<ActivityList rows={rows} selection={{ isSelected, toggle }} />`.

`ActivityFilters` gains `canManage`. When it's true, the form shows a "Show hidden" checkbox (`name="hidden" value="1"`).

The page renders `<ActivityManager rows={rows} />` when `canManage`, and `<ActivityList rows={rows} />` otherwise.

- [ ] **Step 11: Typecheck, test, and check it in the running app**

Run: `pnpm typecheck && pnpm test`
Expected: PASS

Then in `pnpm dev`:
1. As a Member: no checkboxes, no toolbar, and no "Show hidden" option.
2. As the Super Admin: tick 2 entries and choose Hide. They disappear.
3. Tick "Show hidden". They show greyed with a "Hidden" pill. Select them; the button reads Unhide. Choose it; they're back.
4. Tick 3 entries, choose Delete…, and enter "Test data". They're gone, and "Ken deleted 3 log entries from … Reason: Test data" appears at the top. That record has no checkbox.
5. Change page with entries ticked. The toolbar's count drops to what's on the new page.

- [ ] **Step 12: Commit**

```bash
git add src/lib/validations/audit.ts src/lib/validations/audit.test.ts src/lib/audit/manage.ts src/lib/audit/manage.test.ts src/actions/audit.ts src/hooks/useSelection.ts src/hooks/useSelection.test.ts src/components/admin/activity-toolbar.tsx src/components/admin/activity-manager.tsx src/components/admin/activity-filters.tsx src/config/icons.ts src/app/admin/activity/page.tsx
git commit -m "[FEAT] : Let the Super Admin hide, unhide, and delete activity log entries"
```

---

### Task 8: User stories and final checks

**Files:**
- Modify: `docs/user-stories.md`

- [ ] **Step 1: Move the Audit log stories to Built**

Remove the planned `## Audit log (AUD)` section. Add a built `## Activity log (AUD)` section just before `## Developers (DEV)`, with two stories.

**AUD-01 See who did what.** As any signed-in position, I want an Activity page, so that I can see who changed what and when. Done when:
- `/admin/activity` lists entries newest first, 50 per page, in plain sentences.
- You can filter by member and by kind.
- Sign-ins, posts, members, applications, approvals, donations, uploads, suggestions, and message reads are logged.

**AUD-02 Clean up the log.** As the Super Admin, I want to hide or delete entries. Done when:
- Hiding leaves no visible trace and can be undone from "Show hidden".
- Deleting needs a reason, and leaves a permanent record of the count, the date range, and the reason.
- Nobody can hide or delete that record.

- [ ] **Step 2: Run the full checks**

Run: `pnpm lint && pnpm test && pnpm build`
Expected: all three pass with no errors.

- [ ] **Step 3: Commit**

```bash
git add docs/user-stories.md
git commit -m "[DOCS] : Move activity log stories to built"
```

- [ ] **Step 4: Hand back for merging**

Don't push. Use superpowers:finishing-a-development-branch. Remind Ken that the `0007` migration must be applied to production before this code is deployed.
