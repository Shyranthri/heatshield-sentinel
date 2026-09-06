/**
 * HEATSHIELD mock API/service layer.
 *
 * Every screen reads through this module only. To go live, replace each
 * function body with a fetch to the real service — signatures stay identical.
 *
 *   getAllWardRisk()   -> GET  /wards/all-risk
 *   predictRisk(id)    -> POST /predict-risk   { ward_id }
 *   getWardGeoJson()   -> GET  /wards/geojson
 *   getAlerts()        -> GET  /alerts
 *   getActions()       -> GET  /actions
 *   getSystemStatus()  -> GET  /system/status
 */

import {
  WARDS,
  WARD_GEOJSON,
  type RiskLevel,
  type WardFeatureCollection,
  type WardRisk,
} from "@/data/wards";

export const API_MODE = "DEMO DATA — API READY" as const;
export const API_BASE = "/api"; // point at the FastAPI service when connected

const latency = <T>(value: T, ms = 220): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(value), ms));

export const getAllWardRisk = (): Promise<WardRisk[]> => latency(WARDS);

export const predictRisk = (ward_id: number): Promise<WardRisk> => {
  const ward = WARDS.find((w) => w.ward_id === ward_id) ?? WARDS[0]!;
  return latency(ward, 320);
};

export const getWardGeoJson = (): Promise<WardFeatureCollection> => latency(WARD_GEOJSON, 120);

export interface CityStats {
  city_risk: RiskLevel;
  extreme_wards: number;
  high_wards: number;
  moderate_wards: number;
  low_wards: number;
  peak_forecast_wbgt: number;
  early_warning_hours: number;
  updated_at: string;
}

export const getCityStats = async (): Promise<CityStats> => {
  const wards = await getAllWardRisk();
  const count = (l: RiskLevel) => wards.filter((w) => w.risk_level === l).length;
  const peak = Math.max(...wards.map((w) => Math.max(w.forecast_t1.wbgt, w.forecast_t3.wbgt)));
  const extreme = count("EXTREME");
  return {
    city_risk: extreme > 3 ? "EXTREME" : count("HIGH") > 10 ? "HIGH" : "MODERATE",
    extreme_wards: extreme,
    high_wards: count("HIGH"),
    moderate_wards: count("MODERATE"),
    low_wards: count("LOW"),
    peak_forecast_wbgt: Number(peak.toFixed(1)),
    early_warning_hours: 18,
    updated_at: new Date().toISOString(),
  };
};

export interface CityForecastPoint {
  horizon: string;
  label: string;
  wbgt: number;
  risk_level: RiskLevel;
  trend: "RISING" | "STEADY" | "EASING";
  wards_at_risk: number;
}

export const getCityForecast = async (): Promise<CityForecastPoint[]> => {
  const wards = await getAllWardRisk();
  const mean = (fn: (w: WardRisk) => number) =>
    Number((wards.reduce((a, w) => a + fn(w), 0) / wards.length).toFixed(1));
  return [
    {
      horizon: "NOW",
      label: "Current conditions",
      wbgt: mean((w) => w.wbgt),
      risk_level: "HIGH",
      trend: "RISING",
      wards_at_risk: wards.filter((w) => w.risk_score >= 0.6).length,
    },
    {
      horizon: "T+1",
      label: "Next 24 hours",
      wbgt: mean((w) => w.forecast_t1.wbgt),
      risk_level: "EXTREME",
      trend: "RISING",
      wards_at_risk: wards.filter((w) => w.forecast_t1.risk_score >= 0.6).length,
    },
    {
      horizon: "T+3",
      label: "Day 3",
      wbgt: mean((w) => w.forecast_t3.wbgt),
      risk_level: "EXTREME",
      trend: "RISING",
      wards_at_risk: wards.filter((w) => w.forecast_t3.risk_score >= 0.6).length,
    },
    {
      horizon: "T+5",
      label: "Day 5",
      wbgt: mean((w) => w.forecast_t5.wbgt),
      risk_level: "HIGH",
      trend: "EASING",
      wards_at_risk: wards.filter((w) => w.forecast_t5.risk_score >= 0.6).length,
    },
  ];
};

export const getCityShapDrivers = async (): Promise<{ feature: string; impact: number }[]> => {
  const wards = await getAllWardRisk();
  const totals = new Map<string, number>();
  for (const w of wards) {
    for (const f of w.shap_factors) {
      totals.set(f.feature, (totals.get(f.feature) ?? 0) + Math.abs(f.contribution));
    }
  }
  const max = Math.max(...totals.values());
  return [...totals.entries()]
    .map(([feature, v]) => ({ feature, impact: Number((v / max).toFixed(2)) }))
    .sort((a, b) => b.impact - a.impact);
};

export type AlertSeverity = "CRITICAL" | "HIGH" | "MODERATE";
export type AlertStatus = "READY TO ISSUE" | "DRAFT" | "ACKNOWLEDGED" | "SENT — DEMO";

export interface HeatAlert {
  id: string;
  severity: AlertSeverity;
  title: string;
  ward_id: number;
  ward_name: string;
  expected_in: string;
  issued_at: string;
  message: string;
  status: AlertStatus;
  channels: string[];
}

export const getAlerts = async (): Promise<HeatAlert[]> => {
  const wards = await getAllWardRisk();
  const top = [...wards].sort((a, b) => b.risk_score - a.risk_score).slice(0, 7);
  const statuses: AlertStatus[] = [
    "READY TO ISSUE",
    "READY TO ISSUE",
    "ACKNOWLEDGED",
    "DRAFT",
    "SENT — DEMO",
    "DRAFT",
    "ACKNOWLEDGED",
  ];
  return top.map((w, i) => ({
    id: `HS-2026-${(1041 + i).toString()}`,
    severity: w.risk_level === "EXTREME" ? "CRITICAL" : w.risk_level === "HIGH" ? "HIGH" : "MODERATE",
    title:
      w.risk_level === "EXTREME"
        ? "Extreme heat risk detected"
        : w.risk_level === "HIGH"
          ? "Heat stress escalation"
          : "Elevated heat stress watch",
    ward_id: w.ward_id,
    ward_name: w.ward_name,
    expected_in: i === 0 ? "Within 18 hours" : `Within ${24 + i * 6} hours`,
    issued_at: `${String(6 + i).padStart(2, "0")}:${i % 2 ? "45" : "15"} IST`,
    message: `Forecast WBGT ${w.forecast_t1.wbgt.toFixed(1)}°C in ${w.ward_name}. Risk score ${w.risk_score.toFixed(
      2,
    )} (${w.risk_level}). Activate ward-level heat response and protect vulnerable residents.`,
    status: statuses[i] ?? "DRAFT",
    channels: ["SMS", "WhatsApp", "Public Notice"],
  }));
};

export interface ResponseAction {
  id: string;
  title: string;
  description: string;
  priority: "P1" | "P2" | "P3";
  wards: number[];
  status: "AWAITING REVIEW" | "IN PROGRESS" | "PLANNED";
  owner: string;
}

export const getActions = async (): Promise<ResponseAction[]> => {
  const wards = await getAllWardRisk();
  const sorted = [...wards].sort((a, b) => b.risk_score - a.risk_score);
  const ids = sorted.map((w) => w.ward_id);
  return [
    {
      id: "ACT-01",
      title: "ACTIVATE COOLING CENTRES",
      description:
        "Open designated cooling shelters in extreme-risk wards with extended evening hours and drinking-water provision.",
      priority: "P1",
      wards: ids.slice(0, 5),
      status: "AWAITING REVIEW",
      owner: "Ward Health Officers",
    },
    {
      id: "ACT-02",
      title: "PROTECT VULNERABLE POPULATIONS",
      description:
        "Door-to-door checks for elderly, bed-bound and dependent residents in wards with high vulnerability index.",
      priority: "P1",
      wards: ids.slice(0, 8),
      status: "IN PROGRESS",
      owner: "Urban Health Nurses",
    },
    {
      id: "ACT-03",
      title: "ISSUE PUBLIC HEALTH ADVISORY",
      description:
        "Release ward-targeted heat-safety advisory drafted from model risk output and SHAP drivers, after duty officer review.",
      priority: "P2",
      wards: ids.slice(0, 12),
      status: "AWAITING REVIEW",
      owner: "Corporation Public Relations",
    },
    {
      id: "ACT-04",
      title: "ADJUST OUTDOOR WORK",
      description:
        "Shift municipal and construction labour out of the 11:00–16:00 window; mandate shaded rest breaks every hour.",
      priority: "P2",
      wards: ids.slice(2, 10),
      status: "PLANNED",
      owner: "Engineering & Labour Cell",
    },
    {
      id: "ACT-05",
      title: "PRE-POSITION EMERGENCY RESOURCES",
      description:
        "Stage ORS, cold packs and ambulance cover at primary health centres serving the highest-risk ward cluster.",
      priority: "P1",
      wards: ids.slice(0, 6),
      status: "PLANNED",
      owner: "City Health Command",
    },
  ];
};

export interface PipelineStage {
  name: string;
  detail: string;
  status: "ONLINE" | "READY FOR CONNECTION";
}

export interface SystemStatus {
  pipeline: PipelineStage[];
  components: { name: string; status: "ONLINE" | "READY FOR CONNECTION"; note: string }[];
  model: { name: string; target: string; metric: string; value: string; note: string };
}

export const getSystemStatus = (): Promise<SystemStatus> =>
  latency({
    pipeline: [
      { name: "Weather Data", detail: "Station + gridded meteorological inputs", status: "ONLINE" },
      { name: "WBGT Engine", detail: "Wet Bulb Globe Temperature computation", status: "ONLINE" },
      { name: "XGBoost Forecast", detail: "WBGT forecast at T+1 / T+3 / T+5", status: "ONLINE" },
      { name: "Vulnerability Layer", detail: "Census-based ward vulnerability indicators", status: "ONLINE" },
      { name: "Risk Engine", detail: "Composite ward heat-risk score", status: "ONLINE" },
      { name: "SHAP", detail: "Per-ward feature attribution", status: "ONLINE" },
      { name: "Gemini Advisory", detail: "Advisory text from risk score + SHAP factors", status: "ONLINE" },
      { name: "Dashboard", detail: "Operational interface for duty officers", status: "ONLINE" },
    ],
    components: [
      { name: "Weather Data", status: "ONLINE", note: "Demo feed active" },
      { name: "Risk Model", status: "ONLINE", note: "XGBoost WBGT forecast" },
      { name: "SHAP", status: "ONLINE", note: "Explanations available per ward" },
      { name: "LLM Advisory", status: "ONLINE", note: "Gemini advisory generation" },
      { name: "API", status: "READY FOR CONNECTION", note: "GET /wards/all-risk · POST /predict-risk" },
    ],
    model: {
      name: "XGBoost",
      target: "WBGT forecast",
      metric: "R²",
      value: "0.84",
      note: "Best reported forecast horizon. No other performance metrics are claimed.",
    },
  });
