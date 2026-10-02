# Design refresh: logo palette, gentle motion, action icons, toasts

Date: 2026-10-03

## Intent

Make the public site feel warmer and more on-brand without getting busy, make actions recognisable at a glance on phones, and replace browser `alert()` popups with in-page toasts. The `/components` page should show the real shared components, including the new ones.

## What was asked

- Improve the design using the colors from the logo.
- Smoother feel, with parallax that isn't overwhelming.
- Mobile-first icons so actions are easy to understand.
- Update the component showcase and the shared components it displays.
- Toasts that pop in from the top centre, stack at most 3, and can be dismissed.

## Assumptions (correct these if wrong)

- Palette stays the logo's: `#023d54` ink, `#0c6980` sea, `#94dfa7` mint, `#fdfd68` sun, white. Sun is still a fill only, never text on white.
- Parallax and scroll reveals use CSS scroll-driven animations (`animation-timeline`). They run off the main thread, so they stay smooth on phones. Browsers without support, and anyone with "reduce motion" on, get a static page. Nothing is hidden when motion is off.
- Toasts are for short-lived feedback: successful saves and errors from buttons that have no form around them. Form validation errors stay inline beside the fields, because they need to persist while the person fixes them.
- Native `confirm()` and `prompt()` stay for now. Replacing them with a dialog is a separate change.
- The backoffice keeps its layout and picks up the new tokens, icons, and toasts.

## Design

### Tokens (`src/app/globals.css`)

- Keep the existing color tokens. Add `--shadow-soft` and `--shadow-lift`, tinted with ink, for cards and toasts, plus an `--ease-out-soft` curve shared by every transition.
- Add a `bg-horizon` utility: a sky-to-white wash with faint mint and sun glows, used by the hero and page headers.
- Turn on smooth anchor scrolling, but only when reduced motion is not requested.

### Motion

- `.parallax-scope` sets up a view timeline. `.parallax` children drift by `--parallax-shift` (a few dozen pixels at most) as the scope crosses the viewport. `parallaxStyle(shift)` in `src/lib/motion.ts` sets that variable.
- `.reveal` fades content up by 16px as it enters the viewport. It's for blocks shorter than the screen, which are fully opaque once fully in view.
- `.header-elevate` adds a soft shadow to the sticky header after the first 96px of scroll.
- All of it sits inside `@supports (animation-timeline: view())` and `prefers-reduced-motion: no-preference`.
- Ancestors of animated elements clip with `overflow-clip`, never `overflow-hidden`. `hidden` makes a scroll container, the timeline binds to it instead of the page, and the motion stops without any error.

### Shared components

| Component | Where | Purpose |
|---|---|---|
| `Icon` | `components/ui/icon.tsx` | Hugeicons wrapper: decorative by default, consistent stroke |
| `Button` / `ButtonLink` | `components/ui/button.tsx` | New `icon` and `iconEnd` props, plus a press state |
| `IconButton` | `components/ui/icon-button.tsx` | Icon-only action with a required accessible label |
| `TextLink` | `components/ui/text-link.tsx` | Inline link with a trailing arrow |
| `Toaster` | `components/ui/toaster.tsx` | Top-centre toast stack, mounted once in the root layout |
| `BrandOrbs` | `components/site/brand-orbs.tsx` | The logo's overlapping circles as a decorative, parallaxing backdrop |
| `SectionHeading` | `components/site/section-heading.tsx` | Eyebrow, title, and an optional link |
| `StepList` | `components/site/step-list.tsx` | Numbered steps (homepage and Join page, previously duplicated) |
| `StatGrid` | `components/site/stat-grid.tsx` | Figure tiles (homepage and Transparency) |
| `ContactList` | `components/site/contact-list.tsx` | Email, phone, and Facebook (footer and Contact page, previously duplicated) |

Action icons are named once in `src/config/icons.ts` (donate, volunteer, send, approve, reject, delete, and so on), so the same action always has the same icon. Nav entries in `src/config/site.ts` carry their own icon.

### Mobile

- The header keeps a compact Donate button visible on phones, next to the menu button. The menu opens with a short slide-down animation and lists icon-plus-label rows.
- Every primary action gets icon + label. Icon-only buttons appear only where space is tight, and they always have an `aria-label`.

### Toasts

- API: `toast.success(message)`, `toast.error(message)`, `toast.info(message)`, callable from any client component.
- The state lives in a Zustand store (`src/stores/toast-store.ts`). `enqueueToast` (in `src/lib/toast.ts`) puts the newest toast first and drops the oldest past 3.
- Placement: fixed at the top centre, below the safe area, above the sticky header. Width is `min(100% - 2rem, 26rem)`.
- Entry: pops down from the top with `@starting-style`. Exit: fades up, then the toast is removed.
- Dismissal: a close button on every toast, plus an auto-dismiss timer (5s; 8s for errors). The timer pauses while the toast is hovered or has focus (`useDismissTimer`, built on `createPausableTimer` in `src/lib/timer.ts`).
- Announced through one polite live region for every tone. A per-toast `role="alert"` inside that region would make screen readers announce errors twice.
- `toastResult(result, successMessage?)` reports a server action's outcome: its error message on failure, its message (or the fallback) on success. It returns whether the action succeeded, and TypeScript narrows the result type on that return.
- Replaces every `alert()` in the backoffice and the inline "Saved" or "Invited" notices. Form errors stay inline.

### Showcase (`/components`)

New sections: Icons (the action vocabulary), Button with icons, IconButton, TextLink, Toast (buttons that fire each tone, plus a burst that shows the cap of 3), BrandOrbs and motion, SectionHeading, StepList, StatGrid, and ContactList. The color token list gains the shadow tokens.

## Testing

TDD for every new helper, hook, and store:

- `lib/toast.ts`: ordering, the cap of 3, removal.
- `lib/timer.ts`: expiry, pause, and resume with the remaining time kept.
- `stores/toast-store.ts`: `toast.*` pushes with the right tone and duration, `dismiss` removes.
- `hooks/useDismissTimer.ts`: expires after the duration, waits while paused, cleans up on unmount.
- `hooks/useFieldState.ts`: the Formik field state shared by the form fields; errors show only once the field is touched.
- `stores/toast-store.ts` `toastResult`: error on failure, message or fallback on success, silent otherwise.
- `lib/motion.ts` and `lib/initials.ts`.
- Hook tests use `src/test/render-hook.ts`, a small renderer built on React's `act` and happy-dom, so no new test dependency is needed.

Checked in the real app (production build, headless Edge, 390px and 1280px): no sideways overflow on any public page; the hero circles shift as the page scrolls; a burst of 5 toasts leaves the newest 3; dismiss and auto-dismiss both work, and errors outlast successes; every reveal block reaches full opacity after scrolling; with reduced motion nothing is hidden; no console errors.

Before committing: `pnpm lint`, `pnpm test`, `pnpm build`.
