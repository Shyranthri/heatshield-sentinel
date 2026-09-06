/**
 * HEATSHIELD — DEMO ward dataset (72 Coimbatore Municipal Corporation wards).
 *
 * This module is the ONLY place demo data lives. Replace it with backend
 * responses from:
 *   GET  /wards/all-risk   -> WardRisk[]
 *   POST /predict-risk     -> WardRisk
 * Geometry is emitted as a GeoJSON FeatureCollection so a real ward
 * shapefile/GeoJSON can be dropped in without touching the map component.
 */

export type RiskLevel = "LOW" | "MODERATE" | "HIGH" | "EXTREME";

export interface ShapFactor {
  feature: string;
  contribution: number; // signed contribution to the risk score
}

export interface ForecastPoint {
  horizon: string; // NOW, T+1, T+3, T+5
  wbgt: number;
  risk_score: number;
  risk_level: RiskLevel;
}

export interface WardRisk {
  ward_id: number;
  ward_name: string;
  zone: string;
  risk_score: number;
  risk_level: RiskLevel;
  wbgt: number;
  temperature: number;
  humidity: number;
  wind_speed: number;
  vulnerability_score: number;
  population: number;
  elderly_population: number;
  illiteracy_proxy: number; // % of population, Census-derived proxy
  non_working_population: number; // % of population
  forecast_t1: ForecastPoint;
  forecast_t3: ForecastPoint;
  forecast_t5: ForecastPoint;
  shap_factors: ShapFactor[];
  advisory: WardAdvisory;
}

export interface WardAdvisory {
  reason: string;
  recommended_action: string[];
  priority: "P1" | "P2" | "P3";
  review_status: "PENDING REVIEW" | "REVIEWED" | "RELEASED — DEMO";
  generated_by: string;
}

const ZONES = ["North Zone", "South Zone", "East Zone", "West Zone", "Central Zone"];

const WARD_AREAS = [
  "Thudiyalur", "Vellakinar", "Kavundampalayam", "Edayarpalayam", "Saibaba Colony",
  "Gandhipuram", "R.S. Puram", "Race Course", "Peelamedu", "Singanallur",
  "Ondipudur", "Ganapathy", "Sanganoor", "Ramanathapuram", "Sundarapuram",
  "Kurichi", "Podanur", "Ukkadam", "Town Hall", "Selvapuram",
  "Vadavalli", "Thondamuthur Road", "Kalapatti", "Chinniyampalayam", "Telungupalayam",
  "Sivananda Colony", "Puliakulam", "Sowripalayam", "Vilankurichi", "Veerakeralam",
  "Kuniyamuthur", "Madukkarai Road", "Perur", "Rathinapuri", "Karumbukkadai",
  "Kattoor",
];

// Deterministic pseudo-random so every render/session shows identical demo data.
function rand(seed: number) {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

function levelFor(score: number): RiskLevel {
  if (score >= 0.8) return "EXTREME";
  if (score >= 0.6) return "HIGH";
  if (score >= 0.4) return "MODERATE";
  return "LOW";
}

const SHAP_FEATURES = [
  "Rising 3-day heat trend",
  "High relative humidity",
  "Low wind speed",
  "Recent WBGT (24h mean)",
  "Elderly population share",
  "Built-up surface density",
  "Solar radiation load",
  "Night-time heat retention",
];

// Extreme/high demo hotspots referenced across the platform.
const HOTSPOTS: Record<number, number> = {
  34: 0.87, 25: 0.78, 41: 0.74, 18: 0.83, 52: 0.71, 7: 0.81, 63: 0.69, 29: 0.82, 12: 0.66,
};

function buildWard(id: number): WardRisk {
  const r = rand(id + 1);
  const r2 = rand(id * 3 + 7);
  const r3 = rand(id * 7 + 13);
  const score = Number((HOTSPOTS[id] ?? 0.22 + r * 0.55).toFixed(2));
  const level = levelFor(score);
  const wbgt = Number((26.5 + score * 9.2 + r2 * 0.8).toFixed(1));
  const temperature = Number((33 + score * 6.5 + r3 * 1.2).toFixed(1));
  const humidity = Math.round(42 + r2 * 34 + score * 8);
  const wind = Number((1.1 + (1 - score) * 3.4 + r3 * 0.6).toFixed(1));
  const vulnerability = Number((0.28 + r3 * 0.4 + score * 0.28).toFixed(2));
  const population = Math.round(11000 + r * 21000);

  const mkPoint = (horizon: string, delta: number, drift: number): ForecastPoint => {
    const s = Math.min(0.98, Math.max(0.05, Number((score + drift).toFixed(2))));
    return {
      horizon,
      wbgt: Number((wbgt + delta).toFixed(1)),
      risk_score: s,
      risk_level: levelFor(s),
    };
  };

  const trend = (r2 - 0.35) * 0.16;
  const shap = SHAP_FEATURES.map((feature, i) => ({
    feature,
    contribution: Number(
      ((rand(id * 11 + i * 5) - 0.28) * (0.34 - i * 0.028) * (0.6 + score)).toFixed(3),
    ),
  }))
    .sort((a, b) => Math.abs(b.contribution) - Math.abs(a.contribution))
    .slice(0, 6);

  const topFactors = shap
    .slice(0, 3)
    .map((f) => f.feature.toLowerCase())
    .join(", ");

  const advisory: WardAdvisory = {
    reason: `Forecast WBGT of ${(wbgt + 0.9).toFixed(1)}°C with a ${level.toLowerCase()} composite heat-risk score of ${score.toFixed(
      2,
    )}. Leading model contributors: ${topFactors}. Ward vulnerability index is ${vulnerability.toFixed(
      2,
    )}, with an estimated ${Math.round(population * (0.07 + r3 * 0.05)).toLocaleString()} residents in the elderly and dependent categories.`,
    recommended_action:
      level === "EXTREME"
        ? [
            "Open designated cooling centres and extend operating hours to 21:00.",
            "Deploy ORS and drinking-water points at markets, bus stops and construction clusters.",
            "Shift outdoor municipal and construction work away from 11:00–16:00.",
            "Run door-to-door checks for elderly and bed-bound residents through ward health workers.",
            "Place primary health centre with heat-stroke protocol and cold-pack stock on standby.",
          ]
        : level === "HIGH"
          ? [
              "Pre-position water and ORS at high-footfall public locations.",
              "Advise rescheduling of outdoor labour to early morning shifts.",
              "Issue ward-level public health advisory through local channels.",
              "Alert ward health workers to monitor vulnerable households.",
            ]
          : level === "MODERATE"
            ? [
                "Maintain public hydration points at transit hubs.",
                "Share routine heat-safety messaging for outdoor workers.",
                "Continue monitoring; re-assess at next forecast cycle.",
              ]
            : [
                "No escalation required. Continue routine monitoring.",
                "Maintain standard hydration and shade provisions.",
              ],
    priority: level === "EXTREME" ? "P1" : level === "HIGH" ? "P2" : "P3",
    review_status: level === "EXTREME" ? "PENDING REVIEW" : "REVIEWED",
    generated_by: "Gemini LLM — from model risk score + SHAP factors",
  };

  return {
    ward_id: id,
    ward_name: `Ward ${id} — ${WARD_AREAS[(id - 1) % WARD_AREAS.length] ?? "Coimbatore"}`,
    zone: ZONES[id % ZONES.length] ?? "Central Zone",
    risk_score: score,
    risk_level: level,
    wbgt,
    temperature,
    humidity,
    wind_speed: wind,
    vulnerability_score: vulnerability,
    population,
    elderly_population: Math.round(population * (0.06 + r3 * 0.05)),
    illiteracy_proxy: Number((9 + r * 17).toFixed(1)),
    non_working_population: Number((38 + r2 * 18).toFixed(1)),
    forecast_t1: mkPoint("T+1", 0.9, trend + 0.05),
    forecast_t3: mkPoint("T+3", 1.4 + r2, trend + 0.08),
    forecast_t5: mkPoint("T+5", 0.6 + r3, trend - 0.02),
    shap_factors: shap,
    advisory,
  };
}

export const WARDS: WardRisk[] = Array.from({ length: 72 }, (_, i) => buildWard(i + 1));

/* ---------------------------------------------------------------------------
 * Demo ward geometry as GeoJSON (EPSG:4326) around Coimbatore city centre.
 * Swap `WARD_GEOJSON` for the official CMC ward boundary file when available.
 * ------------------------------------------------------------------------- */

export interface WardFeature {
  type: "Feature";
  properties: { ward_id: number };
  geometry: { type: "Polygon"; coordinates: [number, number][][] };
}

export interface WardFeatureCollection {
  type: "FeatureCollection";
  features: WardFeature[];
}

const CENTER: [number, number] = [76.9558, 11.0168];
const COLS = 9;
const ROWS = 8;
const CELL = 0.0165;

function buildGeoJSON(): WardFeatureCollection {
  const features: WardFeature[] = [];
  for (let i = 0; i < COLS * ROWS; i++) {
    const id = i + 1;
    const col = i % COLS;
    const row = Math.floor(i / COLS);
    const jx = (rand(id * 5) - 0.5) * CELL * 0.22;
    const jy = (rand(id * 9) - 0.5) * CELL * 0.22;
    const lon0 = CENTER[0] - (COLS * CELL) / 2 + col * CELL + jx;
    const lat0 = CENTER[1] + (ROWS * CELL) / 2 - row * CELL + jy;
    const g = CELL * 0.06;
    const ring: [number, number][] = [
      [lon0 + g, lat0 - g],
      [lon0 + CELL - g, lat0 - g * 1.6],
      [lon0 + CELL - g * 1.2, lat0 - CELL + g],
      [lon0 + g * 1.6, lat0 - CELL + g * 1.2],
      [lon0 + g, lat0 - g],
    ];
    features.push({
      type: "Feature",
      properties: { ward_id: id },
      geometry: { type: "Polygon", coordinates: [ring] },
    });
  }
  return { type: "FeatureCollection", features };
}

export const WARD_GEOJSON: WardFeatureCollection = buildGeoJSON();
