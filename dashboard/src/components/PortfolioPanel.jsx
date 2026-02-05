import { METRICS, computeFarmRisk, computeAggregateRisk } from "../data/metrics";

const riskColors = {
  low: "text-green-400 bg-green-400/10 border-green-400/30",
  moderate: "text-amber-400 bg-amber-400/10 border-amber-400/30",
  high: "text-red-400 bg-red-400/10 border-red-400/30",
};
const riskLabels = { low: "Low", moderate: "Moderate", high: "High" };

const GROUP_COLORS = [
  "#3b82f6", "#22c55e", "#f59e0b", "#ef4444", "#a78bfa",
  "#ec4899", "#14b8a6", "#0ea5e9", "#d97706", "#6366f1",
];

function RiskBadge({ risk, className = "" }) {
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full border ${riskColors[risk]} ${className}`}>
      {riskLabels[risk]}
    </span>
  );
}

export default function PortfolioPanel({ farms, selectedFarmId, onSelectFarm, onDeleteFarm }) {
  if (farms.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-500 px-6 py-12">
        <svg className="w-12 h-12 mb-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0H5m14 0h2m-2 0l-3-3m-7 3H3m2 0l3-3" />
        </svg>
        <p className="text-sm text-center font-medium">Draw polygons on the map to build your farm portfolio</p>
      </div>
    );
  }

  // Group farms
  const groups = {};
  farms.forEach((farm) => {
    if (!groups[farm.group]) groups[farm.group] = [];
    groups[farm.group].push(farm);
  });

  const groupNames = Object.keys(groups);
  const groupColorMap = {};
  groupNames.forEach((g, i) => {
    groupColorMap[g] = GROUP_COLORS[i % GROUP_COLORS.length];
  });

  const portfolioRisk = computeAggregateRisk(farms);

  return (
    <div className="h-full overflow-y-auto px-1 space-y-4">
      {/* Portfolio summary */}
      <div className="bg-slate-800/60 border border-slate-700/50 rounded-lg p-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Portfolio Risk</span>
          <RiskBadge risk={portfolioRisk} />
        </div>
        <div className="text-xs text-slate-500">
          {farms.length} farm{farms.length !== 1 ? "s" : ""} across {groupNames.length} group{groupNames.length !== 1 ? "s" : ""}
        </div>
      </div>

      {/* Groups */}
      {groupNames.map((groupName) => {
        const groupFarms = groups[groupName];
        const groupRisk = computeAggregateRisk(groupFarms);
        const color = groupColorMap[groupName];

        return (
          <div key={groupName}>
            <div className="flex items-center justify-between mb-2 px-1">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
                <span className="text-sm font-medium text-slate-300">{groupName}</span>
                <span className="text-xs text-slate-500">({groupFarms.length})</span>
              </div>
              <RiskBadge risk={groupRisk} />
            </div>

            <div className="space-y-1.5">
              {groupFarms.map((farm) => {
                const farmRisk = computeFarmRisk(farm.metricsData);
                const isSelected = farm.id === selectedFarmId;

                return (
                  <button
                    key={farm.id}
                    onClick={() => onSelectFarm(farm.id)}
                    className={`w-full text-left p-2.5 rounded-lg border transition-all duration-150 group relative
                      ${isSelected
                        ? "bg-slate-700/80 border-blue-500/50 shadow-lg shadow-blue-500/5"
                        : "bg-slate-800/50 border-slate-700/50 hover:bg-slate-700/50 hover:border-slate-600"
                      }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className="w-1.5 h-6 rounded-full flex-shrink-0"
                          style={{ backgroundColor: color }}
                        />
                        <div className="min-w-0">
                          <span className="text-sm font-medium text-slate-200 block truncate">
                            {farm.name}
                          </span>
                          <span className="text-xs text-slate-500">
                            {farm.metricsData.centroid.lat}, {farm.metricsData.centroid.lng} &middot; ~{farm.metricsData.area} km²
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <RiskBadge risk={farmRisk} />
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteFarm(farm.id);
                          }}
                          className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-500/20 text-slate-500 hover:text-red-400 transition-all"
                          title="Remove farm"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
