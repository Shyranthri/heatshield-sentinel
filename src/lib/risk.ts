import type { RiskLevel } from "@/data/wards";

export const RISK_LEVELS: RiskLevel[] = ["LOW", "MODERATE", "HIGH", "EXTREME"];

export const riskText: Record<RiskLevel, string> = {
  LOW: "text-risk-low",
  MODERATE: "text-risk-moderate",
  HIGH: "text-risk-high",
  EXTREME: "text-risk-extreme",
};

export const riskBg: Record<RiskLevel, string> = {
  LOW: "bg-risk-low",
  MODERATE: "bg-risk-moderate",
  HIGH: "bg-risk-high",
  EXTREME: "bg-risk-extreme",
};

export const riskBorder: Record<RiskLevel, string> = {
  LOW: "border-risk-low/50",
  MODERATE: "border-risk-moderate/50",
  HIGH: "border-risk-high/50",
  EXTREME: "border-risk-extreme/60",
};

export const riskSoft: Record<RiskLevel, string> = {
  LOW: "bg-risk-low/12",
  MODERATE: "bg-risk-moderate/12",
  HIGH: "bg-risk-high/12",
  EXTREME: "bg-risk-extreme/15",
};

export const riskVar: Record<RiskLevel, string> = {
  LOW: "var(--risk-low)",
  MODERATE: "var(--risk-moderate)",
  HIGH: "var(--risk-high)",
  EXTREME: "var(--risk-extreme)",
};

export function levelFromScore(score: number): RiskLevel {
  if (score >= 0.8) return "EXTREME";
  if (score >= 0.6) return "HIGH";
  if (score >= 0.4) return "MODERATE";
  return "LOW";
}
