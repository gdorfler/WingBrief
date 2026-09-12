"use client";

/**
 * Application shell.
 *
 * Desktop gets a persistent left rail with expandable study resources.
 * Mobile gets a bottom bar. Immersive routes — the lesson player, an exam in
 * progress, a full-screen explainer — drop the chrome entirely so the student
 * is looking at one thing.
 */

import { useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
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
import { LoadingState, cn } from "./ui";
import { CourseSwitcher } from "./course-switcher";
import { StreakFlame } from "./reward";
import { claimsFor, evaluateClaims, summariseClaims } from "@/lib/claims";
import { AwardToasts } from "./awards";
import { useAuth } from "@/lib/auth";
import { NameOnboarding } from "./name-onboarding";

interface NavItem {
  href: string;
  label: string;
  icon: typeof Home;
  exact?: boolean;
}

const NAV: NavItem[] = [
  { href: "/course", label: "Home", icon: Home },
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
  { href: "/course", label: "Home", icon: Home },
  { href: "/lessons", label: "Route", icon: Layers },
  { href: "/drills", label: "Drills", icon: Repeat },
  { href: "/nav-desk", label: "Desk", icon: Compass },
  { href: "/exam", label: "Exam", icon: ClipboardCheck },
];

const SECONDARY: NavItem[] = [
  { href: "/lab", label: "", icon: FlaskConical },
  { href: "/know-cold", label: "Know cold", icon: Layers },
  { href: "/explainers", label: "Explainers", icon: Sparkles },
  { href: "/click", label: "Make it click", icon: Lightbulb },
  { href: "/profile", label: "Profile", icon: User },
];

const DESK_SECONDARY: NavItem[] = [
  { href: "/know-cold", label: "Know cold", icon: Layers },
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
    pathname === "/auth/callback" ||
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
  const { meta } = useCourse();
  const pathname = usePathname();
  const { primary, secondary } = navFor(meta.layout);
  const resources = secondary.filter(item => item.href !== "/profile");
  return <aside className="flight-sidebar sticky top-0 hidden h-dvh w-60 shrink-0 flex-col overflow-y-auto border-r border-line lg:flex">
    <Link href="/" className="mb-7 flex items-center gap-2.5 px-2"><WingMark /><span className="text-sm font-semibold tracking-widest">WINGBRIEF</span></Link>
    <div className="mb-6"><CourseSwitcher /></div>
    <nav aria-label="Main navigation" className="flex flex-col gap-1">{primary.map(item => <NavItem key={item.href} {...item} label={item.label || meta.labLabel} />)}</nav>
    <details key={pathname} className="sidebar-resources" open={resources.some(item => pathname === item.href || pathname.startsWith(item.href + "/"))}>
      <summary>Study resources</summary>
      <nav aria-label="Study resources" className="flex flex-col gap-1">{resources.map(item => <NavItem key={item.href} {...item} label={item.label || meta.labLabel} compact />)}</nav>
    </details>
    <div className="sidebar-footer"><Link href="/#courses">All courses</Link><Link href="/profile"><User size={15} />Profile & progress</Link><p>NIFE / Ground school</p></div>
  </aside>;
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
        <Link href="/" className="shrink-0" aria-label="WingBrief home">
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

/** Flat wing mark; no shared SVG IDs between hidden and visible navigation. */
export function WingMark({ size = 30 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden className="shrink-0">
    <rect width="32" height="32" rx="6" fill="var(--color-navy)" />
    <path d="M6 19.5 C11 16.5 14 15.6 16 15.6 C18 15.6 21 16.5 26 19.5 L26 21.4 C20.6 19.6 18 19 16 19 C14 19 11.4 19.6 6 21.4 Z" fill="var(--color-surface-2)" />
    <path d="M16 8.6 L17.9 13.4 L16 15 L14.1 13.4 Z" fill="var(--color-surface-2)" />
  </svg>;
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { ready, state } = useProgress();
  const { user, displayName } = useAuth();
  const immersive = isImmersive(pathname);

  // Until storage/account hydration completes, the progress context contains
  // an intentionally empty Aerodynamics default. Rendering that placeholder
  // made returning students briefly see the wrong course, readiness, nav and
  // recommendations. The callback must stay mounted because it participates
  // in completing authentication; every other route can wait safely.
  if (!ready && pathname !== "/auth/callback") {
    return <LoadingState label="Loading your progress…" fullPage />;
  }
  if (user && !displayName && pathname !== "/auth/callback") {
    return <NameOnboarding key={user.id} />;
  }

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
          <div key={state.activeCourse} className="course-arrival">{children}</div>
        </main>
        <BottomNav />
      </div>
      <AwardToasts />
    </div>
  );
}
