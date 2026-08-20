"use client";

import { QUESTIONS } from "@/content";
import { outstandingMistakes } from "@/lib/review";
import { useProgress } from "@/lib/progress-store";
import { ReviewSession } from "@/components/review-session";

export default function MistakesPage() {
  const { state, ready } = useProgress();
  const questions = outstandingMistakes(QUESTIONS, state).slice(0, 15);

  if (!ready) return null;

  return (
    <ReviewSession
      title="Mistakes"
      subtitle="Every question you have got wrong and not since answered correctly."
      questions={questions}
      emptyTitle="No outstanding mistakes"
      emptyBody="You have since answered every question you previously missed. Nothing left to repair here."
    />
  );
}
