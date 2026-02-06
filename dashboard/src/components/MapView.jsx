import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet-draw";

const GROUP_COLORS = [
  "#dc2626", "#0ea5e9", "#10b981", "#f59e0b", "#ef4444",
  "#ec4899", "#14b8a6", "#6366f1", "#d97706", "#8b5cf6",
];

export default function MapView({ farms, selectedFarmId, onPolygonDrawn, onFarmSelect }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const drawnItemsRef = useRef(null);
  const farmLayersRef = useRef(new Map());
  const onFarmSelectRef = useRef(onFarmSelect);

  useEffect(() => {
    onFarmSelectRef.current = onFarmSelect;
  });

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
          shapeOptions: { color: "#dc2626", weight: 2, fillColor: "#dc2626", fillOpacity: 0.15 },
        },
        polyline: false,
        circle: false,
        rectangle: false,
        marker: false,
        circlemarker: false,
      },
      edit: false,
    });

    map.addControl(drawControl);

    map.on(L.Draw.Event.CREATED, (e) => {
      const layer = e.layer;
      const coords = layer.getLatLngs()[0].map((ll) => ({ lat: ll.lat, lng: ll.lng }));
      onPolygonDrawn(coords);
    });

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
      farmLayersRef.current = new Map();
    };
  }, []);

  // Render farm polygons
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const existingIds = new Set(farms.map((f) => f.id));

    farmLayersRef.current.forEach((layerGroup, id) => {
      if (!existingIds.has(id)) {
        map.removeLayer(layerGroup);
        farmLayersRef.current.delete(id);
      }
    });

    const groups = [...new Set(farms.map((f) => f.group))];
    const groupColorMap = {};
    groups.forEach((g, i) => {
      groupColorMap[g] = GROUP_COLORS[i % GROUP_COLORS.length];
    });

    farms.forEach((farm) => {
      const color = groupColorMap[farm.group] || "#dc2626";
      const isSelected = farm.id === selectedFarmId;

      if (farmLayersRef.current.has(farm.id)) {
        const lg = farmLayersRef.current.get(farm.id);
        lg.eachLayer((layer) => {
          if (layer.setStyle) {
            layer.setStyle({
              color: isSelected ? "#ffffff" : color,
              weight: isSelected ? 3 : 2,
              fillColor: color,
              fillOpacity: isSelected ? 0.3 : 0.15,
            });
          }
        });
        return;
      }

      const layerGroup = new L.FeatureGroup();
      const latlngs = farm.coords.map((c) => [c.lat, c.lng]);
      const polygon = L.polygon(latlngs, {
        color: isSelected ? "#ffffff" : color,
        weight: isSelected ? 3 : 2,
        fillColor: color,
        fillOpacity: isSelected ? 0.3 : 0.15,
      });

      polygon.on("click", () => onFarmSelectRef.current(farm.id));

      const center = polygon.getBounds().getCenter();
      const label = L.marker(center, {
        icon: L.divIcon({
          className: "farm-label",
          html: `<div style="
            background: rgba(255,255,255,0.92);
            backdrop-filter: blur(4px);
            color: #1e1b3a;
            font-size: 16px;
            font-weight: 700;
            padding: 4px 12px;
            border-radius: 8px;
            border: 2px solid ${color};
            white-space: nowrap;
            pointer-events: none;
            box-shadow: 0 2px 8px rgba(0,0,0,0.15);
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

    // Fit bounds whenever farms are rendered (including on remount)
    if (farms.length > 0) {
      const bounds = L.latLngBounds([]);
      farms.forEach((farm) => {
        farm.coords.forEach((c) => bounds.extend([c.lat, c.lng]));
      });
      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
      }
    }
  }, [farms, selectedFarmId]);

  return (
    <div className="relative h-full w-full">
      <div ref={mapRef} className="h-full w-full rounded-2xl" />
      <div className="absolute top-4 left-4 z-[1000] bg-white/90 backdrop-blur-sm rounded-xl px-4 py-3 text-base text-gray-500 font-medium shadow-sm border border-gray-200">
        Draw polygons to add farm sites
      </div>
    </div>
  );
}
