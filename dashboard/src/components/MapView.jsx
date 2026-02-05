import { useEffect, useRef, useCallback } from "react";
import L from "leaflet";
import "leaflet-draw";

const GROUP_COLORS = [
  "#3b82f6", "#22c55e", "#f59e0b", "#ef4444", "#a78bfa",
  "#ec4899", "#14b8a6", "#0ea5e9", "#d97706", "#6366f1",
];

export default function MapView({ farms, selectedFarmId, onPolygonDrawn, onFarmSelect }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const drawnItemsRef = useRef(null);
  const farmLayersRef = useRef(new Map());

  useEffect(() => {
    if (mapInstanceRef.current) return;

    const map = L.map(mapRef.current, {
      center: [20, 0],
      zoom: 3,
      zoomControl: true,
      attributionControl: false,
    });

    const satellite = L.tileLayer(
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      { maxZoom: 19, attribution: "&copy; Esri" }
    );

    const labels = L.tileLayer(
      "https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}",
      { maxZoom: 19, attribution: "&copy; Esri" }
    );

    satellite.addTo(map);
    labels.addTo(map);

    const drawnItems = new L.FeatureGroup();
    map.addLayer(drawnItems);
    drawnItemsRef.current = drawnItems;

    const drawControl = new L.Control.Draw({
      position: "topright",
      draw: {
        polygon: {
          allowIntersection: false,
          shapeOptions: {
            color: "#3b82f6",
            weight: 2,
            fillColor: "#3b82f6",
            fillOpacity: 0.15,
          },
        },
        polyline: false,
        circle: false,
        rectangle: {
          shapeOptions: {
            color: "#3b82f6",
            weight: 2,
            fillColor: "#3b82f6",
            fillOpacity: 0.15,
          },
        },
        marker: false,
        circlemarker: false,
      },
      edit: false,
    });

    map.addControl(drawControl);

    map.on(L.Draw.Event.CREATED, (e) => {
      const layer = e.layer;
      const coords = layer.getLatLngs()[0].map((ll) => ({
        lat: ll.lat,
        lng: ll.lng,
      }));
      onPolygonDrawn(coords);
    });

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Sync farm polygons onto the map
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const existingIds = new Set(farms.map((f) => f.id));

    // Remove layers for deleted farms
    farmLayersRef.current.forEach((layerGroup, id) => {
      if (!existingIds.has(id)) {
        map.removeLayer(layerGroup);
        farmLayersRef.current.delete(id);
      }
    });

    // Build a map of group -> color index
    const groups = [...new Set(farms.map((f) => f.group))];
    const groupColorMap = {};
    groups.forEach((g, i) => {
      groupColorMap[g] = GROUP_COLORS[i % GROUP_COLORS.length];
    });

    farms.forEach((farm) => {
      const color = groupColorMap[farm.group] || "#3b82f6";
      const isSelected = farm.id === selectedFarmId;

      if (farmLayersRef.current.has(farm.id)) {
        // Update style for selection changes
        const lg = farmLayersRef.current.get(farm.id);
        lg.eachLayer((layer) => {
          if (layer.setStyle) {
            layer.setStyle({
              color: isSelected ? "#ffffff" : color,
              weight: isSelected ? 3 : 2,
              fillColor: color,
              fillOpacity: isSelected ? 0.25 : 0.12,
            });
          }
        });
        return;
      }

      // Create new layer group for this farm
      const layerGroup = new L.FeatureGroup();

      const latlngs = farm.coords.map((c) => [c.lat, c.lng]);
      const polygon = L.polygon(latlngs, {
        color: isSelected ? "#ffffff" : color,
        weight: isSelected ? 3 : 2,
        fillColor: color,
        fillOpacity: isSelected ? 0.25 : 0.12,
      });

      polygon.on("click", () => onFarmSelect(farm.id));

      // Label
      const center = polygon.getBounds().getCenter();
      const label = L.marker(center, {
        icon: L.divIcon({
          className: "farm-label",
          html: `<div style="
            background: rgba(15,23,42,0.85);
            backdrop-filter: blur(4px);
            color: #e2e8f0;
            font-size: 11px;
            font-weight: 600;
            padding: 2px 8px;
            border-radius: 4px;
            border: 1px solid ${color};
            white-space: nowrap;
            pointer-events: none;
          ">${farm.name}</div>`,
          iconSize: null,
          iconAnchor: [0, 0],
        }),
        interactive: false,
      });

      layerGroup.addLayer(polygon);
      layerGroup.addLayer(label);
      layerGroup.addTo(map);
      farmLayersRef.current.set(farm.id, layerGroup);
    });
  }, [farms, selectedFarmId]);

  return (
    <div className="relative h-full w-full">
      <div ref={mapRef} className="h-full w-full rounded-xl" />
      <div className="absolute top-3 left-3 z-[1000] bg-slate-800/90 backdrop-blur-sm rounded-lg px-3 py-2 text-xs text-slate-300 border border-slate-700">
        Draw polygons to add farm sites to your portfolio
      </div>
    </div>
  );
}
