import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { COURSE_ORDER, contentFor } from "@/content";
import { DrillRunner } from "@/components/nav/drill-runner";

/** Drills exist only on problem-solving courses, so this walks every course. */
function allDrills() {
  return COURSE_ORDER.flatMap((c) => contentFor(c).drills ?? []);
}

export function generateStaticParams() {
  return allDrills().map((d) => ({ id: d.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const drill = allDrills().find((d) => d.id === id);
  return { title: drill ? drill.title : "Drill" };
}

export default async function DrillPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const drill = allDrills().find((d) => d.id === id);
  if (!drill) notFound();
  return <DrillRunner drill={drill} />;
}
