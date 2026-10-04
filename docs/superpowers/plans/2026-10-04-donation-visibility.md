# Donation Visibility Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Only the positions in two config lists can open the Donations page and see donors' names, emails, and messages.

**Architecture:** Two role arrays in `src/config/roles.ts` become "listed permissions" (`donation:view`, `donation:view:donor`) that `can()` answers from, so every caller keeps checking permissions. A pure `toDonorView` helper strips donor fields on the server for anyone without `donation:view:donor`, and a small `DonorCell` component renders the result.

**Tech Stack:** Next.js 16 (App Router, server components), TypeScript 5.9, Drizzle ORM, Vitest 5, Tailwind 4.

**Spec:** `docs/superpowers/specs/2026-10-04-donation-visibility-design.md`

## Global Constraints

- Default lists: `DONATION_LIST_VIEWERS` and `DONOR_DETAILS_VIEWERS` are both `["superAdmin", "president", "bookkeeper", "donorSponsorRelations"]`.
- Use `const` arrow functions only, including page components: `const DonationsPage = async (…) => {…}; export default DonationsPage;`.
- Destructure props, params, and hook returns.
- Pure helpers go in `src/lib/`, constants in `src/config/`, shared types in `src/types/`.
- Check permissions with `can(role, permission)`, never with position names (DEV-02).
- `src/config/roles.ts` is imported by the Drizzle schema, so it uses relative imports only.
- Write the test first for every new helper.
- Commit messages use `[TYPE] : <message>`. Never add AI co-author or attribution lines.
- Work on branch `feat/donation-visibility`. `pnpm lint`, `pnpm test`, and `pnpm build` must all pass before it reaches `main`.

## Review Focus

1. **An anonymous donation that still has a name stored** (edited in `db:studio`, or older data): the page shows "Anonymous", never the name. Covered by a test in Task 2.
2. **Blank strings in older rows** (`""` or spaces for email or message): treated as missing, so there's no empty line or empty quote. Covered by a test in Task 2.
3. **A position on the list but not on the donor-details list**: sees "Hidden" in the Donor column, and still sees the amount, reference, status, and buttons. Covered by the hidden-view test in Task 2 and the manual check in Task 3.
4. **Someone removes a confirming position from `DONATION_LIST_VIEWERS`**: `pnpm test` fails, instead of the Bookkeeper silently losing the page. Covered by Task 1.
5. **A Member opens an old `/admin/donations` bookmark**: they're redirected to `/admin`, not shown an error. Covered by the manual check in Task 3.

---

### Task 1: Listed permissions in RBAC

**Files:**
- Modify: `src/config/roles.ts` (`PERMISSIONS`, `BASE`, new lists after `ROLES`)
- Modify: `src/types/rbac.ts:13` (`Permission`) and `RoleConfig`
- Modify: `src/lib/rbac.ts:38` (`can`)
- Test: `src/lib/rbac.test.ts`

**Interfaces:**
- Produces:
  - `DONATION_LIST_VIEWERS`, `DONOR_DETAILS_VIEWERS`: `readonly Role[]` tuples.
  - `LISTED_PERMISSIONS: { "donation:view": typeof DONATION_LIST_VIEWERS; "donation:view:donor": typeof DONOR_DETAILS_VIEWERS }`.
  - Types `RolePermission`, `ListedPermission`, and `Permission = RolePermission | ListedPermission`.
  - `isListedPermission(permission: Permission): permission is ListedPermission`.
  - `can(role, "donation:view:donor")` works everywhere `can` is used.

- [ ] **Step 1: Create the branch**

Run: `git checkout -b feat/donation-visibility`

- [ ] **Step 2: Write the failing tests in `src/lib/rbac.test.ts`**

Import `DONATION_LIST_VIEWERS`, `DONOR_DETAILS_VIEWERS`, `LISTED_PERMISSIONS`, `ROLE_KEYS`, and `ROLES` from `@/config/roles`, and the `ListedPermission` type from `@/types/rbac`. Change the existing Super Admin test to loop over both kinds of permission, and add a new `describe`:

```ts
it("gives the Super Admin every permission", () => {
  const listed = Object.keys(LISTED_PERMISSIONS) as ListedPermission[];
  for (const permission of [...PERMISSIONS, ...listed]) expect(can("superAdmin", permission)).toBe(true);
});

describe("listed permissions", () => {
  const DONATION_STAFF: Role[] = ["superAdmin", "president", "bookkeeper", "donorSponsorRelations"];
  const EVERYONE_ELSE: Role[] = ["vpExternal", "vpInternal", "communications", "creativesTeam", "orgDevelopment", "member"];

  it("lets donation staff see donations and donor details", () => {
    for (const role of DONATION_STAFF) {
      expect(can(role, "donation:view")).toBe(true);
      expect(can(role, "donation:view:donor")).toBe(true);
    }
  });

  it("keeps donations from every other position", () => {
    for (const role of EVERYONE_ELSE) {
      expect(can(role, "donation:view")).toBe(false);
      expect(can(role, "donation:view:donor")).toBe(false);
    }
  });

  it("lists everyone who confirms donations as a donation list viewer", () => {
    for (const role of ROLE_KEYS.filter((r) => can(r, "donation:review"))) expect(DONATION_LIST_VIEWERS).toContain(role);
  });

  it("only shows donor details to positions that can open the list", () => {
    for (const role of DONOR_DETAILS_VIEWERS) expect(DONATION_LIST_VIEWERS).toContain(role);
  });

  it("never grants a listed permission through a position's own permissions", () => {
    const listed: string[] = Object.keys(LISTED_PERMISSIONS);
    for (const role of ROLE_KEYS) for (const permission of ROLES[role].permissions) expect(listed).not.toContain(permission);
  });

  it("refuses listed permissions to a missing or unknown role", () => {
    expect(can(undefined, "donation:view")).toBe(false);
    expect(can("admin" as Role, "donation:view:donor")).toBe(false);
  });
});
```

- [ ] **Step 3: Run the tests to verify they fail**

Run: `pnpm test src/lib/rbac.test.ts`
Expected: FAIL. `LISTED_PERMISSIONS` is undefined, and the "every other position" test fails because Member still has `donation:view`.

- [ ] **Step 4: Implement the config, types, and `can`**

- In `src/config/roles.ts`, remove `"donation:view"` from `PERMISSIONS`, set `BASE` to `["admin:access"]`, and add the three constants after `ROLES`, exactly as written in the spec's Config section, including the doc comments.
- In `src/types/rbac.ts`:
  - Add `RolePermission = (typeof PERMISSIONS)[number]` and `ListedPermission = keyof typeof LISTED_PERMISSIONS`, with `LISTED_PERMISSIONS` as a type import from `../config/roles`.
  - Set `Permission = RolePermission | ListedPermission`.
  - Change `RoleConfig.permissions` to `readonly RolePermission[]`.
  - Update the doc comment on `Permission` to say listed permissions come from the lists in `src/config/roles.ts`.
- In `src/lib/rbac.ts`, add `isListedPermission` with `Object.hasOwn(LISTED_PERMISSIONS, permission)`. In `can`, read `LISTED_PERMISSIONS[permission]` for a listed permission and `ROLES[role].permissions` otherwise. Widen the listed tuple to `readonly Role[]` before calling `.includes(role)`.

- [ ] **Step 5: Run the tests and the type check**

Run: `pnpm test src/lib/rbac.test.ts` then `pnpm typecheck`
Expected: all tests PASS, and `tsc` reports no errors.

- [ ] **Step 6: Commit**

```bash
git add src/config/roles.ts src/types/rbac.ts src/lib/rbac.ts src/lib/rbac.test.ts
git commit -m "[FEAT] : Grant donation access through position lists"
```

### Task 2: Donor view helper

**Files:**
- Create: `src/types/donations.ts`
- Create: `src/lib/donations/donor-view.ts`
- Modify: `src/db/schema.ts` (type exports at the bottom: add `Donation`)
- Test: `src/lib/donations/donor-view.test.ts`

**Interfaces:**
- Produces:
  - `type Donation = typeof donations.$inferSelect` from `@/db/schema`.
  - `type DonorView = { visibility: "hidden" } | { visibility: "shown"; name: string | null; email: string | null; message: string | null }` from `@/types/donations`.
  - `toDonorView(donation: Pick<Donation, "isAnonymous" | "donorName" | "donorEmail" | "message">, canSeeDonor: boolean): DonorView` from `@/lib/donations/donor-view`.

- [ ] **Step 1: Write the failing tests in `src/lib/donations/donor-view.test.ts`**

```ts
import { describe, expect, it } from "vitest";
import { toDonorView } from "@/lib/donations/donor-view";

const ana = { isAnonymous: false, donorName: "Ana Cruz", donorEmail: "ana@example.com", message: "Para sa mga bata!" };

describe("toDonorView", () => {
  it("carries nothing about the donor without donor access", () => {
    expect(toDonorView(ana, false)).toStrictEqual({ visibility: "hidden" });
  });

  it("shows the name, email, and message with donor access", () => {
    expect(toDonorView(ana, true)).toStrictEqual({ visibility: "shown", name: "Ana Cruz", email: "ana@example.com", message: "Para sa mga bata!" });
  });

  it("leaves out an anonymous donor's name even when one is stored", () => {
    expect(toDonorView({ ...ana, isAnonymous: true }, true)).toStrictEqual({ visibility: "shown", name: null, email: "ana@example.com", message: "Para sa mga bata!" });
  });

  it("returns null for a missing email or message", () => {
    expect(toDonorView({ ...ana, donorEmail: null, message: null }, true)).toStrictEqual({ visibility: "shown", name: "Ana Cruz", email: null, message: null });
  });

  it("treats blank text as missing", () => {
    expect(toDonorView({ isAnonymous: false, donorName: " ", donorEmail: "", message: "  " }, true)).toStrictEqual({ visibility: "shown", name: null, email: null, message: null });
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `pnpm test src/lib/donations/donor-view.test.ts`
Expected: FAIL, because `@/lib/donations/donor-view` can't be resolved.

- [ ] **Step 3: Implement the type, the schema export, and `toDonorView`**

- Add `export type Donation = typeof donations.$inferSelect;` after `export type Media` in `src/db/schema.ts`.
- Put `DonorView` in `src/types/donations.ts`, with a doc comment: "`name` is null when the donor gave anonymously or left no name."
- In `toDonorView`, use a module-private `const blankToNull = (text: string | null) => (text?.trim() ? text : null)` for the name, email, and message. The name is `null` whenever `isAnonymous` is true.

- [ ] **Step 4: Run the tests to verify they pass**

Run: `pnpm test src/lib/donations/donor-view.test.ts`
Expected: 5 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/db/schema.ts src/types/donations.ts src/lib/donations/donor-view.ts src/lib/donations/donor-view.test.ts
git commit -m "[FEAT] : Add donor view helper that hides donor details"
```

### Task 3: Donations page, donor cell, and stories

**Files:**
- Create: `src/components/admin/donor-cell.tsx`
- Modify: `src/app/admin/donations/page.tsx`
- Modify: `docs/user-stories.md` (DON-05 at lines 94-95, MEM-08 at lines 133-134)

**Interfaces:**
- Consumes: `can(role, "donation:view" | "donation:view:donor")` (Task 1), `toDonorView` and `DonorView` (Task 2).
- Produces: `DonorCell = ({ donor }: { donor: DonorView }) => JSX.Element` from `@/components/admin/donor-cell`.

- [ ] **Step 1: Create `DonorCell` in `src/components/admin/donor-cell.tsx`**

A server component (no `"use client"`). It renders:
- **Hidden:** `<span className="text-ink-soft">Hidden</span>`.
- **Shown:**
  - The name, or `<span className="text-ink-soft">Anonymous</span>` when the name is null.
  - The email as `block text-sm text-ink-soft`, when present.
  - The message as `mt-1 block max-w-xs text-sm text-ink-soft whitespace-pre-line`, wrapped in curly quotes (“…”), when present.

- [ ] **Step 2: Update `src/app/admin/donations/page.tsx`**

- Turn `export default async function DonationsPage` into `const DonationsPage = async ({ searchParams }: …) => {…}` with `export default DonationsPage;` at the end.
- Replace `requirePermission("donation:view")` with `requireUser()` followed by `if (!can(user.role, "donation:view")) redirect("/admin");`, importing `redirect` from `next/navigation` as `src/app/admin/messages/page.tsx` does.
- Add `const canSeeDonor = can(user.role, "donation:view:donor");`.
- Replace the Donor `<td>` contents (lines 73-74) with `<DonorCell donor={toDonorView(d, canSeeDonor)} />`.

- [ ] **Step 3: Update DON-05 and MEM-08 in `docs/user-stories.md`**

Replace DON-05 with:

```markdown
**DON-05 See donations as an officer.** As an officer who handles donations, I want to see the donations list, so that I can follow and confirm gifts.
- Positions in `DONATION_LIST_VIEWERS` (`src/config/roles.ts`) see the list. By default: Super Admin, President, Bookkeeper, and Donor & Sponsor Relations.
- Positions in `DONOR_DETAILS_VIEWERS` also see each donor's name, email, and message. Others on the list see "Hidden".
- Only positions with `donation:review` (Super Admin, President, and Bookkeeper) see the confirm and reject buttons.
- Anyone else who opens `/admin/donations` is sent to the dashboard.
```

In MEM-08, change "see the dashboard, donations, and members list" to "see the dashboard and members list". Add the bullet "- Members don't see donations (DON-05)."

- [ ] **Step 4: Run the full checks**

Run: `pnpm lint`, then `pnpm test`, then `pnpm build`
Expected: lint passes with no errors, every test passes, and the build completes.

- [ ] **Step 5: Manual check in the running app** (`pnpm dev`; needs `.env.local` with a database and accounts for each position)

- As a Member: there's no Donations item in the sidebar, and `/admin/donations` redirects to `/admin`.
- As the Bookkeeper: the list shows names, emails, and messages, plus the Confirm and Reject buttons.
- Remove `"bookkeeper"` from `DONOR_DETAILS_VIEWERS`: the Donor column says "Hidden" and Confirm still works. Restore the list afterwards.

If no accounts for these positions exist locally, report this step as not done. Don't skip it silently.

- [ ] **Step 6: Commit**

```bash
git add src/components/admin/donor-cell.tsx src/app/admin/donations/page.tsx docs/user-stories.md
git commit -m "[FEAT] : Hide donor details on the donations page from positions without access"
```
