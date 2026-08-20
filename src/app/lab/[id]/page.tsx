import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { LABS, LAB_BY_ID } from "@/content";
import { LabDetail } from "@/components/lab/lab-detail";

export function generateStaticParams() {
  return LABS.map((l) => ({ id: l.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const lab = LAB_BY_ID[id];
  return { title: lab ? lab.title : "Sim Lab" };
}

export default async function LabPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const lab = LAB_BY_ID[id];
  if (!lab) notFound();
  return <LabDetail lab={lab} />;
}
