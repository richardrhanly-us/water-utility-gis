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

import {
  hydrants,
  valves,
  waterMains,
  serviceZones,
} from "./data/utilityData";

type NearbyAsset = {
  assetId: string;
  assetType: string;
  status: string;
};

function App() {
  const mapDiv = useRef<HTMLDivElement | null>(null);

  const [assetFilter, setAssetFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedMainId, setSelectedMainId] = useState<string | null>(null);
  const [bufferDistance, setBufferDistance] = useState(500);
  const [nearbyAssets, setNearbyAssets] = useState<NearbyAsset[]>([]);

  const hydrantLayerRef = useRef<GraphicsLayer | null>(null);
  const valveLayerRef = useRef<GraphicsLayer | null>(null);
  const waterMainLayerRef = useRef<GraphicsLayer | null>(null);
  const resultsLayerRef = useRef<GraphicsLayer | null>(null);

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

    const map = new Map({
      basemap: "streets-navigation-vector",
      layers: [
        serviceZoneLayer,
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

      const waterMainHit = response.results.find(
        (result) =>
          result.type === "graphic" &&
          result.graphic.layer === waterMainLayer
      );

      if (waterMainHit && waterMainHit.type === "graphic") {
        const selectedGraphic = waterMainHit.graphic;

        selectedWaterMainRef.current = selectedGraphic;

        setSelectedMainId(
          selectedGraphic.attributes?.assetId ?? null
        );

        setNearbyAssets([]);
        resultsLayer.removeAll();
      }
    });

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
        })
    );

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
        })
    );

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
        })
    );

    const serviceZoneGraphics = serviceZones.map(
      (zone) =>
        new Graphic({
          geometry: new Polygon({
            rings: zone.rings,
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
        })
    );

    serviceZoneLayer.addMany(serviceZoneGraphics);
    waterMainLayer.addMany(waterMainGraphics);
    hydrantLayer.addMany(hydrantGraphics);
    valveLayer.addMany(valveGraphics);

    return () => {
      clickHandler.remove();
      view.destroy();

      selectedWaterMainRef.current = null;
      waterMainLayerRef.current = null;
      hydrantLayerRef.current = null;
      valveLayerRef.current = null;
      resultsLayerRef.current = null;
    };
  }, []);

  useEffect(() => {
    const hydrantLayer = hydrantLayerRef.current;
    const valveLayer = valveLayerRef.current;
    const waterMainLayer = waterMainLayerRef.current;

    if (!hydrantLayer || !valveLayer || !waterMainLayer) {
      return;
    }

    hydrantLayer.visible =
      assetFilter === "all" || assetFilter === "hydrants";

    valveLayer.visible =
      assetFilter === "all" || assetFilter === "valves";

    waterMainLayer.visible =
      assetFilter === "all" || assetFilter === "water-mains";

    const applyStatusFilter = (layer: GraphicsLayer) => {
      layer.graphics.forEach((graphic) => {
        if (statusFilter === "all") {
          graphic.visible = true;
        } else {
          graphic.visible =
            graphic.attributes?.status === statusFilter;
        }
      });
    };

    applyStatusFilter(hydrantLayer);
    applyStatusFilter(valveLayer);
    applyStatusFilter(waterMainLayer);
  }, [assetFilter, statusFilter]);

  const findNearbyAssets = async () => {
    const selectedMain = selectedWaterMainRef.current;
    const hydrantLayer = hydrantLayerRef.current;
    const valveLayer = valveLayerRef.current;
    const resultsLayer = resultsLayerRef.current;

    if (
      !selectedMain ||
      !selectedMain.geometry ||
      !hydrantLayer ||
      !valveLayer ||
      !resultsLayer
    ) {
      return;
    }

    resultsLayer.removeAll();

    if (!geodesicBufferOperator.isLoaded()) {
      await geodesicBufferOperator.load();
    }

    const bufferGeometry = geodesicBufferOperator.execute(
      selectedMain.geometry,
      bufferDistance,
      {
        unit: "feet",
      }
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

    const candidateAssets = [
      ...hydrantLayer.graphics.toArray(),
      ...valveLayer.graphics.toArray(),
    ];

    const intersectingAssets = candidateAssets.filter((graphic) => {
      if (!graphic.geometry) {
        return false;
      }

      return intersectsOperator.execute(
        bufferGeometry,
        graphic.geometry
      );
    });

    const resultAssets: NearbyAsset[] =
      intersectingAssets.map((graphic) => ({
        assetId:
          graphic.attributes?.assetId ?? "Unknown",
        assetType:
          graphic.attributes?.assetType ?? "Unknown",
        status:
          graphic.attributes?.status ?? "Unknown",
      }));

    setNearbyAssets(resultAssets);

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
          boxShadow:
            "0 2px 8px rgba(0,0,0,0.25)",
          minWidth: "200px",
        }}
      >
        <div>
          <strong>Asset Type</strong>
        </div>

        <select
          value={assetFilter}
          onChange={(e) =>
            setAssetFilter(e.target.value)
          }
        >
          <option value="all">All Assets</option>
          <option value="hydrants">Hydrants</option>
          <option value="valves">Valves</option>
          <option value="water-mains">
            Water Mains
          </option>
        </select>

        <div style={{ marginTop: "10px" }}>
          <strong>Status</strong>
        </div>

        <select
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(e.target.value)
          }
        >
          <option value="all">All Statuses</option>
          <option value="Active">Active</option>
          <option value="Open">Open</option>
          <option value="Inspection Due">
            Inspection Due
          </option>
          <option value="Maintenance Due">
            Maintenance Due
          </option>
        </select>

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
            onChange={(e) =>
              setBufferDistance(
                Number(e.target.value)
              )
            }
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
              cursor: selectedMainId
                ? "pointer"
                : "not-allowed",
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
              <div style={{ marginTop: "6px" }}>
                No results yet
              </div>
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
                      <strong>
                        {asset.assetId}
                      </strong>
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