export const hydrants = [
  {
    assetId: "HYD-001",
    longitude: -98.4936,
    latitude: 29.4241,
    status: "Active",
    inspectionDate: "2026-03-12",
    flowRatingGpm: 1250,
  },
  {
    assetId: "HYD-002",
    longitude: -98.487,
    latitude: 29.428,
    status: "Inspection Due",
    inspectionDate: "2025-08-04",
    flowRatingGpm: 980,
  },
  {
    assetId: "HYD-003",
    longitude: -98.4902,
    latitude: 29.421,
    status: "Active",
    inspectionDate: "2026-01-19",
    flowRatingGpm: 1100,
  },
  {
    assetId: "HYD-004",
    longitude: -98.4848,
    latitude: 29.4255,
    status: "Active",
    inspectionDate: "2026-05-08",
    flowRatingGpm: 1400,
  },
  {
    assetId: "HYD-005",
    longitude: -98.499,
    latitude: 29.426,
    status: "Inspection Due",
    inspectionDate: "2025-07-15",
    flowRatingGpm: 900,
  },
];

export const valves = [
  {
    assetId: "VALVE-001",
    longitude: -98.4965,
    latitude: 29.423,
    valveType: "Gate Valve",
    status: "Open",
    installYear: 2016,
  },
  {
    assetId: "VALVE-002",
    longitude: -98.487,
    latitude: 29.428,
    valveType: "Butterfly Valve",
    status: "Open",
    installYear: 2019,
  },
  {
    assetId: "VALVE-003",
    longitude: -98.4905,
    latitude: 29.4205,
    valveType: "Gate Valve",
    status: "Open",
    installYear: 2011,
  },
  {
    assetId: "VALVE-004",
    longitude: -98.4848,
    latitude: 29.4255,
    valveType: "Gate Valve",
    status: "Maintenance Due",
    installYear: 2005,
  },
  {
    assetId: "VALVE-005",
    longitude: -98.499,
    latitude: 29.426,
    valveType: "Butterfly Valve",
    status: "Open",
    installYear: 2021,
  },
];

export const waterMains = [
  {
    assetId: "MAIN-001",
    paths: [
      [
        [-98.5005, 29.4205],
        [-98.4965, 29.423],
        [-98.4936, 29.4241],
        [-98.487, 29.428],
        [-98.4815, 29.431],
      ],
    ],
    diameter: "12 in",
    material: "PVC",
    installYear: 2014,
    condition: "Good",
    status: "Active",
  },
  {
    assetId: "MAIN-002",
    paths: [
      [
        [-98.4936, 29.4241],
        [-98.4905, 29.4205],
        [-98.4865, 29.4175],
      ],
    ],
    diameter: "8 in",
    material: "Ductile Iron",
    installYear: 2008,
    condition: "Fair",
    status: "Active",
  },
  {
    assetId: "MAIN-003",
    paths: [
      [
        [-98.4965, 29.423],
        [-98.499, 29.426],
        [-98.5015, 29.429],
      ],
    ],
    diameter: "10 in",
    material: "Cast Iron",
    installYear: 1987,
    condition: "Poor",
    status: "Inspection Due",
  },
  {
    assetId: "MAIN-004",
    paths: [
      [
        [-98.487, 29.428],
        [-98.4848, 29.4255],
        [-98.482, 29.423],
      ],
    ],
    diameter: "6 in",
    material: "PVC",
    installYear: 2018,
    condition: "Good",
    status: "Active",
  },
];

export const serviceZones = [
  {
    zoneId: "ZONE-01",
    zoneName: "Central Service Zone",
    status: "Normal",
    rings: [
      [
        [-98.505, 29.417],
        [-98.478, 29.417],
        [-98.478, 29.435],
        [-98.505, 29.435],
        [-98.505, 29.417],
      ],
    ],
  },
];