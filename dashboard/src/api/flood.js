// Open-Meteo Flood API - River discharge for flood risk
// Free, no API key, GloFAS reanalysis data
const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

export async function fetchFloodData(lat, lng) {
  try {
    const url =
      `https://flood-api.open-meteo.com/v1/flood` +
      `?latitude=${lat}&longitude=${lng}` +
      `&daily=river_discharge&past_days=730&forecast_days=0`;

    const res = await fetch(url);
    if (!res.ok) throw new Error(`Flood API HTTP ${res.status}`);
    const json = await res.json();

    const daily = json.daily;
    if (!daily || !daily.river_discharge) throw new Error("No flood data");

    const values = daily.river_discharge.filter((v) => v != null);
    if (values.length === 0) throw new Error("No valid discharge data");

    // Compute percentiles for risk scoring
    const sorted = [...values].sort((a, b) => a - b);
    const pct = (p) => sorted[Math.floor(sorted.length * p)];
    const p50 = pct(0.5);
    const p90 = pct(0.9);
    const p95 = pct(0.95);
    const p99 = pct(0.99);

    const current = values[values.length - 1];

    // Risk index 0-10 based on percentile position
    let risk;
    if (p50 === 0) {
      risk = current > 0 ? 5 : 0;
    } else if (current <= p50) {
      risk = (current / p50) * 3;
    } else if (current <= p90) {
      risk = 3 + ((current - p50) / (p90 - p50)) * 2;
    } else if (current <= p95) {
      risk = 5 + ((current - p90) / (p95 - p90)) * 2;
    } else if (current <= p99) {
      risk = 7 + ((current - p95) / (p99 - p95)) * 2;
    } else {
      risk = 9 + Math.min(1, (current - p99) / Math.max(p99 * 0.5, 1));
    }

    risk = +Math.max(0, Math.min(10, risk)).toFixed(1);

    // Monthly time series (max discharge per month, normalized to 0-10)
    const monthlyBuckets = {};
    daily.time.forEach((date, i) => {
      if (daily.river_discharge[i] == null) return;
      const m = MONTHS[new Date(date).getMonth()];
      if (!monthlyBuckets[m]) monthlyBuckets[m] = [];
      monthlyBuckets[m].push(daily.river_discharge[i]);
    });

    const maxDischarge = Math.max(...values, 1);
    const now = new Date();
    const timeSeries = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const month = MONTHS[d.getMonth()];
      const vals = monthlyBuckets[month];
      if (vals && vals.length > 0) {
        timeSeries.push({
          month,
          value: +((Math.max(...vals) / maxDischarge) * 10).toFixed(1),
        });
      }
    }

    return { current: risk, timeSeries };
  } catch (err) {
    console.warn("Flood API fetch failed:", err.message);
    return null;
  }
}
