"use client";

/**
 * Application shell.
 *
 * Desktop gets a persistent left rail with the readiness ring always visible.
 * Mobile gets a bottom bar. Immersive routes — the lesson player, an exam in
 * progress, a full-screen explainer — drop the chrome entirely so the student
 * is looking at one thing.
 */

import { useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Check,
  ClipboardCheck,
  Compass,
  FlaskConical,
  Home,
  Layers,
  Lightbulb,
  Repeat,
  RotateCcw,
  Sparkles,
  Target,
  User,
} from "lucide-react";

import { overallReadiness } from "@/lib/review";
import { liveStreak } from "@/lib/xp";
import { useProgress } from "@/lib/progress-store";
import { useCourse } from "@/lib/course";
import { ProgressRing, cn } from "./ui";
import { CourseSwitcher } from "./course-switcher";
import { StreakFlame } from "./reward";
import { StreakWeek } from "./streak-week";
import { claimsFor, evaluateClaims, summariseClaims } from "@/lib/claims";
import { AwardToasts } from "./awards";

interface NavItem {
  href: string;
  label: string;
  icon: typeof Home;
  exact?: boolean;
}

const NAV: NavItem[] = [
  { href: "/", label: "Home", icon: Home, exact: true },
  { href: "/lessons", label: "Lessons", icon: Layers },
  { href: "/review", label: "Review", icon: RotateCcw },
  { href: "/exam", label: "Exam", icon: ClipboardCheck },
];

/**
 * A problem-solving course needs different things in reach.
 *
 * Drills and the desk are where a Navigation student actually spends their
 * time, and putting them two taps away behind a secondary menu would be a
 * quiet statement that they are optional. Review moves to the secondary list
 * instead — it matters, but not five times a session.
 */
const DESK_NAV: NavItem[] = [
  { href: "/", label: "Home", icon: Home, exact: true },
  { href: "/lessons", label: "Route", icon: Layers },
  { href: "/drills", label: "Drills", icon: Repeat },
  { href: "/nav-desk", label: "Desk", icon: Compass },
  { href: "/exam", label: "Exam", icon: ClipboardCheck },
];

const SECONDARY: NavItem[] = [
  { href: "/explainers", label: "Explainers", icon: Sparkles },
  { href: "/click", label: "Make it click", icon: Lightbulb },
  { href: "/profile", label: "Profile", icon: User },
];

const DESK_SECONDARY: NavItem[] = [
  { href: "/missions", label: "Missions", icon: Target },
  { href: "/review", label: "Review", icon: RotateCcw },
  { href: "/lab", label: "", icon: FlaskConical },
  { href: "/explainers", label: "Explainers", icon: Sparkles },
  { href: "/click", label: "Make it click", icon: Lightbulb },
  { href: "/profile", label: "Profile", icon: User },
];

/** Which nav a course gets, keyed off the same flag that picks its home screen. */
function navFor(layout: "standard" | "desk" | undefined) {
  return layout === "desk"
    ? { primary: DESK_NAV, secondary: DESK_SECONDARY }
    : { primary: NAV, secondary: SECONDARY };
}

/** Routes that hide the shell so the student sees one thing at a time. */
function isImmersive(pathname: string): boolean {
  return (
    /^\/lessons\/[^/]+$/.test(pathname) ||
    /^\/explainers\/[^/]+$/.test(pathname) ||
    pathname.startsWith("/exam/run") ||
    /^\/review\/(weak|spaced|mistakes|saved)$/.test(pathname) ||
    /^\/drills\/[^/]+$/.test(pathname) ||
    /^\/missions\/[^/]+$/.test(pathname)
  );
}

function useActive(href: string, exact?: boolean) {
  const pathname = usePathname();
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavItem({
  href,
  label,
  icon: Icon,
  exact,
  compact = false,
}: {
  href: string;
  label: string;
  icon: typeof Home;
  exact?: boolean;
  compact?: boolean;
}) {
  const active = useActive(href, exact);
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "group relative flex items-center gap-3 rounded-xl px-3 transition-colors",
        compact ? "h-9 text-[13.5px]" : "h-11 text-[14.5px]",
        active
          ? "bg-brand-soft font-extrabold text-brand"
          : "font-semibold text-navy-soft hover:bg-surface-2 hover:text-navy",
      )}
    >
      {/* Where you are should survive a glance from across the room, so the
          current item gets a bar in the course accent as well as a tint. */}
      {active && (
        <span
          className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-brand"
          aria-hidden
        />
      )}
      <Icon size={compact ? 16 : 18} strokeWidth={active ? 2.6 : 2} />
      <span>{label}</span>
    </Link>
  );
}

function SideNav() {
  const { state, ready } = useProgress();
  const { id: course, content, meta } = useCourse();
  const readiness = overallReadiness(content.concepts, state.mastery);
  const claims = claimsFor(course);
  const claimSummary = useMemo(
    () => (claims.length ? summariseClaims(evaluateClaims(content, state.attempts, claims)) : null),
    [claims, content, state.attempts],
  );
  const streak = liveStreak(state.streak, Date.now());
  const { primary, secondary } = navFor(meta.layout);

  return (
    <aside className="sticky top-0 hidden h-dvh w-60 shrink-0 flex-col border-r border-line bg-surface px-3 py-5 lg:flex xl:w-64">
      <Link href="/" className="mb-3 flex items-center gap-2.5 px-2">
        <WingMark />
        <p className="text-[15px] font-extrabold tracking-tight text-navy">WINGBRIEF</p>
      </Link>

      <div className="mb-4">
        <CourseSwitcher />
      </div>

      <div className="mb-5 rounded-2xl bg-ink-800 p-4">
        {/*
          A course that reports claims must not also report coverage. Leaving
          the readiness ring in the rail would put the metric the hero exists to
          replace back on screen, three inches to the left of it.
        */}
        {claimSummary ? (
          <div className="min-w-0">
            <p className="eyebrow text-[#8fb0d4]">What I&apos;ll vouch for</p>
            {claimSummary.earned.length > 0 ? (
              <ul className="mt-2 space-y-1.5">
                {claimSummary.earned.slice(0, 3).map((s) => (
                  <li key={s.claim.id} className="flex items-start gap-2">
                    <Check size={13} strokeWidth={3} className="mt-0.5 shrink-0 text-go" />
                    <span className="text-[11.5px] font-semibold leading-tight text-[#c9dcf0]">
                      {s.claim.label}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-1.5 text-[11.5px] font-semibold leading-tight text-[#c9dcf0]">
                Nothing yet. Applied work earns a claim.
              </p>
            )}
            {claimSummary.contested.length > 0 && (
              <p className="mt-2 text-[11px] font-bold leading-tight text-caution">
                {claimSummary.contested.length} withdrawn
              </p>
            )}
          </div>
        ) : (
        <div className="flex items-center gap-3.5">
          <ProgressRing
            value={ready ? readiness / 100 : 0}
            size={62}
            stroke={7}
            tone={readiness >= 80 ? "go" : readiness >= 50 ? "brand" : "caution"}
            trackClassName="stroke-ink-600"
          >
            <span className="tabular text-[15px] font-extrabold text-white">{readiness}</span>
          </ProgressRing>
          <div className="min-w-0">
            <p className="eyebrow text-[#8fb0d4]">{meta.name} readiness</p>
            <p className="mt-1 text-[11.5px] font-semibold leading-tight text-[#c9dcf0]">
              {readiness >= 85
                ? "Checkride ready"
                : readiness >= 60
                  ? "Solid progress"
                  : readiness > 0
                    ? "Building the base"
                    : "Start your first flight"}
            </p>
          </div>
        </div>
        )}
      </div>

      {/* The week, not just the count: an unfilled ring on today is a far
          better prompt than a number that has stopped going up. */}
      <div className="mb-5 rounded-2xl bg-ink-800 px-4 py-3.5">
        <StreakWeek history={state.streak.history} current={streak} onInk />
      </div>

      <nav className="flex flex-col gap-1">
        {primary.map((item) => (
          <NavItem key={item.href} {...item} label={item.label || meta.labLabel} />
        ))}
      </nav>

      <div className="my-4 h-px bg-line" />

      <nav className="flex flex-col gap-0.5">
        {secondary.map((item) => (
          <NavItem key={item.href} {...item} label={item.label || meta.labLabel} compact />
        ))}
      </nav>

      <div className="mt-auto px-3 pt-4">
        <p className="text-[11px] leading-relaxed text-navy-faint">
          Content traced to {meta.sourceLabel}.
        </p>
      </div>
    </aside>
  );
}

function TopBarMobile() {
  const { state } = useProgress();
  const { id: course, content } = useCourse();
  const readiness = overallReadiness(content.concepts, state.mastery);
  const claims = claimsFor(course);
  const claimSummary = useMemo(
    () => (claims.length ? summariseClaims(evaluateClaims(content, state.attempts, claims)) : null),
    [claims, content, state.attempts],
  );
  const streak = liveStreak(state.streak, Date.now());
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-line bg-surface/90 px-4 backdrop-blur-md lg:hidden">
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <Link href="/" className="shrink-0">
          <WingMark size={26} />
        </Link>
        <div className="min-w-0 max-w-[11rem]">
          <CourseSwitcher compact />
        </div>
      </div>
      <div className="flex items-center gap-3">
        {streak > 0 && <StreakFlame days={streak} size="sm" />}
        <Link
          href="/profile"
          className="tabular flex items-center gap-1.5 rounded-full bg-surface-2 px-2.5 py-1 text-[12.5px] font-bold text-navy"
        >
          {claimSummary ? (
            <>
              {/* Claims, not coverage — and a withdrawn one is the thing worth
                  showing in the two centimetres a phone header has. */}
              <span
                className={cn(
                  "inline-block h-2 w-2 rounded-full",
                  claimSummary.contested.length > 0
                    ? "bg-caution"
                    : claimSummary.earned.length > 0
                      ? "bg-go"
                      : "bg-navy-faint",
                )}
              />
              {claimSummary.contested.length > 0
                ? `${claimSummary.contested.length} withdrawn`
                : `${claimSummary.earned.length} vouched`}
            </>
          ) : (
            <>
              <span
                className={cn(
                  "inline-block h-2 w-2 rounded-full",
                  readiness >= 80 ? "bg-go" : readiness >= 50 ? "bg-brand" : "bg-caution",
                )}
              />
              {readiness}%
            </>
          )}
        </Link>
      </div>
    </header>
  );
}

function BottomNav() {
  const { meta } = useCourse();
  const { primary } = navFor(meta.layout);
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-surface/95 backdrop-blur-md lg:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className={cn("grid", primary.length === 5 ? "grid-cols-5" : "grid-cols-4")}>
        {primary.map((item) => (
          <BottomNavItem key={item.href} {...item} label={item.label || meta.labLabel} />
        ))}
      </ul>
    </nav>
  );
}

function BottomNavItem({
  href,
  label,
  icon: Icon,
  exact,
}: {
  href: string;
  label: string;
  icon: typeof Home;
  exact?: boolean;
}) {
  const active = useActive(href, exact);
  return (
    <li>
      <Link
        href={href}
        aria-current={active ? "page" : undefined}
        className={cn(
          "flex h-16 flex-col items-center justify-center gap-1 text-[11px] font-semibold transition-colors",
          active ? "text-brand" : "text-navy-faint",
        )}
      >
        <Icon size={21} strokeWidth={active ? 2.5 : 2} />
        {label}
      </Link>
    </li>
  );
}

/**
 * The WingBrief mark: a wing in planform under a nose chevron.
 *
 * The plate is a gradient rather than a flat fill so the mark has the same
 * sense of depth as the cards, and the accent is drawn from the course ramp so
 * the mark changes with the course like everything else.
 *
 * The gradient ids are fixed rather than generated. Two instances of this mark
 * are on screen at once (the rail and the mobile bar) and both emit the same
 * defs, so `url(#id)` resolving to whichever comes first in document order is
 * harmless — the definitions are identical. A generated id would be worse here:
 * it would have to be stable across server and client to avoid a mismatch.
 */
export function WingMark({ size = 30 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden className="shrink-0">
      <defs>
        <linearGradient id="wb-mark-plate" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--color-ink-700)" />
          <stop offset="100%" stopColor="var(--color-ink-900)" />
        </linearGradient>
        <linearGradient id="wb-mark-wing" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="var(--color-brand)" />
          <stop offset="55%" stopColor="var(--color-brand-light)" />
          <stop offset="100%" stopColor="var(--color-brand)" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="9" fill="url(#wb-mark-plate)" />
      {/* A highlight along the top edge, the same trick the progress bar uses. */}
      <rect width="32" height="15" rx="9" fill="#fff" opacity="0.06" />
      <path
        d="M6 19.5 C11 16.5 14 15.6 16 15.6 C18 15.6 21 16.5 26 19.5 L26 21.4 C20.6 19.6 18 19 16 19 C14 19 11.4 19.6 6 21.4 Z"
        fill="url(#wb-mark-wing)"
      />
      <path d="M16 8.6 L17.9 13.4 L16 15 L14.1 13.4 Z" fill="#fff" />
      <circle cx="16" cy="23.6" r="1.5" fill="var(--color-brand-light)" />
    </svg>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const immersive = isImmersive(pathname);

  if (immersive) {
    return (
      <>
        {children}
        <AwardToasts />
      </>
    );
  }

  return (
    <div className="flex min-h-dvh">
      <SideNav />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBarMobile />
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-24 pt-5 sm:px-6 lg:pb-10 lg:pt-8">
          {children}
        </main>
        <BottomNav />
      </div>
      <AwardToasts />
    </div>
  );
}

