// ISRIC SoilGrids v2.0 REST API - Soil Organic Carbon
// Free, no API key, returns static baseline SOC data
export async function fetchSoilCarbonData(lat, lng) {
  try {
    const url =
      `https://rest.isric.org/soilgrids/v2.0/properties/query` +
      `?lon=${lng}&lat=${lat}` +
      `&property=soc&depth=0-5cm&depth=5-15cm&depth=15-30cm&value=mean`;

    const res = await fetch(url);
    if (!res.ok) throw new Error(`ISRIC HTTP ${res.status}`);
    const json = await res.json();

    const layers = json.properties?.layers?.[0]?.depths;
    if (!layers || layers.length === 0) throw new Error("No SOC data");

    let total = 0;
    let count = 0;
    layers.forEach((layer) => {
      const val = layer.values?.mean;
      if (val != null) {
        total += val;
        count++;
      }
    });

    if (count === 0) throw new Error("No valid SOC values");

    // SoilGrids returns SOC in dg/kg (decigrams per kg)
    // Convert: dg/kg / 100 = percentage
    const socPercent = +((total / count) / 100).toFixed(2);

    return { soil_carbon: Math.max(0, Math.min(8, socPercent)) };
  } catch (err) {
    console.warn("ISRIC SoilGrids fetch failed:", err.message);
    return null;
  }
}
