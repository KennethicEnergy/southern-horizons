/**
 * Campaign progress drawn as the horizon filling in.
 * Same visual language as the logo and hero.
 */
export function ProgressHorizon({ given, goal, unit }: { given: number; goal: number; unit: string }) {
  const pct = goal > 0 ? Math.min(100, Math.round((given / goal) * 100)) : 0;
  return (
    <div>
      <div className="flex items-baseline justify-between gap-4">
        <p className="font-display text-3xl font-semibold tabular-nums tracking-tight">
          {given.toLocaleString("en-PH")}
          <span className="text-lg font-normal text-ink-soft"> of {goal.toLocaleString("en-PH")} {unit}</span>
        </p>
        <p className="text-sm tabular-nums text-ink-soft">{pct}%</p>
      </div>
      <div
        className="relative mt-3 h-2.5 overflow-hidden rounded-full bg-sea-mist"
        role="progressbar"
        aria-valuenow={given}
        aria-valuemin={0}
        aria-valuemax={goal}
        aria-label={`${given} of ${goal} ${unit} given`}
      >
        <div className="absolute inset-y-0 left-0 rounded-full bg-sea" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
