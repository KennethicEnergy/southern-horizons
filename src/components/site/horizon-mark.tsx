/** Logo mark: a sun half-risen over a horizon line. */
export function HorizonMark({ className = "size-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <path d="M6 22a10 10 0 0 1 20 0Z" fill="var(--color-marigold)" />
      <rect x="2" y="22" width="28" height="2.5" rx="1.25" fill="currentColor" />
      <rect x="9" y="27" width="14" height="2" rx="1" fill="currentColor" opacity="0.35" />
    </svg>
  );
}
