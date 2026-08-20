"use client";

import { CONCEPTS, QUESTIONS } from "@/content";
import { isDue, reviewPriority } from "@/lib/mastery";
import { selectReviewQuestions } from "@/lib/review";
import { useProgress } from "@/lib/progress-store";
import { ReviewSession } from "@/components/review-session";

export default function SpacedReviewPage() {
  const { state, ready } = useProgress();
  const now = Date.now();

  const due = CONCEPTS.filter((c) => isDue(state.mastery[c.id], now)).sort(
    (a, b) =>
      reviewPriority(state.mastery[b.id], now) - reviewPriority(state.mastery[a.id], now),
  );
  const questions = selectReviewQuestions(
    QUESTIONS,
    due.map((c) => c.id),
    state,
    12,
  );

  if (!ready) return null;

  return (
    <ReviewSession
      title="Spaced review"
      subtitle={`${due.length} concept${due.length === 1 ? "" : "s"} scheduled to come back today.`}
      questions={questions}
      emptyTitle="Nothing due yet"
      emptyBody="Your scheduled reviews are all in the future. Answer some questions in a lesson and they will start appearing here."
    />
  );
}
