import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";
import { Metric, PageHeader, Panel } from "@/components/heat/Panel";
import { RiskBadge, TrendTag } from "@/components/heat/RiskBadge";
import { MapLegend, WardMap } from "@/components/heat/WardMap";
import { ImpactBars } from "@/components/heat/ShapBars";
import {
  cityForecastQuery,
  cityStatsQuery,
  geoQuery,
  shapDriversQuery,
  wardsQuery,
} from "@/services/queries";
import { riskText } from "@/lib/risk";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Coimbatore Heat Command Center — HEATSHIELD" },
      {
        name: "description",
        content:
          "Ward-level heatwave early warning and human thermal risk intelligence for Coimbatore: WBGT forecasts, vulnerability data and official response actions.",
      },
      { property: "og:title", content: "Coimbatore Heat Command Center — HEATSHIELD" },
      {
        property: "og:description",
        content:
          "Human heat-risk intelligence for early intervention across 72 Coimbatore wards.",
      },
    ],
  }),
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(wardsQuery),
      context.queryClient.ensureQueryData(geoQuery),
    ]);
  },
  component: CommandCenter,
});

function CommandCenter() {
  const navigate = useNavigate();
  const { data: wards } = useSuspenseQuery(wardsQuery);
  const { data: geo } = useSuspenseQuery(geoQuery);
  const { data: stats } = useSuspenseQuery(cityStatsQuery);
  const { data: forecast } = useSuspenseQuery(cityForecastQuery);
  const { data: drivers } = useSuspenseQuery(shapDriversQuery);

  const critical = [...wards].sort((a, b) => b.risk_score - a.risk_score).slice(0, 7);

  return (
    <>
      <PageHeader
        title="COIMBATORE HEAT COMMAND CENTER"
        subtitle="Human heat-risk intelligence for early intervention."
        right={
          <Link
            to="/forecast"
            className="flex items-center gap-2 rounded-md border border-risk-extreme/50 bg-risk-extreme/12 px-4 py-2 text-sm font-medium text-risk-extreme transition-colors hover:bg-risk-extreme/20"
          >
            Early warning active — {stats.early_warning_hours}h lead time
            <ArrowRight className="size-4" />
          </Link>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <Metric
          label="City Heat Risk"
          value={stats.city_risk}
          valueClassName={riskText[stats.city_risk]}
          hint="Composite of ward risk scores"
        />
        <Metric
          label="Extreme Risk Wards"
          value={stats.extreme_wards}
          valueClassName="text-risk-extreme"
          hint={`of ${wards.length} wards`}
        />
        <Metric
          label="High Risk Wards"
          value={stats.high_wards}
          valueClassName="text-risk-high"
          hint={`Moderate ${stats.moderate_wards} · Low ${stats.low_wards}`}
        />
        <Metric
          label="Peak Forecast WBGT"
          value={stats.peak_forecast_wbgt.toFixed(1)}
          unit="°C"
          hint="XGBoost WBGT forecast"
        />
        <Metric
          label="Early Warning"
          value={`${stats.early_warning_hours} HOURS`}
          valueClassName="text-risk-moderate"
          hint="Lead time before peak"
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.6fr_1fr]">
        <Panel
          title="72-Ward Heat Risk Map"
          subtitle="Click any ward to open Ward Intelligence"
          action={
            <Link to="/map" className="label-mono hover:text-foreground">
              Full map →
            </Link>
          }
          bodyClassName="space-y-3"
        >
          <WardMap
            geo={geo}
            wards={wards}
            height={430}
            onSelect={(id) => navigate({ to: "/wards", search: { ward: id } })}
          />
          <MapLegend />
        </Panel>

        <Panel title="Critical Areas" subtitle="Highest ward risk scores now" bodyClassName="space-y-2">
          {critical.map((w) => (
            <button
              key={w.ward_id}
              onClick={() => navigate({ to: "/wards", search: { ward: w.ward_id } })}
              className="flex w-full items-center gap-3 rounded-md border border-border bg-surface-2/50 px-3 py-2.5 text-left transition-colors hover:border-border-strong hover:bg-accent/60"
            >
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium">{w.ward_name}</div>
                <div className="mt-0.5 font-mono text-[11px] text-muted-foreground">
                  SCORE {w.risk_score.toFixed(2)} · WBGT {w.wbgt.toFixed(1)}°C
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <RiskBadge level={w.risk_level} />
                <TrendTag
                  trend={
                    w.forecast_t1.risk_score > w.risk_score
                      ? "RISING"
                      : w.forecast_t1.risk_score < w.risk_score - 0.02
                        ? "EASING"
                        : "STEADY"
                  }
                />
              </div>
            </button>
          ))}
        </Panel>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.6fr_1fr]">
        <Panel
          title="Early Warning Timeline"
          subtitle="City-mean WBGT and risk transition across the forecast window"
        >
          <div className="grid gap-3 sm:grid-cols-4">
            {forecast.map((p) => (
              <div
                key={p.horizon}
                className={cn(
                  "rounded-md border border-border bg-surface-2/50 p-3",
                  p.horizon === "NOW" && "border-border-strong",
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-sm font-semibold">{p.horizon}</span>
                  <TrendTag trend={p.trend} />
                </div>
                <div className="mt-1 text-[11px] text-muted-foreground">{p.label}</div>
                <div className="mt-3 font-mono text-2xl font-semibold">
                  {p.wbgt.toFixed(1)}
                  <span className="text-sm font-normal text-muted-foreground">°C</span>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <RiskBadge level={p.risk_level} />
                  <span className="font-mono text-[10px] text-muted-foreground">
                    {p.wards_at_risk} WARDS
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Panel>

        <Panel
          title="Top Risk Drivers"
          subtitle="Aggregated SHAP contribution across all 72 wards"
        >
          <ImpactBars items={drivers.slice(0, 6)} />
          <Link
            to="/explainability"
            className="mt-4 inline-block label-mono hover:text-foreground"
          >
            Open risk explainability →
          </Link>
        </Panel>
      </div>
    </>
  );
}
