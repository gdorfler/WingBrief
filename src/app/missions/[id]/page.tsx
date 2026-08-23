import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { COURSE_ORDER, contentFor } from "@/content";
import { MissionRunner } from "@/components/nav/mission-runner";

function allMissions() {
  return COURSE_ORDER.flatMap((c) => contentFor(c).missions ?? []);
}

export function generateStaticParams() {
  return allMissions().map((m) => ({ id: m.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const mission = allMissions().find((m) => m.id === id);
  return { title: mission ? mission.title : "Mission" };
}

export default async function MissionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const mission = allMissions().find((m) => m.id === id);
  if (!mission) notFound();
  return <MissionRunner mission={mission} />;
}
