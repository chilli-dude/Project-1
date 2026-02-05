import { computeFarmRisk, computeAggregateRisk } from "../data/metrics";

const GROUP_COLORS = [
  "#7c3aed", "#0ea5e9", "#10b981", "#f59e0b", "#ef4444",
  "#ec4899", "#14b8a6", "#6366f1", "#d97706", "#8b5cf6",
];

const riskColors = {
  low: "bg-emerald-50 text-emerald-600",
  moderate: "bg-amber-50 text-amber-600",
  high: "bg-rose-50 text-rose-500",
};
const riskLabels = { low: "Low", moderate: "Med", high: "High" };

function RiskBadge({ risk }) {
  return (
    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${riskColors[risk]}`}>
      {riskLabels[risk]}
    </span>
  );
}

export default function PortfolioPanel({ farms, selectedFarmId, onSelectFarm, onDeleteFarm }) {
  if (farms.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-300 px-4 py-10">
        <svg className="w-10 h-10 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0H5m14 0h2m-2 0l-3-3m-7 3H3m2 0l3-3" />
        </svg>
        <p className="text-xs text-center font-medium text-gray-400">Draw on the map to add farms</p>
      </div>
    );
  }

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
    <div className="space-y-4">
      {/* Portfolio summary */}
      <div className="bg-gradient-to-r from-violet-500 to-purple-600 rounded-xl p-3 text-white">
        <div className="flex items-center justify-between mb-0.5">
          <span className="text-[10px] font-semibold uppercase tracking-wider opacity-80">Portfolio Risk</span>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/20">
            {riskLabels[portfolioRisk]}
          </span>
        </div>
        <p className="text-lg font-bold leading-tight">{farms.length} Farm{farms.length !== 1 ? "s" : ""}</p>
        <p className="text-[11px] opacity-70">
          {groupNames.length} group{groupNames.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Groups */}
      {groupNames.map((groupName) => {
        const groupFarms = groups[groupName];
        const groupRisk = computeAggregateRisk(groupFarms);
        const color = groupColorMap[groupName];

        return (
          <div key={groupName}>
            <div className="flex items-center justify-between mb-1.5 px-0.5">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                <span className="text-xs font-semibold text-gray-700">{groupName}</span>
                <span className="text-[10px] text-gray-400">({groupFarms.length})</span>
              </div>
              <RiskBadge risk={groupRisk} />
            </div>

            <div className="space-y-1">
              {groupFarms.map((farm) => {
                const farmRisk = computeFarmRisk(farm.metricsData);
                const isSelected = farm.id === selectedFarmId;

                return (
                  <button
                    key={farm.id}
                    onClick={() => onSelectFarm(farm.id)}
                    className={`w-full text-left px-3 py-2 rounded-xl border transition-all duration-150 group relative
                      ${isSelected
                        ? "bg-violet-50 border-violet-200 shadow-sm"
                        : "bg-gray-50/60 border-transparent hover:bg-gray-50 hover:border-gray-100"
                      }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="w-1 h-5 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                        <div className="min-w-0">
                          <span className={`text-xs font-semibold block truncate ${isSelected ? "text-violet-700" : "text-gray-700"}`}>
                            {farm.name}
                          </span>
                          <span className="text-[10px] text-gray-400">
                            ~{farm.metricsData.area} km²
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <RiskBadge risk={farmRisk} />
                        <button
                          onClick={(e) => { e.stopPropagation(); onDeleteFarm(farm.id); }}
                          className="opacity-0 group-hover:opacity-100 p-0.5 rounded text-gray-300 hover:text-rose-400 transition-all"
                          title="Remove farm"
                        >
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
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
