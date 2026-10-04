/**
 * What an officer may see about a donor. `hidden` carries nothing from the donor.
 * `name` is null when the donor gave anonymously or left no name.
 */
export type DonorView =
  | { visibility: "hidden" }
  | { visibility: "shown"; name: string | null; email: string | null; message: string | null };
