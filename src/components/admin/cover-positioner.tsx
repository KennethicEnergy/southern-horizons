"use client";

import { useRef, useState } from "react";

const clamp = (n: number) => Math.round(Math.min(100, Math.max(0, n)));

/**
 * Drag the photo inside the banner frame to choose which part stays in view when it's cropped.
 * The point is saved as a percentage and used as CSS object-position on the post page (16:9)
 * and on cards (3:2), so both previews here match what visitors see.
 */
export function CoverPositioner({
  src,
  alt,
  x,
  y,
  onChange,
}: {
  src: string;
  alt: string;
  x: number;
  y: number;
  onChange: (x: number, y: number) => void;
}) {
  const frame = useRef<HTMLDivElement>(null);
  const drag = useRef<{ px: number; py: number; x: number; y: number } | null>(null);
  const [dragging, setDragging] = useState(false);
  const position = `${x}% ${y}%`;

  const onPointerDown = (e: React.PointerEvent) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { px: e.clientX, py: e.clientY, x, y };
    setDragging(true);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const start = drag.current;
    const box = frame.current?.getBoundingClientRect();
    if (!start || !box) return;
    // Dragging the photo right reveals more of its left side, so the focus point moves the other way.
    onChange(clamp(start.x - ((e.clientX - start.px) / box.width) * 100), clamp(start.y - ((e.clientY - start.py) / box.height) * 100));
  };
  const onPointerUp = () => {
    drag.current = null;
    setDragging(false);
  };
  const onKeyDown = (e: React.KeyboardEvent) => {
    const step = e.shiftKey ? 10 : 2;
    const moves: Record<string, [number, number]> = { ArrowLeft: [step, 0], ArrowRight: [-step, 0], ArrowUp: [0, step], ArrowDown: [0, -step] };
    const move = moves[e.key];
    if (!move) return;
    e.preventDefault();
    onChange(clamp(x + move[0]), clamp(y + move[1]));
  };

  return (
    <div className="space-y-3">
      <div
        ref={frame}
        role="group"
        tabIndex={0}
        aria-label={`Cover framing, ${x}% from left and ${y}% from top. Drag the photo, or use the arrow keys, to choose what stays in view.`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onKeyDown={onKeyDown}
        className={`relative aspect-[16/9] touch-none select-none overflow-hidden rounded-lg bg-sky ring-sea focus-visible:ring-2 ${dragging ? "cursor-grabbing" : "cursor-grab"}`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- local preview; next/image adds nothing here */}
        <img src={src} alt={alt} draggable={false} className="pointer-events-none size-full object-cover" style={{ objectPosition: position }} />
        <span className="pointer-events-none absolute bottom-2 left-2 rounded-full bg-ink/70 px-2.5 py-1 text-xs font-medium text-white">
          {dragging ? "Release to keep this framing" : "Drag to reposition"}
        </span>
      </div>
      <div className="flex items-end gap-3">
        <div className="w-28 shrink-0">
          <div className="relative aspect-[3/2] overflow-hidden rounded-md bg-sky">
            {/* eslint-disable-next-line @next/next/no-img-element -- local preview */}
            <img src={src} alt="" draggable={false} className="size-full object-cover" style={{ objectPosition: position }} />
          </div>
          <p className="mt-1 text-xs text-ink-soft">On cards (3:2)</p>
        </div>
        <div className="min-w-0 flex-1 text-xs text-ink-soft">
          <p>Banner above is how it looks at the top of the post (16:9).</p>
          {x !== 50 || y !== 50 ? (
            <button type="button" onClick={() => onChange(50, 50)} className="mt-1 text-sea hover:underline">
              Reset to centre
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
