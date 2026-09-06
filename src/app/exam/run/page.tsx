"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useMemo } from "react";
import { parseExamConfig, type ExamConfig } from "@/lib/exam-config";
import { ExamRunner } from "@/components/exam-runner";
import { LoadingState } from "@/components/ui";

export default function ExamRunPage() {
  return (
    <Suspense fallback={<LoadingState label="Building your paper…" fullPage />}>
      <Runner />
    </Suspense>
  );
}

function Runner() {
  const params = useSearchParams();
  const config = useMemo<ExamConfig>(() => parseExamConfig(params), [params]);

  return <ExamRunner config={config} />;
}
