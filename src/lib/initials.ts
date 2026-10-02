/** Up to two letters for an avatar: the first letter of the first two words, as written. */
export const initials = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map(([first = ""]) => first)
    .join("");
