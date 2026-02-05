import { useState, useCallback } from "react";
import MapView from "./components/MapView";
import MetricsPanel from "./components/MetricsPanel";
import MetricCharts from "./components/MetricCharts";
import PortfolioPanel from "./components/PortfolioPanel";
import AddFarmModal from "./components/AddFarmModal";
import { createFarm, computeAggregateRisk, METRICS, getRiskLevel } from "./data/metrics";

const NAV_ITEMS = [
  { id: "overview", label: "Overview", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1" },
  { id: "map", label: "Map", icon: "M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" },
  { id: "portfolio", label: "Portfolio", icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0H5m14 0h2m-2 0l-3-3m-7 3H3m2 0l3-3" },
  { id: "settings", label: "Settings", icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z" },
];

function SummaryCards({ farms }) {
  const totalArea = farms.reduce((s, f) => s + (f.metricsData?.area || 0), 0);
  const groups = [...new Set(farms.map((f) => f.group))];
  const portfolioRisk = computeAggregateRisk(farms);

  let highRiskCount = 0;
  farms.forEach((farm) => {
    METRICS.forEach((m) => {
      if (getRiskLevel(m, farm.metricsData.current[m.id]) === "high") highRiskCount++;
    });
  });

  const cards = [
    { label: "Total Farms", value: farms.length, bg: "bg-violet-100", iconColor: "text-violet-600", icon: "M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" },
    { label: "Farm Groups", value: groups.length, bg: "bg-sky-100", iconColor: "text-sky-600", icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" },
    { label: "Total Area", value: `${totalArea.toFixed(1)} km²`, bg: "bg-emerald-100", iconColor: "text-emerald-600", icon: "M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" },
    { label: "High Risk Alerts", value: highRiskCount, bg: "bg-rose-100", iconColor: "text-rose-500", icon: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-5">
      {cards.map((card) => (
        <div
          key={card.label}
          className="bg-white rounded-2xl px-5 py-4 flex items-center gap-4 shadow-sm"
        >
          <div className={`w-11 h-11 rounded-xl ${card.bg} flex items-center justify-center`}>
            <svg className={`w-5 h-5 ${card.iconColor}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d={card.icon} />
            </svg>
          </div>
          <div>
            <p className="text-xl font-bold text-gray-900 leading-tight">{card.value}</p>
            <p className="text-xs text-gray-400 font-medium">{card.label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

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

  const selectedFarm = farms.find((f) => f.id === selectedFarmId) || null;

  return (
    <div className="min-h-screen bg-[#f1f0f9] flex">
      {/* Modal */}
      {pendingCoords && (
        <AddFarmModal
          onConfirm={handleAddFarm}
          onCancel={handleCancelAdd}
          existingGroups={existingGroups}
        />
      )}

      {/* ---- Sidebar ---- */}
      <aside className="w-56 bg-white flex flex-col flex-shrink-0 border-r border-gray-100 min-h-screen">
        {/* Logo */}
        <div className="px-5 pt-5 pb-6 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-sm font-extrabold text-white">
            F
          </div>
          <span className="text-base font-bold text-gray-900 tracking-tight">FarmRisk</span>
        </div>

        {/* Add Farm button */}
        <div className="px-4 mb-5">
          <button
            onClick={() => setActiveNav("map")}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-violet-500 to-purple-600 text-white text-sm font-semibold rounded-xl px-4 py-2.5 shadow-md shadow-violet-200 hover:shadow-lg hover:shadow-violet-300 transition-all"
          >
            Add farm
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex-1 px-3 space-y-1">
          {NAV_ITEMS.map((item) => {
            const isActive = activeNav === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveNav(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? "bg-violet-50 text-violet-700"
                    : "text-gray-400 hover:text-gray-600 hover:bg-gray-50"
                }`}
              >
                <svg className={`w-[18px] h-[18px] ${isActive ? "text-violet-500" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                </svg>
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Sidebar footer */}
        <div className="px-4 pb-5">
          <div className="bg-violet-50 rounded-2xl p-4 text-center">
            <p className="text-xs font-semibold text-violet-700 mb-1">
              {farms.length} farm{farms.length !== 1 ? "s" : ""} tracked
            </p>
            <p className="text-[11px] text-violet-400">
              {existingGroups.length} group{existingGroups.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
      </aside>

      {/* ---- Main area ---- */}
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        {/* Top bar */}
        <header className="bg-white/70 backdrop-blur-md border-b border-gray-100 sticky top-0 z-40">
          <div className="px-6 py-3 flex items-center justify-between">
            {/* Search */}
            <div className="flex items-center gap-2 bg-[#f1f0f9] rounded-xl px-4 py-2 w-72">
              <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span className="text-sm text-gray-400">Search...</span>
            </div>

            <div className="flex items-center gap-4">
              {farms.length > 0 && (
                <span className="text-xs font-medium px-3 py-1.5 rounded-full bg-violet-100 text-violet-600">
                  {farms.length} farm{farms.length !== 1 ? "s" : ""} in portfolio
                </span>
              )}
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center text-xs font-bold text-white">
                U
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          {/* Summary cards */}
          <SummaryCards farms={farms} />

          {/* Main grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 min-h-0">
            {/* Map */}
            <div className="lg:col-span-5 bg-white rounded-2xl shadow-sm overflow-hidden min-h-[420px]">
              <MapView
                farms={farms}
                selectedFarmId={selectedFarmId}
                onPolygonDrawn={handlePolygonDrawn}
                onFarmSelect={setSelectedFarmId}
              />
            </div>

            {/* Portfolio list */}
            <div className="lg:col-span-3 bg-white rounded-2xl shadow-sm p-4 overflow-hidden flex flex-col max-h-[600px]">
              <h2 className="text-sm font-bold text-gray-900 mb-3 px-1">Portfolio</h2>
              <div className="flex-1 overflow-y-auto min-h-0">
                <PortfolioPanel
                  farms={farms}
                  selectedFarmId={selectedFarmId}
                  onSelectFarm={setSelectedFarmId}
                  onDeleteFarm={handleDeleteFarm}
                />
              </div>
            </div>

            {/* Metrics panel */}
            <div className="lg:col-span-4 bg-white rounded-2xl shadow-sm p-4 overflow-hidden flex flex-col max-h-[600px]">
              {selectedFarm ? (
                <>
                  <div className="flex items-center justify-between mb-3 px-1">
                    <h2 className="text-sm font-bold text-gray-900">{selectedFarm.name}</h2>
                    <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-violet-100 text-violet-600">
                      {selectedFarm.group}
                    </span>
                  </div>
                  <div className="flex-1 overflow-y-auto min-h-0">
                    <MetricsPanel
                      data={selectedFarm.metricsData}
                      selectedMetric={selectedMetric}
                      onSelectMetric={setSelectedMetric}
                    />
                  </div>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-gray-300 px-6">
                  <svg className="w-14 h-14 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={0.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  <p className="text-sm text-center font-medium">
                    {farms.length === 0
                      ? "Draw a polygon on the map to add your first farm"
                      : "Select a farm to view its metrics"}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Charts row */}
          {selectedFarm && (
            <div className="mt-5">
              <MetricCharts
                data={selectedFarm.metricsData}
                selectedMetric={selectedMetric}
              />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
