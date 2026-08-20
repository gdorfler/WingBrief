import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { EXPLAINERS, EXPLAINER_BY_ID } from "@/content";
import { ExplainerPlayer } from "@/components/explainer-player";

export function generateStaticParams() {
  return EXPLAINERS.map((e) => ({ id: e.id }));
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
