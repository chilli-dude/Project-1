import { useState } from "react";
import { generateRecommendations, generatePortfolioSummary } from "../data/recommendations";

const priorityConfig = {
  1: { label: "Critical", bg: "bg-rose-50", text: "text-rose-600", border: "border-rose-200", dot: "bg-rose-500" },
  2: { label: "Important", bg: "bg-amber-50", text: "text-amber-600", border: "border-amber-200", dot: "bg-amber-500" },
  3: { label: "Advisory", bg: "bg-sky-50", text: "text-sky-600", border: "border-sky-200", dot: "bg-sky-500" },
};

function AiHeader() {
  return (
    <div className="flex items-center gap-3" style={{ marginBottom: "var(--widget-gap)" }}>
      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center flex-shrink-0">
        <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      </div>
      <div>
        <h2 className="text-xl font-bold text-gray-900">AI Recommendations</h2>
        <p className="text-sm text-gray-400">Actionable insights based on your farm data and risk factors</p>
      </div>
    </div>
  );
}

function SummaryBar({ summary }) {
  return (
    <div className="widget-card" style={{ background: "linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)", color: "white" }}>
      <div className="flex items-center justify-between flex-wrap" style={{ gap: "var(--spacing-md)" }}>
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider opacity-80">Total Recommendations</p>
          <p className="text-3xl font-bold">{summary.total}</p>
        </div>
        <div className="flex gap-4">
          {summary.critical > 0 && (
            <div className="text-center">
              <p className="text-2xl font-bold">{summary.critical}</p>
              <p className="text-xs opacity-80 font-medium">Critical</p>
            </div>
          )}
          {summary.important > 0 && (
            <div className="text-center">
              <p className="text-2xl font-bold">{summary.important}</p>
              <p className="text-xs opacity-80 font-medium">Important</p>
            </div>
          )}
          {summary.advisory > 0 && (
            <div className="text-center">
              <p className="text-2xl font-bold">{summary.advisory}</p>
              <p className="text-xs opacity-80 font-medium">Advisory</p>
            </div>
          )}
        </div>
      </div>
      {summary.topCategories.length > 0 && (
        <div className="flex flex-wrap gap-2" style={{ marginTop: "var(--spacing-md)" }}>
          {summary.topCategories.map((cat) => (
            <span key={cat.name} className="text-xs font-semibold px-3 py-1 rounded-full bg-white/20">
              {cat.name} ({cat.count})
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function RecommendationCard({ rec, defaultExpanded }) {
  const [expanded, setExpanded] = useState(defaultExpanded || false);
  const config = priorityConfig[rec.priority];

  return (
    <div
      className={`rounded-xl border transition-all ${config.border} ${expanded ? config.bg : "bg-white"}`}
      style={{ padding: "var(--widget-padding)" }}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 mt-1.5 ${config.dot}`} />
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base font-bold text-gray-900">{rec.title}</h3>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${config.bg} ${config.text}`}>
                  {config.label}
                </span>
              </div>
              <p className="text-sm text-gray-500 mt-1">{rec.summary}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: rec.metricColor }} />
                <span className="text-xs font-medium text-gray-400">
                  {rec.metricName}: <strong className="text-gray-600">{rec.metricValue}{rec.metricUnit}</strong>
                  <span className={`ml-2 font-semibold ${rec.riskLevel === "high" ? "text-rose-500" : "text-amber-500"}`}>
                    {rec.riskLevel === "high" ? "High Risk" : "Moderate Risk"}
                  </span>
                </span>
              </div>
            </div>
          </div>
          <svg
            className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform ${expanded ? "rotate-180" : ""}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {expanded && (
        <div style={{ marginTop: "var(--spacing-md)", marginLeft: "22px" }}>
          <p className="text-sm font-semibold text-gray-700" style={{ marginBottom: "var(--spacing-xs)" }}>Recommended Actions:</p>
          <ul className="space-y-2">
            {rec.actions.map((action, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                <svg className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4" />
                </svg>
                {action}
              </li>
            ))}
          </ul>
          <div className="flex items-center gap-2 mt-3">
            <span className="text-xs font-medium px-2 py-0.5 rounded bg-red-50 text-red-600">{rec.category}</span>
          </div>
        </div>
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="widget-card flex flex-col items-center justify-center" style={{ padding: "var(--spacing-xl) var(--widget-padding)" }}>
      <svg className="w-16 h-16 text-emerald-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={0.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <p className="text-lg font-semibold text-gray-700">All Clear</p>
      <p className="text-sm text-gray-400 mt-1 text-center">No recommendations at this time. All metrics are within healthy ranges.</p>
    </div>
  );
}

function NoFarmState() {
  return (
    <div className="widget-card flex flex-col items-center justify-center" style={{ padding: "var(--spacing-xl) var(--widget-padding)" }}>
      <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={0.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
      <p className="text-lg font-semibold text-gray-400">No farms added yet</p>
      <p className="text-sm text-gray-400 mt-1 text-center">Draw polygons on the map to add farms and receive AI-powered recommendations.</p>
    </div>
  );
}

export default function RecommendationsPanel({ farms, selectedFarmId }) {
  const [filterPriority, setFilterPriority] = useState("all");

  if (farms.length === 0) {
    return (
      <div>
        <AiHeader />
        <NoFarmState />
      </div>
    );
  }

  const selectedFarm = farms.find((f) => f.id === selectedFarmId) || null;
  const targetFarms = selectedFarm ? [selectedFarm] : farms;
  const summary = generatePortfolioSummary(targetFarms);

  // Build per-farm recommendations
  const farmRecs = targetFarms.map((farm) => ({
    farm,
    recommendations: generateRecommendations(farm),
  })).filter((fr) => fr.recommendations.length > 0);

  // Flatten and filter
  const allRecs = farmRecs.flatMap((fr) =>
    fr.recommendations.map((r) => ({ ...r, farmName: fr.farm.name, farmId: fr.farm.id }))
  );

  const filtered = filterPriority === "all"
    ? allRecs
    : allRecs.filter((r) => r.priority === parseInt(filterPriority));

  return (
    <div>
      <AiHeader />

      <div className="widget-stack">
        <SummaryBar summary={summary} />

        {/* Scope indicator */}
        <div className="widget-card flex items-center justify-between flex-wrap" style={{ gap: "var(--spacing-sm)" }}>
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm text-gray-500">
              {selectedFarm
                ? <>Showing recommendations for <strong className="text-gray-900">{selectedFarm.name}</strong></>
                : <>Showing recommendations across <strong className="text-gray-900">{farms.length} farm{farms.length !== 1 ? "s" : ""}</strong></>
              }
            </span>
          </div>
          {/* Priority filter */}
          <div className="flex gap-2">
            {[
              { value: "all", label: "All" },
              { value: "1", label: "Critical" },
              { value: "2", label: "Important" },
              { value: "3", label: "Advisory" },
            ].map((f) => (
              <button
                key={f.value}
                onClick={() => setFilterPriority(f.value)}
                className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-colors ${
                  filterPriority === f.value
                    ? "bg-red-100 text-red-700"
                    : "bg-gray-100 text-gray-400 hover:bg-gray-200"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Recommendations list */}
        {filtered.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="flex flex-col" style={{ gap: "var(--spacing-sm)" }}>
            {!selectedFarm && farmRecs.length > 1 ? (
              // Group by farm when viewing portfolio
              farmRecs.map((fr) => {
                const farmFiltered = filterPriority === "all"
                  ? fr.recommendations
                  : fr.recommendations.filter((r) => r.priority === parseInt(filterPriority));
                if (farmFiltered.length === 0) return null;
                return (
                  <div key={fr.farm.id} className="widget-card">
                    <div className="flex items-center gap-2" style={{ marginBottom: "var(--spacing-md)" }}>
                      <h3 className="text-base font-bold text-gray-900">{fr.farm.name}</h3>
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">{fr.farm.group}</span>
                      <span className="text-xs text-gray-400">{farmFiltered.length} recommendation{farmFiltered.length !== 1 ? "s" : ""}</span>
                    </div>
                    <div className="flex flex-col" style={{ gap: "var(--spacing-sm)" }}>
                      {farmFiltered.map((rec, i) => (
                        <RecommendationCard key={`${fr.farm.id}-${rec.metricId}-${i}`} rec={rec} defaultExpanded={rec.priority === 1} />
                      ))}
                    </div>
                  </div>
                );
              })
            ) : (
              // Single farm or flat list
              filtered.map((rec, i) => (
                <RecommendationCard key={`${rec.metricId}-${i}`} rec={rec} defaultExpanded={rec.priority === 1} />
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
