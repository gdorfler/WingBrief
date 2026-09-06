import { contentFor } from "@/content";
import { normalizeExamConfig, parseExamConfig, parsePickableExamMode } from "./exam-config";

function params(values: Record<string, string> = {}) {
  return new URLSearchParams(values);
}

describe("exam URL configuration", () => {
  it("preserves unit scope when the question count is customised", () => {
    const config=normalizeExamConfig(parseExamConfig(params({mode:"custom",scope:"unit",unit:"u1",count:"100"})),contentFor("aero"));
    expect(config.mode).toBe("custom");expect(config.scope).toBe("unit");expect(config.unit).toBe("u1");
    expect(config.count).toBe(Math.min(100,contentFor("aero").questions.filter(q=>q.unit==="u1").length));
  });
  it("preserves weak-area scope for customised exams", () => {
    expect(parseExamConfig(params({mode:"custom",scope:"weak",count:"12"})).scope).toBe("weak");
  });
  it("rejects non-pickable setup modes, including custom result retries", () => {
    expect(parsePickableExamMode("custom")).toBe("quick");
    expect(parsePickableExamMode("bogus")).toBe("quick");
    expect(parsePickableExamMode("unit")).toBe("unit");
  });

  it("uses mode-specific defaults for direct runner links", () => {
    expect(parseExamConfig(params({ mode: "full" })).count).toBe(50);
    expect(parseExamConfig(params({ mode: "unit", unit: "u1" })).count).toBe(15);
    expect(parseExamConfig(params()).label).toBe("Quick 20-question exam");
  });

  it("replaces malformed numeric values with safe defaults", () => {
    const parsed = parseExamConfig(
      params({ count: "banana", minutes: "Infinity", timed: "1" }),
    );
    expect(parsed.count).toBe(20);
    expect(parsed.seconds).toBe(20 * 60);
    expect(parsed.timed).toBe(true);
  });

  it("falls back from missing and unknown unit papers", () => {
    expect(parseExamConfig(params({ mode: "unit" })).mode).toBe("quick");
    expect(parseExamConfig(params({ mode: "unit", unit: "not-a-unit" })).mode).toBe(
      "quick",
    );
  });

  it("falls back when a real unit belongs to a different active course", () => {
    const parsed = parseExamConfig(params({ mode: "unit", unit: "u1", count: "15" }));
    const normalized = normalizeExamConfig(parsed, contentFor("nav"));
    expect(normalized.mode).toBe("quick");
    expect(normalized.unit).toBeUndefined();
    expect(normalized.count).toBe(15);
    expect(normalized.label).toBe("Quick 15-question exam");
  });

  it("caps a requested paper at the active course's available questions", () => {
    const content = contentFor("aero");
    const parsed = parseExamConfig(params({ count: "100" }));
    expect(normalizeExamConfig({ ...parsed, count: 1_000 }, content).count).toBe(
      content.questions.length,
    );
  });
});
