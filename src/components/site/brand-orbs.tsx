import { brandColors } from "@/config/brand";
import { parallaxStyle } from "@/lib/motion";

const { ink, sea, sun, mint } = brandColors;

/*
 * Circle positions copied from public/brand/logo-mark.svg. `shift` is the parallax drift in SVG units,
 * so it scales with the artwork: the big circles sink back slowly, the small ones float forward.
 */
const orbs = [
  { cx: 755, cy: 685, r: 315, fill: sun, shift: 36 },
  { cx: 957, cy: 515, r: 215, fill: mint, shift: 64 },
  { cx: 672, cy: 555, r: 260, fill: sea, shift: 18 },
  { cx: 910, cy: 780, r: 198, fill: ink, shift: 48 },
];

const satellites = [
  { cx: 830, cy: 221, r: 48, fill: sea, opacity: 0.85, shift: -110 },
  { cx: 1248, cy: 605, r: 50, fill: mint, opacity: 0.85, shift: -80 },
  { cx: 1199, cy: 766, r: 29, fill: sea, opacity: 0.75, shift: -140 },
  { cx: 295, cy: 637, r: 25, fill: sun, opacity: 1, shift: -100 },
  { cx: 493, cy: 921, r: 31, fill: ink, opacity: 0.85, shift: -60 },
];

/**
 * The logo's overlapping circles as a decorative backdrop. Each circle drifts at its own depth as the
 * block scrolls past (see .parallax in globals.css). Size and place it with `className`.
 */
export const BrandOrbs = ({ className = "" }: { className?: string }) => (
  <div aria-hidden="true" className={`parallax-scope pointer-events-none ${className}`}>
    <svg viewBox="240 150 1080 880" className="block h-auto w-full overflow-visible">
      <g fillOpacity={0.8}>
        {orbs.map(({ shift, ...circle }) => (
          <circle key={`${circle.cx}-${circle.cy}`} className="parallax" style={parallaxStyle(shift)} {...circle} />
        ))}
      </g>
      {satellites.map(({ shift, ...circle }) => (
        <circle key={`${circle.cx}-${circle.cy}`} className="parallax" style={parallaxStyle(shift)} {...circle} />
      ))}
    </svg>
  </div>
);
