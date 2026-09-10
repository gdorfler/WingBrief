import { describe, expect, it } from "vitest";
import { contentFor, QUESTION_BY_ID } from "./index";
import { correctKey } from "@/lib/scoring";

describe("source audit regressions", () => {
  it("distinguishes an airborne return instruction from landing clearance", () => {
    const q = QUESTION_BY_ID["fq-f4-015"];
    expect(q.type).toBe("mcq");
    if (q.type !== "mcq") return;
    expect(q.options[q.answer]).toMatch(/await a steady green/);
    expect(q.options[q.answer]).not.toMatch(/immediately/);
    const course = JSON.stringify(contentFor("frr"));
    expect(course).not.toMatch(/flashing white (?:means|is|only means|says) return for landing/i);
  });

  it("assesses VFR alternatives without inventing a mandatory order", () => {
    const q = QUESTION_BY_ID["fq-f5-vfr-alternate"];
    expect(q.type).toBe("mcq");
    if (q.type !== "mcq") return;
    expect(q.options[q.answer]).toMatch(/Remain in VMC and land/);
    expect(q.options[q.answer]).not.toMatch(/mandatory order/);
    expect(correctKey(q)).toBeTruthy();
  });

  it("keeps trace in the icing scale and out of turbulence intensity", () => {
    const weather = contentFor("weather");
    const cards = weather.knowCold.filter(c => c.conceptIds.includes("wx-turbulence-intensity"));
    expect(cards.length).toBeGreaterThan(0);
    expect(cards.some(c => /Light → Moderate → Severe → Extreme/.test(c.body))).toBe(true);
    expect(cards.every(c => !/Trace → Light/.test(c.body))).toBe(true);
    expect(weather.concepts.some(c => c.relationships?.some(r => /Trace.*Light.*Moderate.*Severe/.test(r)))).toBe(true);
  });
});
