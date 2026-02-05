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
    <div className="bg-white border border-gray-200 rounded-xl px-3 py-2 shadow-lg text-xs">
      <p className="text-gray-400 mb-0.5">{label}</p>
      <p className="text-gray-900 font-bold">
        {payload[0].value} {unit}
      </p>
    </div>
  );
}

function TimeSeriesChart({ data, metric }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-gray-900">
          {metric.name} Trend
        </h3>
        <span className="text-[11px] text-gray-400 font-medium">Show by months</span>
      </div>
      <ResponsiveContainer width="100%" height={240}>
        <AreaChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
          <defs>
            <linearGradient id={`grad-${metric.id}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.15} />
              <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f5" vertical={false} />
          <XAxis
            dataKey="month"
            tick={{ fill: "#9ca3af", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            domain={metric.range}
            tick={{ fill: "#9ca3af", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={40}
          />
          <Tooltip content={<CustomTooltip unit={metric.unit} />} />
          <ReferenceLine
            y={metric.riskThresholds.high}
            stroke="#f87171"
            strokeDasharray="4 4"
            strokeOpacity={0.4}
          />
          <ReferenceLine
            y={metric.riskThresholds.low}
            stroke="#34d399"
            strokeDasharray="4 4"
            strokeOpacity={0.4}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke="#7c3aed"
            strokeWidth={2.5}
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
      metric: metric.name.length > 12 ? metric.name.slice(0, 12) + "..." : metric.name,
      risk: riskScore,
      fullMark: 3,
    };
  });

  return (
    <div className="bg-white rounded-2xl shadow-sm p-5">
      <h3 className="text-sm font-bold text-gray-900 mb-3">Risk Overview</h3>
      <ResponsiveContainer width="100%" height={280}>
        <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="70%">
          <PolarGrid stroke="#e5e7eb" />
          <PolarAngleAxis
            dataKey="metric"
            tick={{ fill: "#9ca3af", fontSize: 9 }}
          />
          <PolarRadiusAxis
            domain={[0, 3]}
            tick={{ fill: "#d1d5db", fontSize: 10 }}
            axisLine={false}
            tickCount={4}
          />
          <Radar
            dataKey="risk"
            stroke="#7c3aed"
            fill="#7c3aed"
            fillOpacity={0.15}
            strokeWidth={2}
          />
        </RadarChart>
      </ResponsiveContainer>
      <div className="flex justify-center gap-4 text-[10px] text-gray-400 mt-1 font-medium">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-emerald-400" /> 1 = Low
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-amber-400" /> 2 = Moderate
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-rose-400" /> 3 = High
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
    <div className="bg-white rounded-2xl shadow-sm p-5">
      <h3 className="text-sm font-bold text-gray-900 mb-3">Metric Comparison</h3>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={barData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f5" vertical={false} />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 14 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            domain={[0, 100]}
            tick={{ fill: "#9ca3af", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={35}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#ffffff",
              border: "1px solid #e5e7eb",
              borderRadius: "12px",
              fontSize: "12px",
              color: "#1f2937",
              boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
            }}
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
      <div className="flex items-center justify-center h-full text-gray-300 text-sm">
        Select a region on the map to view charts
      </div>
    );
  }

  const metric = METRICS.find((m) => m.id === selectedMetric);
  const tsData = data.timeSeries[selectedMetric];

  return (
    <div className="space-y-5">
      {metric && <TimeSeriesChart data={tsData} metric={metric} />}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <RiskOverviewChart data={data} />
        <ComparisonBarChart data={data} />
      </div>
    </div>
  );
}
