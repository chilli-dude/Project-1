import { useState, useCallback } from "react";
import MapView from "./components/MapView";
import MetricsPanel from "./components/MetricsPanel";
import MetricCharts from "./components/MetricCharts";
import PortfolioPanel from "./components/PortfolioPanel";
import AddFarmModal from "./components/AddFarmModal";
import FarmDetails from "./components/FarmDetails";
import { createFarm, enrichFarmWithRealData, computeAggregateRisk, computeFarmRisk, METRICS, getRiskLevel } from "./data/metrics";

const NAV_ITEMS = [
  { id: "overview", label: "Overview", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1" },
  { id: "map", label: "Map", icon: "M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" },
  { id: "portfolio", label: "Portfolio", icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0H5m14 0h2m-2 0l-3-3m-7 3H3m2 0l3-3" },
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
    { label: "Total Farms", value: farms.length, bg: "bg-violet-100", iconColor: "text-violet-600", icon: "M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" },
    { label: "Farm Groups", value: groups.length, bg: "bg-sky-100", iconColor: "text-sky-600", icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" },
    { label: selectedFarm ? "Farm Area" : "Total Area", value: `${totalArea.toFixed(1)} km²`, bg: "bg-emerald-100", iconColor: "text-emerald-600", icon: "M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" },
    { label: selectedFarm ? "Farm Risk Alerts" : "High Risk Alerts", value: highRiskCount, bg: "bg-rose-100", iconColor: "text-rose-500", icon: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-[30px] mb-[30px]">
      {cards.map((card) => (
        <div key={card.label} className="bg-white rounded-2xl p-[12px] flex items-center gap-4 shadow-sm">
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
function OverviewPage({ farms, selectedFarmId, toggleFarmSelection, selectedMetric, setSelectedMetric, handlePolygonDrawn, handleDeleteFarm }) {
  const selectedFarm = farms.find((f) => f.id === selectedFarmId) || null;

  return (
    <>
      <SummaryCards farms={farms} selectedFarm={selectedFarm} />
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-[30px] min-h-0">
        <div className="lg:col-span-5 bg-white rounded-2xl shadow-sm overflow-hidden min-h-[450px]">
          <MapView farms={farms} selectedFarmId={selectedFarmId} onPolygonDrawn={handlePolygonDrawn} onFarmSelect={toggleFarmSelection} />
        </div>
        <div className="lg:col-span-3 bg-white rounded-2xl shadow-sm p-[12px] overflow-hidden flex flex-col max-h-[650px]">
          <h2 className="text-xl font-bold text-gray-900 mb-[12px]">Portfolio</h2>
          <div className="flex-1 overflow-y-auto min-h-0">
            <PortfolioPanel farms={farms} selectedFarmId={selectedFarmId} onSelectFarm={toggleFarmSelection} onDeleteFarm={handleDeleteFarm} />
          </div>
        </div>
        <div className="lg:col-span-4 bg-white rounded-2xl shadow-sm p-[12px] overflow-hidden flex flex-col max-h-[650px]">
          {selectedFarm ? (
            <>
              <div className="flex items-center justify-between mb-[12px]">
                <h2 className="text-xl font-bold text-gray-900">{selectedFarm.name}</h2>
                <span className="text-base font-medium px-3 py-1 rounded-full bg-violet-100 text-violet-600">{selectedFarm.group}</span>
              </div>
              <div className="flex-1 overflow-y-auto min-h-0">
                <MetricsPanel data={selectedFarm.metricsData} selectedMetric={selectedMetric} onSelectMetric={setSelectedMetric} />
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-300 p-[12px]">
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
        <div className="mt-[30px]">
          <MetricCharts data={selectedFarm.metricsData} selectedMetric={selectedMetric} />
        </div>
      )}
    </>
  );
}

// ---- Map page ----
function MapPage({ farms, selectedFarmId, toggleFarmSelection, handlePolygonDrawn }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden" style={{ height: "calc(100vh - 140px)" }}>
      <MapView farms={farms} selectedFarmId={selectedFarmId} onPolygonDrawn={handlePolygonDrawn} onFarmSelect={toggleFarmSelection} />
    </div>
  );
}

// ---- Portfolio page ----
function PortfolioPage({ farms, selectedFarmId, toggleFarmSelection, handleDeleteFarm, selectedMetric, setSelectedMetric }) {
  const selectedFarm = farms.find((f) => f.id === selectedFarmId) || null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-[30px]">
      <div className="lg:col-span-1 bg-white rounded-2xl shadow-sm p-[12px]">
        <h2 className="text-xl font-bold text-gray-900 mb-[30px]">All Farms</h2>
        <PortfolioPanel
          farms={farms}
          selectedFarmId={selectedFarmId}
          onSelectFarm={toggleFarmSelection}
          onDeleteFarm={handleDeleteFarm}
        />
      </div>
      <div className="lg:col-span-2">
        <SummaryCards farms={farms} selectedFarm={selectedFarm} />
        {selectedFarm ? (
          <div className="bg-white rounded-2xl shadow-sm p-[12px] mt-[30px]">
            <h2 className="text-xl font-bold text-gray-900 mb-[12px]">{selectedFarm.name} - Metrics</h2>
            <MetricsPanel data={selectedFarm.metricsData} selectedMetric={selectedMetric} onSelectMetric={setSelectedMetric} />
            <div className="mt-[30px]">
              <MetricCharts data={selectedFarm.metricsData} selectedMetric={selectedMetric} />
            </div>
          </div>
        ) : farms.length > 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-[12px] mt-[30px]">
            <h2 className="text-xl font-bold text-gray-900 mb-[30px]">Portfolio Risk Analysis</h2>
            <MetricCharts data={farms[0].metricsData} selectedMetric="soil_moisture" />
          </div>
        ) : null}
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
    <div>
      <div className="bg-white rounded-2xl shadow-sm p-[12px] mb-[30px]">
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

      <div className="flex gap-[30px] mb-[30px]">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-8 py-4 rounded-xl text-base font-semibold transition-all ${
              tab === t.id
                ? "bg-violet-100 text-violet-700"
                : "bg-white text-gray-400 hover:bg-gray-50 shadow-sm"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "metrics" && (
        <div className="bg-white rounded-2xl shadow-sm p-[12px]">
          <MetricsPanel data={farm.metricsData} selectedMetric={selectedMetric} onSelectMetric={setSelectedMetric} />
        </div>
      )}
      {tab === "charts" && (
        <MetricCharts data={farm.metricsData} selectedMetric={selectedMetric} />
      )}
      {tab === "details" && (
        <div className="bg-white rounded-2xl shadow-sm p-[12px]">
          <FarmDetails farm={farm} onUpdateDetails={onUpdateDetails} />
        </div>
      )}
    </div>
  );
}

// ---- Main App ----
export default function App() {
  const [farms, setFarms] = useState([]);
  const [selectedFarmId, setSelectedFarmId] = useState(null);
  const [selectedMetric, setSelectedMetric] = useState("soil_moisture");
  const [pendingCoords, setPendingCoords] = useState(null);
  const [activeNav, setActiveNav] = useState("overview");

  const existingGroups = [...new Set(farms.map((f) => f.group))];

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

  const handleUpdateDetails = useCallback((farmId, details) => {
    setFarms((prev) => prev.map((f) => (f.id === farmId ? { ...f, details } : f)));
  }, []);

  const selectedFarm = farms.find((f) => f.id === selectedFarmId) || null;

  const toggleFarmSelection = useCallback((id) => {
    setSelectedFarmId((prev) => (prev === id ? null : id));
  }, []);

  return (
    <div className="min-h-screen bg-[#f1f0f9] flex">
      {pendingCoords && (
        <AddFarmModal onConfirm={handleAddFarm} onCancel={handleCancelAdd} existingGroups={existingGroups} />
      )}

      {/* Sidebar */}
      <aside className="w-72 bg-white flex flex-col flex-shrink-0 border-r border-gray-100 min-h-screen">
        <div className="p-[30px] pb-[30px] flex items-center gap-3">
          <div className="w-11 h-11 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-xl font-extrabold text-white">
            F
          </div>
          <span className="text-xl font-bold text-gray-900 tracking-tight">FarmRisk</span>
        </div>

        <div className="px-[30px] mb-[30px]">
          <button
            onClick={() => setActiveNav("map")}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-violet-500 to-purple-600 text-white text-base font-bold rounded-xl px-6 py-[18px] shadow-md shadow-violet-200 hover:shadow-lg hover:shadow-violet-300 transition-all"
          >
            Add farm
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>

        <nav className="flex-1 px-[18px] space-y-2">
          {NAV_ITEMS.map((item) => {
            const isActive = activeNav === item.id;
            if (item.id === "farm" && !selectedFarm) return null;
            return (
              <button
                key={item.id}
                onClick={() => setActiveNav(item.id)}
                className={`w-full flex items-center gap-3 px-6 py-[18px] rounded-xl text-base font-semibold transition-all ${
                  isActive
                    ? "bg-violet-50 text-violet-700"
                    : "text-gray-400 hover:text-gray-600 hover:bg-gray-50"
                }`}
              >
                <svg className={`w-6 h-6 ${isActive ? "text-violet-500" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                </svg>
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="px-[30px] pb-[30px]">
          <div className="bg-violet-50 rounded-2xl p-[12px] text-center">
            <p className="text-base font-semibold text-violet-700 mb-1">
              {farms.length} farm{farms.length !== 1 ? "s" : ""} tracked
            </p>
            <p className="text-sm text-violet-400">
              {existingGroups.length} group{existingGroups.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
      </aside>

      {/* Main area */}
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        <header className="bg-white/70 backdrop-blur-md border-b border-gray-100 sticky top-0 z-40">
          <div className="px-[30px] py-[18px] flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900 capitalize">{activeNav === "farm" && selectedFarm ? selectedFarm.name : activeNav}</h2>
            <div className="flex items-center gap-4">
              {farms.length > 0 && (
                <span className="text-base font-medium px-5 py-2 rounded-full bg-violet-100 text-violet-600">
                  {farms.length} farm{farms.length !== 1 ? "s" : ""} in portfolio
                </span>
              )}
              <div className="w-11 h-11 rounded-full bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center text-base font-bold text-white">
                U
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-[30px]">
          {activeNav === "overview" && (
            <OverviewPage
              farms={farms}
              selectedFarmId={selectedFarmId}
              toggleFarmSelection={toggleFarmSelection}
              selectedMetric={selectedMetric}
              setSelectedMetric={setSelectedMetric}
              handlePolygonDrawn={handlePolygonDrawn}
              handleDeleteFarm={handleDeleteFarm}
            />
          )}
          {activeNav === "map" && (
            <MapPage
              farms={farms}
              selectedFarmId={selectedFarmId}
              toggleFarmSelection={toggleFarmSelection}
              handlePolygonDrawn={handlePolygonDrawn}
            />
          )}
          {activeNav === "portfolio" && (
            <PortfolioPage
              farms={farms}
              selectedFarmId={selectedFarmId}
              toggleFarmSelection={toggleFarmSelection}
              handleDeleteFarm={handleDeleteFarm}
              selectedMetric={selectedMetric}
              setSelectedMetric={setSelectedMetric}
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
