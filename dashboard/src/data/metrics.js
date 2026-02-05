export const METRICS = [
  {
    id: "soil_moisture",
    name: "Soil Moisture Index",
    unit: "%",
    icon: "💧",
    color: "#3b82f6",
    description: "Volumetric water content in topsoil (0–30 cm)",
    riskThresholds: { low: 40, high: 80 },
    range: [0, 100],
  },
  {
    id: "ndvi",
    name: "NDVI",
    unit: "",
    icon: "🌿",
    color: "#22c55e",
    description: "Normalized Difference Vegetation Index — crop vigour",
    riskThresholds: { low: 0.3, high: 0.8 },
    range: [0, 1],
  },
  {
    id: "precipitation",
    name: "Precipitation",
    unit: "mm",
    icon: "🌧️",
    color: "#6366f1",
    description: "Monthly cumulative rainfall",
    riskThresholds: { low: 30, high: 200 },
    range: [0, 350],
  },
  {
    id: "temperature",
    name: "Temperature Extremes",
    unit: "°C",
    icon: "🌡️",
    color: "#ef4444",
    description: "Max daily temperature over the period",
    riskThresholds: { low: 10, high: 35 },
    range: [-10, 50],
  },
  {
    id: "evapotranspiration",
    name: "Evapotranspiration",
    unit: "mm/day",
    icon: "☀️",
    color: "#f59e0b",
    description: "Reference evapotranspiration rate (ET₀)",
    riskThresholds: { low: 2, high: 7 },
    range: [0, 12],
  },
  {
    id: "soil_carbon",
    name: "Soil Organic Carbon",
    unit: "%",
    icon: "🪨",
    color: "#a78bfa",
    description: "Organic carbon concentration in topsoil",
    riskThresholds: { low: 1, high: 4 },
    range: [0, 8],
  },
  {
    id: "wind_speed",
    name: "Wind Speed",
    unit: "km/h",
    icon: "💨",
    color: "#14b8a6",
    description: "Average wind speed — erosion & crop damage risk",
    riskThresholds: { low: 15, high: 40 },
    range: [0, 80],
  },
  {
    id: "flood_risk",
    name: "Flood Risk Index",
    unit: "",
    icon: "🌊",
    color: "#0ea5e9",
    description: "Composite flood susceptibility score (0–10)",
    riskThresholds: { low: 3, high: 7 },
    range: [0, 10],
  },
  {
    id: "drought_severity",
    name: "Drought Severity Index",
    unit: "",
    icon: "🏜️",
    color: "#d97706",
    description: "Palmer Drought Severity Index (PDSI)",
    riskThresholds: { low: -2, high: 2 },
    range: [-6, 6],
  },
  {
    id: "biodiversity",
    name: "Biodiversity Index",
    unit: "",
    icon: "🦋",
    color: "#ec4899",
    description: "Shannon diversity index for surrounding ecosystem",
    riskThresholds: { low: 1.5, high: 3.5 },
    range: [0, 5],
  },
];

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function seededRandom(seed) {
  let x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function generateValue(metric, seed) {
  const [min, max] = metric.range;
  const r = seededRandom(seed);
  return +(min + r * (max - min)).toFixed(2);
}

export function generateMetricsForRegion(polygonCoords) {
  if (!polygonCoords || polygonCoords.length === 0) return null;

  const centroidLat =
    polygonCoords.reduce((s, p) => s + p.lat, 0) / polygonCoords.length;
  const centroidLng =
    polygonCoords.reduce((s, p) => s + p.lng, 0) / polygonCoords.length;
  const seed = Math.abs(centroidLat * 1000 + centroidLng * 1000);

  const current = {};
  const timeSeries = {};

  METRICS.forEach((metric, mi) => {
    const val = generateValue(metric, seed + mi * 7);
    current[metric.id] = val;

    timeSeries[metric.id] = MONTHS.map((month, i) => ({
      month,
      value: generateValue(metric, seed + mi * 7 + i * 13),
    }));
  });

  return {
    centroid: { lat: +centroidLat.toFixed(4), lng: +centroidLng.toFixed(4) },
    area: computeArea(polygonCoords),
    current,
    timeSeries,
  };
}

function computeArea(coords) {
  if (coords.length < 3) return 0;
  let area = 0;
  for (let i = 0; i < coords.length; i++) {
    const j = (i + 1) % coords.length;
    area += coords[i].lng * coords[j].lat;
    area -= coords[j].lng * coords[i].lat;
  }
  area = Math.abs(area) / 2;
  const kmPerDegree = 111;
  const areaKm2 = area * kmPerDegree * kmPerDegree;
  return +areaKm2.toFixed(2);
}

export function getRiskLevel(metric, value) {
  const { riskThresholds } = metric;
  if (metric.id === "drought_severity") {
    if (value < riskThresholds.low) return "high";
    if (value > riskThresholds.high) return "low";
    return "moderate";
  }
  if (
    metric.id === "temperature" ||
    metric.id === "wind_speed" ||
    metric.id === "flood_risk" ||
    metric.id === "evapotranspiration"
  ) {
    if (value > riskThresholds.high) return "high";
    if (value < riskThresholds.low) return "low";
    return "moderate";
  }
  if (value < riskThresholds.low) return "high";
  if (value > riskThresholds.high) return "low";
  return "moderate";
}

const RISK_SCORES = { low: 1, moderate: 2, high: 3 };
const SCORE_TO_RISK = { 1: "low", 2: "moderate", 3: "high" };

export function computeFarmRisk(metricsData) {
  if (!metricsData) return "low";
  let total = 0;
  METRICS.forEach((metric) => {
    const value = metricsData.current[metric.id];
    const risk = getRiskLevel(metric, value);
    total += RISK_SCORES[risk];
  });
  const avg = total / METRICS.length;
  if (avg >= 2.5) return "high";
  if (avg >= 1.5) return "moderate";
  return "low";
}

export function computeAggregateRisk(farms) {
  if (!farms || farms.length === 0) return "low";
  let total = 0;
  farms.forEach((farm) => {
    total += RISK_SCORES[computeFarmRisk(farm.metricsData)];
  });
  const avg = total / farms.length;
  if (avg >= 2.5) return "high";
  if (avg >= 1.5) return "moderate";
  return "low";
}

let _nextId = 1;
export function createFarm(name, group, coords) {
  const metricsData = generateMetricsForRegion(coords);
  return {
    id: _nextId++,
    name,
    group,
    coords,
    metricsData,
  };
}
