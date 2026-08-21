import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { EXPLAINER_BY_ID, COURSE_ORDER, contentFor } from "@/content";
import { ExplainerPlayer } from "@/components/explainer-player";

export function generateStaticParams() {
  // Build time: prerender every course's pages, not just the active one.
  return COURSE_ORDER.flatMap((c) => contentFor(c).explainers).map((e) => ({ id: e.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const e = EXPLAINER_BY_ID[id];
  return { title: e ? e.title : "Explainer" };
}

export default async function ExplainerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const explainer = EXPLAINER_BY_ID[id];
  if (!explainer) notFound();
  return <ExplainerPlayer explainer={explainer} />;
}
