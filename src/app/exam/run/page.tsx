"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useMemo } from "react";
import type { ExamResult, UnitId } from "@/lib/types";
import { UNIT_BY_ID } from "@/content";
import { ExamRunner, type ExamConfig } from "@/components/exam-runner";

export default function ExamRunPage() {
  return (
    <Suspense fallback={null}>
      <Runner />
    </Suspense>
  );
}

function Runner() {
  const params = useSearchParams();

  const config = useMemo<ExamConfig>(() => {
    const mode = (params.get("mode") ?? "quick") as ExamResult["mode"];
    const unit = (params.get("unit") ?? undefined) as UnitId | undefined;
    const count = Math.max(1, Number(params.get("count") ?? 20));
    const minutes = Math.max(1, Number(params.get("minutes") ?? count));
    const label =
      mode === "unit" && unit
        ? `${UNIT_BY_ID[unit]?.title ?? "Unit"} exam`
        : mode === "weak"
          ? "Weak-area exam"
          : mode === "full"
            ? "Full 50-question exam"
            : mode === "quick"
              ? "Quick 20-question exam"
              : `${count}-question exam`;

    return {
      mode,
      unit,
      count,
      timed: params.get("timed") === "1",
      seconds: minutes * 60,
      seed: params.get("seed") ?? "exam-default",
      label,
    };
  }, [params]);

  return <ExamRunner config={config} />;
}
