import "@arcgis/core/assets/esri/themes/light/main.css";

import { useEffect, useRef, useState } from "react";

import Map from "@arcgis/core/Map";
import MapView from "@arcgis/core/views/MapView";
import GraphicsLayer from "@arcgis/core/layers/GraphicsLayer";
import Graphic from "@arcgis/core/Graphic";

import Point from "@arcgis/core/geometry/Point";
import Polyline from "@arcgis/core/geometry/Polyline";
import Polygon from "@arcgis/core/geometry/Polygon";

import LayerList from "@arcgis/core/widgets/LayerList";

import * as geodesicBufferOperator from "@arcgis/core/geometry/operators/geodesicBufferOperator";
import * as intersectsOperator from "@arcgis/core/geometry/operators/intersectsOperator";

import { matchesWaterMainFilters } from "./utils/filterWaterMains";
import FeatureLayer from "@arcgis/core/layers/FeatureLayer";

type HydrantApi = {
  assetId: string;
  longitude: number;
  latitude: number;
  status: string;
  inspectionDate: string;
  flowRatingGpm: number;
};

type ValveApi = {
  assetId: string;
  longitude: number;
  latitude: number;
  valveType: string;
  status: string;
  installYear: number;
};

type WaterMainApi = {
  assetId: string;
  paths: number[][][];
  diameter: number;
  material: string;
  installYear: number;
  condition: string;
  status: string;
};

type ServiceZoneApi = {
  zoneId: string;
  zoneName: string;
  status: string;
  rings: number[][][];
};

type NearbyAsset = {
  assetId: string;
  assetType: string;
  status: string;
  source?: "simulated" | "public";
};

type SelectedAsset = {
  assetId: string;
  assetType: string;
  status: string;
  material?: string;
  condition?: string;
  installYear?: number;
  valveType?: string;
  inspectionDate?: string;
  flowRatingGpm?: number;
};

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

function App() {
  const mapDiv = useRef<HTMLDivElement | null>(null);

  const [assetFilter, setAssetFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedMainId, setSelectedMainId] = useState<string | null>(null);
  const [selectedAsset, setSelectedAsset] = useState<SelectedAsset | null>(
    null,
  );
  const [materialFilter, setMaterialFilter] = useState("all");
  const [conditionFilter, setConditionFilter] = useState("all");
  const [installYearFilter, setInstallYearFilter] = useState("all");
  const [bufferDistance, setBufferDistance] = useState(500);
  const [nearbyAssets, setNearbyAssets] = useState<NearbyAsset[]>([]);

  const hydrantLayerRef = useRef<GraphicsLayer | null>(null);
  const valveLayerRef = useRef<GraphicsLayer | null>(null);
  const waterMainLayerRef = useRef<GraphicsLayer | null>(null);
  const resultsLayerRef = useRef<GraphicsLayer | null>(null);
  const stormwaterLayerRef = useRef<FeatureLayer | null>(null);

  const selectedWaterMainRef = useRef<Graphic | null>(null);

  useEffect(() => {
    if (!mapDiv.current) {
      return;
    }

    const serviceZoneLayer = new GraphicsLayer({
      title: "Service Zones",
    });

    const waterMainLayer = new GraphicsLayer({
      title: "Water Mains",
    });

    const hydrantLayer = new GraphicsLayer({
      title: "Hydrants",
    });

    const valveLayer = new GraphicsLayer({
      title: "Valves",
    });

    const resultsLayer = new GraphicsLayer({
      title: "Spatial Analysis Results",
    });

    waterMainLayerRef.current = waterMainLayer;
    hydrantLayerRef.current = hydrantLayer;
    valveLayerRef.current = valveLayer;
    resultsLayerRef.current = resultsLayer;

    const stormwaterLayer = new FeatureLayer({
      url: "https://services.arcgis.com/g1fRTDLeMgspWrYp/arcgis/rest/services/StormwaterUnderground/FeatureServer/0",
      title: "San Antonio Stormwater Underground",
      outFields: ["*"],
      visible: true,

      renderer: {
        type: "simple",
        symbol: {
          type: "simple-line",
          color: "#00a6c8",
          width: 2,
        },
      },

      popupTemplate: {
        title: "{MSAG_Name}",
        content: [
          {
            type: "fields",
            fieldInfos: [
              {
                fieldName: "StructureType",
                label: "Structure Type",
              },
              {
                fieldName: "Material",
                label: "Material",
              },
              {
                fieldName: "Diameter_Inches",
                label: "Diameter (in)",
              },
              {
                fieldName: "YearConstructed",
                label: "Year Constructed",
              },
              {
                fieldName: "Status",
                label: "Status",
              },
              {
                fieldName: "ConditionScore",
                label: "Condition Score",
              },
              {
                fieldName: "MaintenanceResponsibility",
                label: "Maintenance Responsibility",
              },
            ],
          },
        ],
      },
    });

    stormwaterLayerRef.current = stormwaterLayer;

    const map = new Map({
      basemap: "streets-navigation-vector",
      layers: [
        serviceZoneLayer,
        stormwaterLayer,
        waterMainLayer,
        hydrantLayer,
        valveLayer,
        resultsLayer,
      ],
    });

    const view = new MapView({
      container: mapDiv.current,
      map,
      center: [-98.4936, 29.4241],
      zoom: 13,
    });

    const layerList = new LayerList({
      view,
    });

    view.ui.add(layerList, "top-right");

    const clickHandler = view.on("click", async (event) => {
      const response = await view.hitTest(event);

      const graphicHit = response.results.find(
        (result) =>
          result.type === "graphic" &&
          (result.graphic.layer === waterMainLayer ||
            result.graphic.layer === hydrantLayer ||
            result.graphic.layer === valveLayer),
      );

      if (!graphicHit || graphicHit.type !== "graphic") {
        return;
      }

      const graphic = graphicHit.graphic;
      const attributes = graphic.attributes;

      setSelectedAsset({
        assetId: attributes?.assetId ?? "Unknown",
        assetType: attributes?.assetType ?? "Unknown",
        status: attributes?.status ?? "Unknown",
        material: attributes?.material,
        condition: attributes?.condition,
        installYear: attributes?.installYear,
        valveType: attributes?.valveType,
        inspectionDate: attributes?.inspectionDate,
        flowRatingGpm: attributes?.flowRatingGpm,
      });

      if (graphic.layer === waterMainLayer) {
        selectedWaterMainRef.current = graphic;

        setSelectedMainId(attributes?.assetId ?? null);
      } else {
        selectedWaterMainRef.current = null;
        setSelectedMainId(null);
      }

      setNearbyAssets([]);
      resultsLayer.removeAll();
    });

    const loadHydrants = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/hydrants`);

        if (!response.ok) {
          throw new Error(`Failed to load hydrants: ${response.status}`);
        }

        const hydrants: HydrantApi[] = await response.json();

        const hydrantGraphics = hydrants.map(
          (hydrant) =>
            new Graphic({
              geometry: new Point({
                longitude: hydrant.longitude,
                latitude: hydrant.latitude,
              }),
              symbol: {
                type: "simple-marker",
                color: "red",
                size: 10,
                outline: {
                  color: "white",
                  width: 1,
                },
              },
              attributes: {
                assetId: hydrant.assetId,
                assetType: "Hydrant",
                status: hydrant.status,
                inspectionDate: hydrant.inspectionDate,
                flowRatingGpm: hydrant.flowRatingGpm,
              },
              popupTemplate: {
                title: "{assetId}",
                content: [
                  {
                    type: "fields",
                    fieldInfos: [
                      {
                        fieldName: "assetType",
                        label: "Asset Type",
                      },
                      {
                        fieldName: "status",
                        label: "Status",
                      },
                      {
                        fieldName: "inspectionDate",
                        label: "Inspection Date",
                      },
                      {
                        fieldName: "flowRatingGpm",
                        label: "Flow Rating (GPM)",
                      },
                    ],
                  },
                ],
              },
            }),
        );

        hydrantLayer.addMany(hydrantGraphics);
      } catch (error) {
        console.error("Unable to load hydrants from API:", error);
      }
    };

    void loadHydrants();

    const loadValves = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/valves`);

        if (!response.ok) {
          throw new Error(`Failed to load valves: ${response.status}`);
        }

        const valves: ValveApi[] = await response.json();

        const valveGraphics = valves.map(
          (valve) =>
            new Graphic({
              geometry: new Point({
                longitude: valve.longitude,
                latitude: valve.latitude,
              }),
              symbol: {
                type: "simple-marker",
                color: "orange",
                size: 9,
                outline: {
                  color: "white",
                  width: 1,
                },
              },
              attributes: {
                assetId: valve.assetId,
                assetType: "Valve",
                valveType: valve.valveType,
                status: valve.status,
                installYear: valve.installYear,
              },
              popupTemplate: {
                title: "{assetId}",
                content: [
                  {
                    type: "fields",
                    fieldInfos: [
                      {
                        fieldName: "assetType",
                        label: "Asset Type",
                      },
                      {
                        fieldName: "valveType",
                        label: "Valve Type",
                      },
                      {
                        fieldName: "status",
                        label: "Status",
                      },
                      {
                        fieldName: "installYear",
                        label: "Install Year",
                      },
                    ],
                  },
                ],
              },
            }),
        );

        valveLayer.addMany(valveGraphics);
      } catch (error) {
        console.error("Unable to load valves from API:", error);
      }
    };

    void loadValves();

    const loadWaterMains = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/water-mains`);

        if (!response.ok) {
          throw new Error(`Failed to load water mains: ${response.status}`);
        }

        const waterMains: WaterMainApi[] = await response.json();

        const waterMainGraphics = waterMains.map(
          (main) =>
            new Graphic({
              geometry: new Polyline({
                paths: main.paths,
                spatialReference: {
                  wkid: 4326,
                },
              }),
              symbol: {
                type: "simple-line",
                color: "blue",
                width: 4,
              },
              attributes: {
                assetId: main.assetId,
                assetType: "Water Main",
                diameter: main.diameter,
                material: main.material,
                installYear: main.installYear,
                condition: main.condition,
                status: main.status,
              },
              popupTemplate: {
                title: "{assetId}",
                content: [
                  {
                    type: "fields",
                    fieldInfos: [
                      {
                        fieldName: "assetType",
                        label: "Asset Type",
                      },
                      {
                        fieldName: "diameter",
                        label: "Diameter",
                      },
                      {
                        fieldName: "material",
                        label: "Material",
                      },
                      {
                        fieldName: "installYear",
                        label: "Install Year",
                      },
                      {
                        fieldName: "condition",
                        label: "Condition",
                      },
                      {
                        fieldName: "status",
                        label: "Status",
                      },
                    ],
                  },
                ],
              },
            }),
        );

        waterMainLayer.addMany(waterMainGraphics);
      } catch (error) {
        console.error("Unable to load water mains from API:", error);
      }
    };

    void loadWaterMains();

    const loadServiceZones = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/service-zones`,);

        if (!response.ok) {
          throw new Error(`Failed to load service zones: ${response.status}`);
        }

        const serviceZones: ServiceZoneApi[] = await response.json();

        const serviceZoneGraphics = serviceZones.map(
          (zone) =>
            new Graphic({
              geometry: new Polygon({
                rings: zone.rings,
                spatialReference: {
                  wkid: 4326,
                },
              }),
              symbol: {
                type: "simple-fill",
                color: [0, 120, 255, 0.12],
                outline: {
                  color: [0, 120, 255],
                  width: 2,
                },
              },
              attributes: {
                zoneId: zone.zoneId,
                zoneName: zone.zoneName,
                status: zone.status,
              },
              popupTemplate: {
                title: "{zoneName}",
                content: [
                  {
                    type: "fields",
                    fieldInfos: [
                      {
                        fieldName: "zoneId",
                        label: "Zone ID",
                      },
                      {
                        fieldName: "status",
                        label: "Status",
                      },
                    ],
                  },
                ],
              },
            }),
        );

        serviceZoneLayer.addMany(serviceZoneGraphics);
      } catch (error) {
        console.error("Unable to load service zones from API:", error);
      }
    };

    void loadServiceZones();

    return () => {
      clickHandler.remove();
      view.destroy();

      selectedWaterMainRef.current = null;
      waterMainLayerRef.current = null;
      hydrantLayerRef.current = null;
      valveLayerRef.current = null;
      resultsLayerRef.current = null;
      stormwaterLayerRef.current = null;
    };
  }, []);

  useEffect(() => {
    const hydrantLayer = hydrantLayerRef.current;
    const valveLayer = valveLayerRef.current;
    const waterMainLayer = waterMainLayerRef.current;

    if (!hydrantLayer || !valveLayer || !waterMainLayer) {
      return;
    }

    hydrantLayer.visible = assetFilter === "all" || assetFilter === "hydrants";

    valveLayer.visible = assetFilter === "all" || assetFilter === "valves";

    waterMainLayer.visible =
      assetFilter === "all" || assetFilter === "water-mains";

    hydrantLayer.graphics.forEach((graphic) => {
      if (statusFilter === "all") {
        graphic.visible = true;
      } else {
        graphic.visible = graphic.attributes?.status === statusFilter;
      }
    });

    valveLayer.graphics.forEach((graphic) => {
      if (statusFilter === "all") {
        graphic.visible = true;
      } else {
        graphic.visible = graphic.attributes?.status === statusFilter;
      }
    });

    waterMainLayer.graphics.forEach((graphic) => {
      graphic.visible = matchesWaterMainFilters(
        {
          status: graphic.attributes?.status,
          material: graphic.attributes?.material,
          condition: graphic.attributes?.condition,
          installYear: graphic.attributes?.installYear,
        },
        {
          statusFilter,
          materialFilter,
          conditionFilter,
          installYearFilter,
        },
      );
    });
  }, [
    assetFilter,
    statusFilter,
    materialFilter,
    conditionFilter,
    installYearFilter,
  ]);

  const findNearbyAssets = async () => {
    const selectedMain = selectedWaterMainRef.current;
    const hydrantLayer = hydrantLayerRef.current;
    const valveLayer = valveLayerRef.current;
    const resultsLayer = resultsLayerRef.current;
    const stormwaterLayer = stormwaterLayerRef.current;

    if (
      !selectedMain ||
      !hydrantLayer ||
      !valveLayer ||
      !resultsLayer ||
      !stormwaterLayer
    ) {
      return;
    }

    const selectedMainGeometry = selectedMain.geometry;

    if (!selectedMainGeometry) {
      return;
    }

    resultsLayer.removeAll();

    if (!geodesicBufferOperator.isLoaded()) {
      await geodesicBufferOperator.load();
    }

    const bufferGeometry = geodesicBufferOperator.execute(
      selectedMainGeometry,
      bufferDistance,
      {
        unit: "feet",
      },
    );

    if (!bufferGeometry) {
      return;
    }

    const bufferGraphic = new Graphic({
      geometry: bufferGeometry,
      symbol: {
        type: "simple-fill",
        color: [255, 215, 0, 0.18],
        outline: {
          color: [255, 140, 0, 0.9],
          width: 2,
        },
      },
    });

    resultsLayer.add(bufferGraphic);

    // Find simulated hydrants and valves inside the buffer.
    const candidateAssets = [
      ...hydrantLayer.graphics.toArray(),
      ...valveLayer.graphics.toArray(),
    ];

    const intersectingAssets = candidateAssets.filter((graphic) => {
      if (!graphic.geometry) {
        return false;
      }

      return intersectsOperator.execute(bufferGeometry, graphic.geometry);
    });

    const nearbySimulatedAssets: NearbyAsset[] = intersectingAssets.map(
      (graphic) => ({
        assetId: graphic.attributes?.assetId ?? "Unknown",
        assetType: graphic.attributes?.assetType ?? "Unknown",
        status: graphic.attributes?.status ?? "Unknown",
        source: "simulated",
      }),
    );

    // Query the live City of San Antonio stormwater FeatureLayer.
    const stormwaterQuery = stormwaterLayer.createQuery();

    stormwaterQuery.geometry = bufferGeometry;
    stormwaterQuery.spatialRelationship = "intersects";
    stormwaterQuery.returnGeometry = true;
    stormwaterQuery.outFields = [
      "OBJECTID",
      "StructureType",
      "Material",
      "Diameter_Inches",
      "YearConstructed",
      "Status",
      "ConditionScore",
    ];

    const stormwaterResults =
      await stormwaterLayer.queryFeatures(stormwaterQuery);

    const nearbyStormwaterAssets: NearbyAsset[] =
      stormwaterResults.features.map((feature) => ({
        assetId: `SW-${feature.attributes?.OBJECTID ?? "Unknown"}`,
        assetType:
          feature.attributes?.StructureType ?? "Stormwater Infrastructure",
        status: feature.attributes?.Status ?? "Unknown",
        source: "public",
      }));

    // Put simulated and public-service results into the same results panel.
    setNearbyAssets([...nearbySimulatedAssets, ...nearbyStormwaterAssets]);

    // Highlight nearby simulated hydrants and valves.
    intersectingAssets.forEach((graphic) => {
      if (!graphic.geometry) {
        return;
      }

      const highlightGraphic = new Graphic({
        geometry: graphic.geometry,
        symbol: {
          type: "simple-marker",
          color: "yellow",
          size: 16,
          outline: {
            color: "black",
            width: 2,
          },
        },
      });

      resultsLayer.add(highlightGraphic);
    });

    // Highlight stormwater lines returned by the live FeatureLayer query.
    stormwaterResults.features.forEach((feature) => {
      if (!feature.geometry) {
        return;
      }

      const stormwaterHighlight = new Graphic({
        geometry: feature.geometry,
        symbol: {
          type: "simple-line",
          color: "#ff00ff",
          width: 5,
        },
      });

      resultsLayer.add(stormwaterHighlight);
    });
  };

  const handleAssetFilterChange = (value: string) => {
    setAssetFilter(value);

    if (value === "hydrants" || value === "valves") {
      setMaterialFilter("all");
      setConditionFilter("all");
      setInstallYearFilter("all");
    }
  };

  const waterMainFiltersEnabled =
    assetFilter === "all" || assetFilter === "water-mains";

  const resetFilters = () => {
    setAssetFilter("all");
    setStatusFilter("all");
    setMaterialFilter("all");
    setConditionFilter("all");
    setInstallYearFilter("all");
    setBufferDistance(500);

    setSelectedMainId(null);
    setSelectedAsset(null);
    setNearbyAssets([]);

    selectedWaterMainRef.current = null;
    resultsLayerRef.current?.removeAll();
  };

  return (
    <div
      style={{
        height: "100vh",
        width: "100vw",
        position: "relative",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 15,
          left: 15,
          zIndex: 10,
          background: "white",
          padding: "12px",
          borderRadius: "6px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.25)",
          minWidth: "200px",
        }}
      >
        <div>
          <strong>Asset Type</strong>
        </div>

        <select
          value={assetFilter}
          onChange={(e) => handleAssetFilterChange(e.target.value)}
          style={{ width: "100%" }}
        >
          <option value="all">All Assets</option>
          <option value="hydrants">Hydrants</option>
          <option value="valves">Valves</option>
          <option value="water-mains">Water Mains</option>
        </select>

        <div style={{ marginTop: "10px" }}>
          <strong>Status</strong>
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">All Statuses</option>
          <option value="Active">Active</option>
          <option value="Open">Open</option>
          <option value="Inspection Due">Inspection Due</option>
          <option value="Maintenance Due">Maintenance Due</option>
        </select>
        <div style={{ marginTop: "10px" }}>
          <strong>Material</strong>
        </div>

        <select
          value={materialFilter}
          onChange={(e) => setMaterialFilter(e.target.value)}
          disabled={!waterMainFiltersEnabled}
          style={{
            width: "100%",
            opacity: waterMainFiltersEnabled ? 1 : 0.55,
            cursor: waterMainFiltersEnabled ? "pointer" : "not-allowed",
          }}
        >
          <option value="all">All Materials</option>
          <option value="PVC">PVC</option>
          <option value="Ductile Iron">Ductile Iron</option>
          <option value="Cast Iron">Cast Iron</option>
        </select>

        <div style={{ marginTop: "10px" }}>
          <strong>Condition</strong>
        </div>

        <select
          value={conditionFilter}
          onChange={(e) => setConditionFilter(e.target.value)}
          disabled={!waterMainFiltersEnabled}
          style={{
            width: "100%",
            opacity: waterMainFiltersEnabled ? 1 : 0.55,
            cursor: waterMainFiltersEnabled ? "pointer" : "not-allowed",
          }}
        >
          <option value="all">All Conditions</option>
          <option value="Good">Good</option>
          <option value="Fair">Fair</option>
          <option value="Poor">Poor</option>
        </select>

        <div style={{ marginTop: "10px" }}>
          <strong>Install Year</strong>
        </div>

        <select
          value={installYearFilter}
          onChange={(e) => setInstallYearFilter(e.target.value)}
          disabled={!waterMainFiltersEnabled}
          style={{
            width: "100%",
            opacity: waterMainFiltersEnabled ? 1 : 0.55,
            cursor: waterMainFiltersEnabled ? "pointer" : "not-allowed",
          }}
        >
          <option value="all">All Years</option>
          <option value="before-2000">Before 2000</option>
          <option value="2000-2009">2000–2009</option>
          <option value="2010-2019">2010–2019</option>
          <option value="2020-plus">2020+</option>
        </select>

        <button
          type="button"
          onClick={resetFilters}
          style={{
            marginTop: "12px",
            width: "100%",
            padding: "7px 10px",
            cursor: "pointer",
          }}
        >
          Reset Filters
        </button>

        {selectedAsset && (
          <div
            style={{
              marginTop: "14px",
              paddingTop: "12px",
              borderTop: "1px solid #ddd",
            }}
          >
            <div>
              <strong>Selected Asset</strong>
            </div>

            <div
              style={{
                marginTop: "8px",
                padding: "9px",
                border: "1px solid #ddd",
                borderRadius: "4px",
                background: "#f8f8f8",
              }}
            >
              <div>
                <strong>{selectedAsset.assetId}</strong>
              </div>

              <div style={{ marginTop: "4px", fontSize: "14px" }}>
                Type: {selectedAsset.assetType}
              </div>

              <div style={{ marginTop: "3px", fontSize: "14px" }}>
                Status: {selectedAsset.status}
              </div>

              {selectedAsset.material && (
                <div style={{ marginTop: "3px", fontSize: "14px" }}>
                  Material: {selectedAsset.material}
                </div>
              )}

              {selectedAsset.condition && (
                <div style={{ marginTop: "3px", fontSize: "14px" }}>
                  Condition: {selectedAsset.condition}
                </div>
              )}

              {selectedAsset.installYear !== undefined && (
                <div style={{ marginTop: "3px", fontSize: "14px" }}>
                  Installed: {selectedAsset.installYear}
                </div>
              )}

              {selectedAsset.valveType && (
                <div style={{ marginTop: "3px", fontSize: "14px" }}>
                  Valve Type: {selectedAsset.valveType}
                </div>
              )}

              {selectedAsset.inspectionDate && (
                <div style={{ marginTop: "3px", fontSize: "14px" }}>
                  Inspection Date: {selectedAsset.inspectionDate}
                </div>
              )}

              {selectedAsset.flowRatingGpm !== undefined && (
                <div style={{ marginTop: "3px", fontSize: "14px" }}>
                  Flow Rating: {selectedAsset.flowRatingGpm} GPM
                </div>
              )}
            </div>
          </div>
        )}

        <div
          style={{
            marginTop: "14px",
            paddingTop: "12px",
            borderTop: "1px solid #ddd",
          }}
        >
          <div>
            <strong>Selected Water Main</strong>
          </div>

          <div style={{ marginTop: "5px" }}>
            {selectedMainId ?? "None selected"}
          </div>

          <div style={{ marginTop: "10px" }}>
            <strong>Buffer Distance</strong>
          </div>

          <select
            value={bufferDistance}
            onChange={(e) => setBufferDistance(Number(e.target.value))}
            disabled={!selectedMainId}
            style={{
              marginTop: "5px",
              width: "100%",
            }}
          >
            <option value={250}>250 ft</option>
            <option value={500}>500 ft</option>
            <option value={1000}>1000 ft</option>
          </select>

          <button
            type="button"
            disabled={!selectedMainId}
            onClick={findNearbyAssets}
            style={{
              marginTop: "10px",
              width: "100%",
              padding: "7px 10px",
              cursor: selectedMainId ? "pointer" : "not-allowed",
            }}
          >
            Find Nearby Assets
          </button>
        </div>

        {selectedMainId && (
          <div
            style={{
              marginTop: "14px",
              paddingTop: "12px",
              borderTop: "1px solid #ddd",
            }}
          >
            <div>
              <strong>Nearby Assets</strong>
            </div>

            {nearbyAssets.length === 0 ? (
              <div style={{ marginTop: "6px" }}>No results yet</div>
            ) : (
              <>
                <div
                  style={{
                    marginTop: "6px",
                    marginBottom: "8px",
                    fontSize: "14px",
                  }}
                >
                  {nearbyAssets.length} found
                </div>

                {nearbyAssets.map((asset) => (
                  <div
                    key={asset.assetId}
                    style={{
                      marginTop: "8px",
                      padding: "8px",
                      border: "1px solid #ddd",
                      borderRadius: "4px",
                      background: "#f8f8f8",
                    }}
                  >
                    <div>
                      <strong>{asset.assetId}</strong>
                    </div>

                    <div
                      style={{
                        marginTop: "3px",
                        fontSize: "14px",
                      }}
                    >
                      {asset.assetType}
                    </div>

                    <div
                      style={{
                        marginTop: "2px",
                        fontSize: "13px",
                      }}
                    >
                      Status: {asset.status}
                    </div>

                    <div
                      style={{
                        marginTop: "2px",
                        fontSize: "12px",
                        color: "#666",
                      }}
                    >
                      Source:{" "}
                      {asset.source === "public"
                        ? "City of San Antonio"
                        : "Simulated Utility Data"}
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        )}
      </div>

      <div
        ref={mapDiv}
        style={{
          height: "100%",
          width: "100%",
        }}
      />
    </div>
  );
}

export default App;
