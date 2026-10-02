/**
 * Logo mark: four overlapping circles with a sun rising over the horizon.
 * Simplified from public/brand/logo-mark.svg so it stays legible at icon sizes;
 * keep in sync with src/app/icon.svg.
 */
export function HorizonMark({ className = "size-8", size }: { className?: string; size?: number }) {
  return (
    <svg viewBox="0 0 32 32" width={size} height={size} className={className} aria-hidden="true">
      <g fillOpacity="0.8">
        <circle cx="13.5" cy="18.5" r="9.5" fill="#fdfd68" />
        <circle cx="21" cy="12.5" r="7.5" fill="#94dfa7" />
        <circle cx="12" cy="12" r="9" fill="#0c6980" />
        <circle cx="20.5" cy="20.5" r="7.5" fill="#023d54" />
      </g>
      <g fill="none" stroke="#fff" strokeLinecap="round" strokeWidth="1.6">
        <path d="M11 17a5 5 0 0 1 10 0" />
        <path d="M16 10L16 7.5M11.05 12.05L9.28 10.28M20.95 12.05L22.72 10.28" strokeWidth="1.4" />
        <path d="M8.5 17.2H23.5M11 20.2H21" />
      </g>
    </svg>
  );
}
