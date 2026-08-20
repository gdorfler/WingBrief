import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { LESSONS, LESSON_BY_ID } from "@/content";
import { LessonPlayer } from "@/components/lesson-player";

export function generateStaticParams() {
  return LESSONS.map((l) => ({ id: l.id }));
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
