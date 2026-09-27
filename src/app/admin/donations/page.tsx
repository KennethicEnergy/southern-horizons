import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { getDb, schema } from "@/db";
import { requirePermission } from "@/lib/session";
import { can } from "@/lib/rbac";
import { formatDateTime } from "@/lib/dates";
import { formatPeso } from "@/lib/money";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { StatusBadge } from "@/components/admin/status-badge";
import { DonationReviewButtons } from "@/components/admin/donation-review-buttons";

const tabs = [
  { value: "pending", label: "To confirm" },
  { value: "confirmed", label: "Confirmed" },
  { value: "rejected", label: "Rejected" },
] as const;

export default async function DonationsPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const user = await requirePermission("donation:view");
  const { status: raw } = await searchParams;
  const status = tabs.find((t) => t.value === raw)?.value ?? "pending";
  const canReview = can(user.role, "donation:review");

  const rows = await getDb().query.donations.findMany({
    where: eq(schema.donations.status, status),
    orderBy: [desc(schema.donations.createdAt)],
    limit: 200,
    with: { campaign: { columns: { title: true } }, item: { columns: { name: true } } },
  });

  return (
    <>
      <AdminPageHeader
        title="Donations"
        description="Match each reference number against the bank or e-wallet statement before confirming."
      />
      <nav aria-label="Filter donations" className="mb-4 flex gap-2">
        {tabs.map((t) => (
          <Link
            key={t.value}
            href={`/admin/donations?status=${t.value}`}
            aria-current={t.value === status ? "page" : undefined}
            className={`rounded-full px-3.5 py-1.5 text-sm ${t.value === status ? "bg-ink text-white" : "bg-white text-ink-soft hover:text-ink"}`}
          >
            {t.label}
          </Link>
        ))}
      </nav>

      {rows.length === 0 ? (
        <p className="rounded-xl bg-white p-8 text-ink-soft">
          {status === "pending" ? "All caught up. New donations appear here when donors send their reference number." : "Nothing here yet."}
        </p>
      ) : (
        <div className="overflow-x-auto rounded-xl bg-white">
          <table className="w-full min-w-[56rem] text-left text-[0.95rem]">
            <thead className="border-b border-line text-sm text-ink-soft">
              <tr>
                <th scope="col" className="px-5 py-3 font-medium">Received</th>
                <th scope="col" className="px-5 py-3 font-medium">Donor</th>
                <th scope="col" className="px-5 py-3 font-medium">Campaign</th>
                <th scope="col" className="px-5 py-3 text-right font-medium">Amount</th>
                <th scope="col" className="px-5 py-3 font-medium">Reference</th>
                <th scope="col" className="px-5 py-3 font-medium">Status</th>
                {canReview && status === "pending" ? <th scope="col" className="px-5 py-3"><span className="sr-only">Review</span></th> : null}
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {rows.map((d) => (
                <tr key={d.id}>
                  <td className="whitespace-nowrap px-5 py-3.5 text-ink-soft">{formatDateTime(d.createdAt)}</td>
                  <td className="px-5 py-3.5">
                    {d.isAnonymous ? <span className="text-ink-soft">Anonymous</span> : d.donorName}
                    {d.donorEmail ? <span className="block text-sm text-ink-soft">{d.donorEmail}</span> : null}
                  </td>
                  <td className="px-5 py-3.5">
                    {d.campaign.title}
                    <span className="block text-sm text-ink-soft">
                      {d.quantity} × {d.item?.name ?? "general"}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right font-medium tabular-nums">{formatPeso(d.amount)}</td>
                  <td className="px-5 py-3.5 font-mono text-sm">{d.referenceNumber}</td>
                  <td className="px-5 py-3.5">
                    <StatusBadge status={d.status} />
                  </td>
                  {canReview && status === "pending" ? (
                    <td className="px-5 py-3.5">
                      <DonationReviewButtons donationId={d.id} />
                    </td>
                  ) : null}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
