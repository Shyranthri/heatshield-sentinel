import type { RiskLevel } from "@/data/wards";
import { riskBorder, riskSoft, riskText } from "@/lib/risk";
import { cn } from "@/lib/utils";

export function RiskBadge({
  level,
  size = "sm",
  className,
}: {
  level: RiskLevel;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded border font-mono uppercase tracking-widest",
        riskSoft[level],
        riskBorder[level],
        riskText[level],
        size === "sm" && "px-2 py-0.5 text-[10px]",
        size === "md" && "px-2.5 py-1 text-xs",
        size === "lg" && "px-3 py-1.5 text-sm",
        className,
      )}
    >
      <span className={cn("size-1.5 rounded-full", riskText[level], "bg-current")} />
      {level}
    </span>
  );
}

export function TrendTag({ trend }: { trend: "RISING" | "STEADY" | "EASING" }) {
  return (
    <span
      className={cn(
        "font-mono text-[10px] uppercase tracking-widest",
        trend === "RISING" && "text-risk-extreme",
        trend === "STEADY" && "text-muted-foreground",
        trend === "EASING" && "text-risk-low",
      )}
    >
      {trend === "RISING" ? "▲" : trend === "EASING" ? "▼" : "■"} {trend}
    </span>
  );
}
