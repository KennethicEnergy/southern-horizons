import type { DonorView } from "@/types/donations";

/** The Donor column of the donations list. Officers without donor access see "Hidden". */
export const DonorCell = ({ donor }: { donor: DonorView }) => {
  if (donor.visibility === "hidden") return <span className="text-ink-soft">Hidden</span>;

  const { name, email, message } = donor;
  return (
    <>
      {name ?? <span className="text-ink-soft">Anonymous</span>}
      {email ? <span className="block text-sm text-ink-soft">{email}</span> : null}
      {message ? <span className="mt-1 block max-w-xs whitespace-pre-line text-sm text-ink-soft">“{message}”</span> : null}
    </>
  );
};
