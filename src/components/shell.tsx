"use client";

/**
 * Application shell.
 *
 * Desktop gets a persistent left rail with the readiness ring always visible.
 * Mobile gets a bottom bar. Immersive routes — the lesson player, an exam in
 * progress, a full-screen explainer — drop the chrome entirely so the student
 * is looking at one thing.
 */

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ClipboardCheck,
  FlaskConical,
  Home,
  Layers,
  RotateCcw,
  Snowflake,
  Sparkles,
  User,
} from "lucide-react";

import { overallReadiness } from "@/lib/review";
import { liveStreak } from "@/lib/xp";
import { useProgress } from "@/lib/progress-store";
import { useCourse } from "@/lib/course";
import { ProgressRing, cn } from "./ui";
import { CourseSwitcher } from "./course-switcher";
import { AwardToasts } from "./awards";

const NAV = [
  { href: "/", label: "Home", icon: Home, exact: true },
  { href: "/lessons", label: "Lessons", icon: Layers },
  { href: "/review", label: "Review", icon: RotateCcw },
  { href: "/lab", label: "Sim Lab", icon: FlaskConical },
  { href: "/exam", label: "Exam", icon: ClipboardCheck },
];

const SECONDARY = [
  { href: "/explainers", label: "Explainers", icon: Sparkles },
  { href: "/know-cold", label: "Know Cold", icon: Snowflake },
  { href: "/profile", label: "Profile", icon: User },
];

/** Routes that hide the shell so the student sees one thing at a time. */
function isImmersive(pathname: string): boolean {
  return (
    /^\/lessons\/[^/]+$/.test(pathname) ||
    /^\/explainers\/[^/]+$/.test(pathname) ||
    pathname.startsWith("/exam/run") ||
    /^\/review\/(weak|spaced|mistakes|saved)$/.test(pathname)
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
        "group flex items-center gap-3 rounded-xl px-3 font-semibold transition-colors",
        compact ? "h-9 text-[13px]" : "h-11 text-sm",
        active
          ? "bg-brand-soft text-brand"
          : "text-navy-soft hover:bg-surface-2 hover:text-navy",
      )}
    >
      <Icon size={compact ? 16 : 18} strokeWidth={active ? 2.4 : 2} />
      <span>{label}</span>
    </Link>
  );
}

function SideNav() {
  const { state, ready } = useProgress();
  const { content, meta } = useCourse();
  const readiness = overallReadiness(content.concepts, state.mastery);
  const streak = liveStreak(state.streak, Date.now());

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
        {streak > 0 && (
          <p className="mt-3 flex items-center gap-1.5 text-[11.5px] font-bold text-[#ffb74d]">
            <span aria-hidden>🔥</span> {streak}-day streak
          </p>
        )}
      </div>

      <nav className="flex flex-col gap-1">
        {NAV.map((item) => (
          <NavItem key={item.href} {...item} />
        ))}
      </nav>

      <div className="my-4 h-px bg-line" />

      <nav className="flex flex-col gap-0.5">
        {SECONDARY.map((item) => (
          <NavItem key={item.href} {...item} compact />
        ))}
      </nav>

      <div className="mt-auto px-3 pt-4">
        <p className="text-[10px] leading-relaxed text-navy-faint">
          Content traced to {meta.sourceLabel}.
        </p>
      </div>
    </aside>
  );
}

function TopBarMobile() {
  const { state } = useProgress();
  const { content } = useCourse();
  const readiness = overallReadiness(content.concepts, state.mastery);
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
        {streak > 0 && (
          <span className="tabular flex items-center gap-1 text-[13px] font-bold text-caution">
            <span aria-hidden>🔥</span>
            {streak}
          </span>
        )}
        <Link
          href="/profile"
          className="tabular flex items-center gap-1.5 rounded-full bg-surface-2 px-2.5 py-1 text-[12.5px] font-bold text-navy"
        >
          <span
            className={cn(
              "inline-block h-2 w-2 rounded-full",
              readiness >= 80 ? "bg-go" : readiness >= 50 ? "bg-brand" : "bg-caution",
            )}
          />
          {readiness}%
        </Link>
      </div>
    </header>
  );
}

function BottomNav() {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-surface/95 backdrop-blur-md lg:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="grid grid-cols-5">
        {NAV.map((item) => (
          <BottomNavItem key={item.href} {...item} />
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
          "flex h-16 flex-col items-center justify-center gap-1 text-[10.5px] font-semibold transition-colors",
          active ? "text-brand" : "text-navy-faint",
        )}
      >
        <Icon size={21} strokeWidth={active ? 2.5 : 2} />
        {label}
      </Link>
    </li>
  );
}

export function WingMark({ size = 30 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden className="shrink-0">
      <rect width="32" height="32" rx="9" fill="var(--color-ink-800)" />
      <path
        d="M6 19.5 C11 16.5 14 15.6 16 15.6 C18 15.6 21 16.5 26 19.5 L26 21.4 C20.6 19.6 18 19 16 19 C14 19 11.4 19.6 6 21.4 Z"
        fill="var(--color-brand-light)"
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

