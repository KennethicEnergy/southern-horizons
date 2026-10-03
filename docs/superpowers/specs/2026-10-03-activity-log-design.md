# Activity log: who did what, and when

Date: 2026-10-03

## Intent

Give every officer and member one page that answers "who did what, and when" in the backoffice, so the group can see how the site and its records change. The Super Admin can clean the log up: either delete entries, which always leaves a permanent trace, or hide them quietly, which can be undone.

## What was asked

- An audit trail of every member's action.
- Everyone can see it.
- Only the Super Admin can delete history.
- Both kinds of removal are needed: "sometimes I need to leave a trace, but sometimes I will hide it."

## Assumptions (correct these if wrong)

- "Everyone" means every signed-in backoffice position, including plain Members. The public can't see the log.
- "Every action" means every change: adds, edits, deletes, approvals, reviews, uploads, and sign-ins. Page views aren't logged.
- The log holds nothing more sensitive than what every position can already see elsewhere: member emails, donation amounts, and rejection reasons. It never holds passwords or donor contact details.
- Public visitors' contact messages and membership applications aren't logged. They aren't member actions, and they're already kept in their own tables.
- The Super Admin also has database access through the Neon console. So the rules below are enforced in app code, not with database triggers.

## What exists today

- The `audit_logs` table has existed since migration `0000`. Its columns are `actor_id`, `action`, `entity_type`, `entity_id`, `changes` (jsonb), and `created_at`.
- `audit()` in `src/lib/audit.ts` is called from posts, users, applications, approvals, donations, approval requests, and `/api/uploads/finalize`.
- The `audit:view` permission exists, but only Super Admin and President have it, and nothing checks it.
- No page shows the log.

## Design

### Data (`src/db/schema.ts`, next migration)

New columns on `audit_logs`:

| Column | Type | Purpose |
| --- | --- | --- |
| `entity_label` | `text`, nullable | Snapshot of what the entry was about when it happened, such as the post title or member name. The entry stays readable after the post or person is deleted. |
| `hidden_at` | `timestamptz`, nullable | Set when the Super Admin hides the entry. |
| `hidden_by_id` | `uuid`, nullable, references `users.id` | Who hid it. Shown only to the Super Admin. |

New indexes: `audit_created_idx` on `created_at`, for the newest-first list, and `audit_actor_idx` on `actor_id`, for the member filter.

Generate the migration with `pnpm db:generate` and apply it with `pnpm db:migrate`.

### Permissions (`src/config/roles.ts`)

- Add `audit:view` to `BASE`, so every position can open the page.
- Add `audit:manage` to `PERMISSIONS`. Only Super Admin gets it. The President's list becomes every permission except `audit:manage`.
- Code checks these permissions, never position names (DEV-02).

### Action codes (`src/config/audit.ts`)

Every action code is listed in one typed config. Each code has a readable label and belongs to one kind, which drives the Kind filter. `audit()` accepts only a listed code, so a code without a label fails the build.

| Kind | Codes |
| --- | --- |
| Posts | `post.create.<status>`, `post.update.<status>` (status is `draft`, `in_review`, or `published`), `post.delete` |
| Members | `user.invite`, `user.role`, `user.deactivate`, `user.reactivate` |
| Applications | `application.approved`, `application.rejected` |
| Approvals | `approval.request.add`, `approval.request.edit`, `approval.request.delete`, `approval.update`, `approval.approved`, `approval.rejected` |
| Donations | `donation.confirmed`, `donation.rejected` |
| Uploads | `media.upload` |
| Sign-ins | `auth.sign_in` *(new)* |
| Suggestions | `suggestion.create`, `suggestion.done`, `suggestion.reopen`, `suggestion.delete` *(new)* |
| Messages | `message.read`, `message.unread` *(new)* |
| Deletions | `audit.delete` *(new)* |

Shared types (`AuditAction`, `AuditKind`, `AuditEntry`) go in `src/types/audit.ts`.

### Writing entries (`src/lib/audit/write.ts`)

- `audit()` moves here and becomes a `const` arrow function. It gains an optional `entityLabel`.
- **Behaviour change:** if the insert fails, `audit()` logs the error with `console.error` and returns. It doesn't throw. Today a failed log write after a successful save shows "Something went wrong" even though the change went through. A failed write must also never block a sign-in.
- Existing calls start passing a label:

| Call | Label |
| --- | --- |
| Posts | Post title |
| Members | Member name |
| Applications | Applicant name |
| Donations | Formatted amount, never the donor's name |
| Uploads | File name |
| Approval requests | Title of the post concerned |

- **Sign-ins:** a new `recordSignIn(userId, method)` sets `lastLoginAt` and writes `auth.sign_in` with `{ method: "google" | "password" }`. Both sign-in paths in `src/auth.ts` call it in place of their own `lastLoginAt` updates. Sign-outs aren't logged.
- **Suggestions:** `addSuggestion`, `setSuggestionDone`, and `deleteSuggestion` write their codes. The label is the suggestion title.
- **Messages:** `setMessageRead` writes `message.read` or `message.unread`. The label is the message subject.

### Reading entries (`src/lib/audit/queries.ts`, `src/lib/audit/describe.ts`)

- `listAuditEntries({ page, actorId, kind, includeHidden })` returns 50 entries per page, newest first, joined to the actor's name and avatar. Deactivated or deleted actors still resolve, because users are soft-deleted. It also returns `totalPages`.
- Hidden entries are excluded unless `includeHidden` is true. The page passes `true` only when the viewer has `audit:manage` and `?hidden=1` is set.
- `kindToActionPrefixes(kind)` maps a Kind filter value to the action prefixes it covers.
- `describeAuditEntry(entry)` is a pure function that returns `{ sentence, details? }`. Examples:
  - *Ana Cruz published the post "Bags of Hope"*
  - *Ken changed Mark Reyes from Member to Bookkeeper*
  - *Ken deleted 12 entries from 3 Jan – 14 Mar 2026*
- `details` carries a rejection reason, a donation note, or the deletion reason, when there is one.
- Older entries with no `entity_label` fall back to a generic noun, such as "a post".
- An entry with no actor reads as "Someone".

### The Activity page (`/admin/activity`)

- The sidebar item is **Activity**, visible with `audit:view`. The page itself also checks `audit:view` on the server.
- Each row shows:
  - The actor's avatar and name.
  - The sentence.
  - The time, from `formatDateTime`, in Philippine time.
  - A details line, when there is one.
- Previous and Next links use `?page=`.
- Filters are a plain GET form, so a filtered view is a shareable URL:
  - **Member** (`?actor=`): anyone who appears in the log.
  - **Kind** (`?kind=`): the kinds in the table above.
- Components: `src/components/admin/activity-list.tsx`, `activity-filters.tsx`, and `activity-manage-toolbar.tsx`. The toolbar is a client component.

### Super Admin controls

Only rendered when the viewer has `audit:manage`. Each server action checks `audit:manage` again.

- **Selection:** each row has a checkbox, except `audit.delete` entries, which can't be selected. When anything is ticked, a toolbar shows "**N selected** · Hide · Delete…".
- **Show hidden:** a toggle (`?hidden=1`) shows hidden entries greyed out with a "Hidden" badge. Selecting them offers **Unhide** in place of Hide.
- **`hideAuditEntries({ ids, hidden })`:**
  - Sets or clears `hidden_at` and `hidden_by_id`.
  - Writes no log entry, so nobody else sees a trace.
  - Refuses the whole request if any ID is an `audit.delete` entry. The UI never lets you select those entries, so this only guards against tampered requests.
- **`deleteAuditEntries({ ids, reason })`:**
  1. Asks for confirmation and a required reason through `prompt()`, matching the rest of the backoffice.
  2. Refuses the whole request if any ID is an `audit.delete` entry.
  3. Uses `summarizeDeletion(entries)` to compute `{ count, from, to }` from the selected entries' `created_at`.
  4. In one `db.batch` (a single transaction), deletes the rows and inserts one `audit.delete` entry with `changes: { count, from, to, reason }`.
  5. Copies none of the deleted details into the new entry.
- `audit.delete` entries can't be hidden or deleted by anyone.
- Input validation (`src/lib/validations/audit.ts`): 1–50 UUIDs per request, and a trimmed reason of 3–200 characters.
- Results go through `runAction`, and the toolbar shows the existing toasts on success and failure.

## Testing

Write each test before the code it covers.

- **`describeAuditEntry`:** every action code produces a sentence; there are label and no-label fallbacks; an entry with no actor works; details appear for reasons and notes.
- **Action-code config:** every code has a label and a kind. The `kindToActionPrefixes` mapping is covered.
- **`summarizeDeletion`:** the count and the oldest and newest dates, including a single entry.
- **Validation:** hide and delete inputs, covering the ID count limits, malformed IDs, and an empty or too-long reason.
- **RBAC (`src/lib/rbac.test.ts`):** every position has `audit:view`, and only Super Admin has `audit:manage`.
- **Manual check in the running app** (the repo has no database test setup):
  - As a Member: the page loads, and no checkboxes appear.
  - As the Super Admin: hide, show hidden, unhide, and delete with a reason all work, and the deletion record can't be selected.
  - Sign in with each method and confirm an `auth.sign_in` entry appears.

## Out of scope

- A date filter.
- Logging sign-outs or failed sign-in attempts.
- Automatic cleanup of old entries.
- Database-level enforcement such as triggers or revoked privileges.
- Replacing `prompt()` with an in-page dialog.
