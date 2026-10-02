export type Stat = { label: string; value: string };

/**
 * Figures in tiles. Two columns on phones; pass e.g. `md:grid-cols-4` to widen.
 * An odd last tile spans the row, so no empty cell shows.
 */
export const StatGrid = ({ stats, className = "" }: { stats: readonly Stat[]; className?: string }) => (
  <dl
    className={`grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line bg-line shadow-soft [&>*:last-child:nth-child(odd)]:col-span-2 ${className}`}
  >
    {stats.map(({ label, value }) => (
      <div key={label} className="bg-white p-5">
        <dt className="text-sm text-ink-soft">{label}</dt>
        <dd className="mt-1 font-display text-2xl font-semibold tabular-nums tracking-tight">{value}</dd>
      </div>
    ))}
  </dl>
);
