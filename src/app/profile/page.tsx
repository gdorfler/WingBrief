"use client";

import { useMemo, useRef, useState } from "react";
import { Check, Download, Trash2, Upload } from "lucide-react";
import {
  CONCEPTS,
  CURRICULUM_STATS,
  LESSONS,
  UNITS,
  buildEoMatrix,
} from "@/content";
import { overallReadiness, unitReadiness } from "@/lib/review";
import { ACHIEVEMENTS, dayKey, levelFromXp, liveStreak } from "@/lib/xp";
import { exportProgress, importProgress } from "@/lib/storage";
import { useProgress } from "@/lib/progress-store";
import { AchievementIcon } from "@/components/achievement-icon";
import {
  Button,
  Card,
  PageHeader,
  Pill,
  ProgressBar,
  ProgressRing,
  SectionHeading,
  StatTile,
  cn,
} from "@/components/ui";

export default function ProfilePage() {
  const { state, resetProgress, importState } = useProgress();
  const [confirmReset, setConfirmReset] = useState(false);
  const [importMessage, setImportMessage] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const now = Date.now();

  const readiness = overallReadiness(CONCEPTS, state.mastery);
  const units = unitReadiness(UNITS, CONCEPTS, LESSONS, state);
  const level = levelFromXp(state.xp);
  const streak = liveStreak(state.streak, now);
  const owned = new Set(state.achievements.map((a) => a.id));

  const eoMatrix = useMemo(() => buildEoMatrix(), []);
  const eoCovered = eoMatrix.filter((r) => r.covered).length;

  const totals = useMemo(() => {
    const answered = state.attempts.length;
    const correct = state.attempts.filter((a) => a.correct).length;
    const mastered = Object.values(state.mastery).filter((m) => m.level >= 5).length;
    const strong = Object.values(state.mastery).filter((m) => m.level >= 4).length;
    return { answered, correct, mastered, strong };
  }, [state.attempts, state.mastery]);

  const last30 = useMemo(() => {
    const days: { key: string; count: number }[] = [];
    for (let i = 29; i >= 0; i--) {
      const key = dayKey(now - i * 86_400_000);
      days.push({
        key,
        count: state.attempts.filter((a) => dayKey(a.at) === key).length,
      });
    }
    return days;
  }, [now, state.attempts]);
  const maxDay = Math.max(1, ...last30.map((d) => d.count));

  const doExport = () => {
    const blob = new Blob([exportProgress(state)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `nife-aero-progress-${dayKey(now)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const doImport = async (file: File) => {
    const text = await file.text();
    const parsed = importProgress(text);
    if (!parsed) {
      setImportMessage("That file could not be read as progress data.");
      return;
    }
    importState(parsed);
    setImportMessage("Progress restored.");
  };

  return (
    <>
      <PageHeader
        eyebrow="Your record"
        title="Profile"
        subtitle="Everything is stored locally in this browser. Export it if you want a backup or to move to another device."
      />

      {/* Overview */}
      <Card className="mb-6">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
          <ProgressRing
            value={readiness / 100}
            size={112}
            stroke={11}
            tone={readiness >= 80 ? "go" : readiness >= 50 ? "brand" : "caution"}
          >
            <span className="tabular text-[28px] font-extrabold leading-none text-navy">
              {readiness}
              <span className="text-base">%</span>
            </span>
            <span className="mt-0.5 text-[9.5px] font-bold uppercase tracking-wider text-navy-faint">
              readiness
            </span>
          </ProgressRing>

          <div className="grid flex-1 grid-cols-2 gap-2.5 sm:grid-cols-4">
            <StatTile label="Level" value={level.level} hint={`${state.xp.toLocaleString()} XP`} tone="brand" />
            <StatTile label="Streak" value={streak} hint={`best ${state.streak.longest}`} tone="caution" />
            <StatTile
              label="Questions"
              value={totals.answered}
              hint={totals.answered > 0 ? `${Math.round((totals.correct / totals.answered) * 100)}% correct` : "none yet"}
            />
            <StatTile label="Mastered" value={totals.mastered} hint={`${totals.strong} strong+`} tone="go" />
          </div>
        </div>
        <div className="mt-4">
          <div className="mb-1.5 flex items-baseline justify-between">
            <span className="text-[12px] font-semibold text-navy-soft">
              Level {level.level} → {level.level + 1}
            </span>
            <span className="tabular text-[12px] font-bold text-navy-faint">
              {level.intoLevel} / {level.span} XP
            </span>
          </div>
          <ProgressBar value={level.progress} tone="brand" height={7} />
        </div>
      </Card>

      {/* Activity */}
      <section className="mb-6">
        <SectionHeading eyebrow="Last 30 days" title="Activity" />
        <Card>
          <div className="flex h-24 items-end gap-1">
            {last30.map((d) => (
              <div key={d.key} className="group relative flex-1">
                <div
                  className={cn(
                    "w-full rounded-t transition-all",
                    d.count > 0 ? "bg-brand" : "bg-surface-3",
                  )}
                  style={{ height: `${Math.max(4, (d.count / maxDay) * 88)}px` }}
                  title={`${d.key}: ${d.count} questions`}
                />
              </div>
            ))}
          </div>
          <div className="mt-2 flex justify-between text-[10.5px] font-semibold text-navy-faint">
            <span>30 days ago</span>
            <span>today</span>
          </div>
        </Card>
      </section>

      {/* Units */}
      <section className="mb-6">
        <SectionHeading eyebrow="Concept mastery" title="By unit" />
        <Card padded={false}>
          <ul className="divide-y divide-line">
            {units.map((u) => (
              <li key={u.unit} className="px-4 py-3">
                <div className="flex items-baseline justify-between gap-3">
                  <p className="text-[13.5px] font-semibold text-navy">{u.title}</p>
                  <span className="tabular text-[13px] font-bold text-navy">{u.readiness}%</span>
                </div>
                <ProgressBar
                  value={u.readiness / 100}
                  tone={u.readiness >= 80 ? "go" : u.readiness >= 40 ? "brand" : "caution"}
                  height={6}
                  className="mt-2"
                />
                <p className="mt-1.5 text-[11px] text-navy-faint">
                  {u.lessonsCompleted}/{u.lessonsTotal} lessons · {u.conceptsMastered}/
                  {u.conceptsTotal} concepts mastered
                </p>
              </li>
            ))}
          </ul>
        </Card>
      </section>

      {/* Achievements */}
      <section className="mb-6">
        <SectionHeading
          eyebrow={`${owned.size} of ${ACHIEVEMENTS.length} unlocked`}
          title="Achievements"
        />
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {ACHIEVEMENTS.map((a) => {
            const unlocked = owned.has(a.id);
            return (
              <li key={a.id}>
                <Card
                  className={cn(
                    "flex h-full items-start gap-3",
                    !unlocked && "opacity-60",
                  )}
                >
                  <AchievementIcon icon={a.icon} size={38} locked={!unlocked} />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-[13.5px] font-semibold text-navy">{a.name}</p>
                      {unlocked && <Check size={13} className="shrink-0 text-go" strokeWidth={3} />}
                    </div>
                    <p className="mt-0.5 text-[11.5px] leading-snug text-navy-soft">
                      {a.description}
                    </p>
                  </div>
                </Card>
              </li>
            );
          })}
        </ul>
      </section>

      {/* Curriculum coverage */}
      <section className="mb-6">
        <SectionHeading
          eyebrow="Source traceability"
          title="Enabling objective coverage"
        />
        <Card>
          <div className="grid gap-3 sm:grid-cols-4">
            <StatTile label="EOs mapped" value={eoMatrix.length} hint="from the trainee guide" />
            <StatTile
              label="Taught + assessed"
              value={eoCovered}
              hint={`${Math.round((eoCovered / Math.max(1, eoMatrix.length)) * 100)}% of mapped`}
              tone="go"
            />
            <StatTile label="Questions" value={CURRICULUM_STATS.questions} hint="in the bank" />
            <StatTile label="Concepts" value={CURRICULUM_STATS.concepts} hint="tracked for mastery" />
          </div>
          <p className="mt-4 text-[12px] leading-relaxed text-navy-soft">
            Every lesson, concept and question carries the document, chapter and enabling
            objectives it was written from — the Naval Aviation Fundamentals Aerodynamics trainee
            guide (Q-9B-0020L) and lecture decks ACA0101 through ACA0104. The matrix above is
            rebuilt from the content at runtime, so it cannot drift.
          </p>
          <details className="mt-3">
            <summary className="cursor-pointer text-[12.5px] font-semibold text-brand">
              Show the coverage matrix
            </summary>
            <div className="mt-3 max-h-80 overflow-auto rounded-xl border border-line">
              <table className="w-full border-collapse text-left text-[11.5px]">
                <thead className="sticky top-0 bg-surface-2">
                  <tr>
                    <th className="px-3 py-2 font-bold text-navy-soft">EO</th>
                    <th className="px-3 py-2 font-bold text-navy-soft">Lessons</th>
                    <th className="px-3 py-2 font-bold text-navy-soft">Questions</th>
                    <th className="px-3 py-2 font-bold text-navy-soft">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {eoMatrix.map((row) => (
                    <tr key={row.eo}>
                      <td className="tabular px-3 py-1.5 font-semibold text-navy">{row.eo}</td>
                      <td className="tabular px-3 py-1.5 text-navy-soft">{row.lessonIds.length}</td>
                      <td className="tabular px-3 py-1.5 text-navy-soft">
                        {row.questionIds.length}
                      </td>
                      <td className="px-3 py-1.5">
                        <Pill tone={row.covered ? "go" : "caution"} size="sm">
                          {row.covered ? "covered" : "partial"}
                        </Pill>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </details>
        </Card>
      </section>

      {/* Data */}
      <section>
        <SectionHeading eyebrow="Local only" title="Your data" />
        <Card className="space-y-4">
          <p className="text-[13px] leading-relaxed text-navy-soft">
            Progress, mastery, XP, streak and exam history are stored in this browser&rsquo;s local
            storage. Nothing is sent anywhere. Clearing site data will erase it, so export a backup
            if it matters.
          </p>

          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" onClick={doExport}>
              <Download size={16} />
              Export progress
            </Button>
            <Button variant="secondary" onClick={() => fileInput.current?.click()}>
              <Upload size={16} />
              Import progress
            </Button>
            <input
              ref={fileInput}
              type="file"
              accept="application/json"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void doImport(f);
                e.target.value = "";
              }}
            />
            <Button variant="danger" onClick={() => setConfirmReset(true)}>
              <Trash2 size={16} />
              Reset everything
            </Button>
          </div>

          {importMessage && (
            <p className="text-[12.5px] font-semibold text-go">{importMessage}</p>
          )}

          {confirmReset && (
            <div className="rounded-xl border border-nogo/30 bg-nogo-soft p-4">
              <p className="text-[13.5px] font-semibold text-navy">
                Erase all progress? This cannot be undone.
              </p>
              <div className="mt-3 flex gap-2">
                <Button variant="secondary" size="sm" onClick={() => setConfirmReset(false)}>
                  Cancel
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => {
                    resetProgress();
                    setConfirmReset(false);
                  }}
                >
                  Yes, erase everything
                </Button>
              </div>
            </div>
          )}
        </Card>
      </section>

      <p className="mt-8 text-center text-[11px] leading-relaxed text-navy-faint">
        Educational aid only. Not a substitute for official NIFE instruction or NATOPS.
        <br />
        Content traced to NAVAVSCOLSCOM-SG-200 Unit 2 and lecture decks ACA0101–ACA0104.
      </p>
    </>
  );
}
