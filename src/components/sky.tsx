"use client";

/**
 * The night sky the gamified surfaces sit on.
 *
 * Hand-built rather than a bitmap: stars, cloud banks and a dashed flight arc
 * are cheap as SVG, re-tint themselves per course from --color-brand, and cost
 * nothing to ship. Positions are a fixed table, not random, so the sky does
 * not reshuffle on every render or differ between server and client.
 *
 * Purely decorative. Everything here is aria-hidden and pointer-events-none,
 * and the drift stops under prefers-reduced-motion.
 */

import { useReducedMotion } from "motion/react";
import { cn } from "./ui";

/** x%, y%, radius, base opacity. Hand-placed to avoid clumping. */
const STARS: [number, number, number, number][] = [
  [6, 14, 1.1, 0.75], [13, 33, 0.8, 0.5], [19, 8, 1.4, 0.9], [26, 22, 0.9, 0.6],
  [31, 45, 1.1, 0.45], [38, 11, 1.2, 0.8], [44, 29, 0.8, 0.55], [51, 6, 1.3, 0.85],
  [57, 19, 1.0, 0.6], [63, 38, 0.9, 0.4], [69, 9, 1.2, 0.75], [74, 25, 0.8, 0.5],
  [80, 15, 1.4, 0.9], [85, 34, 1.0, 0.55], [90, 7, 1.1, 0.7], [95, 27, 0.9, 0.5],
  [9, 52, 0.8, 0.35], [22, 60, 1.0, 0.4], [47, 52, 0.9, 0.38], [66, 57, 1.0, 0.42],
  [88, 50, 0.8, 0.36], [35, 66, 0.9, 0.3], [77, 63, 1.1, 0.34],
];

/*
 * cx%, cy%, rx%, ry%, opacity — soft banks that read as cloud tops.
 *
 * Centres sit just below the bottom edge so only the crowns show, but not so
 * far below that they vanish: at cy 104+ with ry 13 the whole bank fell
 * outside the viewBox and the hero rendered as plain gradient.
 */
const CLOUDS: [number, number, number, number, number][] = [
  [6, 94, 30, 16, 0.46],
  [31, 98, 34, 18, 0.36],
  [60, 93, 28, 15, 0.42],
  [89, 97, 32, 17, 0.34],
];

export function SkyBackdrop({
  className,
  /** Draws the dashed arc a plane would have left. */
  arc = true,
}: {
  className?: string;
  arc?: boolean;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <div className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)} aria-hidden>
      {/* Depth: a warm lift toward the horizon so the clouds have something to
          sit against, tinted by whichever course is active. */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(130% 90% at 50% 108%, color-mix(in srgb, var(--color-brand) 34%, transparent) 0%, transparent 64%),
            radial-gradient(90% 70% at 84% -12%, color-mix(in srgb, var(--color-brand) 18%, transparent) 0%, transparent 56%)
          `,
        }}
      />

      <svg className="absolute inset-0 h-full w-full" preserveAspectRatio="none" viewBox="0 0 100 100">
        <defs>
          <filter id="sky-cloud-blur" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="2.4" />
          </filter>
          <linearGradient id="sky-cloud-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#dce8f5" stopOpacity="0.55" />
          </linearGradient>
        </defs>

        {STARS.map(([x, y, r, o], i) => (
          <circle
            key={i}
            cx={x}
            cy={y}
            r={r * 0.32}
            fill="#ffffff"
            opacity={o}
            style={
              reduceMotion
                ? undefined
                : {
                    animation: `sky-twinkle ${3 + (i % 5) * 0.8}s ease-in-out ${(i % 7) * 0.4}s infinite`,
                  }
            }
          />
        ))}

        {arc && (
          <path
            d="M -4 62 C 18 40, 40 34, 58 44 C 74 53, 86 44, 104 22"
            fill="none"
            stroke="#ffffff"
            strokeOpacity="0.34"
            strokeWidth="0.5"
            strokeLinecap="round"
            strokeDasharray="2.2 2.4"
            vectorEffect="non-scaling-stroke"
          />
        )}

        <g filter="url(#sky-cloud-blur)">
          {CLOUDS.map(([cx, cy, rx, ry, o], i) => (
            <ellipse key={i} cx={cx} cy={cy} rx={rx} ry={ry} fill="url(#sky-cloud-fill)" opacity={o} />
          ))}
        </g>
      </svg>
    </div>
  );
}
