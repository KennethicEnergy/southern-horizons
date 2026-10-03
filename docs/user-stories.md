# User stories

What Southern Horizons does today and what it should do next, written as user stories with acceptance criteria. Use the **Built** section to check behaviour and write regression tests. Use the **Planned** section as the backlog.

Last reviewed: 2026-10-03.

## How to read this

Each story has an ID, a one-line story, and acceptance criteria ("done when"). IDs are stable, so reference them in commits and PRs, for example `[FEAT] : Add campaign editor (CAMP-01)`.

**Status**
- **Built**: in the code on `main` now.
- **Planned**: not built. Each planned story names its **source** (where the need comes from) and a **suggested priority** for the officers to confirm or change:
  - **P1**: before public launch
  - **P2**: soon after launch
  - **P3**: when there's time

**Sources** for planned stories
- *README*: listed under "Not built yet" in [README.md](../README.md).
- *TODO*: a `TODO` comment in the code.
- *Schema ready*: the table, column, or permission already exists, but nothing uses it yet.
- *Design spec*: deferred in a spec under `docs/superpowers/specs/`.
- *Proposed*: a suggestion, not yet agreed. Confirm with the officers before building.

## People

| Who | Description |
|---|---|
| **Visitor** | Anyone on the public site. Not signed in. |
| **Donor** | A visitor who gives to a campaign. |
| **Applicant** | A visitor who applies to join. |
| **Member** | Signed in with the *Member* position: can look around the backoffice but can't change content. |
| **Officer** | Signed in with a position that adds and edits content, with approval: VP External, VP Internal, Communications, Creatives Team, Org Development, Donor & Sponsor Relations, Bookkeeper. |
| **President** | Full access. Approves officers' changes, manages members, uploads SVGs. |
| **Bookkeeper** | Also confirms donations and (once built) keeps the ledger. |
| **Message reader** | VPs, Communications, and Donor & Sponsor Relations, who read contact messages. |
| **Developer** | Someone working on this codebase. |

What each position may do is set in [src/config/roles.ts](../src/config/roles.ts) and summarised in [README → Positions, permissions, and approvals](../README.md#positions-permissions-and-approvals).

---

# Built

## Public site (PUB)

**PUB-01 Browse news, events, and stories.** As a visitor, I want to browse what the group has posted, so that I can see what it's been doing.
- `/news` lists published posts, newest first, with filters for Everything, Events, News, and Stories.
- Long lists are paginated.
- Drafts, posts awaiting approval, and deleted posts never appear.

**PUB-02 Follow an event as a thread.** As a visitor, I want an event and its updates on one page, so that I can follow it from announcement to wrap-up.
- An event page shows its updates as a timeline.
- The event shows as upcoming, happening now, or past, computed from its start and end dates.

**PUB-03 See the highlights on the home page.** As a visitor, I want the home page to show the current campaign, recent posts, upcoming events, and totals, so that I get the picture at a glance.
- Shows the current campaign, "From the field" (latest posts), "Coming up" (upcoming events), and money received and spent.

**PUB-04 Open a post's attachments.** As a visitor, I want to open the files attached to a post, so that I can read the full report or see more photos.
- PDFs, DOCX files, videos, and extra images attached to a post are listed on it.

**PUB-05 Share a post with a good preview.** As a visitor, I want a shared link to show a proper preview card, so that friends know what they're clicking.
- Each post and the news index have their own Open Graph image.
- `sitemap.xml` and `robots.txt` are generated.

**PUB-06 Learn about the group.** As a visitor, I want About, FAQ, Privacy, and Terms pages, so that I know who the group is and how it handles my data.
- All four pages exist. Their content still needs review before launch (see [Launch tasks](#launch-tasks-that-arent-stories)).

**PUB-07 Contact the team.** As a visitor, I want to send the group a message, so that I can ask a question without needing a Facebook account.
- The contact form takes name, email, subject, and message, and saves the message for message readers.
- A hidden honeypot field catches simple bots. A bot that fills it in is told the message was sent, and nothing is saved.

## Donations and transparency (DON)

**DON-01 Give to a campaign.** As a donor, I want to pick what to give, pay with QR Ph, and report my payment, so that my gift is counted.
- On a campaign page, the donor picks a donation item (for example "₱250 = 1 Bag of Hope") and a quantity, pays with the campaign's QR code, and submits the reference number from their receipt.
- Name, email, and a message are optional. The donor can give anonymously.
- The server computes the amount from the item's price. The client never sends a total.
- Only active campaigns accept donations.
- The new donation is *pending* until the Bookkeeper confirms it.

**DON-02 Stop duplicate reports.** As the Bookkeeper, I want the same payment to be reported only once, so that totals aren't inflated.
- A reference number that's already pending or confirmed for that campaign is refused, with an error on the reference number field.

**DON-03 See campaign progress.** As a visitor, I want to see how close a campaign is to its goal, so that I know whether my gift is still needed.
- Progress counts confirmed donations only.

**DON-04 Confirm or reject donations.** As the Bookkeeper, I want to check each reported donation against the bank record, so that only real payments are counted.
- `/admin/donations` has To confirm, Confirmed, and Rejected tabs.
- The Bookkeeper confirms or rejects each pending donation. A rejection can carry a note that only officers see.
- A donation can be reviewed only once. If two people try at the same time, the second is told it was already reviewed.
- The decision is written to the audit log, and the public totals update right away.

**DON-05 See donations as an officer.** As any signed-in position, I want to see the donations list, so that I know how campaigns are doing.
- Every position can view donations. Only positions with `donation:review` (Bookkeeper and President) see the confirm and reject buttons.

**DON-06 See where the money goes.** As a visitor, I want a public ledger, so that I can trust the group with my money.
- `/transparency` shows, for each campaign: money received, money spent, balance on hand (or shortfall), and the number of confirmed donations.
- Each ledger entry shows its date, description, amount (income or expense), and a link to its receipt when there is one.

## Membership and sign-in (MEM)

**MEM-01 Apply to join.** As an applicant, I want to apply online, so that I don't need to know an officer personally.
- `/join` takes name, the Google email they'll sign in with, an optional phone number, and a message.
- The reply is the same whether or not the email already belongs to a member or a pending application, so the form can't be used to check who's a member.
- A honeypot field catches simple bots.

**MEM-02 Review applications.** As the President, I want to approve or reject applications, so that only people we trust get in.
- Pending applications show on the Members page, with a count badge in the sidebar and a dashboard card.
- Approving one creates the member with the chosen position. They can then sign in with Google.
- If the email is already a member, no duplicate account is created, and the President is told so.
- An application can be reviewed only once. Every decision is written to the audit log.

**MEM-03 Invite a member directly.** As the President, I want to invite someone by name, email, and position, so that I can add officers without them applying.
- Invited members have no password and sign in with Google only.

**MEM-04 Sign in.** As a member, I want to sign in with my Google account, so that I don't have another password to remember.
- Google sign-in works only for an email on the members list that is active and verified by Google. Anyone else is sent back to `/login` with a "not invited" message.
- Email and password sign-in works for accounts that have a password (such as the seeded President). It's also the way in on preview deployments, where Google sign-in doesn't work.
- `/admin` is closed to signed-out visitors. A session lasts up to 12 hours.

**MEM-05 Change someone's position.** As the President, I want to change a member's position, so that the site matches who holds which role.
- The change takes effect within 5 minutes, or straight away if that person signs out and back in.
- The change is written to the audit log.

**MEM-06 Remove someone's access.** As the President, I want to deactivate a member, so that someone who leaves can't sign in.
- The President is asked to confirm. The person is signed out within 5 minutes and can't sign in again.
- The change is written to the audit log.

**MEM-07 See what each position can do.** As the President, I want a table of positions and their permissions, so that I can pick the right one when inviting.
- The Members page shows a permission matrix. Other positions see a read-only members list.

**MEM-08 Look around as a member.** As a member, I want to sign in and see the dashboard, donations, and members list, so that I can follow what's going on.
- Members can't add, edit, or delete content, and the UI hides those controls.

## Publishing and approvals (POST)

**POST-01 Write a post.** As an officer, I want to write a news post, event, event update, or story, so that the public sees what we've done.
- The editor has rich text, a cover image with an adjustable focal point, and attachments.
- An event takes start and end dates and a location. An update is attached to the event it belongs to.

**POST-02 Keep drafts private.** As an officer, I want my drafts to stay private and save straight away, so that I can work on a post over several sittings.
- Saving a draft never needs approval.
- Officers see live posts and their own drafts. The President sees every draft.

**POST-03 Publish with approval.** As an officer, I want to send my post for approval, so that nothing goes public without a second look.
- **Publish** moves the post to *Awaiting approval* and locks it until someone decides.

**POST-04 Edit a live post with approval.** As an officer, I want to propose changes to a live post, so that I can fix it without taking it down.
- The proposed changes wait in Approvals. The live post stays as it is until they're approved.

**POST-05 Ask to delete a post.** As an officer whose position may delete, I want to ask for a post to be removed, so that outdated content comes down.
- Delete sends a delete request to Approvals. Positions without delete permission don't see the button.
- Deletes are soft: the post is hidden, not erased.

**POST-06 Approve or reject changes.** As the President (the default approver), I want to approve or reject each request, so that I stay in control of what's public.
- Approving applies the change.
- Rejecting requires a reason and changes nothing. A rejected new post goes back to drafts.
- Each request records who asked, in which position, who could approve, who decided, when, and why. Decisions are also written to the audit log.

**POST-07 Track my requests.** As an officer, I want to see the state of my requests, so that I know whether my post is live.
- The Approvals page lists "Your requests" and "Recently decided", including the reason for any rejection.
- The dashboard shows how many of my requests are still waiting.

**POST-08 Publish directly.** As the President, I want my changes to go live immediately, so that urgent updates aren't held up.
- The President's adds, edits, and deletes skip approval.

## Media (MED)

**MED-01 Upload photos, videos, and documents.** As an officer, I want to upload files for posts, so that posts can show more than text.
- Files go straight from the browser to storage, never through the web server.
- Limits: images 10 MB, SVG 512 KB, video 250 MB, PDF and DOCX 25 MB.
- A file counts as uploaded only after the server checks its real bytes against its declared type.

**MED-02 Strip location data from photos.** As an officer, I want photo metadata removed on upload, so that we never publish where a photo was taken.
- JPEG and PNG are converted to WebP in the browser before upload, which removes EXIF data such as GPS location.

**MED-03 Upload SVGs safely.** As the President, I want to upload SVG logos without risking a script attack.
- Only the President can upload SVGs. Any SVG that contains a script or an external link is rejected.

**MED-04 Browse the media library.** As an officer, I want to see everything that's been uploaded, so that I can reuse it.
- `/admin/media` shows every verified file that hasn't been deleted.

## Backoffice (OPS)

**OPS-01 See what needs my attention.** As any signed-in position, I want the dashboard to show my to-dos, so that I don't have to check every page.
- Cards appear only when they apply to my position: my drafts, my requests waiting, requests waiting for my approval, donations to confirm, member applications, and unread messages.

**OPS-02 Read and answer contact messages.** As a message reader, I want to read messages and reply, so that no question goes unanswered.
- `/admin/messages` lists messages. Each can be marked read or unread, and a reply button opens my email app with the subject filled in.
- The sidebar badge counts unread messages.

**OPS-03 Keep a shared to-do list (temporary).** As any signed-in position, I want to note ideas for the site, so that they don't get lost.
- `/admin/suggestions` lets anyone add, tick off, and delete suggestions. It's meant to be removed later (see [Launch tasks](#launch-tasks-that-arent-stories)).

**OPS-04 Use the backoffice on a phone.** As an officer, I want the backoffice to work on my phone, so that I can post from an event.
- On small screens, the header has a menu and a back button to the parent section.
- Tap targets are at least 44px tall. Results show as toasts at the top of the screen.

## Developers (DEV)

**DEV-01 See every shared component in one place.** As a developer, I want a live component catalogue, so that I reuse what exists instead of rebuilding it.
- `/components` shows the shared UI components in their states, including icons, buttons, form fields, and toasts.

**DEV-02 Reshape positions in one file.** As a developer, I want permissions defined in config, so that the officers can rename or regroup positions without code changes elsewhere.
- Code checks permissions through `src/lib/rbac.ts`, never position names. Changing `src/config/roles.ts` changes access everywhere.

---

# Planned

## Campaign management (CAMP)

Campaigns are created with `pnpm db:studio` today. The `campaign:manage` permission exists (President only).

**CAMP-01 Create and edit campaigns.** *README · P1.* As the President, I want to create and edit campaigns in the backoffice, so that I don't need database access to start a fundraiser.
- A form for title, slug, summary, rich-text content, cover image, QR Ph image and account name, start and end dates, and status (draft, active, closed).
- Draft campaigns aren't public. Only active campaigns accept donations (already enforced by DON-01).
- Closing a campaign stops new donations, but it stays on `/transparency`.
- Every change is written to the audit log.
- Only positions with `campaign:manage` see the screen, and the server checks the permission.

**CAMP-02 Manage donation items.** *README · P1.* As the President, I want to set the items donors choose from, so that each campaign asks for the right things.
- Add, edit, reorder, and remove items: name, description, price in pesos, goal quantity, contents (for example "6 notebooks"), and image.
- Prices are entered in pesos and stored in centavos.
- Changing a price never changes the amount of a donation already made.

**CAMP-03 Link a campaign to the event it funds.** *Schema ready · P2.* As a visitor, I want to see the event a campaign pays for, and give from the event page, so that I can see what my money does.
- The campaign form has an optional "Funds event" picker.
- The campaign page links to the event, and the event page shows the campaign's progress and a Donate button.

**CAMP-04 Send campaign changes for approval.** *Proposed · P3.* As the President, I want to let Donor & Sponsor Relations draft campaigns that I approve, so that I'm not the only one setting them up.
- Campaigns become an approval resource, using the same flow as posts (POST-03 to POST-06).
- Positions given `campaign:manage` that require approval send their changes to Approvals.

## Ledger (LED)

The `ledger_entries` table and `ledger:manage` permission (Bookkeeper and President) exist, but entries are added through the database today.

**LED-01 Record income and expenses.** *README · P1.* As the Bookkeeper, I want to record money in and money out with receipts, so that the transparency page stays current.
- A form for type (income or expense), description, amount in pesos, date, campaign (optional), and receipt upload.
- New entries appear on `/transparency` right away.
- Every entry is written to the audit log.

**LED-02 Correct a ledger entry.** *Proposed · P1.* As the Bookkeeper, I want to fix a wrong entry, so that the public figures are right.
- An entry can be edited or removed. Removal is a soft delete.
- The audit log keeps the old and new values.
- Open question: should corrections need the President's approval?

**LED-03 Record cash and in-kind donations.** *Schema ready · P2.* As the Bookkeeper, I want to record donations made in cash or in goods, so that every gift counts toward the campaign.
- The Bookkeeper can add a donation with channel *cash* or *in-kind*, against a campaign and item.
- These count toward progress and transparency the same way as confirmed QR Ph donations.
- Open question: how is an in-kind gift valued?

## Audit log (AUD)

**AUD-01 View the audit log.** *README · P2.* As the President, I want to see who changed what and when, so that I can answer questions about any change.
- A read-only screen for positions with `audit:view` (President only today).
- Each row shows who, what action, which item, when, and the recorded changes.
- Filter by type of item, person, and date range. Paginated, newest first.

## Spam and abuse protection (SEC)

**SEC-01 Block bots on public forms.** *README, TODO · P1.* As a message reader, I want bot submissions blocked, so that real messages aren't buried in spam.
- Cloudflare Turnstile on the contact, join, and donation forms.
- The server verifies the token before saving anything. A failed check shows a friendly error and keeps what the person typed.
- The forms still work for keyboard and screen-reader users.

**SEC-02 Limit repeated attempts.** *README · P1.* As the President, I want sign-in and form submissions rate-limited, so that no one can guess passwords or flood the inbox.
- `/login` and each public form refuse requests past a set number per IP address in a time window, with a "try again later" message.
- Sign-in errors never reveal whether an email has an account.

## Email notifications (NOTIF)

Nothing sends email today. The README and a TODO in `src/actions/contact.ts` suggest Resend.

**NOTIF-01 Tell the team about new messages.** *README, TODO · P1.* As a message reader, I want an email when someone uses the contact form, so that I reply within the promised two working days.
- A new contact message emails the group inbox (or every active message reader; to be decided).
- The email links to the message in the backoffice.
- If sending fails, the message is still saved.

**NOTIF-02 Tell applicants the outcome.** *README · P2.* As an applicant, I want an email when my application is decided, so that I know whether to sign in.
- Approval: the email says to sign in with Google using the address they applied with, and links to `/login`.
- Rejection: a short, polite email.

**NOTIF-03 Thank donors when their gift is confirmed.** *README · P2.* As a donor who left an email, I want a confirmation, so that I know my gift arrived.
- Sent when the Bookkeeper confirms the donation. It shows the amount, campaign, item, and reference number.
- Nothing is sent to donors who left no email.

**NOTIF-04 Tell officers about approval decisions.** *Proposed · P2.* As an officer, I want an email when my request is approved or rejected, so that I don't have to keep checking.
- Includes the post title, the decision, and the reason for a rejection.
- Approvers get a daily summary of waiting requests instead of one email per request.

## Online payments (PAY)

**PAY-01 Pay online.** *README · P3.* As a donor, I want to pay by card or e-wallet on the site, so that I don't have to scan a QR code and type a reference number.
- A gateway (PayMongo, Xendit, or Maya) creates the donation with channel *gateway* and its payment ID.
- The gateway's webhook confirms the donation. The webhook's signature is verified, and a repeated webhook never counts a donation twice.
- QR Ph stays available as an option.

## Media library (MED)

**MED-05 Manage files in the library.** *Proposed · P2.* As an officer, I want to edit a file's alt text and remove files we no longer need, so that images are accessible and the library stays tidy.
- Edit alt text from the library.
- Remove a file (soft delete). A file in use by a post or campaign shows where it's used, and removing it needs confirmation.
- Filter by type: image, video, document.

## Usability (UX)

**UX-01 Replace browser pop-ups with in-page dialogs.** *Design spec · P2.* As an officer, I want confirmations and short inputs in a proper dialog, so that they look like the rest of the app and work well on phones.
- Covers every `confirm()` and `prompt()` in the backoffice: reject application, delete post, reject donation (with note), deactivate member, add link in the editor, and delete suggestion.
- The dialog traps focus, closes with Escape, and returns focus to the button that opened it.

**UX-02 Archive old posts.** *Schema ready · P3.* As an officer, I want to archive a post, so that old content leaves the news list without breaking links.
- Archived posts disappear from `/news` and the home page, but their URLs still work.
- Open question: does archiving need approval, like editing a live post?

**UX-03 Set my own profile photo.** *Schema ready · P3.* As a member who signs in with a password, I want to upload a profile photo, so that I don't show up as initials.
- Upload an avatar from the backoffice. It replaces the initials, and a Google photo is used when there is no upload.

---

## Launch tasks that aren't stories

These come from [README → Before launch](../README.md#before-launch) and code TODOs. They're tasks, not features, so they aren't stories above.

- Write the real About page: story, officers, and photos (TODO in `src/app/(site)/about/page.tsx`).
- Have the officers review every FAQ answer (TODO in `src/app/(site)/faqs/page.tsx`).
- Have a lawyer review `/privacy` and `/terms` against RA 10173.
- Get written consent before publishing photos of children, and never pair their full names with their faces.
- Check whether public donations need a DSWD solicitation permit.
- Retire the temporary Suggestions list (OPS-03) once this file is the backlog. The removal steps are in the comment on `suggestions` in `src/db/schema.ts`.

## Open questions

Decisions the officers need to make before the related stories can be built:

1. **LED-02:** Do ledger corrections need the President's approval?
2. **LED-03:** How is an in-kind donation valued, and who decides?
3. **NOTIF-01:** Do contact emails go to one group inbox or to every message reader?
4. **CAMP-04:** Should anyone besides the President manage campaigns?
5. **UX-02:** Does archiving a post need approval?
