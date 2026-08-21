import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { LESSON_BY_ID, COURSE_ORDER, contentFor } from "@/content";
import { LessonPlayer } from "@/components/lesson-player";

export function generateStaticParams() {
  // Build time: prerender every course's pages, not just the active one.
  return COURSE_ORDER.flatMap((c) => contentFor(c).lessons).map((l) => ({ id: l.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const lesson = LESSON_BY_ID[id];
  return { title: lesson ? lesson.title : "Lesson" };
}

export default async function LessonPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const lesson = LESSON_BY_ID[id];
  if (!lesson) notFound();
  return <LessonPlayer lesson={lesson} />;
}
