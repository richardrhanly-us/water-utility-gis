import { describe, expect, it } from "vitest";

import { matchesWaterMainFilters } from "./filterWaterMains";

const castIronMain = {
  status: "Inspection Due",
  material: "Cast Iron",
  condition: "Poor",
  installYear: 1987,
};

const pvcMain = {
  status: "Active",
  material: "PVC",
  condition: "Good",
  installYear: 2018,
};

describe("matchesWaterMainFilters", () => {
  it("matches when all filters are set to all", () => {
    expect(
      matchesWaterMainFilters(castIronMain, {
        statusFilter: "all",
        materialFilter: "all",
        conditionFilter: "all",
        installYearFilter: "all",
      }),
    ).toBe(true);
  });

  it("matches Cast Iron material", () => {
    expect(
      matchesWaterMainFilters(castIronMain, {
        statusFilter: "all",
        materialFilter: "Cast Iron",
        conditionFilter: "all",
        installYearFilter: "all",
      }),
    ).toBe(true);
  });

  it("rejects a material mismatch", () => {
    expect(
      matchesWaterMainFilters(castIronMain, {
        statusFilter: "all",
        materialFilter: "PVC",
        conditionFilter: "all",
        installYearFilter: "all",
      }),
    ).toBe(false);
  });

  it("matches poor condition", () => {
    expect(
      matchesWaterMainFilters(castIronMain, {
        statusFilter: "all",
        materialFilter: "all",
        conditionFilter: "Poor",
        installYearFilter: "all",
      }),
    ).toBe(true);
  });

  it("matches mains installed before 2000", () => {
    expect(
      matchesWaterMainFilters(castIronMain, {
        statusFilter: "all",
        materialFilter: "all",
        conditionFilter: "all",
        installYearFilter: "before-2000",
      }),
    ).toBe(true);
  });

  it("matches mains installed from 2010 through 2019", () => {
    expect(
      matchesWaterMainFilters(pvcMain, {
        statusFilter: "all",
        materialFilter: "all",
        conditionFilter: "all",
        installYearFilter: "2010-2019",
      }),
    ).toBe(true);
  });

  it("handles combined filters", () => {
    expect(
      matchesWaterMainFilters(castIronMain, {
        statusFilter: "Inspection Due",
        materialFilter: "Cast Iron",
        conditionFilter: "Poor",
        installYearFilter: "before-2000",
      }),
    ).toBe(true);
  });

  it("fails when one combined filter does not match", () => {
    expect(
      matchesWaterMainFilters(castIronMain, {
        statusFilter: "Inspection Due",
        materialFilter: "Cast Iron",
        conditionFilter: "Good",
        installYearFilter: "before-2000",
      }),
    ).toBe(false);
  });
});