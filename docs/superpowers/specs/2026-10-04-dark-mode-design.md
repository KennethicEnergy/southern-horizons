# Dark mode: follow the device, or choose Light or Dark

Date: 2026-10-04

## Intent

Let people read the site and work in the backoffice in dark mode. By default it follows the device setting. A switcher lets anyone pick Light or Dark instead, and that choice is remembered in their browser. Nothing is tied to an account, so it works the same for public visitors and signed-in members.

## What was asked

- Dark mode, without binding the preference to a user.
- The recommended approach: follow the device setting, plus a switcher whose choice is saved in a cookie.
- Role tokens, so components describe what a colour is for rather than which brand colour it is.
- A Light / Dark / Match device switcher in the footer and the backoffice sidebar.

## Assumptions (correct these if wrong)

- Covers the public site, the backoffice, the login page, the 404 page, and `/components`.
- Generated share images (Open Graph cards) stay light. They're images, not pages, and look the same everywhere they're shared.
- With JavaScript turned off, the site shows the light theme. Showing dark there too would mean repeating every dark colour inside a media query.
- The browser's toolbar colour follows the device setting only. A manual choice on the site doesn't change it.
- The palette below is the starting point. It's checked in the browser and on `/components` in both themes before anything ships.

## What exists today

- `src/app/globals.css` defines brand-named tokens in `@theme`: `ink`, `ink-soft`, `sea`, `sea-deep`, `sea-mist`, `sky`, `sun`, `sun-deep`, `sun-ink`, `sun-mist`, `mint`, `leaf`, `leaf-mist`, `danger`, `danger-mist`, and `line`.
- Components use most of these for roles, not for the brand colour itself: `text-ink` means body text (153 uses), `bg-white` means a surface (59 uses in 34 files), `bg-sky` means a quiet panel (44), the `line` tokens mean borders (59), and `text-sea` usually means a link (48).
- Some places really do need the fixed brand colour: the footer (`bg-ink`), ink text on sun yellow (the Donate button, the `highlight-sun` marker, the sun discs in `StepList`), and white text on sea or the tide gradient.
- The root layout renders `<body className="bg-white">`, and `html` has `background: #ffffff` in the base layer. `viewport.themeColor` is ink.
- The public pages are cached and revalidated every 5 minutes. Reading a cookie on the server would make every page render per request, so the server doesn't read it.

## Design

### 1. Colour tokens (`src/app/globals.css`)

**Brand colours stay fixed** in both themes: `ink`, `sea`, `sun`, `mint`, and their `-deep` variants. They're for brand art and for the places listed above.

**Role colours change with the theme.** They're declared in `@theme inline` as references, for example `--color-canvas: var(--canvas)`, so `bg-canvas` and opacity modifiers like `bg-surface/85` work. Their values are set on `:root` for light and on `:root[data-theme="dark"]` for dark.

| Role | Used for | Light | Dark |
| --- | --- | --- | --- |
| `canvas` | Page background | `#ffffff` | `#01161f` |
| `surface` | Cards, header, form fields, toasts | `#ffffff` | `#052433` |
| `panel` | Quiet panels; replaces `sky` | `#eff7f8` | `#0a3142` |
| `fg` | Body text | `#023d54` | `#e4f2f5` |
| `fg-soft` | Secondary text; replaces `ink-soft` | `#4a6671` | `#9dbcc6` |
| `line` | Borders and dividers | `#d3e1e5` | `#1a4a5c` |
| `accent` | Links and accent text | `#0c6980` | `#6fcde0` |
| `deep` | Footer and other always-dark grounds | `#023d54` | `#000f16` |
| `on-sun` | Text on sun yellow | `#023d54` | `#023d54` |

- **Tinted panels:** the mist tokens and the text colours used on them keep their names but get dark values:

  | Tint | Panel (light → dark) | Text on it (light → dark) |
  | --- | --- | --- |
  | Info | `sea-mist` `#d4eaef` → `#0d3b4c` | `sea-deep` `#023d54` → `#bfe6ef` |
  | Success | `leaf-mist` `#e1f6e7` → `#0e3a2a` | `leaf` `#1f7446` → `#7fd99a` |
  | Waiting | `sun-mist` `#fefed8` → `#3a3a10` | `sun-ink` `#5c5800` → `#f0ef7a` |
  | Error | `danger-mist` `#fbe4e2` → `#3d1513` | `danger` `#b3261e` → `#ff8a80` |

  Solid `danger` buttons keep the light value (`#b3261e`) as a fixed `danger-solid`, so white text on them stays readable.
- **Shadows:** `shadow-soft` and `shadow-lift` take their colour from a `--shadow-tint` variable: ink in light, near-black in dark.
- **Surfaces:**
  - `bg-horizon` is built from `panel` and `canvas`, with fainter glows in dark.
  - `bg-tide` stays as it is, because it's already a dark ground.
  - In dark, `highlight-sun` becomes a sun-yellow underline, so light text stays readable.
- **Native controls:** `color-scheme: light` or `dark` on `:root`, so native selects, date pickers, and scrollbars match.
- **Rich text:** the typography plugin's `--tw-prose-*` variables are mapped to the role tokens, so article bodies, the campaign description, and the post editor switch without `prose-invert`.
- **Buttons:**
  - Primary (`bg-sea text-white`) stays the same in both themes: 6.5:1 contrast.
  - Give (`bg-sun text-on-sun`) stays the same.
  - Active filter chips invert to `bg-fg text-canvas`.

### 2. Choosing and remembering the theme

**Choice and storage**
- **Choice:** `light`, `dark`, or `system` (Match device), held in a `theme` cookie. No cookie means `system`. Picking Match device deletes the cookie. Cookie settings: `Path=/`, `Max-Age` one year, `SameSite=Lax`. It isn't `HttpOnly`, because the page reads it.
- **Before the first paint:** the root layout puts a small inline script in `<head>`. It reads the cookie, resolves `system` with `matchMedia("(prefers-color-scheme: dark)")`, and sets `data-theme="light"` or `"dark"` on `<html>`. While the choice is `system`, it also follows changes to the device setting live. `<html>` gets `suppressHydrationWarning`, because the script changes it before React hydrates.
- **Browser toolbar:** `viewport.themeColor` becomes two entries with `prefers-color-scheme` media queries: ink for light, `#01161f` for dark.

**Code, each piece with one job**

| Unit | File | Job |
| --- | --- | --- |
| Theme helpers | `src/lib/theme.ts` | `THEME_CHOICES`, `parseThemeChoice(cookieString)`, `resolveTheme(choice, prefersDark)`, `themeCookie(choice)` (the cookie string to write, or an expiring one for `system`), and `themeInitScript` (the inline script, built from the same constants) |
| Theme store | `src/stores/theme-store.ts` | Zustand store holding the current choice. `setChoice` writes the cookie, updates `data-theme`, and notifies every switcher on the page. |
| Hook | `src/hooks/useTheme.ts` | `{ choice, theme, setChoice }`. Subscribes to the device setting while `system` is chosen. It returns no choice during server rendering, so the switcher doesn't cause a hydration mismatch. |
| Switcher | `src/components/ui/theme-switcher.tsx` | Three icon buttons in a `radiogroup`: Sun03 for "Light", Moon02 for "Dark", Computer for "Match device". The selected one is filled, and each has a visible tooltip and an `aria-label`. |

The switcher appears in the site footer, under "Reach us"; in the backoffice sidebar, beside the avatar; and in the `/components` header.

### 3. Moving components to role tokens

**Renames across `src/`:**

| From | To |
| --- | --- |
| `text-ink` | `text-fg` |
| `text-ink-soft` | `text-fg-soft` |
| `bg-white` | `bg-surface`, or `bg-canvas` for the page body and `html` |
| `bg-sky` | `bg-panel` (also inside gradients) |
| `text-sea` on links | `text-accent` |
| `bg-ink` (footer) | `bg-deep` |
| `text-ink` on sun | `text-on-sun` |
| `bg-danger` on solid buttons | `bg-danger-solid` |

**What changes elsewhere**
- `StatusBadge`, `FormAlert`, toasts, and progress bars pick up the dark tints through the existing mist and text tokens.
- `/components` gets a ThemeSwitcher section. The colour-token section is regrouped into "Brand (fixed)" and "Roles (change with theme)", and each role swatch shows both its light and dark value.

**Unchanged:** the logo circles (`BrandOrbs`, `HorizonMark`), photos, the share-card images, and the brand-colour swatches.

## Testing

TDD for every new helper, store, and hook:

- **`lib/theme.ts`:** parsing (missing, unknown, and valid values); resolving `system` with the device set to light and to dark; the cookie string for each choice, including the expiring one for `system`; and `themeInitScript`, run in happy-dom with a cookie and with no cookie, setting the right `data-theme`.
- **`stores/theme-store.ts`:** `setChoice` writes the cookie, sets `data-theme`, and every subscriber sees the change.
- **`hooks/useTheme.ts`:** returns the stored choice and the resolved theme, and follows a device change while `system` is chosen.
- **Contrast** (`src/app/theme-contrast.test.ts`): reads the role values for both themes from `globals.css`, then checks each text-on-background pair (`fg`, `fg-soft`, and `accent` on `canvas`, `surface`, and `panel`, and each tint's text on its mist) against WCAG AA, 4.5:1.
- **Regression guard:** fails if any `.tsx` file in `src/` uses `bg-white`, `text-ink`, `text-ink-soft`, or `bg-sky` again.

Before claiming it's done:
- `pnpm lint`, `pnpm test`, and `pnpm build` all pass.
- Screenshots of home, news, a post, contact, `/components`, the backoffice dashboard, and the members list, in both themes, at 390px and 1280px wide. Checking those screenshots for low-contrast text, wrong surfaces, or anything still white in dark.
- The theme set to Dark, then the page reloaded, shows no light flash.

## Out of scope

- Saving the choice on the member's account.
- A dark version of the Open Graph share images.
- Dark mode with JavaScript turned off.
