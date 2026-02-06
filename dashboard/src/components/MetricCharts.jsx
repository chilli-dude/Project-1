import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ReferenceLine,
  Cell,
} from "recharts";
import { METRICS, getRiskLevel } from "../data/metrics";

function CustomTooltip({ active, payload, label, unit }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-lg text-base" style={{ padding: "var(--spacing-sm) var(--spacing-md)" }}>
      <p className="text-gray-400 mb-0.5">{label}</p>
      <p className="text-gray-900 font-bold">
        {payload[0].value} {unit}
      </p>
    </div>
  );
}

function TimeSeriesChart({ data, metric }) {
  return (
    <div className="widget-card">
      <div className="flex items-center justify-between" style={{ marginBottom: "var(--spacing-md)" }}>
        <h3 className="text-lg font-bold text-gray-900">
          {metric.name} Trend
        </h3>
        <span className="text-sm text-gray-400 font-medium">Monthly</span>
      </div>
      <ResponsiveContainer width="100%" height={280}>
        <AreaChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
          <defs>
            <linearGradient id={`grad-${metric.id}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.15} />
              <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f5" vertical={false} />
          <XAxis dataKey="month" tick={{ fill: "#9ca3af", fontSize: 14 }} axisLine={false} tickLine={false} />
          <YAxis domain={metric.range} tick={{ fill: "#9ca3af", fontSize: 14 }} axisLine={false} tickLine={false} width={50} />
          <Tooltip content={<CustomTooltip unit={metric.unit} />} />
          <ReferenceLine y={metric.riskThresholds.high} stroke="#f87171" strokeDasharray="4 4" strokeOpacity={0.4} />
          <ReferenceLine y={metric.riskThresholds.low} stroke="#34d399" strokeDasharray="4 4" strokeOpacity={0.4} />
          <Area type="monotone" dataKey="value" stroke="var(--color-primary)" strokeWidth={2.5} fill={`url(#grad-${metric.id})`} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

function RiskOverviewChart({ data }) {
  const radarData = METRICS.map((metric) => {
    const value = data.current[metric.id];
    const risk = getRiskLevel(metric, value);
    const riskScore = risk === "low" ? 1 : risk === "moderate" ? 2 : 3;
    return {
      metric: metric.name.length > 12 ? metric.name.slice(0, 12) + "..." : metric.name,
      risk: riskScore,
      fullMark: 3,
    };
  });

  return (
    <div className="widget-card">
      <h3 className="widget-heading">Risk Overview</h3>
      <ResponsiveContainer width="100%" height={320}>
        <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="70%">
          <PolarGrid stroke="#e5e7eb" />
          <PolarAngleAxis dataKey="metric" tick={{ fill: "#9ca3af", fontSize: 12 }} />
          <PolarRadiusAxis domain={[0, 3]} tick={{ fill: "#d1d5db", fontSize: 13 }} axisLine={false} tickCount={4} />
          <Radar dataKey="risk" stroke="var(--color-primary)" fill="var(--color-primary)" fillOpacity={0.15} strokeWidth={2} />
        </RadarChart>
      </ResponsiveContainer>
      <div className="flex justify-center gap-5 text-sm text-gray-400 mt-2 font-medium">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-emerald-400" /> 1 = Low
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-amber-400" /> 2 = Moderate
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-rose-400" /> 3 = High
        </span>
      </div>
    </div>
  );
}

function ComparisonBarChart({ data }) {
  const barData = METRICS.map((metric) => {
    const value = data.current[metric.id];
    const [min, max] = metric.range;
    const normalized = ((value - min) / (max - min)) * 100;
    return { name: metric.name.length > 8 ? metric.name.slice(0, 8) + ".." : metric.name, value: +normalized.toFixed(1), fill: metric.color };
  });

  return (
    <div className="widget-card">
      <h3 className="widget-heading">Metric Comparison</h3>
      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={barData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f5" vertical={false} />
          <XAxis dataKey="name" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} interval={0} angle={-30} textAnchor="end" height={50} />
          <YAxis domain={[0, 100]} tick={{ fill: "#9ca3af", fontSize: 14 }} axisLine={false} tickLine={false} width={45} />
          <Tooltip
            contentStyle={{ backgroundColor: "#fff", border: "1px solid #e5e7eb", borderRadius: "12px", fontSize: "16px", color: "#1f2937", boxShadow: "var(--shadow-md)" }}
            formatter={(val) => [`${val}%`, "Normalised"]}
          />
          <Bar dataKey="value" radius={[6, 6, 0, 0]}>
            {barData.map((entry, i) => (
              <Cell key={i} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default function MetricCharts({ data, selectedMetric }) {
  if (!data) {
    return (
      <div className="flex items-center justify-center h-full text-gray-300 text-lg">
        Select a region on the map to view charts
      </div>
    );
  }

  const metric = METRICS.find((m) => m.id === selectedMetric);
  const tsData = data.timeSeries[selectedMetric];

  return (
    <div className="widget-stack">
      {metric && <TimeSeriesChart data={tsData} metric={metric} />}
      <div className="widget-grid grid-cols-1 xl:grid-cols-2">
        <RiskOverviewChart data={data} />
        <ComparisonBarChart data={data} />
      </div>
    </div>
  );
}
