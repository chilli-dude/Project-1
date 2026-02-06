import { useState, useCallback, useEffect } from "react";
import MapView from "./components/MapView";
import MetricsPanel from "./components/MetricsPanel";
import MetricCharts from "./components/MetricCharts";
import PortfolioPanel from "./components/PortfolioPanel";
import AddFarmModal from "./components/AddFarmModal";
import EditFarmModal from "./components/EditFarmModal";
import FarmDetails from "./components/FarmDetails";
import RecommendationsPanel from "./components/RecommendationsPanel";
import { createFarm, enrichFarmWithRealData, computeAggregateRisk, computeFarmRisk, METRICS, getRiskLevel, setNextId } from "./data/metrics";

const STORAGE_KEY = "farmrisk_farms";
const THEME_KEY = "farmrisk_theme";

function loadFarms() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

function saveFarms(farms) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(farms));
  } catch {
    // storage full or unavailable
  }
}

const NAV_ITEMS = [
  { id: "overview", label: "Overview", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1" },
  { id: "map", label: "Map", icon: "M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" },
  { id: "portfolio", label: "Portfolio", icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0H5m14 0h2m-2 0l-3-3m-7 3H3m2 0l3-3" },
  { id: "recommendations", label: "Recommendations", icon: "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" },
  { id: "archive", label: "Archive", icon: "M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" },
  { id: "farm", label: "Farm Detail", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" },
];

function SummaryCards({ farms, selectedFarm }) {
  const totalArea = selectedFarm
    ? (selectedFarm.metricsData?.area || 0)
    : farms.reduce((s, f) => s + (f.metricsData?.area || 0), 0);
  const groups = [...new Set(farms.map((f) => f.group))];

  let highRiskCount = 0;
  const target = selectedFarm ? [selectedFarm] : farms;
  target.forEach((farm) => {
    METRICS.forEach((m) => {
      if (getRiskLevel(m, farm.metricsData.current[m.id]) === "high") highRiskCount++;
    });
  });

  const cards = [
    { label: "Total Farms", value: farms.length, bg: "bg-red-100", iconColor: "text-red-600", icon: "M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" },
    { label: "Farm Groups", value: groups.length, bg: "bg-sky-100", iconColor: "text-sky-600", icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" },
    { label: selectedFarm ? "Farm Area" : "Total Area", value: `${totalArea.toFixed(1)} km²`, bg: "bg-emerald-100", iconColor: "text-emerald-600", icon: "M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" },
    { label: selectedFarm ? "Farm Risk Alerts" : "High Risk Alerts", value: highRiskCount, bg: "bg-rose-100", iconColor: "text-rose-500", icon: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" },
  ];

  return (
    <div className="widget-grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4" style={{ marginBottom: "var(--widget-gap)" }}>
      {cards.map((card) => (
        <div key={card.label} className="widget-card flex items-center" style={{ gap: "var(--spacing-md)" }}>
          <div className={`w-14 h-14 rounded-xl ${card.bg} flex items-center justify-center`}>
            <svg className={`w-7 h-7 ${card.iconColor}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d={card.icon} />
            </svg>
          </div>
          <div>
            <p className="text-3xl font-bold text-gray-900 leading-tight">{card.value}</p>
            <p className="text-base text-gray-400 font-medium">{card.label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ---- Overview page ----
function OverviewPage({ farms, selectedFarmId, toggleFarmSelection, selectedMetric, setSelectedMetric, handlePolygonDrawn, handleDeleteFarm, hiddenGroups, onEditFarm, onArchiveFarm }) {
  const selectedFarm = farms.find((f) => f.id === selectedFarmId) || null;

  return (
    <div className="widget-stack">
      <SummaryCards farms={farms} selectedFarm={selectedFarm} />
      <div className="widget-grid grid-cols-1 lg:grid-cols-12 min-h-0">
        <div className="lg:col-span-5 widget-card !p-0 overflow-hidden min-h-[450px]">
          <MapView farms={farms} selectedFarmId={selectedFarmId} onPolygonDrawn={handlePolygonDrawn} onFarmSelect={toggleFarmSelection} hiddenGroups={hiddenGroups} />
        </div>
        <div className="lg:col-span-3 widget-card overflow-hidden flex flex-col max-h-[650px]">
          <h2 className="widget-heading">Portfolio</h2>
          <div className="flex-1 overflow-y-auto min-h-0">
            <PortfolioPanel farms={farms} selectedFarmId={selectedFarmId} onSelectFarm={toggleFarmSelection} onDeleteFarm={handleDeleteFarm} onEditFarm={onEditFarm} onArchiveFarm={onArchiveFarm} />
          </div>
        </div>
        <div className="lg:col-span-4 widget-card overflow-hidden flex flex-col max-h-[650px]">
          {selectedFarm ? (
            <>
              <div className="flex items-center justify-between" style={{ marginBottom: "var(--spacing-md)" }}>
                <h2 className="text-xl font-bold text-gray-900">{selectedFarm.name}</h2>
                <span className="text-base font-medium px-3 py-1 rounded-full bg-red-100 text-red-600">{selectedFarm.group}</span>
              </div>
              <div className="flex-1 overflow-y-auto min-h-0">
                <MetricsPanel data={selectedFarm.metricsData} selectedMetric={selectedMetric} onSelectMetric={setSelectedMetric} />
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-300" style={{ padding: "var(--widget-padding)" }}>
              <svg className="w-16 h-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={0.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <p className="text-lg text-center font-medium text-gray-400">
                {farms.length === 0 ? "Draw a polygon on the map to add your first farm" : "Select a farm to view its metrics"}
              </p>
            </div>
          )}
        </div>
      </div>
      {selectedFarm && (
        <MetricCharts data={selectedFarm.metricsData} selectedMetric={selectedMetric} />
      )}
    </div>
  );
}

// ---- Map page ----
function MapPage({ farms, selectedFarmId, toggleFarmSelection, handlePolygonDrawn, hiddenGroups }) {
  return (
    <div className="widget-card !p-0 overflow-hidden" style={{ height: "calc(100vh - 140px)" }}>
      <MapView farms={farms} selectedFarmId={selectedFarmId} onPolygonDrawn={handlePolygonDrawn} onFarmSelect={toggleFarmSelection} hiddenGroups={hiddenGroups} />
    </div>
  );
}

// ---- Portfolio page ----
function PortfolioPage({ farms, selectedFarmId, toggleFarmSelection, handleDeleteFarm, selectedMetric, setSelectedMetric, onEditFarm, onArchiveFarm }) {
  const selectedFarm = farms.find((f) => f.id === selectedFarmId) || null;

  return (
    <div className="widget-grid grid-cols-1 lg:grid-cols-3">
      <div className="lg:col-span-1 widget-card">
        <h2 className="text-xl font-bold text-gray-900" style={{ marginBottom: "var(--widget-gap)" }}>All Farms</h2>
        <PortfolioPanel
          farms={farms}
          selectedFarmId={selectedFarmId}
          onSelectFarm={toggleFarmSelection}
          onDeleteFarm={handleDeleteFarm}
          onEditFarm={onEditFarm}
          onArchiveFarm={onArchiveFarm}
        />
      </div>
      <div className="lg:col-span-2 widget-stack">
        <SummaryCards farms={farms} selectedFarm={selectedFarm} />
        {selectedFarm ? (
          <div className="widget-card">
            <h2 className="widget-heading">{selectedFarm.name} - Metrics</h2>
            <MetricsPanel data={selectedFarm.metricsData} selectedMetric={selectedMetric} onSelectMetric={setSelectedMetric} />
            <div style={{ marginTop: "var(--widget-gap)" }}>
              <MetricCharts data={selectedFarm.metricsData} selectedMetric={selectedMetric} />
            </div>
          </div>
        ) : farms.length > 0 ? (
          <div className="widget-card">
            <h2 className="text-xl font-bold text-gray-900" style={{ marginBottom: "var(--widget-gap)" }}>Portfolio Risk Analysis</h2>
            <MetricCharts data={farms[0].metricsData} selectedMetric="soil_moisture" />
          </div>
        ) : null}
      </div>
    </div>
  );
}

// ---- Archive page ----
function ArchivePage({ archivedFarms, onUnarchive, onDeleteFarm }) {
  if (archivedFarms.length === 0) {
    return (
      <div className="widget-card flex flex-col items-center justify-center" style={{ padding: "var(--spacing-xl) var(--widget-padding)" }}>
        <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={0.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
        </svg>
        <p className="text-lg font-semibold text-gray-400">No archived farms</p>
        <p className="text-sm text-gray-400 mt-1 text-center">Archived farms will appear here. Hover over a farm in the portfolio and click the archive icon.</p>
      </div>
    );
  }

  const groups = {};
  archivedFarms.forEach((farm) => {
    if (!groups[farm.group]) groups[farm.group] = [];
    groups[farm.group].push(farm);
  });

  return (
    <div className="widget-stack">
      <div className="widget-card">
        <h2 className="widget-heading">Archived Farms ({archivedFarms.length})</h2>
        <p className="text-sm text-gray-400" style={{ marginBottom: "var(--widget-gap)" }}>These farms are hidden from the main portfolio and map. Restore them to bring them back.</p>

        {Object.entries(groups).map(([groupName, groupFarms]) => (
          <div key={groupName} style={{ marginBottom: "var(--widget-gap)" }}>
            <h3 className="text-base font-bold text-gray-600 mb-2">{groupName}</h3>
            <div className="flex flex-col" style={{ gap: "var(--spacing-xs)" }}>
              {groupFarms.map((farm) => (
                <div
                  key={farm.id}
                  className="flex items-center justify-between rounded-xl bg-gray-50 border border-gray-100"
                  style={{ padding: "var(--spacing-sm) var(--spacing-md)" }}
                >
                  <div>
                    <span className="text-base font-semibold text-gray-600">{farm.name}</span>
                    <span className="text-sm text-gray-400 ml-2">~{farm.metricsData.area} km²</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onUnarchive(farm.id)}
                      className="text-sm font-semibold px-4 py-2 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors"
                    >
                      Restore
                    </button>
                    <button
                      onClick={() => onDeleteFarm(farm.id)}
                      className="text-sm font-semibold px-4 py-2 rounded-lg bg-rose-50 text-rose-500 hover:bg-rose-100 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---- Farm detail page ----
function FarmPage({ farm, selectedMetric, setSelectedMetric, onUpdateDetails }) {
  const [tab, setTab] = useState("metrics");

  if (!farm) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-gray-300">
        <svg className="w-16 h-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={0.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        <p className="text-xl font-medium text-gray-400">Select a farm from the Portfolio to view details</p>
      </div>
    );
  }

  const tabs = [
    { id: "metrics", label: "Metrics" },
    { id: "charts", label: "Charts" },
    { id: "details", label: "Project Info" },
  ];

  return (
    <div className="widget-stack">
      <div className="widget-card">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{farm.name}</h2>
            <p className="text-base text-gray-400 mt-1">
              {farm.group} &middot; {farm.metricsData.centroid.lat}, {farm.metricsData.centroid.lng} &middot; ~{farm.metricsData.area} km²
            </p>
          </div>
          <div className="flex items-center gap-3">
            {farm.metricsData.realDataLoaded && (
              <span className="text-base font-bold px-4 py-2 rounded-full bg-emerald-50 text-emerald-600">LIVE DATA</span>
            )}
            <span className={`text-base font-bold px-4 py-2 rounded-full ${
              computeFarmRisk(farm.metricsData) === "low" ? "bg-emerald-50 text-emerald-600"
                : computeFarmRisk(farm.metricsData) === "moderate" ? "bg-amber-50 text-amber-600"
                : "bg-rose-50 text-rose-500"
            }`}>
              {computeFarmRisk(farm.metricsData) === "low" ? "Low Risk" : computeFarmRisk(farm.metricsData) === "moderate" ? "Moderate Risk" : "High Risk"}
            </span>
          </div>
        </div>
      </div>

      <div className="flex" style={{ gap: "var(--widget-gap)" }}>
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-7 py-4 rounded-xl text-base font-semibold transition-all ${
              tab === t.id
                ? "bg-red-100 text-red-700"
                : "bg-white text-gray-400 hover:bg-gray-50 shadow-sm"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "metrics" && (
        <div className="widget-card">
          <MetricsPanel data={farm.metricsData} selectedMetric={selectedMetric} onSelectMetric={setSelectedMetric} />
        </div>
      )}
      {tab === "charts" && (
        <MetricCharts data={farm.metricsData} selectedMetric={selectedMetric} />
      )}
      {tab === "details" && (
        <div className="widget-card">
          <FarmDetails farm={farm} onUpdateDetails={onUpdateDetails} />
        </div>
      )}
    </div>
  );
}

// ---- Main App ----
export default function App() {
  const [farms, setFarms] = useState(() => {
    const loaded = loadFarms();
    if (loaded.length > 0) {
      const maxId = Math.max(...loaded.map((f) => f.id));
      setNextId(maxId + 1);
    }
    return loaded;
  });
  const [selectedFarmId, setSelectedFarmId] = useState(null);
  const [selectedMetric, setSelectedMetric] = useState("soil_moisture");
  const [pendingCoords, setPendingCoords] = useState(null);
  const [activeNav, setActiveNav] = useState("overview");
  const [editingFarm, setEditingFarm] = useState(null);
  const [hiddenGroups, setHiddenGroups] = useState(new Set());
  const [darkMode, setDarkMode] = useState(() => {
    try { return localStorage.getItem(THEME_KEY) === "dark"; } catch { return false; }
  });

  // Persist farms to localStorage
  useEffect(() => {
    saveFarms(farms);
  }, [farms]);

  // Apply dark mode theme
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", darkMode ? "dark" : "light");
    try { localStorage.setItem(THEME_KEY, darkMode ? "dark" : "light"); } catch {}
  }, [darkMode]);

  // Re-enrich farms that haven't loaded real data yet (after loading from localStorage)
  useEffect(() => {
    farms.forEach((farm) => {
      if (!farm.metricsData.realDataLoaded) {
        enrichFarmWithRealData(farm).then((enriched) => {
          setFarms((prev) => prev.map((f) => (f.id === enriched.id ? enriched : f)));
        });
      }
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Listen for group toggle events from MapView
  useEffect(() => {
    const handler = (e) => {
      const group = e.detail;
      setHiddenGroups((prev) => {
        const next = new Set(prev);
        if (next.has(group)) next.delete(group);
        else next.add(group);
        return next;
      });
    };
    window.addEventListener("toggle-group", handler);
    return () => window.removeEventListener("toggle-group", handler);
  }, []);

  const activeFarms = farms.filter((f) => !f.archived);
  const archivedFarms = farms.filter((f) => f.archived);
  const existingGroups = [...new Set(activeFarms.map((f) => f.group))];

  const handlePolygonDrawn = useCallback((coords) => {
    setPendingCoords(coords);
  }, []);

  const handleAddFarm = useCallback(
    (name, group) => {
      if (!pendingCoords) return;
      const farm = createFarm(name, group, pendingCoords);
      setFarms((prev) => [...prev, farm]);
      setSelectedFarmId(farm.id);
      setPendingCoords(null);

      enrichFarmWithRealData(farm).then((enriched) => {
        setFarms((prev) => prev.map((f) => (f.id === enriched.id ? enriched : f)));
      });
    },
    [pendingCoords]
  );

  const handleCancelAdd = useCallback(() => {
    setPendingCoords(null);
  }, []);

  const handleDeleteFarm = useCallback(
    (id) => {
      setFarms((prev) => prev.filter((f) => f.id !== id));
      if (selectedFarmId === id) setSelectedFarmId(null);
    },
    [selectedFarmId]
  );

  const handleArchiveFarm = useCallback(
    (id) => {
      setFarms((prev) => prev.map((f) => (f.id === id ? { ...f, archived: true } : f)));
      if (selectedFarmId === id) setSelectedFarmId(null);
    },
    [selectedFarmId]
  );

  const handleUnarchiveFarm = useCallback((id) => {
    setFarms((prev) => prev.map((f) => (f.id === id ? { ...f, archived: false } : f)));
  }, []);

  const handleEditFarm = useCallback((farm) => {
    setEditingFarm(farm);
  }, []);

  const handleEditConfirm = useCallback((id, name, group) => {
    setFarms((prev) => prev.map((f) => (f.id === id ? { ...f, name, group } : f)));
    setEditingFarm(null);
  }, []);

  const handleUpdateDetails = useCallback((farmId, details) => {
    setFarms((prev) => prev.map((f) => (f.id === farmId ? { ...f, details } : f)));
  }, []);

  const selectedFarm = activeFarms.find((f) => f.id === selectedFarmId) || null;

  const toggleFarmSelection = useCallback((id) => {
    setSelectedFarmId((prev) => (prev === id ? null : id));
  }, []);

  const toggleGroupVisibility = useCallback((group) => {
    setHiddenGroups((prev) => {
      const next = new Set(prev);
      if (next.has(group)) next.delete(group);
      else next.add(group);
      return next;
    });
  }, []);

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: "var(--color-bg)" }}>
      {pendingCoords && (
        <AddFarmModal onConfirm={handleAddFarm} onCancel={handleCancelAdd} existingGroups={existingGroups} />
      )}
      {editingFarm && (
        <EditFarmModal farm={editingFarm} onConfirm={handleEditConfirm} onCancel={() => setEditingFarm(null)} existingGroups={existingGroups} />
      )}

      {/* Sidebar */}
      <aside className="w-72 bg-white flex flex-col flex-shrink-0 border-r border-gray-100 min-h-screen">
        <div className="flex items-center gap-3" style={{ padding: "var(--sidebar-padding)" }}>
          <div className="w-11 h-11 rounded-lg bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 19.5c-4.5-3-7.5-6.5-7.5-10a5 5 0 0110 0c1.5-2 4-3.5 6-2.5.5.25.8.7.5 1.2C20 11 17 14 12 19.5z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 19.5V10" />
            </svg>
          </div>
          <span className="text-xl font-bold text-gray-900 tracking-tight">FarmRisk</span>
        </div>

        <div style={{ padding: "0 var(--sidebar-padding)", marginBottom: "var(--sidebar-padding)" }}>
          <button
            onClick={() => setActiveNav("map")}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-red-500 to-red-600 text-white text-base font-bold rounded-xl px-6 py-4 shadow-md shadow-red-200 hover:shadow-lg hover:shadow-red-300 transition-all"
          >
            Add farm
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>

        <nav className="flex-1 space-y-2" style={{ padding: "0 var(--spacing-md)" }}>
          {NAV_ITEMS.map((item) => {
            const isActive = activeNav === item.id;
            if (item.id === "farm" && !selectedFarm) return null;
            return (
              <button
                key={item.id}
                onClick={() => setActiveNav(item.id)}
                className={`w-full flex items-center gap-3 px-6 py-4 rounded-xl text-base font-semibold transition-all ${
                  isActive
                    ? "bg-red-50 text-red-700"
                    : "text-gray-400 hover:text-gray-600 hover:bg-gray-50"
                }`}
              >
                <svg className={`w-6 h-6 ${isActive ? "text-red-500" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                </svg>
                {item.label}
                {item.id === "archive" && archivedFarms.length > 0 && (
                  <span className="ml-auto text-xs font-bold px-2 py-0.5 rounded-full bg-gray-200 text-gray-500">{archivedFarms.length}</span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Dark mode toggle */}
        <div style={{ padding: "0 var(--sidebar-padding)" }}>
          <button
            onClick={() => setDarkMode((d) => !d)}
            className="w-full flex items-center gap-3 px-6 py-4 rounded-xl text-base font-semibold text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-all"
          >
            {darkMode ? (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
            {darkMode ? "Light Mode" : "Night Mode"}
          </button>
        </div>

        <div style={{ padding: "0 var(--sidebar-padding) var(--sidebar-padding)" }}>
          <div className="bg-red-50 rounded-2xl text-center" style={{ padding: "var(--spacing-sm)" }}>
            <p className="text-base font-semibold text-red-700 mb-1">
              {activeFarms.length} farm{activeFarms.length !== 1 ? "s" : ""} tracked
            </p>
            <p className="text-sm text-red-400">
              {existingGroups.length} group{existingGroups.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
      </aside>

      {/* Main area */}
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        <header className="bg-white/70 backdrop-blur-md border-b border-gray-100 sticky top-0 z-40">
          <div className="flex items-center justify-between" style={{ padding: "var(--spacing-md) var(--widget-gap)" }}>
            <h2 className="text-xl font-bold text-gray-900 capitalize">{activeNav === "farm" && selectedFarm ? selectedFarm.name : NAV_ITEMS.find(n => n.id === activeNav)?.label || activeNav}</h2>
            <div className="flex items-center gap-4">
              {activeFarms.length > 0 && (
                <span className="text-base font-medium px-5 py-2 rounded-full bg-red-100 text-red-600">
                  {activeFarms.length} farm{activeFarms.length !== 1 ? "s" : ""} in portfolio
                </span>
              )}
              <div className="w-11 h-11 rounded-full bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center text-base font-bold text-white">
                U
              </div>
            </div>
          </div>
        </header>

        <main className="dashboard-container">
          {activeNav === "overview" && (
            <OverviewPage
              farms={activeFarms}
              selectedFarmId={selectedFarmId}
              toggleFarmSelection={toggleFarmSelection}
              selectedMetric={selectedMetric}
              setSelectedMetric={setSelectedMetric}
              handlePolygonDrawn={handlePolygonDrawn}
              handleDeleteFarm={handleDeleteFarm}
              hiddenGroups={hiddenGroups}
              onEditFarm={handleEditFarm}
              onArchiveFarm={handleArchiveFarm}
            />
          )}
          {activeNav === "map" && (
            <MapPage
              farms={activeFarms}
              selectedFarmId={selectedFarmId}
              toggleFarmSelection={toggleFarmSelection}
              handlePolygonDrawn={handlePolygonDrawn}
              hiddenGroups={hiddenGroups}
            />
          )}
          {activeNav === "portfolio" && (
            <PortfolioPage
              farms={activeFarms}
              selectedFarmId={selectedFarmId}
              toggleFarmSelection={toggleFarmSelection}
              handleDeleteFarm={handleDeleteFarm}
              selectedMetric={selectedMetric}
              setSelectedMetric={setSelectedMetric}
              onEditFarm={handleEditFarm}
              onArchiveFarm={handleArchiveFarm}
            />
          )}
          {activeNav === "recommendations" && (
            <RecommendationsPanel
              farms={activeFarms}
              selectedFarmId={selectedFarmId}
            />
          )}
          {activeNav === "archive" && (
            <ArchivePage
              archivedFarms={archivedFarms}
              onUnarchive={handleUnarchiveFarm}
              onDeleteFarm={handleDeleteFarm}
            />
          )}
          {activeNav === "farm" && (
            <FarmPage
              farm={selectedFarm}
              selectedMetric={selectedMetric}
              setSelectedMetric={setSelectedMetric}
              onUpdateDetails={handleUpdateDetails}
            />
          )}
        </main>
      </div>
    </div>
  );
}
