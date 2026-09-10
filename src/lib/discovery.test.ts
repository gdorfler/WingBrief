import { describe, expect, it } from "vitest";
import { discoveryModel } from "./discovery";
import { MOTION_DISCOVERY_SCREENS } from "@/content/aero/lessons/motion-discovery";

describe("guided discovery models", () => {
  it("doubles moment at a fixed force when the perpendicular arm doubles", () => {
    expect(discoveryModel("moment", 2).moment / discoveryModel("moment", 1).moment).toBe(2);
  });
  it("halves density when fixed mass occupies twice the volume", () => {
    expect(discoveryModel("density", 2).density).toBe(.5);
  });
  it("conserves the air sample's mass at every slider step", () => {
    for (let step = 0; step <= 20; step++) {
      const model = discoveryModel("density", 1 + step * .05);
      expect(model.density * model.value).toBeCloseTo(1, 12);
      expect(model.complete).toBe(step === 20);
    }
  });
  it("returns density to its original value when the piston is reset", () => {
    expect(discoveryModel("density", 2).density).toBe(.5);
    expect(discoveryModel("density", 1).density).toBe(1);
    for (const invalid of [NaN, Infinity, -1]) {
      expect(discoveryModel("density", invalid).value).toBe(1);
      expect(discoveryModel("density", invalid).density).toBe(1);
    }
  });
  it("qualifies the density flight connection without changing other experiments", () => {
    const discoveries = MOTION_DISCOVERY_SCREENS.filter(screen => screen.kind === "discovery");
    const density = discoveries.find(screen => screen.experiment === "density")!;
    expect(density.flightConnection?.line).toContain("same true airspeed and lift coefficient");
    expect(density.flightConnection?.caveat).toContain("not an altitude model");
    expect(discoveries.filter(screen => screen.flightConnection)).toHaveLength(1);
  });
  it("increases gravitational potential energy without changing kinetic energy", () => {
    const result = discoveryModel("energy", 2);
    expect(result.potentialEnergy).toBe(2);
    expect(result.kineticEnergy).toBe(1);
  });
  it("requires exploring the target condition to finish each activity", () => {
    for (const id of ["moment", "density", "energy", "balance"] as const) {
      expect(discoveryModel(id, id === "balance" ? 0 : 1).complete).toBe(false);
      expect(discoveryModel(id, id === "balance" ? 1 : 2).complete).toBe(true);
      expect(discoveryModel(id, NaN).complete).toBe(false);
      expect(discoveryModel(id, -100).complete).toBe(false);
    }
  });
  it("keeps retrieval beside the exploration that prepares it", () => {
    for (const [index, screen] of MOTION_DISCOVERY_SCREENS.entries()) {
      if (screen.kind !== "discovery") continue;
      expect(screen.options[screen.answer]).toBeTruthy();
      expect(screen.options.length).toBe(new Set(screen.options).size);
      expect(MOTION_DISCOVERY_SCREENS[index+1].kind).toBe("question");
    }
  });
});
