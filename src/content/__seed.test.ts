/* Temporary: generates a realistic mid-course progress document for design QA. */
import { writeFileSync } from "node:fs";
import { it } from "vitest";
import { contentFor } from "./index";

it("emits a seed", () => {
  const now = Date.now();
  const day = 86_400_000;
  const iso = (t: number) => new Date(t).toISOString().slice(0, 10);

  function courseProgress(course: "aero" | "engines", lessonFrac: number, strong: number) {
    const c = contentFor(course);
    const lessons: Record<string, unknown> = {};
    const doneCount = Math.floor(c.lessons.length * lessonFrac);
    c.lessons.slice(0, doneCount).forEach((l, i) => {
      lessons[l.id] = {
        lessonId: l.id, started: true, completed: true,
        bestScore: i % 7 === 0 ? 0.72 : 0.94, attempts: 1,
        lastCompletedAt: now - (doneCount - i) * day * 0.4, perfect: i % 3 === 0,
      };
    });
    const mastery: Record<string, unknown> = {};
    c.concepts.forEach((cn, i) => {
      const level = i % 11 === 0 ? 1 : i % 7 === 0 ? 2 : i < c.concepts.length * strong ? 5 : 3;
      mastery[cn.id] = {
        conceptId: cn.id, level, seen: 4 + (i % 5),
        correct: level >= 4 ? 4 + (i % 5) : 1 + (i % 2),
        recent: level >= 4 ? [true, true, true, true] : [false, true, false, false],
        lastSeenAt: now - (i % 9) * day,
        dueAt: i % 6 === 0 ? now - day : now + (i % 5) * day,
        intervalDays: level >= 4 ? 9 : 1,
      };
    });
    return {
      xp: course === "engines" ? 4852 : 1930, mastery, lessons,
      attempts: c.questions.slice(0, 140).map((q, i) => ({
        questionId: q.id, conceptIds: q.conceptIds ?? [], correct: i % 5 !== 0,
        at: now - i * 3_600_000, firstTry: i % 4 !== 0,
      })),
      exams: [], savedQuestionIds: [], savedKnowColdIds: [],
      watchedExplainerIds: c.explainers.slice(0, 3).map((e) => e.id), predictions: [],
    };
  }
  const empty = { xp: 0, mastery: {}, lessons: {}, attempts: [], exams: [], savedQuestionIds: [], savedKnowColdIds: [], watchedExplainerIds: [], predictions: [] };
  const doc = {
    version: 4, activeCourse: "engines", onboarded: true,
    streak: { current: 13, longest: 21, lastActiveDay: iso(now), history: Array.from({ length: 13 }, (_, i) => iso(now - i * day)) },
    achievements: [{ id: "first-flight", unlockedAt: now - 12 * day }, { id: "no-go-around", unlockedAt: now - 5 * day }],
    courses: { aero: courseProgress("aero", 0.55, 0.5), engines: courseProgress("engines", 0.9, 0.55), frr: empty, weather: empty, nav: empty },
  };
  writeFileSync("public/__seed.json", JSON.stringify(doc));
});
