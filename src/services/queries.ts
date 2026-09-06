import { queryOptions } from "@tanstack/react-query";
import {
  getActions,
  getAlerts,
  getAllWardRisk,
  getCityForecast,
  getCityShapDrivers,
  getCityStats,
  getSystemStatus,
  getWardGeoJson,
} from "./heatApi";

export const wardsQuery = queryOptions({ queryKey: ["wards"], queryFn: getAllWardRisk });
export const geoQuery = queryOptions({ queryKey: ["ward-geojson"], queryFn: getWardGeoJson });
export const cityStatsQuery = queryOptions({ queryKey: ["city-stats"], queryFn: getCityStats });
export const cityForecastQuery = queryOptions({
  queryKey: ["city-forecast"],
  queryFn: getCityForecast,
});
export const shapDriversQuery = queryOptions({
  queryKey: ["shap-drivers"],
  queryFn: getCityShapDrivers,
});
export const alertsQuery = queryOptions({ queryKey: ["alerts"], queryFn: getAlerts });
export const actionsQuery = queryOptions({ queryKey: ["actions"], queryFn: getActions });
export const systemStatusQuery = queryOptions({ queryKey: ["system"], queryFn: getSystemStatus });
