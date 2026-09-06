"use client";

import { QUESTION_BY_ID } from "@/content";
import { useProgress } from "@/lib/progress-store";
import { ReviewSession } from "@/components/review-session";
import { LoadingState } from "@/components/ui";

export default function SavedPage() {
  const { state, ready } = useProgress();
  const questions = state.savedQuestionIds
    .map((id) => QUESTION_BY_ID[id])
    .filter(Boolean);

  if (!ready) return <LoadingState label="Loading saved questions…" fullPage />;

  return (
    <ReviewSession
      title="Saved questions"
      subtitle="The questions you bookmarked."
      questions={questions}
      emptyTitle="Nothing saved yet"
      emptyBody="Tap the bookmark icon on any question to keep it here for later."
    />
  );
}
