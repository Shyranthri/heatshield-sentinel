import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { PageHeader, Panel } from "@/components/heat/Panel";
import { RiskBadge } from "@/components/heat/RiskBadge";
import { MapLegend, WardMap } from "@/components/heat/WardMap";
import { geoQuery, wardsQuery } from "@/services/queries";
import { RISK_LEVELS, riskText } from "@/lib/risk";
import type { RiskLevel } from "@/data/wards";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/map")({
  head: () => ({
    meta: [
      { title: "72-Ward Heat Risk Map — HEATSHIELD" },
      {
        name: "description",
        content:
          "GIS-style heat risk map of all 72 Coimbatore wards with risk, WBGT and vulnerability layers and forecast horizons.",
      },
      { property: "og:title", content: "72-Ward Heat Risk Map — HEATSHIELD" },
      {
        property: "og:description",
        content: "Filter Coimbatore wards by risk level, WBGT, vulnerability and forecast horizon.",
      },
    ],
  }),
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(wardsQuery),
      context.queryClient.ensureQueryData(geoQuery),
    ]);
  },
  component: HeatRiskMap,
});

type Metric = "risk" | "wbgt" | "vulnerability";
type Horizon = "NOW" | "T+1" | "T+3" | "T+5";

function HeatRiskMap() {
  const navigate = useNavigate();
  const { data: wards } = useSuspenseQuery(wardsQuery);
  const { data: geo } = useSuspenseQuery(geoQuery);
  const [metric, setMetric] = useState<Metric>("risk");
  const [horizon, setHorizon] = useState<Horizon>("NOW");
  const [levels, setLevels] = useState<Set<RiskLevel>>(new Set(RISK_LEVELS));
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<number | null>(null);

  const projected = useMemo(
    () =>
      wards.map((w) => {
        const f =
          horizon === "T+1"
            ? w.forecast_t1
            : horizon === "T+3"
              ? w.forecast_t3
              : horizon === "T+5"
                ? w.forecast_t5
                : null;
        return f ? { ...w, risk_score: f.risk_score, risk_level: f.risk_level, wbgt: f.wbgt } : w;
      }),
    [wards, horizon],
  );

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return new Set(
      projected
        .filter((w) => levels.has(w.risk_level))
        .filter((w) => !q || w.ward_name.toLowerCase().includes(q) || String(w.ward_id) === q)
        .map((w) => w.ward_id),
    );
  }, [projected, levels, search]);

  const sel = projected.find((w) => w.ward_id === selected);

  const toggleLevel = (l: RiskLevel) =>
    setLevels((prev) => {
      const next = new Set(prev);
      if (next.has(l) && next.size > 1) next.delete(l);
      else next.add(l);
      return next;
    });

  return (
    <>
      <PageHeader
        title="72-WARD HEAT RISK MAP"
        subtitle="Demo ward geometry rendered from a GeoJSON FeatureCollection — official CMC boundaries drop in without UI changes."
        right={
          <div className="font-mono text-[11px] tracking-widest text-muted-foreground">
            {visible.size} / {wards.length} WARDS SHOWN
          </div>
        }
      />

      <Panel bodyClassName="space-y-4">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
          <div>
            <div className="label-mono mb-1.5">Risk level</div>
            <div className="flex gap-1.5">
              {RISK_LEVELS.map((l) => (
                <button
                  key={l}
                  onClick={() => toggleLevel(l)}
                  className={cn(
                    "rounded border px-2.5 py-1 font-mono text-[10px] tracking-widest transition-colors",
                    levels.has(l)
                      ? cn("border-border-strong bg-surface-2", riskText[l])
                      : "border-border text-muted-foreground/60",
                  )}
                >
                  {l}
                </button>
              ))}
              <button
                onClick={() => setLevels(new Set(RISK_LEVELS))}
                className="rounded border border-border px-2.5 py-1 font-mono text-[10px] tracking-widest text-muted-foreground hover:text-foreground"
              >
                ALL WARDS
              </button>
            </div>
          </div>

          <div>
            <div className="label-mono mb-1.5">Forecast horizon</div>
            <div className="flex gap-1.5">
              {(["NOW", "T+1", "T+3", "T+5"] as Horizon[]).map((h) => (
                <button
                  key={h}
                  onClick={() => setHorizon(h)}
                  className={cn(
                    "rounded border px-2.5 py-1 font-mono text-[10px] tracking-widest transition-colors",
                    horizon === h
                      ? "border-border-strong bg-surface-2 text-foreground"
                      : "border-border text-muted-foreground",
                  )}
                >
                  {h}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="label-mono mb-1.5">Colour layer</div>
            <div className="flex gap-1.5">
              {(
                [
                  ["risk", "RISK LEVEL"],
                  ["wbgt", "WBGT"],
                  ["vulnerability", "VULNERABILITY"],
                ] as [Metric, string][]
              ).map(([m, label]) => (
                <button
                  key={m}
                  onClick={() => setMetric(m)}
                  className={cn(
                    "rounded border px-2.5 py-1 font-mono text-[10px] tracking-widest transition-colors",
                    metric === m
                      ? "border-border-strong bg-surface-2 text-foreground"
                      : "border-border text-muted-foreground",
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="ml-auto">
            <div className="label-mono mb-1.5">Search ward</div>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Ward number or area"
              className="w-52 rounded-md border border-border bg-surface-2 px-3 py-1.5 text-sm outline-none placeholder:text-muted-foreground/70 focus:border-border-strong"
            />
          </div>
        </div>

        <div className="grid gap-4 xl:grid-cols-[1.7fr_1fr]">
          <div className="space-y-3">
            <WardMap
              geo={geo}
              wards={projected}
              metric={metric}
              height={560}
              showControls
              selectedWard={selected}
              visibleWards={visible}
              onSelect={setSelected}
            />
            <MapLegend />
          </div>

          <div className="panel p-4">
            {sel ? (
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="label-mono">Selected ward</div>
                    <h3 className="mt-1 text-lg font-semibold">{sel.ward_name}</h3>
                    <p className="text-xs text-muted-foreground">
                      {sel.zone} · Horizon {horizon}
                    </p>
                  </div>
                  <RiskBadge level={sel.risk_level} size="md" />
                </div>
                <dl className="grid grid-cols-2 gap-2 text-sm">
                  {[
                    ["Risk score", sel.risk_score.toFixed(2)],
                    ["WBGT", `${sel.wbgt.toFixed(1)}°C`],
                    ["Temperature", `${sel.temperature.toFixed(1)}°C`],
                    ["Humidity", `${sel.humidity}%`],
                    ["Wind speed", `${sel.wind_speed.toFixed(1)} m/s`],
                    ["Vulnerability", sel.vulnerability_score.toFixed(2)],
                  ].map(([k, v]) => (
                    <div key={k} className="rounded border border-border bg-surface-2/60 px-3 py-2">
                      <dt className="label-mono">{k}</dt>
                      <dd className="mt-0.5 font-mono text-sm">{v}</dd>
                    </div>
                  ))}
                </dl>
                <div>
                  <div className="label-mono mb-2">Top SHAP factors</div>
                  <ul className="space-y-1 text-xs text-foreground/90">
                    {sel.shap_factors.slice(0, 3).map((f) => (
                      <li key={f.feature} className="flex justify-between gap-3">
                        <span>{f.feature}</span>
                        <span className="font-mono text-muted-foreground">
                          {f.contribution > 0 ? "+" : ""}
                          {f.contribution.toFixed(3)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
                <button
                  onClick={() => navigate({ to: "/wards", search: { ward: sel.ward_id } })}
                  className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
                >
                  OPEN WARD INTELLIGENCE
                </button>
              </div>
            ) : (
              <div className="flex h-full min-h-64 flex-col items-center justify-center text-center">
                <div className="label-mono">No ward selected</div>
                <p className="mt-2 max-w-xs text-sm text-muted-foreground">
                  Hover a ward for a quick read-out, or click it to open the detailed ward panel.
                </p>
              </div>
            )}
          </div>
        </div>
      </Panel>
    </>
  );
}
