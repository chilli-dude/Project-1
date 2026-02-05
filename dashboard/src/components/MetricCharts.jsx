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
} from "recharts";
import { METRICS, getRiskLevel } from "../data/metrics";

function CustomTooltip({ active, payload, label, unit }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 shadow-xl text-xs">
      <p className="text-slate-400 mb-1">{label}</p>
      <p className="text-white font-semibold">
        {payload[0].value} {unit}
      </p>
    </div>
  );
}

function TimeSeriesChart({ data, metric }) {
  return (
    <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
      <h3 className="text-sm font-medium text-slate-300 mb-3">
        Monthly Trend — {metric.name}
      </h3>
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={`grad-${metric.id}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={metric.color} stopOpacity={0.3} />
              <stop offset="95%" stopColor={metric.color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis
            dataKey="month"
            tick={{ fill: "#94a3b8", fontSize: 11 }}
            axisLine={{ stroke: "#475569" }}
            tickLine={false}
          />
          <YAxis
            domain={metric.range}
            tick={{ fill: "#94a3b8", fontSize: 11 }}
            axisLine={{ stroke: "#475569" }}
            tickLine={false}
            width={40}
          />
          <Tooltip content={<CustomTooltip unit={metric.unit} />} />
          <ReferenceLine
            y={metric.riskThresholds.high}
            stroke="#ef4444"
            strokeDasharray="4 4"
            strokeOpacity={0.5}
          />
          <ReferenceLine
            y={metric.riskThresholds.low}
            stroke="#22c55e"
            strokeDasharray="4 4"
            strokeOpacity={0.5}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke={metric.color}
            strokeWidth={2}
            fill={`url(#grad-${metric.id})`}
          />
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
      metric: metric.name.length > 12 ? metric.name.slice(0, 12) + "…" : metric.name,
      risk: riskScore,
      fullMark: 3,
    };
  });

  return (
    <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
      <h3 className="text-sm font-medium text-slate-300 mb-3">
        Risk Overview
      </h3>
      <ResponsiveContainer width="100%" height={280}>
        <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="70%">
          <PolarGrid stroke="#334155" />
          <PolarAngleAxis
            dataKey="metric"
            tick={{ fill: "#94a3b8", fontSize: 9 }}
          />
          <PolarRadiusAxis
            domain={[0, 3]}
            tick={{ fill: "#64748b", fontSize: 10 }}
            axisLine={false}
            tickCount={4}
          />
          <Radar
            dataKey="risk"
            stroke="#f59e0b"
            fill="#f59e0b"
            fillOpacity={0.2}
            strokeWidth={2}
          />
        </RadarChart>
      </ResponsiveContainer>
      <div className="flex justify-center gap-4 text-xs text-slate-400 mt-1">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-green-400" /> 1 = Low
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-amber-400" /> 2 = Moderate
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-red-400" /> 3 = High
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
    return {
      name: metric.icon,
      value: +normalized.toFixed(1),
      fill: metric.color,
    };
  });

  return (
    <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
      <h3 className="text-sm font-medium text-slate-300 mb-3">
        Metric Values (Normalised %)
      </h3>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={barData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 14 }}
            axisLine={{ stroke: "#475569" }}
            tickLine={false}
          />
          <YAxis
            domain={[0, 100]}
            tick={{ fill: "#94a3b8", fontSize: 11 }}
            axisLine={{ stroke: "#475569" }}
            tickLine={false}
            width={35}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#1e293b",
              border: "1px solid #475569",
              borderRadius: "8px",
              fontSize: "12px",
              color: "#e2e8f0",
            }}
            formatter={(val) => [`${val}%`, "Normalised"]}
          />
          <Bar dataKey="value" radius={[4, 4, 0, 0]}>
            {barData.map((entry, i) => (
              <Bar key={i} fill={entry.fill} />
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
      <div className="flex items-center justify-center h-full text-slate-500 text-sm">
        Select a region on the map to view charts
      </div>
    );
  }

  const metric = METRICS.find((m) => m.id === selectedMetric);
  const tsData = data.timeSeries[selectedMetric];

  return (
    <div className="h-full overflow-y-auto space-y-4 pr-1">
      {metric && <TimeSeriesChart data={tsData} metric={metric} />}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <RiskOverviewChart data={data} />
        <ComparisonBarChart data={data} />
      </div>
    </div>
  );
}
