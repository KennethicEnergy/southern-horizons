import type { Metadata } from "next";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { Invoice01Icon } from "@hugeicons/core-free-icons";
import { PageHeader } from "@/components/site/page-header";
import { getTransparencyReport } from "@/lib/queries";
import { formatPeso } from "@/lib/money";
import { formatDate } from "@/lib/dates";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Transparency",
  description: "Every confirmed donation and every expense, with receipts.",
};

export default async function TransparencyPage() {
  const report = await getTransparencyReport();

  return (
    <>
      <PageHeader
        title="Where the money goes"
        lead="Donations appear here after our treasurer matches them to our bank records. Expenses are posted with their receipts."
      />
      <div className="mx-auto max-w-6xl space-y-20 px-5 py-14">
        {report.length === 0 ? (
          <p className="text-ink-soft">Our first campaign report will appear here once donations start coming in.</p>
        ) : null}

        {report.map(({ campaign, received, spent, donors, entries }) => {
          const balance = received - spent;
          return (
            <section key={campaign.id} aria-labelledby={`c-${campaign.id}`}>
              <div className="flex flex-wrap items-end justify-between gap-4">
                <h2 id={`c-${campaign.id}`} className="text-3xl font-semibold">
                  {campaign.title}
                </h2>
                <Link href={`/campaigns/${campaign.slug}`} className="text-sea hover:underline">
                  Campaign page
                </Link>
              </div>

              <dl className="mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-line bg-line md:grid-cols-4">
                {[
                  { label: "Received", value: formatPeso(received) },
                  { label: "Spent", value: formatPeso(spent) },
                  { label: balance >= 0 ? "Balance on hand" : "Shortfall", value: formatPeso(Math.abs(balance)) },
                  { label: "Confirmed donations", value: donors.toLocaleString("en-PH") },
                ].map((s) => (
                  <div key={s.label} className="bg-white p-5">
                    <dt className="text-sm text-ink-soft">{s.label}</dt>
                    <dd className="mt-1 font-display text-2xl font-semibold tabular-nums">{s.value}</dd>
                  </div>
                ))}
              </dl>

              {entries.length > 0 ? (
                <div className="mt-8 overflow-x-auto">
                  <table className="w-full min-w-[36rem] text-left text-[0.95rem]">
                    <caption className="sr-only">Ledger for {campaign.title}</caption>
                    <thead className="border-b border-ink text-sm text-ink-soft">
                      <tr>
                        <th scope="col" className="py-3 pr-4 font-medium">Date</th>
                        <th scope="col" className="py-3 pr-4 font-medium">Description</th>
                        <th scope="col" className="py-3 pr-4 text-right font-medium">Amount</th>
                        <th scope="col" className="py-3 font-medium">Receipt</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-line">
                      {entries.map((e) => (
                        <tr key={e.id}>
                          <td className="whitespace-nowrap py-3 pr-4 text-ink-soft">{formatDate(e.occurredAt)}</td>
                          <td className="py-3 pr-4">{e.description}</td>
                          <td className={`py-3 pr-4 text-right tabular-nums ${e.kind === "income" ? "text-leaf" : ""}`}>
                            {e.kind === "income" ? "+" : "−"}
                            {formatPeso(e.amount)}
                          </td>
                          <td className="py-3">
                            {e.receipt ? (
                              <a href={e.receipt.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sea hover:underline">
                                <HugeiconsIcon icon={Invoice01Icon} size={16} />
                                View
                              </a>
                            ) : (
                              <span className="text-ink-soft">Pending</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="mt-6 text-ink-soft">No expenses posted for this campaign yet.</p>
              )}
            </section>
          );
        })}
      </div>
    </>
  );
}
