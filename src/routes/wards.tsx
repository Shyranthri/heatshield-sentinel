import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { z } from "zod";
import { Metric, PageHeader, Panel } from "@/components/heat/Panel";
import { RiskBadge, TrendTag } from "@/components/heat/RiskBadge";
import { ShapBars } from "@/components/heat/ShapBars";
import { AdvisoryCard } from "@/components/heat/AdvisoryCard";
import { wardsQuery } from "@/services/queries";
import { riskText } from "@/lib/risk";

const searchSchema = z.object({ ward: z.number().int().min(1).max(72).optional() });

export const Route = createFileRoute("/wards")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Ward Intelligence — HEATSHIELD" },
      {
        name: "description",
        content:
          "Per-ward heat risk detail for Coimbatore: WBGT, weather inputs, Census-based vulnerability, SHAP explanation and the recommended official action.",
      },
      { property: "og:title", content: "Ward Intelligence — HEATSHIELD" },
      {
        property: "og:description",
        content: "Where, when, why, who and what — the full risk picture for a single ward.",
      },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(wardsQuery),
  component: WardIntelligence,
});

function WardIntelligence() {
  const navigate = useNavigate({ from: "/wards" });
  const { ward: wardParam } = Route.useSearch();
  const { data: wards } = useSuspenseQuery(wardsQuery);

  const ward = wards.find((w) => w.ward_id === (wardParam ?? 34)) ?? wards[0]!;
  const setWard = (id: number) => navigate({ search: { ward: id } });

  const forecast = [ward.forecast_t1, ward.forecast_t3, ward.forecast_t5];

  return (
    <>
      <PageHeader
        title="WARD INTELLIGENCE"
        subtitle="Select a ward to see its thermal risk, vulnerable population, model explanation and the advisory prepared for duty-officer review."
        right={
          <div className="flex items-end gap-3">
            <div>
              <div className="label-mono mb-1.5">Select ward</div>
              <select
                value={ward.ward_id}
                onChange={(e) => setWard(Number(e.target.value))}
                className="w-64 rounded-md border border-border bg-surface-2 px-3 py-2 text-sm outline-none focus:border-border-strong"
              >
                {wards.map((w) => (
                  <option key={w.ward_id} value={w.ward_id}>
                    {w.ward_name} — {w.risk_level}
                  </option>
                ))}
              </select>
            </div>
          </div>
        }
      />

      <Panel bodyClassName="grid gap-5 lg:grid-cols-[auto_1fr] lg:items-center">
        <div className="flex items-center gap-6">
          <div>
            <div className="label-mono">Selected ward</div>
            <h2 className="mt-1 text-2xl font-semibold">{ward.ward_name}</h2>
            <div className="mt-2 flex items-center gap-3">
              <RiskBadge level={ward.risk_level} size="md" />
              <span className="text-xs text-muted-foreground">{ward.zone}</span>
            </div>
          </div>
          <div className="border-l border-border pl-6">
            <div className="label-mono">Risk score</div>
            <div className={`font-mono text-5xl font-semibold ${riskText[ward.risk_level]}`}>
              {ward.risk_score.toFixed(2)}
            </div>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-5">
          <Metric label="WBGT" value={ward.wbgt.toFixed(1)} unit="°C" hint="Wet Bulb Globe Temp." />
          <Metric label="Temperature" value={ward.temperature.toFixed(1)} unit="°C" />
          <Metric label="Humidity" value={ward.humidity} unit="%" />
          <Metric label="Wind speed" value={ward.wind_speed.toFixed(1)} unit="m/s" />
          <Metric
            label="Vulnerability score"
            value={ward.vulnerability_score.toFixed(2)}
            hint="Census-derived index"
          />
        </div>
      </Panel>

      <div className="grid gap-4 xl:grid-cols-[1fr_1fr]">
        <Panel title="5-Day Forecast" subtitle="XGBoost WBGT forecast and resulting risk level">
          <div className="grid gap-3 sm:grid-cols-3">
            {forecast.map((f) => (
              <div key={f.horizon} className="rounded-md border border-border bg-surface-2/50 p-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-sm font-semibold">{f.horizon}</span>
                  <TrendTag
                    trend={
                      f.risk_score > ward.risk_score
                        ? "RISING"
                        : f.risk_score < ward.risk_score - 0.02
                          ? "EASING"
                          : "STEADY"
                    }
                  />
                </div>
                <div className="mt-3 font-mono text-2xl font-semibold">
                  {f.wbgt.toFixed(1)}
                  <span className="text-sm font-normal text-muted-foreground">°C</span>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <RiskBadge level={f.risk_level} />
                  <span className="font-mono text-[11px] text-muted-foreground">
                    {f.risk_score.toFixed(2)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Who is vulnerable?" subtitle="Census-based vulnerability indicators">
          <div className="grid gap-3 sm:grid-cols-2">
            <Metric label="Population" value={ward.population.toLocaleString("en-IN")} />
            <Metric
              label="Elderly / dependent population"
              value={ward.elderly_population.toLocaleString("en-IN")}
              hint={`${((ward.elderly_population / ward.population) * 100).toFixed(1)}% of ward`}
            />
            <Metric label="Illiteracy proxy" value={ward.illiteracy_proxy} unit="%" />
            <Metric label="Non-working population" value={ward.non_working_population} unit="%" />
          </div>
          <p className="mt-3 text-[11px] text-muted-foreground">
            Census-based vulnerability indicators feed the ward vulnerability layer, which is combined
            with the forecast WBGT to produce the final heat risk score.
          </p>
        </Panel>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1fr_1.3fr]">
        <Panel title="Why is this ward at risk?" subtitle="Model explanation — SHAP">
          <ShapBars factors={ward.shap_factors} />
        </Panel>
        <div>
          <div className="label-mono mb-2">What should officials do?</div>
          <AdvisoryCard ward={ward} advisory={ward.advisory} />
        </div>
      </div>
    </>
  );
}
