import type { Metadata } from "next";
import { PageHeader } from "@/components/site/page-header";
import { StatGrid } from "@/components/site/stat-grid";
import { Icon } from "@/components/ui/icon";
import { TextLink } from "@/components/ui/text-link";
import { getTransparencyReport } from "@/lib/queries";
import { formatPeso } from "@/lib/money";
import { formatDate } from "@/lib/dates";
import { actionIcons } from "@/config/icons";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Transparency",
  description: "Every confirmed donation and every expense, with receipts.",
};

const TransparencyPage = async () => {
  const report = await getTransparencyReport();

  return (
    <>
      <PageHeader
        eyebrow="Transparency"
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
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <h2 id={`c-${campaign.id}`} className="text-3xl font-semibold">
                  {campaign.title}
                </h2>
                <TextLink href={`/campaigns/${campaign.slug}`}>Campaign page</TextLink>
              </div>

              <StatGrid
                className="mt-8 md:grid-cols-4"
                stats={[
                  { label: "Received", value: formatPeso(received) },
                  { label: "Spent", value: formatPeso(spent) },
                  { label: balance >= 0 ? "Balance on hand" : "Shortfall", value: formatPeso(Math.abs(balance)) },
                  { label: "Confirmed donations", value: donors.toLocaleString("en-PH") },
                ]}
              />

              {entries.length > 0 ? (
                <div className="mt-8 overflow-x-auto rounded-2xl ring-1 ring-line">
                  <table className="w-full min-w-[36rem] text-left text-[0.95rem]">
                    <caption className="sr-only">Ledger for {campaign.title}</caption>
                    <thead className="bg-sky text-sm text-ink-soft">
                      <tr>
                        <th scope="col" className="px-4 py-3 font-medium">Date</th>
                        <th scope="col" className="px-4 py-3 font-medium">Description</th>
                        <th scope="col" className="px-4 py-3 text-right font-medium">Amount</th>
                        <th scope="col" className="px-4 py-3 font-medium">Receipt</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-line">
                      {entries.map(({ id, occurredAt, description, kind, amount, receipt }) => (
                        <tr key={id} className="transition-colors hover:bg-sky/50">
                          <td className="whitespace-nowrap px-4 py-3 text-ink-soft">{formatDate(occurredAt)}</td>
                          <td className="px-4 py-3">{description}</td>
                          <td className={`px-4 py-3 text-right tabular-nums ${kind === "income" ? "text-leaf" : ""}`}>
                            {kind === "income" ? "+" : "−"}
                            {formatPeso(amount)}
                          </td>
                          <td className="px-4 py-3">
                            {receipt ? (
                              <a
                                href={receipt.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 font-medium text-sea hover:text-sea-deep"
                              >
                                <Icon icon={actionIcons.ledger} size={16} />
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
};

export default TransparencyPage;
