const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

// Real metrics fetched from Open-Meteo (no API key required)
export const REAL_METRIC_IDS = new Set([
  "temperature",
  "precipitation",
  "wind_speed",
  "evapotranspiration",
]);

export async function fetchRealWeatherData(lat, lng) {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setFullYear(endDate.getFullYear() - 1);

  const fmt = (d) => d.toISOString().slice(0, 10);

  const url =
    `https://archive-api.open-meteo.com/v1/archive?` +
    `latitude=${lat}&longitude=${lng}` +
    `&start_date=${fmt(startDate)}&end_date=${fmt(endDate)}` +
    `&monthly=temperature_2m_max,precipitation_sum,wind_speed_10m_max,et0_fao_evapotranspiration` +
    `&timezone=auto`;

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Open-Meteo HTTP ${res.status}`);
    const json = await res.json();
    const m = json.monthly;
    if (!m || !m.time || m.time.length === 0) throw new Error("No monthly data");

    // Take the last 12 months (or fewer if not available)
    const count = Math.min(m.time.length, 12);
    const offset = m.time.length - count;

    const temperature = [];
    const precipitation = [];
    const wind_speed = [];
    const evapotranspiration = [];

    for (let i = 0; i < count; i++) {
      const idx = offset + i;
      const month = MONTHS[new Date(m.time[idx]).getMonth()];

      temperature.push({
        month,
        value: +(m.temperature_2m_max[idx] ?? 0).toFixed(1),
      });
      precipitation.push({
        month,
        value: +(m.precipitation_sum[idx] ?? 0).toFixed(1),
      });
      wind_speed.push({
        month,
        value: +((m.wind_speed_10m_max[idx] ?? 0) ).toFixed(1),
      });
      evapotranspiration.push({
        month,
        // Convert monthly total to daily average (divide by ~30)
        value: +((m.et0_fao_evapotranspiration[idx] ?? 0) / 30).toFixed(2),
      });
    }

    // Current values = most recent month
    const last = count - 1;

    return {
      current: {
        temperature: temperature[last].value,
        precipitation: precipitation[last].value,
        wind_speed: wind_speed[last].value,
        evapotranspiration: evapotranspiration[last].value,
      },
      timeSeries: {
        temperature,
        precipitation,
        wind_speed,
        evapotranspiration,
      },
    };
  } catch (err) {
    console.warn("Open-Meteo fetch failed, falling back to simulated data:", err.message);
    return null;
  }
}
