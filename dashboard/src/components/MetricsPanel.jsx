import { METRICS, getRiskLevel } from "../data/metrics";

const riskColors = {
  low: "bg-emerald-50 text-emerald-600",
  moderate: "bg-amber-50 text-amber-600",
  high: "bg-rose-50 text-rose-500",
};

const riskLabels = { low: "Low", moderate: "Med", high: "High" };

export default function MetricsPanel({ data, selectedMetric, onSelectMetric }) {
  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-300" style={{ padding: "var(--widget-padding)" }}>
        <svg className="w-16 h-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={0.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
        </svg>
        <p className="text-lg text-center font-medium text-gray-400">Draw a polygon on the map to view metrics</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col" style={{ gap: "var(--spacing-xs)" }}>
      <div className="text-sm text-gray-400 font-medium" style={{ marginBottom: "var(--spacing-sm)" }}>
        Centroid: {data.centroid.lat}, {data.centroid.lng} &middot; ~{data.area} km²
        {data.realDataLoaded && (
          <span className="ml-2 text-emerald-500 font-semibold">LIVE DATA</span>
        )}
      </div>

      {METRICS.map((metric) => {
        const value = data.current[metric.id];
        const risk = getRiskLevel(metric, value);
        const isSelected = selectedMetric === metric.id;
        const isReal = metric.source === "real";

        return (
          <button
            key={metric.id}
            onClick={() => onSelectMetric(metric.id)}
            className={`w-full text-left rounded-xl border transition-all duration-150
              ${isSelected
                ? "bg-violet-50 border-violet-200 shadow-sm"
                : "bg-gray-50/50 border-transparent hover:bg-gray-50 hover:border-gray-100"
              }`}
            style={{ padding: "var(--spacing-sm) var(--spacing-md)" }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: metric.color }} />
                <div>
                  <span className={`text-base font-semibold ${isSelected ? "text-violet-700" : "text-gray-700"}`}>
                    {metric.name}
                  </span>
                  {isReal && data.realDataLoaded && (
                    <span className="ml-2 text-xs font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-600">LIVE</span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="text-lg font-bold" style={{ color: metric.color }}>
                  {value}
                  {metric.unit && <span className="text-sm font-normal text-gray-400 ml-0.5">{metric.unit}</span>}
                </span>
                <span className={`text-sm font-semibold px-2.5 py-1 rounded-full ${riskColors[risk]}`}>
                  {riskLabels[risk]}
                </span>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
