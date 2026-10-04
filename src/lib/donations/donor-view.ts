import type { Donation } from "@/db/schema";
import type { DonorView } from "@/types/donations";

type DonorFields = Pick<Donation, "isAnonymous" | "donorName" | "donorEmail" | "message">;

const blankToNull = (text: string | null) => (text?.trim() ? text : null);

/** Strips the donor's details on the server for officers without `donation:view:donor`. */
export const toDonorView = ({ isAnonymous, donorName, donorEmail, message }: DonorFields, canSeeDonor: boolean): DonorView =>
  canSeeDonor
    ? {
        visibility: "shown",
        name: isAnonymous ? null : blankToNull(donorName),
        email: blankToNull(donorEmail),
        message: blankToNull(message),
      }
    : { visibility: "hidden" };
