/** Status filter pills on backoffice lists. The active one inverts the text and page colours, so it reads in either theme. */
export const filterChipClass = (active: boolean) =>
  `rounded-full px-3.5 py-1.5 text-sm transition-colors ${active ? "bg-fg text-canvas" : "bg-surface text-fg-soft hover:text-fg"}`;
