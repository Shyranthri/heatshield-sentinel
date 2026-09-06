import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { PageHeader, Panel, Metric } from "@/components/heat/Panel";
import { RiskBadge } from "@/components/heat/RiskBadge";
import { ImpactBars, ShapBars } from "@/components/heat/ShapBars";
import { shapDriversQuery, wardsQuery } from "@/services/queries";
import { riskText } from "@/lib/risk";

export const Route = createFileRoute("/explainability")({
  head: () => ({
    meta: [
      { title: "Risk Explainability — HEATSHIELD" },
      {
        name: "description",
        content:
          "SHAP feature importance and per-ward attribution showing why the heat risk model assigned each Coimbatore ward its risk score.",
      },
      { property: "og:title", content: "Risk Explainability — HEATSHIELD" },
      {
        property: "og:description",
        content: "The heat risk model is not a black box — see every contributing factor.",
      },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(wardsQuery),
  component: Explainability,
});

function Explainability() {
  const { data: wards } = useSuspenseQuery(wardsQuery);
  const { data: drivers } = useSuspenseQuery(shapDriversQuery);
  const [wardId, setWardId] = useState(34);
  const ward = wards.find((w) => w.ward_id === wardId) ?? wards[0]!;

  const positive = ward.shap_factors.filter((f) => f.contribution > 0);
  const vulnShare = ward.vulnerability_score * 0.35;

  return (
    <>
      <PageHeader
        title="RISK EXPLAINABILITY"
        subtitle="Every ward risk score is decomposed into its contributing model features, so officials can justify each decision."
        right={
          <div>
            <div className="label-mono mb-1.5">Ward</div>
            <select
              value={wardId}
              onChange={(e) => setWardId(Number(e.target.value))}
              className="w-64 rounded-md border border-border bg-surface-2 px-3 py-2 text-sm outline-none focus:border-border-strong"
            >
              {wards.map((w) => (
                <option key={w.ward_id} value={w.ward_id}>
                  {w.ward_name} — {w.risk_level}
                </option>
              ))}
            </select>
          </div>
        }
      />

      <div className="grid gap-4 xl:grid-cols-[1fr_1fr]">
        <Panel
          title="SHAP Feature Importance"
          subtitle="Mean absolute contribution across all 72 wards, normalised to the strongest driver"
        >
          <ImpactBars items={drivers} />
        </Panel>

        <Panel
          title={`Attribution — ${ward.ward_name}`}
          subtitle="Signed SHAP contributions for the selected ward"
        >
          <ShapBars factors={ward.shap_factors} />
        </Panel>
      </div>

      <Panel
        title="Why did the model assign this risk?"
        subtitle="Risk score → top contributing factors → human vulnerability contribution"
      >
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="rounded-md border border-border bg-surface-2/50 p-4">
            <div className="label-mono">1 · Risk score</div>
            <div className={`mt-2 font-mono text-4xl font-semibold ${riskText[ward.risk_level]}`}>
              {ward.risk_score.toFixed(2)}
            </div>
            <div className="mt-2">
              <RiskBadge level={ward.risk_level} />
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              Composite of the forecast WBGT from the XGBoost model and the ward vulnerability layer.
            </p>
          </div>

          <div className="rounded-md border border-border bg-surface-2/50 p-4">
            <div className="label-mono">2 · Top contributing factors</div>
            <ul className="mt-3 space-y-2">
              {positive.slice(0, 4).map((f) => (
                <li key={f.feature} className="flex items-baseline justify-between gap-3 text-sm">
                  <span className="text-foreground/90">{f.feature}</span>
                  <span className="font-mono text-xs text-risk-extreme">
                    +{f.contribution.toFixed(3)}
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-xs text-muted-foreground">
              These meteorological and exposure features pushed this ward&apos;s score upward.
            </p>
          </div>

          <div className="rounded-md border border-border bg-surface-2/50 p-4">
            <div className="label-mono">3 · Human vulnerability contribution</div>
            <div className="mt-2 font-mono text-4xl font-semibold text-risk-high">
              {vulnShare.toFixed(2)}
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded bg-surface-2">
              <div
                className="h-full bg-risk-high"
                style={{ width: `${Math.min(100, (vulnShare / ward.risk_score) * 100)}%` }}
              />
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              Share of the final score attributable to Census-based vulnerability — elderly share,
              dependent population and literacy proxy — rather than weather alone.
            </p>
          </div>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-4">
          <Metric label="Forecast WBGT (T+1)" value={ward.forecast_t1.wbgt.toFixed(1)} unit="°C" />
          <Metric label="Humidity" value={ward.humidity} unit="%" />
          <Metric label="Wind speed" value={ward.wind_speed.toFixed(1)} unit="m/s" />
          <Metric label="Vulnerability index" value={ward.vulnerability_score.toFixed(2)} />
        </div>

        <p className="mt-4 rounded border border-border bg-surface-2/60 px-3 py-2 text-[11px] text-muted-foreground">
          Explanations come from SHAP applied to the XGBoost risk pipeline. The language model only
          converts this output into an advisory — it never computes the risk.
        </p>

        <Link to="/wards" search={{ ward: ward.ward_id }} className="mt-4 inline-block label-mono hover:text-foreground">
          View full ward intelligence →
        </Link>
      </Panel>
    </>
  );
}
