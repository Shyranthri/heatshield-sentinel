import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AlertTriangle } from "lucide-react";
import { Metric, PageHeader, Panel } from "@/components/heat/Panel";
import { RiskBadge, TrendTag } from "@/components/heat/RiskBadge";
import { cityForecastQuery, wardsQuery } from "@/services/queries";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/forecast")({
  head: () => ({
    meta: [
      { title: "Forecast & Early Warning — HEATSHIELD" },
      {
        name: "description",
        content:
          "WBGT forecast at 1, 3 and 5 days for Coimbatore wards, with risk transitions and the lead time available for intervention.",
      },
      { property: "og:title", content: "Forecast & Early Warning — HEATSHIELD" },
      {
        property: "og:description",
        content: "See extreme heat risk before it peaks, ward by ward.",
      },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(wardsQuery),
  component: ForecastPage,
});

type Range = 1 | 3 | 5;

function ForecastPage() {
  const { data: wards } = useSuspenseQuery(wardsQuery);
  const { data: city } = useSuspenseQuery(cityForecastQuery);
  const [range, setRange] = useState<Range>(3);

  const series = city
    .slice(0, range === 1 ? 2 : range === 3 ? 3 : 4)
    .map((p) => ({ name: p.horizon, wbgt: p.wbgt, wards: p.wards_at_risk }));

  const topWards = [...wards]
    .sort((a, b) => b.forecast_t1.risk_score - a.forecast_t1.risk_score)
    .slice(0, 8);

  const peak = Math.max(...city.map((p) => p.wbgt));

  return (
    <>
      <PageHeader
        title="FORECAST & EARLY WARNING"
        subtitle="XGBoost WBGT forecast combined with the ward vulnerability layer, expressed as risk transitions across the next five days."
      />

      <div className="panel overflow-hidden border-risk-extreme/50">
        <div className="flex flex-wrap items-start gap-4 bg-risk-extreme/12 px-5 py-4">
          <span className="grid size-10 shrink-0 place-items-center rounded bg-risk-extreme/20 text-risk-extreme">
            <AlertTriangle className="size-5" />
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-semibold text-risk-extreme">
              EXTREME HEAT RISK EXPECTED
            </h2>
            <p className="mt-1 text-sm text-foreground/90">
              Model output indicates extreme thermal risk developing across multiple wards between
              T+1 and T+3, with city-mean WBGT peaking near {peak.toFixed(1)}°C. Officials can act
              before conditions peak.
            </p>
            <div className="mt-3 flex flex-wrap gap-x-8 gap-y-2">
              <div>
                <div className="label-mono">Expected timeframe</div>
                <div className="mt-0.5 font-mono text-sm">T+1 → T+3 (easing by T+5)</div>
              </div>
              <div>
                <div className="label-mono">Lead time to intervention</div>
                <div className="mt-0.5 font-mono text-sm text-risk-moderate">
                  ~18 hours before peak WBGT
                </div>
              </div>
              <div>
                <div className="label-mono">Affected wards</div>
                <div className="mt-0.5 font-mono text-sm">
                  {topWards
                    .slice(0, 5)
                    .map((w) => w.ward_id)
                    .join(" · ")}{" "}
                  +{topWards.length - 5} more
                </div>
              </div>
            </div>
          </div>
          <Link
            to="/actions"
            className="rounded-md bg-risk-extreme px-4 py-2 text-sm font-medium text-background transition-opacity hover:opacity-90"
          >
            OPEN ACTION CENTER
          </Link>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {city.map((p) => (
          <Metric
            key={p.horizon}
            label={`${p.horizon} · ${p.label}`}
            value={p.wbgt.toFixed(1)}
            unit="°C"
            hint={`${p.wards_at_risk} wards at high or extreme risk`}
          />
        ))}
      </div>

      <Panel
        title="WBGT Forecast"
        subtitle="City-mean forecast WBGT — the horizon selector changes the window shown"
        action={
          <div className="flex gap-1.5">
            {([1, 3, 5] as Range[]).map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={cn(
                  "rounded border px-2.5 py-1 font-mono text-[10px] tracking-widest transition-colors",
                  range === r
                    ? "border-border-strong bg-surface-2 text-foreground"
                    : "border-border text-muted-foreground",
                )}
              >
                {r} DAY
              </button>
            ))}
          </div>
        }
      >
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={series} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
              <defs>
                <linearGradient id="wbgtFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--risk-extreme)" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="var(--risk-extreme)" stopOpacity={0.03} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="var(--border)" vertical={false} />
              <XAxis
                dataKey="name"
                stroke="var(--muted-foreground)"
                tick={{ fontSize: 11, fontFamily: "var(--font-mono)" }}
              />
              <YAxis
                domain={["dataMin - 1", "dataMax + 1"]}
                stroke="var(--muted-foreground)"
                tick={{ fontSize: 11, fontFamily: "var(--font-mono)" }}
              />
              <Tooltip
                contentStyle={{
                  background: "var(--popover)",
                  border: "1px solid var(--border-strong)",
                  borderRadius: 6,
                  fontSize: 12,
                }}
                formatter={(v: number) => [`${v}°C`, "WBGT"]}
              />
              <Area
                type="monotone"
                dataKey="wbgt"
                stroke="var(--risk-extreme)"
                strokeWidth={2}
                fill="url(#wbgtFill)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Panel>

      <div className="grid gap-4 xl:grid-cols-[1fr_1fr]">
        <Panel title="Risk transition" subtitle="LOW → MODERATE → HIGH → EXTREME">
          <div className="space-y-2">
            {city.map((p) => (
              <div
                key={p.horizon}
                className="flex items-center gap-4 rounded-md border border-border bg-surface-2/50 px-3 py-2.5"
              >
                <span className="w-12 font-mono text-sm font-semibold">{p.horizon}</span>
                <div className="flex flex-1 items-center gap-1">
                  {(["LOW", "MODERATE", "HIGH", "EXTREME"] as const).map((l) => {
                    const idx = ["LOW", "MODERATE", "HIGH", "EXTREME"].indexOf(p.risk_level);
                    const on = ["LOW", "MODERATE", "HIGH", "EXTREME"].indexOf(l) <= idx;
                    return (
                      <span
                        key={l}
                        className={cn(
                          "h-2 flex-1 rounded-sm",
                          on
                            ? l === "LOW"
                              ? "bg-risk-low"
                              : l === "MODERATE"
                                ? "bg-risk-moderate"
                                : l === "HIGH"
                                  ? "bg-risk-high"
                                  : "bg-risk-extreme"
                            : "bg-surface-2",
                        )}
                      />
                    );
                  })}
                </div>
                <RiskBadge level={p.risk_level} />
                <TrendTag trend={p.trend} />
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Highest-risk wards at T+1" subtitle="Prioritised list for pre-emptive action">
          <div className="space-y-2">
            {topWards.map((w) => (
              <Link
                key={w.ward_id}
                to="/wards"
                search={{ ward: w.ward_id }}
                className="flex items-center gap-3 rounded-md border border-border bg-surface-2/50 px-3 py-2 transition-colors hover:border-border-strong hover:bg-accent/60"
              >
                <span className="min-w-0 flex-1 truncate text-sm">{w.ward_name}</span>
                <span className="font-mono text-[11px] text-muted-foreground">
                  {w.forecast_t1.wbgt.toFixed(1)}°C
                </span>
                <RiskBadge level={w.forecast_t1.risk_level} />
              </Link>
            ))}
          </div>
        </Panel>
      </div>

      <p className="text-[11px] text-muted-foreground">
        Forecast values shown are demo data from the model pipeline structure. No accuracy claim is
        made beyond the reported XGBoost WBGT forecast R² of 0.84 for the best reported horizon.
      </p>
    </>
  );
}
