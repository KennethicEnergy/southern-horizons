const styles: Record<string, string> = {
  draft: "bg-sky text-ink-soft",
  in_review: "bg-sun-mist text-sun-ink ring-1 ring-inset ring-sun-deep",
  published: "bg-leaf-mist text-leaf",
  archived: "bg-sky text-ink-soft",
  pending: "bg-sun-mist text-sun-ink ring-1 ring-inset ring-sun-deep",
  confirmed: "bg-leaf-mist text-leaf",
  approved: "bg-leaf-mist text-leaf",
  rejected: "bg-danger-mist text-danger",
};

const labels: Record<string, string> = {
  draft: "Draft",
  in_review: "Awaiting approval",
  published: "Published",
  archived: "Archived",
  pending: "Pending",
  confirmed: "Confirmed",
  approved: "Approved",
  rejected: "Rejected",
};

/** `label` overrides the default text, e.g. "Delete pending". */
export const StatusBadge = ({ status, label }: { status: string; label?: string }) => (
  <span className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-0.5 text-sm font-medium ${styles[status] ?? "bg-sky"}`}>
    {label ?? labels[status] ?? status}
  </span>
);
