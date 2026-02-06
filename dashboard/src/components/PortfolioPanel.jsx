import { useState } from "react";
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
    <span className={`text-sm font-semibold px-3 py-1.5 rounded-full ${riskColors[risk]}`}>
      {riskLabels[risk]}
    </span>
  );
}

export default function PortfolioPanel({ farms, selectedFarmId, onSelectFarm, onDeleteFarm }) {
  const [collapsedGroups, setCollapsedGroups] = useState({});

  if (farms.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-300 p-4">
        <svg className="w-14 h-14 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0H5m14 0h2m-2 0l-3-3m-7 3H3m2 0l3-3" />
        </svg>
        <p className="text-lg text-center font-medium text-gray-400">Draw on the map to add farms</p>
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

  const toggleGroup = (groupName) => {
    setCollapsedGroups((prev) => ({ ...prev, [groupName]: !prev[groupName] }));
  };

  return (
    <div className="space-y-6">
      {/* Portfolio summary */}
      <div className="bg-gradient-to-r from-violet-500 to-purple-600 rounded-2xl p-4 text-white">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-semibold uppercase tracking-wider opacity-80">Portfolio Risk</span>
          <span className="text-sm font-bold px-3 py-1 rounded-full bg-white/20">
            {riskLabels[portfolioRisk]}
          </span>
        </div>
        <p className="text-3xl font-bold leading-tight">{farms.length} Farm{farms.length !== 1 ? "s" : ""}</p>
        <p className="text-base opacity-70 mt-1">
          {groupNames.length} group{groupNames.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Groups */}
      {groupNames.map((groupName) => {
        const groupFarms = groups[groupName];
        const groupRisk = computeAggregateRisk(groupFarms);
        const color = groupColorMap[groupName];
        const isCollapsed = !!collapsedGroups[groupName];

        return (
          <div key={groupName}>
            <button
              onClick={() => toggleGroup(groupName)}
              className="flex items-center justify-between mb-2 w-full text-left hover:opacity-80 transition-opacity"
            >
              <div className="flex items-center gap-2">
                <svg
                  className={`w-4 h-4 text-gray-400 transition-transform ${isCollapsed ? "" : "rotate-90"}`}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
                <span className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: color }} />
                <span className="text-base font-bold text-gray-700">{groupName}</span>
                <span className="text-sm text-gray-400 font-medium">({groupFarms.length})</span>
              </div>
              <RiskBadge risk={groupRisk} />
            </button>

            {!isCollapsed && (
              <div className="space-y-2">
                {groupFarms.map((farm) => {
                  const farmRisk = computeFarmRisk(farm.metricsData);
                  const isSelected = farm.id === selectedFarmId;

                  return (
                    <button
                      key={farm.id}
                      onClick={() => onSelectFarm(farm.id)}
                      className={`w-full text-left p-4 rounded-xl border transition-all duration-150 group relative
                        ${isSelected
                          ? "bg-violet-50 border-violet-200 shadow-sm"
                          : "bg-gray-50/60 border-transparent hover:bg-gray-50 hover:border-gray-100"
                        }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="w-1.5 h-7 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                          <div className="min-w-0">
                            <span className={`text-base font-semibold block truncate ${isSelected ? "text-violet-700" : "text-gray-700"}`}>
                              {farm.name}
                            </span>
                            <span className="text-sm text-gray-400">
                              ~{farm.metricsData.area} km²
                              {farm.metricsData.realDataLoaded && (
                                <span className="ml-1.5 text-emerald-500 font-medium">LIVE</span>
                              )}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <RiskBadge risk={farmRisk} />
                          <button
                            onClick={(e) => { e.stopPropagation(); onDeleteFarm(farm.id); }}
                            className="opacity-0 group-hover:opacity-100 p-1.5 rounded text-gray-300 hover:text-rose-400 transition-all"
                            title="Remove farm"
                          >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
