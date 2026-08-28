"use client";

/**
 * Making a staged diagram develop instead of snap.
 *
 * An audit of all 144 explainers found 617 scene transitions, and 80% of them
 * already change the picture — they just do it instantly. 60% flip a boolean so
 * an element pops into existence with no entrance and no emphasis; 20% move a
 * number so the wing teleports from 4 degrees to 12. Progressive reveal was
 * there; motion was not. These two hooks add it without touching a single one
 * of the ~90 diagram components.
 *
 * Both respect prefers-reduced-motion, and both carry the same hidden-tab
 * backstop as useCountUp: requestAnimationFrame does not run in a background
 * tab, so anything driven purely by rAF would freeze mid-transition and never
 * arrive.
 */

import { useEffect, useRef, useState } from "react";

const reduced = () =>
  typeof window !== "undefined" &&
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

/* ------------------------------------------------------------------ */
/* Numeric props: move rather than jump                                */
/* ------------------------------------------------------------------ */

/**
 * Interpolates the numeric entries of a prop set when `scene` changes.
 *
 * Non-numeric props switch immediately: a boolean is a reveal, and holding it
 * back until the tween finishes would delay the very thing the scene is about.
 * Only keys that are numbers on BOTH sides are eased — a prop going from
 * undefined to 12 is a reveal too, not a movement from zero.
 */
export function useTweenedProps(
  target: Record<string, unknown>,
  scene: number,
  ms = 620,
): Record<string, unknown> {
  const [shown, setShown] = useState(target);
  // The values actually on screen, so an interrupted tween resumes from where
  // it stopped rather than snapping back to the previous scene's values.
  const live = useRef(target);
  live.current = shown;
  const targetRef = useRef(target);
  targetRef.current = target;

  useEffect(() => {
    const to = targetRef.current;
    const from = live.current;

    if (reduced()) {
      setShown(to);
      return;
    }

    const keys = Object.keys(to).filter(
      (k) => typeof to[k] === "number" && typeof from[k] === "number" && from[k] !== to[k],
    );
    if (!keys.length) {
      setShown(to);
      return;
    }

    let raf = 0;
    let start: number | null = null;
    const step = (t: number) => {
      start ??= t;
      const p = Math.min(1, (t - start) / ms);
      const eased = 1 - Math.pow(1 - p, 4);
      const next: Record<string, unknown> = { ...to };
      for (const k of keys) {
        const a = from[k] as number;
        const b = to[k] as number;
        next[k] = a + (b - a) * eased;
      }
      setShown(next);
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    const settle = setTimeout(() => setShown(to), ms + 150);

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(settle);
    };
    // Driven by the scene, not by the prop object, which is rebuilt every
    // render — hence the refs for the target and the live values.
  }, [scene, ms]);

  return shown;
}

/* ------------------------------------------------------------------ */
/* Reveals: entrance and emphasis                                      */
/* ------------------------------------------------------------------ */

/** Never animate the plumbing — markers and gradients are not the picture. */
const isPlumbing = (el: Element) => !!el.closest("defs, marker, clipPath, mask, pattern");

/**
 * A signature of everything in a prop set that can reveal something.
 *
 * Numbers are excluded because they are tweened: including them would re-fire
 * the reveal on every animation frame. What is left — booleans, strings, the
 * shape of the data — is what makes elements appear and disappear.
 */
export function revealKey(props: Record<string, unknown>): string {
  const parts: string[] = [];
  for (const k of Object.keys(props).sort()) {
    if (typeof props[k] === "number") continue;
    parts.push(`${k}=${JSON.stringify(props[k])}`);
  }
  return parts.join("|");
}

/**
 * Finds the SVG elements that appeared in this scene and animates them in.
 *
 * Identity comes from a WeakSet of DOM nodes seen in previous scenes rather
 * than from any key or data attribute. React reuses the DOM node for an element
 * that persists across renders and creates a fresh one for `{show && <path/>}`
 * when `show` flips, so "node we have never seen" is exactly "thing this scene
 * revealed" — with no cooperation required from the ~90 diagram components.
 *
 * `key` must be derived from the props that were actually RENDERED, not from
 * the scene's target props. useTweenedProps sets its state inside an effect, so
 * the first commit of a new scene still holds the previous scene's picture —
 * keying on the scene number ran this against stale DOM, found nothing, and
 * then animated those nodes one scene late.
 *
 * The first pass is exempt: every node is new then, and animating the whole
 * drawing on arrival would be the noise this system exists to remove.
 */
export function useRevealEntrance(
  ref: React.RefObject<HTMLElement | null>,
  key: string,
): void {
  const seen = useRef<WeakSet<Element>>(new WeakSet());
  const primed = useRef(false);

  useEffect(() => {
    const svg = ref.current?.querySelector("svg");
    if (!svg) return;

    const all = Array.from(svg.querySelectorAll<SVGElement>("*"));
    const fresh: SVGElement[] = [];
    for (const el of all) {
      if (!seen.current.has(el)) {
        seen.current.add(el);
        if (!isPlumbing(el)) fresh.push(el);
      }
    }

    // Record the opening scene without animating it.
    if (!primed.current) {
      primed.current = true;
      return;
    }
    if (reduced() || !fresh.length) return;

    /*
     * A whole revealed group arrives as parent + children, and animating both
     * double-fades the children. Keep only the outermost new nodes.
     */
    const outermost = fresh.filter((el) => !fresh.some((other) => other !== el && other.contains(el)));

    const timers: number[] = [];
    outermost.forEach((el, i) => {
      // Staggered, but capped: a 40-element reveal must not take four seconds.
      const delay = Math.min(i * 22, 300);
      el.style.animationDelay = `${delay}ms`;
      el.classList.add("wb-enter");
      timers.push(
        window.setTimeout(() => {
          el.classList.remove("wb-enter");
          el.style.animationDelay = "";
        }, delay + 700),
      );
    });

    /*
     * The established drawing steps back while the new thing arrives, which is
     * what gives the scene a "look here first".
     *
     * Only elements that contain nothing new recede — dimming an ancestor of a
     * revealed node would drag the reveal down with it, since opacity on a
     * parent multiplies through its children.
     */
    const settled = all.filter(
      (el) =>
        !isPlumbing(el) &&
        !fresh.includes(el) &&
        !fresh.some((f) => el.contains(f)),
    );
    for (const el of settled) el.classList.add("wb-recede");
    timers.push(
      window.setTimeout(() => {
        for (const el of settled) el.classList.remove("wb-recede");
      }, 1000),
    );

    return () => timers.forEach(clearTimeout);
  }, [ref, key]);
}
