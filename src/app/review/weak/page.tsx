"use client";

import { CONCEPTS, QUESTIONS } from "@/content";
import { selectReviewQuestions, weakConcepts } from "@/lib/review";
import { useProgress } from "@/lib/progress-store";
import { ReviewSession } from "@/components/review-session";

export default function WeakReviewPage() {
  const { state, ready } = useProgress();
  const now = Date.now();
  const weak = weakConcepts(CONCEPTS, QUESTIONS, state.mastery, now, { limit: 6 });
  const questions = selectReviewQuestions(
    QUESTIONS,
    weak.map((w) => w.concept.id),
    state,
    10,
  );

  if (!ready) return null;

  return (
    <ReviewSession
      title="Weak areas"
      subtitle={
        weak.length > 0
          ? `Targeting ${weak.slice(0, 3).map((w) => w.concept.name).join(", ")}${weak.length > 3 ? ` and ${weak.length - 3} more` : ""}.`
          : ""
      }
      questions={questions}
      emptyTitle="Nothing weak right now"
      emptyBody="Every concept you have been tested on is at strong mastery or better. Complete more lessons to give the engine something to work with."
    />
  );
}
