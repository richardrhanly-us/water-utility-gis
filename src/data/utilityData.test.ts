import { describe, expect, it } from "vitest";

import {
  hydrants,
  valves,
  waterMains,
  serviceZones,
} from "./utilityData";

describe("utilityData", () => {
  it("contains hydrants", () => {
    expect(hydrants.length).toBeGreaterThan(0);
  });

  it("contains valves", () => {
    expect(valves.length).toBeGreaterThan(0);
  });

  it("contains water mains", () => {
    expect(waterMains.length).toBeGreaterThan(0);
  });

  it("contains service zones", () => {
    expect(serviceZones.length).toBeGreaterThan(0);
  });

  it("gives every hydrant a unique asset ID", () => {
    const ids = hydrants.map((hydrant) => hydrant.assetId);

    expect(new Set(ids).size).toBe(ids.length);
  });

  it("gives every valve a unique asset ID", () => {
    const ids = valves.map((valve) => valve.assetId);

    expect(new Set(ids).size).toBe(ids.length);
  });

  it("gives every water main a unique asset ID", () => {
    const ids = waterMains.map((main) => main.assetId);

    expect(new Set(ids).size).toBe(ids.length);
  });

  it("gives every hydrant valid coordinates", () => {
    hydrants.forEach((hydrant) => {
      expect(hydrant.latitude).toBeGreaterThanOrEqual(-90);
      expect(hydrant.latitude).toBeLessThanOrEqual(90);

      expect(hydrant.longitude).toBeGreaterThanOrEqual(-180);
      expect(hydrant.longitude).toBeLessThanOrEqual(180);
    });
  });

  it("gives every valve valid coordinates", () => {
    valves.forEach((valve) => {
      expect(valve.latitude).toBeGreaterThanOrEqual(-90);
      expect(valve.latitude).toBeLessThanOrEqual(90);

      expect(valve.longitude).toBeGreaterThanOrEqual(-180);
      expect(valve.longitude).toBeLessThanOrEqual(180);
    });
  });

  it("gives every water main at least one valid path", () => {
    waterMains.forEach((main) => {
      expect(main.paths.length).toBeGreaterThan(0);
      expect(main.paths[0].length).toBeGreaterThan(1);
    });
  });

  it("gives every service zone a polygon ring", () => {
    serviceZones.forEach((zone) => {
      expect(zone.rings.length).toBeGreaterThan(0);
      expect(zone.rings[0].length).toBeGreaterThanOrEqual(4);
    });
  });

  it("uses expected water-main conditions", () => {
    const validConditions = ["Good", "Fair", "Poor"];

    waterMains.forEach((main) => {
      expect(validConditions).toContain(main.condition);
    });
  });

  it("uses expected water-main materials", () => {
    const validMaterials = [
      "PVC",
      "Ductile Iron",
      "Cast Iron",
    ];

    waterMains.forEach((main) => {
      expect(validMaterials).toContain(main.material);
    });
  });
});