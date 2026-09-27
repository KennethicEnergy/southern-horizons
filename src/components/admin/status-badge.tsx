const styles: Record<string, string> = {
  draft: "bg-sky text-ink-soft",
  in_review: "bg-marigold-mist text-marigold-deep",
  published: "bg-leaf-mist text-leaf",
  archived: "bg-sky text-ink-soft",
  pending: "bg-marigold-mist text-marigold-deep",
  confirmed: "bg-leaf-mist text-leaf",
  rejected: "bg-danger-mist text-danger",
};

const labels: Record<string, string> = {
  draft: "Draft",
  in_review: "In review",
  published: "Published",
  archived: "Archived",
  pending: "Pending",
  confirmed: "Confirmed",
  rejected: "Rejected",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-sm font-medium ${styles[status] ?? "bg-sky"}`}>
      {labels[status] ?? status}
    </span>
  );
}
