"use client";

import Link from "next/link";
import {
  AlertTriangle,
  Bookmark,
  Clock,
  FlaskConical,
  Plane,
  Sigma,
  Snowflake,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { CONCEPTS, EXPLAINERS, KNOW_COLD, LESSONS, QUESTIONS, UNITS } from "@/content";
import {
  buildDailyFlight,
  outstandingMistakes,
  unitReadiness,
  weakConcepts,
} from "@/lib/review";
import { isDue } from "@/lib/mastery";
import { useProgress } from "@/lib/progress-store";
import {
  Card,
  PageHeader,
  Pill,
  ProgressBar,
  SectionHeading,
  cn,
} from "@/components/ui";

export default function ReviewPage() {
  const { state } = useProgress();
  const now = Date.now();

  const weak = weakConcepts(CONCEPTS, QUESTIONS, state.mastery, now, { limit: 8 });
  const dueCount = CONCEPTS.filter((c) => isDue(state.mastery[c.id], now)).length;
  const mistakes = outstandingMistakes(QUESTIONS, state);
  const saved = state.savedQuestionIds.length;
  const flight = buildDailyFlight(
    { lessons: LESSONS, concepts: CONCEPTS, questions: QUESTIONS, explainers: EXPLAINERS },
    state,
    now,
  );
  const units = unitReadiness(UNITS, CONCEPTS, LESSONS, state);
  const formulas = KNOW_COLD.filter((k) => k.category === "equation").length;

  const tiles = [
    {
      href: "/review/spaced",
      icon: Clock,
      title: "Spaced review",
      body: "Concepts your schedule says are due today.",
      count: dueCount,
      tone: dueCount > 0 ? ("caution" as const) : ("neutral" as const),
      unit: dueCount === 1 ? "concept due" : "concepts due",
    },
    {
      href: "/review/weak",
      icon: TrendingUp,
      title: "Weak areas",
      body: "Your lowest-mastery concepts, drilled hardest first.",
      count: weak.length,
      tone: weak.length > 0 ? ("nogo" as const) : ("go" as const),
      unit: weak.length === 1 ? "concept" : "concepts",
    },
    {
      href: "/review/mistakes",
      icon: AlertTriangle,
      title: "Mistakes",
      body: "Every question you have got wrong and not yet fixed.",
      count: mistakes.length,
      tone: mistakes.length > 0 ? ("caution" as const) : ("go" as const),
      unit: mistakes.length === 1 ? "question" : "questions",
    },
    {
      href: "/review/saved",
      icon: Bookmark,
      title: "Saved",
      body: "Questions you bookmarked to come back to.",
      count: saved,
      tone: "brand" as const,
      unit: saved === 1 ? "question" : "questions",
    },
  ];

  const references = [
    {
      href: "/know-cold?category=equation",
      icon: Sigma,
      title: "Formulas",
      body: `${formulas} equations, every one from the trainee guide.`,
    },
    {
      href: "/know-cold",
      icon: Snowflake,
      title: "Know Cold",
      body: `${KNOW_COLD.length} high-yield cards for the night before.`,
    },
    {
      href: "/explainers",
      icon: Sparkles,
      title: "Visual explainers",
      body: `${EXPLAINERS.length} sixty-second animated walkthroughs.`,
    },
    {
      href: "/lab",
      icon: FlaskConical,
      title: "Sim Lab",
      body: "Manipulate the relationships instead of memorising them.",
    },
  ];

  return (
    <>
      <PageHeader
        eyebrow="Adaptive review"
        title="Review"
        subtitle="The engine tracks mastery per concept and schedules each one to come back before you forget it. Everything here is chosen for you."
      />

      {/* Daily flight */}
      <Card className="mb-6 border-brand/25 bg-brand-soft/40">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand text-white">
              <Plane size={20} />
            </span>
            <div>
              <p className="eyebrow text-brand">Today&rsquo;s flight</p>
              <p className="text-[15px] font-semibold text-navy">
                {flight.items.length} items · about {flight.totalMinutes} minutes
              </p>
            </div>
          </div>
          <Link
            href={flight.items[0]?.href ?? "/lessons"}
            className="rounded-xl bg-brand px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
          >
            Start
          </Link>
        </div>
      </Card>

      <SectionHeading eyebrow="Targeted drills" title="What needs work" />
      <ul className="mb-8 grid gap-3 sm:grid-cols-2">
        {tiles.map((t) => (
          <li key={t.href}>
            <Link
              href={t.href}
              className={cn(
                "group flex h-full items-start gap-3.5 rounded-2xl border bg-surface p-4 transition-all hover:shadow-sm",
                t.count > 0 ? "border-line hover:border-brand/40" : "border-line opacity-70",
              )}
            >
              <span
                className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                  t.tone === "nogo" && "bg-nogo-soft text-nogo",
                  t.tone === "caution" && "bg-caution-soft text-caution",
                  t.tone === "brand" && "bg-brand-soft text-brand",
                  t.tone === "go" && "bg-go-soft text-go",
                  t.tone === "neutral" && "bg-surface-2 text-navy-faint",
                )}
              >
                <t.icon size={19} />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-2">
                  <p className="text-[15px] font-semibold text-navy">{t.title}</p>
                  <span className="tabular shrink-0 text-[15px] font-bold text-navy">
                    {t.count}
                  </span>
                </div>
                <p className="mt-0.5 text-[12.5px] leading-snug text-navy-soft">{t.body}</p>
                <p className="mt-1 text-[11px] font-semibold text-navy-faint">{t.unit}</p>
              </div>
            </Link>
          </li>
        ))}
      </ul>

      {/* Weak areas detail */}
      {weak.length > 0 && (
        <section className="mb-8">
          <SectionHeading
            eyebrow="Concept by concept"
            title="Exactly what is weak"
            action={
              <Link href="/review/weak" className="text-[13px] font-semibold text-brand hover:underline">
                Drill all
              </Link>
            }
          />
          <Card padded={false}>
            <ul className="divide-y divide-line">
              {weak.map((w) => (
                <li key={w.concept.id}>
                  <Link
                    href={`/review/concept/${w.concept.id}`}
                    className="block px-4 py-3.5 transition-colors hover:bg-surface-2"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-[14px] font-semibold text-navy">{w.concept.name}</p>
                          {w.due && (
                            <Pill tone="nogo" size="sm">
                              Due now
                            </Pill>
                          )}
                        </div>
                        <p className="mt-1 line-clamp-2 text-[12.5px] leading-snug text-navy-soft">
                          {w.concept.definition}
                        </p>
                      </div>
                      <span
                        className={cn(
                          "tabular shrink-0 text-[15px] font-bold",
                          w.mastery < 40 ? "text-nogo" : "text-caution",
                        )}
                      >
                        {w.mastery}%
                      </span>
                    </div>
                    <ProgressBar
                      value={w.mastery / 100}
                      tone={w.mastery < 40 ? "nogo" : "caution"}
                      height={5}
                      className="mt-2.5"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </Card>
        </section>
      )}

      {/* Unit rollup */}
      <section className="mb-8">
        <SectionHeading eyebrow="By unit" title="Mastery rollup" />
        <Card padded={false}>
          <ul className="divide-y divide-line">
            {units.map((u) => (
              <li key={u.unit} className="flex items-center gap-4 px-4 py-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-3">
                    <p className="truncate text-[13.5px] font-semibold text-navy">{u.title}</p>
                    <span className="tabular shrink-0 text-[13px] font-bold text-navy">
                      {u.readiness}%
                    </span>
                  </div>
                  <ProgressBar
                    value={u.readiness / 100}
                    tone={u.readiness >= 80 ? "go" : u.readiness >= 40 ? "brand" : "caution"}
                    height={6}
                    className="mt-2"
                  />
                </div>
                <Link
                  href={`/exam?mode=unit&unit=${u.unit}`}
                  className="shrink-0 rounded-lg bg-surface-2 px-3 py-1.5 text-[12px] font-semibold text-navy-soft transition-colors hover:bg-surface-3 hover:text-navy"
                >
                  Test
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      </section>

      {/* Reference */}
      <SectionHeading eyebrow="Reference" title="Study material" />
      <ul className="grid gap-3 sm:grid-cols-2">
        {references.map((r) => (
          <li key={r.title}>
            <Link
              href={r.href}
              className="flex h-full items-center gap-3.5 rounded-2xl border border-line bg-surface p-4 transition-all hover:border-brand/40"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-surface-2 text-navy-soft">
                <r.icon size={18} />
              </span>
              <div className="min-w-0">
                <p className="text-[14.5px] font-semibold text-navy">{r.title}</p>
                <p className="mt-0.5 text-[12px] leading-snug text-navy-soft">{r.body}</p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
