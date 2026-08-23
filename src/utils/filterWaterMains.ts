export type WaterMainFilterInput = {
  status: string;
  material: string;
  condition: string;
  installYear: number;
};

export type WaterMainFilters = {
  statusFilter: string;
  materialFilter: string;
  conditionFilter: string;
  installYearFilter: string;
};

export function matchesWaterMainFilters(
  main: WaterMainFilterInput,
  filters: WaterMainFilters,
): boolean {
  const matchesStatus =
    filters.statusFilter === "all" ||
    main.status === filters.statusFilter;

  const matchesMaterial =
    filters.materialFilter === "all" ||
    main.material === filters.materialFilter;

  const matchesCondition =
    filters.conditionFilter === "all" ||
    main.condition === filters.conditionFilter;

  const matchesInstallYear =
    filters.installYearFilter === "all" ||
    (filters.installYearFilter === "before-2000" &&
      main.installYear < 2000) ||
    (filters.installYearFilter === "2000-2009" &&
      main.installYear >= 2000 &&
      main.installYear <= 2009) ||
    (filters.installYearFilter === "2010-2019" &&
      main.installYear >= 2010 &&
      main.installYear <= 2019) ||
    (filters.installYearFilter === "2020-plus" &&
      main.installYear >= 2020);

  return (
    matchesStatus &&
    matchesMaterial &&
    matchesCondition &&
    matchesInstallYear
  );
}