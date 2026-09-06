import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { ArrowDown, CheckCircle2, Plug } from "lucide-react";
import { Metric, PageHeader, Panel } from "@/components/heat/Panel";
import { systemStatusQuery } from "@/services/queries";
import { API_BASE, API_MODE } from "@/services/heatApi";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/system")({
  head: () => ({
    meta: [
      { title: "System Status — HEATSHIELD" },
      {
        name: "description",
        content:
          "HEATSHIELD pipeline status: weather data, WBGT engine, XGBoost forecast, vulnerability layer, risk engine, SHAP and Gemini advisory generation.",
      },
      { property: "og:title", content: "System Status — HEATSHIELD" },
      {
        property: "og:description",
        content: "Component health and reported model performance for the heat risk pipeline.",
      },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(systemStatusQuery),
  component: SystemStatus,
});

function SystemStatus() {
  const { data: sys } = useSuspenseQuery(systemStatusQuery);

  return (
    <>
      <PageHeader
        title="SYSTEM STATUS"
        subtitle="End-to-end pipeline from raw meteorological input to the advisory a duty officer releases."
        right={
          <span className="rounded border border-border px-3 py-1.5 font-mono text-[10px] tracking-widest text-muted-foreground">
            {API_MODE}
          </span>
        }
      />

      <div className="grid gap-4 xl:grid-cols-[1fr_1fr]">
        <Panel title="Architecture" subtitle="Data flow through the HEATSHIELD pipeline">
          <ol className="space-y-1">
            {sys.pipeline.map((s, i) => (
              <li key={s.name}>
                <div className="flex items-center gap-3 rounded-md border border-border bg-surface-2/50 px-3 py-2.5">
                  <span className="font-mono text-[10px] text-muted-foreground">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium">{s.name}</div>
                    <div className="text-[11px] text-muted-foreground">{s.detail}</div>
                  </div>
                  <span className="font-mono text-[10px] tracking-widest text-risk-low">
                    {s.status}
                  </span>
                </div>
                {i < sys.pipeline.length - 1 && (
                  <div className="flex justify-center py-0.5 text-muted-foreground/60">
                    <ArrowDown className="size-3.5" />
                  </div>
                )}
              </li>
            ))}
          </ol>
        </Panel>

        <div className="space-y-4">
          <Panel title="Component Status">
            <div className="space-y-2">
              {sys.components.map((c) => (
                <div
                  key={c.name}
                  className="flex items-center gap-3 rounded-md border border-border bg-surface-2/50 px-3 py-2.5"
                >
                  {c.status === "ONLINE" ? (
                    <CheckCircle2 className="size-4 text-risk-low" />
                  ) : (
                    <Plug className="size-4 text-risk-moderate" />
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium">{c.name}</div>
                    <div className="text-[11px] text-muted-foreground">{c.note}</div>
                  </div>
                  <span
                    className={cn(
                      "font-mono text-[10px] tracking-widest",
                      c.status === "ONLINE" ? "text-risk-low" : "text-risk-moderate",
                    )}
                  >
                    {c.status}
                  </span>
                </div>
              ))}
            </div>
          </Panel>

          <Panel title="Model Performance" subtitle="Reported metric only — nothing else is claimed">
            <div className="grid gap-3 sm:grid-cols-3">
              <Metric label="Model" value={sys.model.name} />
              <Metric label="Target" value={sys.model.target} />
              <Metric
                label={sys.model.metric}
                value={sys.model.value}
                valueClassName="text-risk-low"
                hint="Best reported horizon"
              />
            </div>
            <p className="mt-3 text-[11px] text-muted-foreground">{sys.model.note}</p>
          </Panel>

          <Panel title="Backend Integration" subtitle="Service layer contract for the live API">
            <div className="space-y-2 font-mono text-xs">
              {[
                `GET  ${API_BASE}/wards/all-risk`,
                `POST ${API_BASE}/predict-risk`,
                `GET  ${API_BASE}/wards/geojson`,
              ].map((ep) => (
                <div
                  key={ep}
                  className="flex items-center justify-between gap-3 rounded border border-border bg-surface-2/60 px-3 py-2"
                >
                  <span>{ep}</span>
                  <span className="text-[10px] tracking-widest text-risk-moderate">
                    READY FOR CONNECTION
                  </span>
                </div>
              ))}
            </div>
            <button
              onClick={() =>
                toast("Connection check — demo mode", {
                  description:
                    "The frontend reads through a single service layer, so pointing it at the live API requires no UI changes.",
                })
              }
              className="mt-3 rounded-md border border-border-strong px-3 py-1.5 text-xs font-medium transition-colors hover:bg-accent"
            >
              RUN CONNECTION CHECK
            </button>
          </Panel>
        </div>
      </div>
    </>
  );
}
