import { useState, useCallback } from "react";
import MapView from "./components/MapView";
import MetricsPanel from "./components/MetricsPanel";
import MetricCharts from "./components/MetricCharts";
import { generateMetricsForRegion } from "./data/metrics";

export default function App() {
  const [metricsData, setMetricsData] = useState(null);
  const [selectedMetric, setSelectedMetric] = useState("soil_moisture");

  const handlePolygonCreated = useCallback((coords) => {
    const data = generateMetricsForRegion(coords);
    setMetricsData(data);
  }, []);

  const handlePolygonDeleted = useCallback(() => {
    setMetricsData(null);
  }, []);

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col">
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
          <div className="flex items-center gap-4 text-xs text-slate-400">
            {metricsData && (
              <span className="px-2 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Region selected
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 max-w-[1920px] mx-auto w-full p-4 grid grid-cols-1 lg:grid-cols-12 gap-4 min-h-0">
        {/* Left sidebar — metrics list */}
        <aside className="lg:col-span-3 bg-slate-800/30 border border-slate-700/40 rounded-xl p-3 overflow-hidden flex flex-col">
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-2 mb-3">
            Environmental Metrics
          </h2>
          <div className="flex-1 overflow-y-auto min-h-0">
            <MetricsPanel
              data={metricsData}
              selectedMetric={selectedMetric}
              onSelectMetric={setSelectedMetric}
            />
          </div>
        </aside>

        {/* Centre — map */}
        <main className="lg:col-span-5 bg-slate-800/30 border border-slate-700/40 rounded-xl overflow-hidden min-h-[400px]">
          <MapView
            onPolygonCreated={handlePolygonCreated}
            onPolygonDeleted={handlePolygonDeleted}
          />
        </main>

        {/* Right — charts */}
        <section className="lg:col-span-4 bg-slate-800/30 border border-slate-700/40 rounded-xl p-3 overflow-hidden flex flex-col">
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-2 mb-3">
            Analysis &amp; Charts
          </h2>
          <div className="flex-1 overflow-y-auto min-h-0">
            <MetricCharts data={metricsData} selectedMetric={selectedMetric} />
          </div>
        </section>
      </div>
    </div>
  );
}
