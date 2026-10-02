/**
 * Campaign progress drawn as the horizon filling in: sea into mint, with the sun at the leading edge.
 * Same visual language as the logo and hero.
 */
export const ProgressHorizon = ({ given, goal, unit }: { given: number; goal: number; unit: string }) => {
  const pct = goal > 0 ? Math.min(100, Math.round((given / goal) * 100)) : 0;
  return (
    <div>
      <div className="flex items-baseline justify-between gap-4">
        <p className="font-display text-3xl font-semibold tabular-nums tracking-tight">
          {given.toLocaleString("en-PH")}
          <span className="text-lg font-normal text-ink-soft"> of {goal.toLocaleString("en-PH")} {unit}</span>
        </p>
        <p className="text-sm font-medium tabular-nums text-sea">{pct}%</p>
      </div>
      <div
        className="relative mt-3 h-3 rounded-full bg-sea-mist"
        role="progressbar"
        aria-valuenow={given}
        aria-valuemin={0}
        aria-valuemax={goal}
        aria-label={`${given} of ${goal} ${unit} given`}
      >
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-linear-to-r from-sea to-mint transition-[width] duration-700 ease-out-soft"
          style={{ width: `${pct}%` }}
        />
        {pct > 0 ? (
          <span
            aria-hidden="true"
            className="absolute top-1/2 size-5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-sun shadow-soft ring-2 ring-white"
            style={{ left: `${pct}%` }}
          />
        ) : null}
      </div>
    </div>
  );
};
