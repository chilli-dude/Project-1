import { METRICS, getRiskLevel } from "./metrics";

/**
 * Recommendation knowledge base.
 * Each metric has recommendations keyed by risk level.
 * priority: 1 = critical, 2 = important, 3 = advisory
 */
const RECOMMENDATION_DB = {
  soil_moisture: {
    high: [
      { title: "Low Soil Moisture Detected", summary: "Soil moisture is critically low, indicating potential crop water stress.", actions: ["Install drip irrigation or micro-sprinkler systems", "Apply organic mulch (5-10 cm) to reduce evaporation", "Implement deficit irrigation scheduling based on crop growth stage", "Consider drought-tolerant crop varieties for the next planting cycle"], priority: 1, category: "Water Management" },
    ],
    moderate: [
      { title: "Soil Moisture Below Optimal", summary: "Moisture levels are adequate but trending low. Preventive measures recommended.", actions: ["Monitor soil moisture sensors weekly", "Schedule supplemental irrigation during dry spells", "Increase organic matter content through cover cropping"], priority: 2, category: "Water Management" },
    ],
  },
  ndvi: {
    high: [
      { title: "Low Vegetation Health (NDVI)", summary: "NDVI readings indicate poor crop vigour, possibly due to nutrient deficiency, pest damage, or water stress.", actions: ["Conduct soil nutrient analysis and apply targeted fertilisation", "Scout fields for pest and disease symptoms", "Review and adjust irrigation schedules", "Consider foliar nutrient applications for quick recovery"], priority: 1, category: "Crop Health" },
    ],
    moderate: [
      { title: "Vegetation Health Declining", summary: "NDVI is in the moderate range. Crop vigour could be improved.", actions: ["Increase nitrogen application if soil tests support it", "Improve canopy management through pruning", "Check for early signs of pest or disease pressure"], priority: 2, category: "Crop Health" },
    ],
  },
  precipitation: {
    high: [
      { title: "Excessive Rainfall Alert", summary: "Precipitation levels are very high, increasing flood and waterlogging risk.", actions: ["Improve field drainage infrastructure (ditches, subsurface drains)", "Raise seedbed height in flood-prone areas", "Apply fungicide to prevent moisture-related diseases", "Delay any planned fertiliser applications to prevent runoff"], priority: 1, category: "Water Management" },
    ],
    moderate: [
      { title: "Rainfall Monitoring Advisory", summary: "Precipitation is within normal range but should be monitored.", actions: ["Maintain drainage channels clear of debris", "Plan field operations around forecasted dry windows"], priority: 3, category: "Water Management" },
    ],
  },
  temperature: {
    high: [
      { title: "Extreme Heat Warning", summary: "Temperatures exceed safe thresholds, risking heat stress to crops and livestock.", actions: ["Deploy shade structures or shade cloth over sensitive crops", "Increase irrigation frequency to offset evapotranspiration", "Shift field work to early morning and late evening", "Ensure livestock have access to shade and additional water", "Consider heat-tolerant cultivars for future planting"], priority: 1, category: "Climate Adaptation" },
    ],
    moderate: [
      { title: "Elevated Temperature Advisory", summary: "Temperatures are above average. Monitor crop stress indicators.", actions: ["Watch for leaf wilting and curling as early stress signs", "Ensure adequate soil moisture through consistent irrigation", "Apply reflective mulch to reduce soil surface temperature"], priority: 2, category: "Climate Adaptation" },
    ],
  },
  evapotranspiration: {
    high: [
      { title: "High Evapotranspiration Rate", summary: "Water loss through ET is very high, meaning crops need significantly more water than normal.", actions: ["Increase irrigation volume to match ET demand", "Use ET-based irrigation scheduling tools", "Apply thick mulch layers to reduce soil evaporation", "Consider switching to crops with lower water requirements"], priority: 1, category: "Water Management" },
    ],
    moderate: [
      { title: "Elevated Evapotranspiration", summary: "ET rates are moderately high. Ensure irrigation keeps pace.", actions: ["Monitor soil moisture more frequently", "Adjust irrigation schedules using ET data", "Maintain mulch coverage on exposed soil"], priority: 2, category: "Water Management" },
    ],
  },
  soil_carbon: {
    high: [
      { title: "Low Soil Organic Carbon", summary: "Soil organic carbon is critically low, reducing soil fertility, water retention, and microbial activity.", actions: ["Implement cover cropping (legumes, grasses) to build organic matter", "Apply compost or biochar at 5-10 tonnes/ha", "Reduce tillage to minimum or no-till to preserve carbon", "Introduce crop rotation with high-residue crops", "Consider agroforestry to increase long-term carbon storage"], priority: 1, category: "Soil Health" },
    ],
    moderate: [
      { title: "Soil Carbon Below Target", summary: "Organic carbon levels are adequate but could be improved for better soil health.", actions: ["Maintain cover crop rotations", "Incorporate crop residues rather than burning", "Apply organic amendments annually"], priority: 2, category: "Soil Health" },
    ],
  },
  wind_speed: {
    high: [
      { title: "High Wind Speed Alert", summary: "Wind speeds are dangerously high, posing risk of soil erosion, crop lodging, and structural damage.", actions: ["Plant windbreak hedgerows or shelterbelts along exposed boundaries", "Stake and support tall or vulnerable crops", "Apply erosion-control measures (cover crops, straw mulch)", "Delay aerial spraying until wind subsides", "Inspect and secure farm structures and equipment"], priority: 1, category: "Environmental Protection" },
    ],
    moderate: [
      { title: "Elevated Wind Exposure", summary: "Wind speeds are above average. Erosion and crop damage risk is moderate.", actions: ["Plan windbreak planting for next season", "Maintain ground cover to prevent wind erosion", "Monitor crop lodging in exposed fields"], priority: 2, category: "Environmental Protection" },
    ],
  },
  flood_risk: {
    high: [
      { title: "High Flood Risk", summary: "Flood risk index is elevated. Immediate protective measures are needed.", actions: ["Clear and deepen all drainage channels", "Install flood barriers or levees around critical infrastructure", "Move stored inputs (fertiliser, seed) to elevated areas", "Ensure emergency response plan is in place and communicated", "Consider flood-tolerant crop varieties (e.g. deepwater rice)"], priority: 1, category: "Disaster Preparedness" },
    ],
    moderate: [
      { title: "Moderate Flood Susceptibility", summary: "Some flood risk exists. Preparedness measures should be reviewed.", actions: ["Inspect and maintain drainage infrastructure", "Identify low-lying areas most vulnerable to inundation", "Review crop insurance coverage for flood events"], priority: 2, category: "Disaster Preparedness" },
    ],
  },
  drought_severity: {
    high: [
      { title: "Severe Drought Conditions", summary: "Drought severity index indicates significant water deficit. Crop failure risk is elevated.", actions: ["Implement emergency irrigation from alternative water sources", "Prioritise irrigation to highest-value crops", "Apply anti-transpirant sprays to reduce crop water loss", "Negotiate water-sharing agreements with neighbouring farms", "Begin contingency planning for potential crop insurance claims", "Consider early harvest of stressed crops to salvage yield"], priority: 1, category: "Drought Response" },
    ],
    moderate: [
      { title: "Drought Conditions Developing", summary: "Drought indicators are showing stress. Proactive water management is advised.", actions: ["Reduce non-essential water usage on the farm", "Increase mulching and soil cover practices", "Monitor weather forecasts for rainfall outlook", "Prepare irrigation infrastructure for increased demand"], priority: 2, category: "Drought Response" },
    ],
  },
  biodiversity: {
    high: [
      { title: "Low Biodiversity Index", summary: "Ecosystem diversity around the farm is critically low, weakening natural pest control and pollination services.", actions: ["Establish native wildflower strips along field margins (3-6m wide)", "Create or restore hedgerows with diverse native species", "Reduce pesticide use and adopt Integrated Pest Management (IPM)", "Install nesting boxes, insect hotels, and pollinator habitats", "Maintain buffer zones around water courses", "Consider agroforestry to diversify the farming system"], priority: 1, category: "Ecosystem Services" },
    ],
    moderate: [
      { title: "Biodiversity Below Target", summary: "Biodiversity is adequate but could be enhanced for better ecosystem resilience.", actions: ["Expand existing habitat corridors between fields", "Diversify crop rotations to support soil biota", "Reduce mowing frequency on field margins during nesting season"], priority: 2, category: "Ecosystem Services" },
    ],
  },
};

/**
 * Generate recommendations for a farm based on its current metrics.
 * Returns an array of recommendation objects sorted by priority.
 */
export function generateRecommendations(farm) {
  if (!farm?.metricsData) return [];

  const recommendations = [];

  METRICS.forEach((metric) => {
    const value = farm.metricsData.current[metric.id];
    const risk = getRiskLevel(metric, value);

    if (risk === "low") return; // no recommendation needed

    const metricRecs = RECOMMENDATION_DB[metric.id]?.[risk];
    if (!metricRecs) return;

    metricRecs.forEach((rec) => {
      recommendations.push({
        ...rec,
        metricId: metric.id,
        metricName: metric.name,
        metricValue: value,
        metricUnit: metric.unit,
        metricColor: metric.color,
        riskLevel: risk,
      });
    });
  });

  // Sort by priority (1 = critical first), then alphabetically
  recommendations.sort((a, b) => a.priority - b.priority || a.title.localeCompare(b.title));

  return recommendations;
}

/**
 * Generate a portfolio-wide summary of recommendations across all farms.
 */
export function generatePortfolioSummary(farms) {
  if (!farms || farms.length === 0) return { total: 0, critical: 0, important: 0, advisory: 0, topCategories: [] };

  let critical = 0;
  let important = 0;
  let advisory = 0;
  const categoryCounts = {};

  farms.forEach((farm) => {
    const recs = generateRecommendations(farm);
    recs.forEach((r) => {
      if (r.priority === 1) critical++;
      else if (r.priority === 2) important++;
      else advisory++;
      categoryCounts[r.category] = (categoryCounts[r.category] || 0) + 1;
    });
  });

  const topCategories = Object.entries(categoryCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, count]) => ({ name, count }));

  return { total: critical + important + advisory, critical, important, advisory, topCategories };
}
