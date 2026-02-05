import { useState, useCallback } from "react";
import MapView from "./components/MapView";
import MetricsPanel from "./components/MetricsPanel";
import MetricCharts from "./components/MetricCharts";
import PortfolioPanel from "./components/PortfolioPanel";
import AddFarmModal from "./components/AddFarmModal";
import { createFarm } from "./data/metrics";

export default function App() {
  const [farms, setFarms] = useState([]);
  const [selectedFarmId, setSelectedFarmId] = useState(null);
  const [selectedMetric, setSelectedMetric] = useState("soil_moisture");
  const [pendingCoords, setPendingCoords] = useState(null);

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
    <div className="min-h-screen bg-slate-900 flex flex-col">
      {/* Modal */}
      {pendingCoords && (
        <AddFarmModal
          onConfirm={handleAddFarm}
          onCancel={handleCancelAdd}
          existingGroups={existingGroups}
        />
      )}

      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-[1920px] mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-blue-500 flex items-center justify-center text-sm font-bold text-white">
              F
            </div>
            <div>
              <h1 className="text-base font-semibold text-slate-100 leading-tight">
                Farm Metrics Dashboard
              </h1>
              <p className="text-xs text-slate-500">
                Environmental risk &amp; resilience analysis
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-400">
            {farms.length > 0 && (
              <span className="px-2 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                {farms.length} farm{farms.length !== 1 ? "s" : ""} in portfolio
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 max-w-[1920px] mx-auto w-full p-4 grid grid-cols-1 lg:grid-cols-12 gap-4 min-h-0">
        {/* Left sidebar — portfolio */}
        <aside className="lg:col-span-3 bg-slate-800/30 border border-slate-700/40 rounded-xl p-3 overflow-hidden flex flex-col">
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-2 mb-3">
            Portfolio
          </h2>
          <div className="flex-1 overflow-y-auto min-h-0">
            <PortfolioPanel
              farms={farms}
              selectedFarmId={selectedFarmId}
              onSelectFarm={setSelectedFarmId}
              onDeleteFarm={handleDeleteFarm}
            />
          </div>
        </aside>

        {/* Centre — map */}
        <main className="lg:col-span-5 bg-slate-800/30 border border-slate-700/40 rounded-xl overflow-hidden min-h-[400px]">
          <MapView
            farms={farms}
            selectedFarmId={selectedFarmId}
            onPolygonDrawn={handlePolygonDrawn}
            onFarmSelect={setSelectedFarmId}
          />
        </main>

        {/* Right — metrics & charts */}
        <section className="lg:col-span-4 bg-slate-800/30 border border-slate-700/40 rounded-xl p-3 overflow-hidden flex flex-col">
          {selectedFarm ? (
            <>
              <div className="flex items-center justify-between px-2 mb-3">
                <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  {selectedFarm.name}
                </h2>
                <span className="text-xs text-slate-500">{selectedFarm.group}</span>
              </div>
              <div className="flex-1 overflow-y-auto min-h-0 space-y-4">
                <MetricsPanel
                  data={selectedFarm.metricsData}
                  selectedMetric={selectedMetric}
                  onSelectMetric={setSelectedMetric}
                />
                <MetricCharts
                  data={selectedFarm.metricsData}
                  selectedMetric={selectedMetric}
                />
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-500 px-6">
              <svg className="w-12 h-12 mb-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <p className="text-sm text-center font-medium">
                {farms.length === 0
                  ? "Draw a polygon on the map to add your first farm"
                  : "Select a farm to view its metrics and charts"}
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
