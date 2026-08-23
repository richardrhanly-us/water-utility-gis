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

function App() {
  const mapDiv = useRef<HTMLDivElement | null>(null);

  const [assetFilter, setAssetFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const hydrantLayerRef = useRef<GraphicsLayer | null>(null);
  const valveLayerRef = useRef<GraphicsLayer | null>(null);
  const waterMainLayerRef = useRef<GraphicsLayer | null>(null);

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

    waterMainLayerRef.current = waterMainLayer;
    hydrantLayerRef.current = hydrantLayer;
    valveLayerRef.current = valveLayer;

    const map = new Map({
      basemap: "streets-navigation-vector",
      layers: [serviceZoneLayer, waterMainLayer, hydrantLayer, valveLayer],
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
    const hydrant1 = new Graphic({
      geometry: new Point({
        longitude: -98.4936,
        latitude: 29.4241,
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
        assetId: "HYD-001",
        assetType: "Hydrant",
        status: "Active",
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
            ],
          },
        ],
      },
    });

    const hydrant2 = new Graphic({
      geometry: new Point({
        longitude: -98.487,
        latitude: 29.428,
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
        assetId: "HYD-002",
        assetType: "Hydrant",
        status: "Inspection Due",
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
            ],
          },
        ],
      },
    });

    const valve1 = new Graphic({
      geometry: new Point({
        longitude: -98.4965,
        latitude: 29.423,
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
        assetId: "VALVE-001",
        assetType: "Valve",
        valveType: "Gate Valve",
        status: "Open",
        installYear: 2016,
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
    });

    const valve2 = new Graphic({
      geometry: new Point({
        longitude: -98.487,
        latitude: 29.428,
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
        assetId: "VALVE-002",
        assetType: "Valve",
        valveType: "Butterfly Valve",
        status: "Open",
        installYear: 2019,
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
    });

    const waterMain = new Graphic({
      geometry: new Polyline({
        paths: [
          [
            [-98.5005, 29.4205],
            [-98.4965, 29.423],
            [-98.4936, 29.4241],
            [-98.487, 29.428],
            [-98.4815, 29.431],
          ],
        ],
      }),
      symbol: {
        type: "simple-line",
        color: "blue",
        width: 4,
      },
      attributes: {
        assetId: "MAIN-001",
        assetType: "Water Main",
        diameter: "12 in",
        material: "PVC",
        status: "Active",
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
                fieldName: "status",
                label: "Status",
              },
            ],
          },
        ],
      },
    });

    const waterMain2 = new Graphic({
      geometry: new Polyline({
        paths: [
          [
            [-98.4936, 29.4241],
            [-98.4905, 29.4205],
            [-98.4865, 29.4175],
          ],
        ],
      }),
      symbol: {
        type: "simple-line",
        color: "blue",
        width: 3,
      },
      attributes: {
        assetId: "MAIN-002",
        assetType: "Water Main",
        diameter: "8 in",
        material: "Ductile Iron",
        status: "Active",
        installYear: 2008,
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
    });

    const serviceZone = new Graphic({
      geometry: new Polygon({
        rings: [
          [
            [-98.505, 29.417],
            [-98.478, 29.417],
            [-98.478, 29.435],
            [-98.505, 29.435],
            [-98.505, 29.417],
          ],
        ],
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
        zoneId: "ZONE-01",
        zoneName: "Central Service Zone",
        status: "Normal",
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
    });

    serviceZoneLayer.add(serviceZone);

    waterMainLayer.addMany([waterMain, waterMain2]);

    hydrantLayer.addMany([hydrant1, hydrant2]);

    valveLayer.addMany([valve1, valve2]);

    return () => {
      view.destroy();
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

    const applyStatusFilter = (layer: GraphicsLayer) => {
      layer.graphics.forEach((graphic) => {
        if (statusFilter === "all") {
          graphic.visible = true;
        } else {
          graphic.visible = graphic.attributes?.status === statusFilter;
        }
      });
    };

    applyStatusFilter(hydrantLayer);
    applyStatusFilter(valveLayer);
    applyStatusFilter(waterMainLayer);
  }, [assetFilter, statusFilter]);

  return (
    <div style={{ height: "100vh", width: "100vw", position: "relative" }}>
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
        }}
      >
        <div>
          <strong>Asset Type</strong>
        </div>

        <select
          value={assetFilter}
          onChange={(e) => setAssetFilter(e.target.value)}
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
        </select>
      </div>

      <div ref={mapDiv} style={{ height: "100%", width: "100%" }} />
    </div>
  );
}

export default App;
