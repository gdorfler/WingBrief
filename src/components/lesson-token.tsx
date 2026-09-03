"use client";

/**
 * A lesson's badge token.
 *
 * Three layers, which is what stops it reading as a flat sticker dropped on
 * the sky: a glow that belongs to the background, a rim that catches light
 * from the top-left, and a face with an inner highlight and an inner
 * occlusion at the bottom. The face is a state colour over a dark base, so it
 * belongs to the night the path runs through rather than sitting on it as a
 * white cutout, and it casts a soft shadow down onto the path itself.
 *
 * Every state gets its own treatment rather than a colour swap, because
 * "locked" and "needs review" are different kinds of information: one is
 * absence, the other is a warning.
 */

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import { Check, Lock, Play, Star, TriangleAlert } from "lucide-react";

import type { LessonNodeState } from "@/lib/review";
import { LessonIcon } from "./lesson-icon";
import { WingGlyph } from "./route-marker";
import { cn } from "./ui";

interface TokenLook {
  /** Inner surface: a state colour mixed into a dark base. See below. */
  face: string;
  /** Rim colour at the light-catching top-left. */
  rimLight: string;
  /** Rim colour in shade. */
  rimDark: string;
  icon: string;
  /** Ambient halo behind the token, or null for none. */
  glow: string | null;
  /** True only for the one lesson to open next. */
  pulse?: boolean;
  badge: { bg: string; fg: string; glyph: ReactNode } | null;
  /** A full ring outside the token — a warning reads as a ring, not a tint. */
  ring: string | null;
  /** Locked art is drained of colour as well as dimmed. */
  drain?: boolean;
}

const GO = "var(--color-go)";
const GOLD = "var(--color-gold)";
const CAUTION = "var(--color-caution)";

/*
 * Faces are a state colour mixed into a DARK base, not into `transparent`.
 *
 * Mixing with transparent let the sky through, which sounds like the right
 * way to bed a token into the scene but is not: over the warm Engines night
 * the green and gold faces turned to mud and the icons stopped reading. A
 * dark base gives the same "belongs to the night" result, keeps every state
 * identical on all five course themes, and leaves enough contrast under the
 * icon to actually see it. The bedding-in is done by the rim, the glow and
 * the shadow instead — which is where it belongs anyway.
 */
const INK = "#0e141d";
const INK_WARM = "#141009";

const LOOKS: Record<LessonNodeState, TokenLook> = {
  locked: {
    face: "linear-gradient(158deg, #2a3240 0%, #191f29 100%)",
    rimLight: "rgba(255,255,255,0.22)",
    rimDark: "rgba(255,255,255,0.06)",
    icon: "rgba(255,255,255,0.42)",
    glow: null,
    badge: {
      bg: "rgba(255,255,255,0.18)",
      fg: "rgba(255,255,255,0.66)",
      glyph: <Lock size={10} strokeWidth={3} />,
    },
    ring: null,
    drain: true,
  },
  current: {
    face: `linear-gradient(158deg, color-mix(in srgb, var(--color-brand) 90%, white) 0%, var(--color-brand-dark) 100%)`,
    rimLight: "rgba(255,255,255,0.7)",
    rimDark: "rgba(255,255,255,0.12)",
    icon: "#ffffff",
    glow: "var(--color-brand)",
    pulse: true,
    badge: { bg: "#ffffff", fg: "var(--color-brand)", glyph: <Play size={10} fill="currentColor" /> },
    ring: null,
  },
  completed: {
    face: `linear-gradient(158deg, color-mix(in srgb, ${GO} 42%, ${INK}) 0%, color-mix(in srgb, ${GO} 18%, ${INK}) 100%)`,
    rimLight: `color-mix(in srgb, ${GO} 40%, white)`,
    rimDark: `color-mix(in srgb, ${GO} 62%, ${INK})`,
    icon: `color-mix(in srgb, ${GO} 18%, white)`,
    glow: null,
    badge: { bg: GO, fg: "#ffffff", glyph: <Check size={11} strokeWidth={3.5} /> },
    ring: null,
  },
  perfect: {
    /* Flawless first try. Green face, but the reward is gold. */
    face: `linear-gradient(158deg, color-mix(in srgb, ${GO} 68%, ${INK}) 0%, color-mix(in srgb, ${GO} 34%, ${INK}) 100%)`,
    rimLight: `color-mix(in srgb, ${GOLD} 42%, white)`,
    rimDark: `color-mix(in srgb, ${GOLD} 58%, ${INK})`,
    icon: "#ffffff",
    glow: GOLD,
    badge: { bg: GOLD, fg: "#ffffff", glyph: <Star size={10} fill="currentColor" strokeWidth={0} /> },
    ring: null,
  },
  mastered: {
    /* Earned over time rather than in one pass: gold face, wing stamp. */
    face: `linear-gradient(158deg, color-mix(in srgb, ${GOLD} 54%, ${INK_WARM}) 0%, color-mix(in srgb, ${GOLD} 22%, ${INK_WARM}) 100%)`,
    rimLight: `color-mix(in srgb, ${GOLD} 34%, white)`,
    rimDark: `color-mix(in srgb, ${GOLD} 58%, ${INK_WARM})`,
    icon: `color-mix(in srgb, ${GOLD} 14%, white)`,
    glow: GOLD,
    badge: { bg: GOLD, fg: "#ffffff", glyph: <WingGlyph className="h-[11px] w-[11px]" /> },
    ring: null,
  },
  weak: {
    face: `linear-gradient(158deg, color-mix(in srgb, ${CAUTION} 44%, ${INK_WARM}) 0%, color-mix(in srgb, ${CAUTION} 18%, ${INK_WARM}) 100%)`,
    rimLight: `color-mix(in srgb, ${CAUTION} 36%, white)`,
    rimDark: `color-mix(in srgb, ${CAUTION} 60%, ${INK_WARM})`,
    icon: `color-mix(in srgb, ${CAUTION} 12%, white)`,
    glow: null,
    badge: {
      bg: CAUTION,
      fg: "#ffffff",
      glyph: <TriangleAlert size={10} strokeWidth={3} />,
    },
    ring: CAUTION,
  },
};

export function LessonToken({
  state,
  icon,
  size,
  /** Plays the one-shot sparkle: this lesson was just finished. */
  celebrate = false,
  className,
}: {
  state: LessonNodeState;
  icon: string;
  size: number;
  celebrate?: boolean;
  className?: string;
}) {
  const look = LOOKS[state];
  const reduceMotion = useReducedMotion();
  const radius = Math.round(size * 0.29);

  return (
    <span
      className={cn("relative inline-flex shrink-0 items-center justify-center", className)}
      style={{ width: size, height: size }}
    >
      {/* Ambient halo. Part of the sky rather than part of the token, which is
          what keeps the token from looking cut out of a different picture. */}
      {look.glow && (
        <motion.span
          className="pointer-events-none absolute -inset-2 rounded-full blur-xl"
          style={{ background: look.glow }}
          animate={
            reduceMotion
              ? { opacity: 0.24 }
              : look.pulse
                ? { opacity: [0.22, 0.46, 0.22], scale: [0.96, 1.06, 0.96] }
                : { opacity: 0.2 }
          }
          transition={
            look.pulse && !reduceMotion
              ? { duration: 2.8, repeat: Infinity, ease: "easeInOut" }
              : { duration: 0.4 }
          }
          aria-hidden
        />
      )}

      {/* A warning is a ring around the whole token, not a tint inside it. */}
      {look.ring && (
        <span
          className="pointer-events-none absolute -inset-[3px] rounded-[inherit]"
          style={{
            borderRadius: radius + 4,
            border: `2px solid color-mix(in srgb, ${look.ring} 70%, transparent)`,
          }}
          aria-hidden
        />
      )}

      {/* The rim: a gradient frame one pixel-and-a-bit wide, lit from the
          top-left so the token reads as a physical disc. */}
      <span
        className="relative flex h-full w-full items-center justify-center p-[2px]"
        style={{
          borderRadius: radius,
          background: `linear-gradient(158deg, ${look.rimLight} 0%, ${look.rimDark} 62%, ${look.rimLight} 100%)`,
          boxShadow: `0 10px 18px -8px rgba(0,0,0,0.55), 0 2px 4px -2px rgba(0,0,0,0.4)`,
        }}
      >
        <span
          className="flex h-full w-full items-center justify-center"
          style={{
            borderRadius: radius - 2,
            background: look.face,
            // Highlight along the top edge, occlusion along the bottom: the
            // face is dished rather than flat.
            boxShadow: `inset 0 1px 0 0 rgba(255,255,255,0.4), inset 0 -10px 16px -10px rgba(0,0,0,0.55)`,
          }}
        >
          <LessonIcon
            name={icon}
            className="h-[54%] w-[54%]"
            style={{
              color: look.icon,
              // The icon sits above the face, so it casts onto it.
              filter: look.drain
                ? "grayscale(1) drop-shadow(0 1px 1px rgba(0,0,0,0.35))"
                : "drop-shadow(0 1.5px 2px rgba(0,0,0,0.4))",
            }}
          />
        </span>
      </span>

      {look.badge && (
        <span
          className="absolute -bottom-1 -right-1 flex h-[22px] w-[22px] items-center justify-center rounded-full"
          style={{
            background: look.badge.bg,
            color: look.badge.fg,
            boxShadow: "0 2px 5px -1px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.35)",
          }}
        >
          {look.badge.glyph}
        </span>
      )}

      {/* One-shot sparkle on the lesson just finished. Four motes, thrown
          outward and gone — a moment, not an effect that stays on screen. */}
      {celebrate && !reduceMotion && (
        <span className="pointer-events-none absolute inset-0" aria-hidden>
          {[
            [-14, -10],
            [16, -14],
            [18, 12],
            [-12, 16],
          ].map(([dx, dy], i) => (
            <motion.span
              key={i}
              className="absolute left-1/2 top-1/2 h-1.5 w-1.5 rounded-full"
              style={{ background: GOLD }}
              initial={{ opacity: 0, x: 0, y: 0, scale: 0.4 }}
              animate={{ opacity: [0, 1, 0], x: dx, y: dy, scale: [0.4, 1.1, 0.5] }}
              transition={{ duration: 0.9, delay: 0.05 * i, ease: "easeOut" }}
            />
          ))}
        </span>
      )}
    </span>
  );
}
