import { METRICS, getRiskLevel } from "../data/metrics";

const riskColors = {
  low: "text-green-400 bg-green-400/10 border-green-400/30",
  moderate: "text-amber-400 bg-amber-400/10 border-amber-400/30",
  high: "text-red-400 bg-red-400/10 border-red-400/30",
};

const riskLabels = {
  low: "Low Risk",
  moderate: "Moderate",
  high: "High Risk",
};

export default function MetricsPanel({ data, selectedMetric, onSelectMetric }) {
  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-500 px-6 py-12">
        <svg className="w-16 h-16 mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
        </svg>
        <p className="text-sm text-center font-medium">Draw a polygon on the map to view environmental metrics</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto px-1">
      <div className="mb-4 px-2">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span>Centroid: {data.centroid.lat}, {data.centroid.lng}</span>
          <span className="text-slate-600">|</span>
          <span>Area: ~{data.area} km²</span>
        </div>
      </div>

      <div className="grid gap-2">
        {METRICS.map((metric) => {
          const value = data.current[metric.id];
          const risk = getRiskLevel(metric, value);
          const isSelected = selectedMetric === metric.id;

          return (
            <button
              key={metric.id}
              onClick={() => onSelectMetric(metric.id)}
              className={`w-full text-left p-3 rounded-lg border transition-all duration-150
                ${isSelected
                  ? "bg-slate-700/80 border-blue-500/50 shadow-lg shadow-blue-500/5"
                  : "bg-slate-800/50 border-slate-700/50 hover:bg-slate-700/50 hover:border-slate-600"
                }`}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className="text-base">{metric.icon}</span>
                  <span className="text-sm font-medium text-slate-200">{metric.name}</span>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full border ${riskColors[risk]}`}>
                  {riskLabels[risk]}
                </span>
              </div>
              <div className="flex items-baseline gap-1 ml-7">
                <span className="text-lg font-bold" style={{ color: metric.color }}>
                  {value}
                </span>
                {metric.unit && (
                  <span className="text-xs text-slate-400">{metric.unit}</span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-1 ml-7">{metric.description}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
