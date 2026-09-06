"use client";
import { useCourse } from "@/lib/course";
import { WorldAtmosphere, WorldBadge } from "./flight-world";
export function SessionBrief({ title, description, children }: { title:string; description:string; children?:React.ReactNode }) {
  const { id,meta }=useCourse();
  return <section className="session-brief"><WorldAtmosphere/><div className="flex-1"><p className="flight-eyebrow">{meta.name}</p><h1>{title}</h1><p className="session-description">{description}</p>{children}</div><WorldBadge course={id}/></section>;
}
