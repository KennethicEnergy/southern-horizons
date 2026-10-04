# Donation visibility: who sees donations and donor details

Date: 2026-10-04

## Intent

Only the positions that need donor information to do their job can see it, as the Data Privacy Act (RA 10173) expects. Two lists in config decide who those positions are, so the officers can change them without touching code anywhere else. An officer reads each donor's message for the kids before any child sees it.

This is the first of three projects from the officers' donation decisions. Campaign management and email through Resend get their own specs.

## What was asked

- Two position lists, set "in an array way": one for who can see the donation list, and one for who can see donors' details. Start with Super Admin and President, and add more positions later.
- "Do what's best and recommended for the current PH setup and for the sake of the children, but make sure it will be configurable."

## Decisions

These were left to us, and every one of them is a config change away from being different.

- Both lists start as **Super Admin, President, Bookkeeper, and Donor & Sponsor Relations**.
  - Bookkeeper: confirms donations, and the donor's name helps when matching a payment against the statement.
  - Donor & Sponsor Relations: thanks donors and looks after sponsor relationships.
- Positions on neither list lose the Donations page and its sidebar item. Campaign totals stay public on `/transparency`.
- "Donor details" means the donor's name, email, and message for the kids.
- The message is saved today but no page shows it. Showing it to detail viewers means an officer reads it before it's passed on.
- The lists are named `DONATION_LIST_VIEWERS` and `DONOR_DETAILS_VIEWERS`. The request suggested `isAllowedToSee…`. These names follow the file's existing style (`SINGLE_HOLDER_ROLES`, `APPROVAL_RULES`), and an `is…` name reads like a boolean.

## What exists today

- `donation:view` is in `BASE`, so every position can open `/admin/donations`, including Member. The page shows each donor's name and email.
- `submitDonation` saves the donor's `message`, but no page displays it.
- `can()` in `src/lib/rbac.ts` reads `ROLES[role].permissions`. The sidebar (`src/components/admin/admin-sidebar.tsx:34`) and the page both check access through `can()`.
- The donations page calls `requirePermission("donation:view")`, which throws. A position that's refused gets an error page, not a redirect.
- The permission matrix on the Members page only shows add, edit, and delete levels, so this change doesn't affect it.

## Design

### Config (`src/config/roles.ts`)

- Remove `"donation:view"` from `PERMISSIONS` and from `BASE`. `BASE` becomes `["admin:access"]`.
- Add the two lists and a map that turns them into permissions:

```ts
/** Who can open the Donations page. Anyone who confirms donations must be on it. */
export const DONATION_LIST_VIEWERS = ["superAdmin", "president", "bookkeeper", "donorSponsorRelations"] as const satisfies readonly Role[];

/** Who sees donors' names, emails, and messages. RA 10173: only positions that need it. */
export const DONOR_DETAILS_VIEWERS = ["superAdmin", "president", "bookkeeper", "donorSponsorRelations"] as const satisfies readonly Role[];

/** Permissions granted by a list of positions, not by each position's own permissions. */
export const LISTED_PERMISSIONS = {
  "donation:view": DONATION_LIST_VIEWERS,
  "donation:view:donor": DONOR_DETAILS_VIEWERS,
} as const satisfies Record<string, readonly Role[]>;
```

- Each permission comes from exactly one place. A listed permission can't appear in a position's `permissions` array.

### Types (`src/types/rbac.ts`)

- `RolePermission = (typeof PERMISSIONS)[number]`: granted per position.
- `ListedPermission = keyof typeof LISTED_PERMISSIONS`: granted by list.
- `Permission = RolePermission | ListedPermission`. Existing calls to `can()` and `requirePermission()` compile unchanged.
- `RoleConfig.permissions` becomes `readonly RolePermission[]`, so putting a listed permission there is a type error.

### Permission check (`src/lib/rbac.ts`)

- New `isListedPermission(permission: Permission): permission is ListedPermission`.
- `can(role, permission)` answers from the list for a listed permission, and from the position's own permissions otherwise. An unknown role still gets `false`.
- No call site changes. Code keeps checking permissions, never position names (DEV-02).

### Hiding donor details (`src/lib/donations/donor-view.ts`)

The type goes in `src/types/donations.ts`:

```ts
export type DonorView =
  | { visibility: "hidden" }
  | { visibility: "shown"; name: string | null; email: string | null; message: string | null };
```

`name: null` means the donor gave anonymously.

- New `toDonorView(donation: Pick<Donation, "isAnonymous" | "donorName" | "donorEmail" | "message">, canSeeDonor: boolean): DonorView`.
- When `canSeeDonor` is false, it returns `{ visibility: "hidden" }` and carries nothing from the donor.
- When the donation is anonymous, `name` is `null` even if a name is stored.
- Add `export type Donation = typeof donations.$inferSelect;` to the type exports at the bottom of `src/db/schema.ts`.

### Donations page (`src/app/admin/donations/page.tsx`)

- Check access the way `src/app/admin/messages/page.tsx` does: `requireUser()`, then `redirect("/admin")` when `can(user.role, "donation:view")` is false. A Member with an old bookmark lands on the dashboard instead of an error page.
- Compute `canSeeDonor = can(user.role, "donation:view:donor")` and map each row through `toDonorView` before rendering.
- The Donor cell shows:
  - **Hidden**: the word "Hidden" in soft ink.
  - **Shown**: the name, or "Anonymous", with the email below it and then the message, when they exist.
- The page component becomes a `const` arrow function, because the project rules apply to code we edit.

### Docs (`docs/user-stories.md`)

- **DON-05:** positions in `DONATION_LIST_VIEWERS` see the donations list. Positions in `DONOR_DETAILS_VIEWERS` also see the donor's name, email, and message. Everyone else on the list sees "Hidden". Only positions with `donation:review` see the confirm and reject buttons.
- **MEM-08:** members see the dashboard and the members list. Donations are no longer on that list.

## Testing

Write each test before the code it covers.

- **RBAC (`src/lib/rbac.test.ts`):**
  - With the default lists, Super Admin, President, Bookkeeper, and Donor & Sponsor Relations have `donation:view` and `donation:view:donor`.
  - VP External, VP Internal, Communications, Creatives Team, Org Development, and Member have neither.
  - Every position with `donation:review` is in `DONATION_LIST_VIEWERS`.
  - Every position in `DONOR_DETAILS_VIEWERS` is also in `DONATION_LIST_VIEWERS`.
  - No position's `permissions` array contains a listed permission. This backs up the type rule at runtime.
  - The existing "gives the Super Admin every permission" test also covers the listed permissions.
  - An unknown role gets `false` for listed permissions.
- **`toDonorView` (`src/lib/donations/donor-view.test.ts`):**
  - Hidden: returns exactly `{ visibility: "hidden" }`, with no name, email, or message key.
  - Shown: returns the name, email, and message.
  - Anonymous: `name` is `null` even when a name is stored, while the email and message still show.
  - A missing email or message comes back as `null`.
- **Manual check in the running app:**
  - As a Member: no Donations item in the sidebar, and `/admin/donations` redirects to `/admin`.
  - As the Bookkeeper: the list shows names, emails, messages, and the Confirm and Reject buttons.
  - Take `"bookkeeper"` out of `DONOR_DETAILS_VIEWERS`: the Bookkeeper sees "Hidden" and can still confirm. Then put it back.

## Interaction with planned work

The activity log plan (`docs/superpowers/plans/2026-10-03-activity-log.md`) also edits `src/config/roles.ts`. It adds `audit:view` to `BASE`, and builds the President's permissions from `PERMISSIONS` minus `audit:manage`. Both changes still work after this one, because `PERMISSIONS` keeps every position-granted permission. Whichever change lands second rebases onto the other.

## Out of scope

- Moving any other permission to a list.
- Showing donor messages on the public site, or passing them on to the children.
- Changing who can confirm or reject donations.
- Campaign management and email notifications, which are projects 2 and 3.
