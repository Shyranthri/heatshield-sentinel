import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { MessageSquare, Send, Smartphone } from "lucide-react";
import { PageHeader, Panel, Metric } from "@/components/heat/Panel";
import { alertsQuery, wardsQuery } from "@/services/queries";
import type { AlertStatus, HeatAlert } from "@/services/heatApi";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/alerts")({
  head: () => ({
    meta: [
      { title: "Alert Center — HEATSHIELD" },
      {
        name: "description",
        content:
          "Active ward heat alerts for Coimbatore with severity, expected timing, message drafts and issue/acknowledge controls.",
      },
      { property: "og:title", content: "Alert Center — HEATSHIELD" },
      {
        property: "og:description",
        content: "Review, acknowledge and prepare ward-level heat alerts for release.",
      },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(wardsQuery),
  component: AlertCenter,
});

const statusStyle: Record<AlertStatus, string> = {
  "READY TO ISSUE": "border-risk-moderate/50 bg-risk-moderate/12 text-risk-moderate",
  DRAFT: "border-border text-muted-foreground",
  ACKNOWLEDGED: "border-risk-low/50 bg-risk-low/12 text-risk-low",
  "SENT — DEMO": "border-risk-low/40 bg-risk-low/10 text-risk-low",
};

function AlertCenter() {
  const { data: initial } = useSuspenseQuery(alertsQuery);
  const [alerts, setAlerts] = useState<HeatAlert[] | null>(null);
  const list = alerts ?? initial;

  const update = (id: string, status: AlertStatus) =>
    setAlerts(list.map((a) => (a.id === id ? { ...a, status } : a)));

  const counts = {
    critical: list.filter((a) => a.severity === "CRITICAL").length,
    ready: list.filter((a) => a.status === "READY TO ISSUE").length,
    ack: list.filter((a) => a.status === "ACKNOWLEDGED").length,
    drafts: list.filter((a) => a.status === "DRAFT").length,
  };

  return (
    <>
      <PageHeader
        title="ALERT CENTER"
        subtitle="Alerts prepared from model risk output. Dispatch channels are integration-ready — nothing is transmitted in this demo build."
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Metric label="Critical alerts" value={counts.critical} valueClassName="text-risk-extreme" />
        <Metric label="Ready to issue" value={counts.ready} valueClassName="text-risk-moderate" />
        <Metric label="Acknowledged" value={counts.ack} valueClassName="text-risk-low" />
        <Metric label="Drafts" value={counts.drafts} />
      </div>

      <Panel title="Active Alerts" subtitle="Time · Ward · Risk · Message · Status" bodyClassName="space-y-3">
        {list.map((a) => (
          <article
            key={a.id}
            className={cn(
              "rounded-md border bg-surface-2/50 p-4",
              a.severity === "CRITICAL"
                ? "border-risk-extreme/50"
                : a.severity === "HIGH"
                  ? "border-risk-high/40"
                  : "border-border",
            )}
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span
                    className={cn(
                      "rounded border px-2 py-0.5 font-mono text-[10px] tracking-widest",
                      a.severity === "CRITICAL"
                        ? "border-risk-extreme/50 bg-risk-extreme/15 text-risk-extreme"
                        : a.severity === "HIGH"
                          ? "border-risk-high/50 bg-risk-high/12 text-risk-high"
                          : "border-risk-moderate/50 bg-risk-moderate/12 text-risk-moderate",
                    )}
                  >
                    {a.severity}
                  </span>
                  <h3 className="text-sm font-semibold">{a.title}</h3>
                  <span className="font-mono text-[11px] text-muted-foreground">{a.id}</span>
                </div>
                <div className="mt-1.5 flex flex-wrap gap-x-5 gap-y-1 font-mono text-[11px] text-muted-foreground">
                  <span>{a.issued_at}</span>
                  <span>{a.ward_name}</span>
                  <span>{a.expected_in}</span>
                </div>
                <p className="mt-2 max-w-3xl text-sm text-foreground/90">{a.message}</p>
              </div>
              <span
                className={cn(
                  "shrink-0 rounded border px-2 py-1 font-mono text-[10px] tracking-widest",
                  statusStyle[a.status],
                )}
              >
                {a.status}
              </span>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-border pt-3">
              <button
                onClick={() => {
                  update(a.id, "SENT — DEMO");
                  toast.success(`Alert ${a.id} marked SENT — DEMO`, {
                    description: "Demo build: no SMS or WhatsApp message was dispatched.",
                  });
                }}
                className="flex items-center gap-2 rounded-md bg-risk-extreme px-3 py-1.5 text-xs font-medium text-background transition-opacity hover:opacity-90"
              >
                <Send className="size-3.5" /> ISSUE ALERT
              </button>
              <button
                onClick={() => {
                  update(a.id, "ACKNOWLEDGED");
                  toast(`Alert ${a.id} acknowledged`);
                }}
                className="rounded-md border border-border-strong px-3 py-1.5 text-xs font-medium transition-colors hover:bg-accent"
              >
                ACKNOWLEDGE
              </button>
              <Link
                to="/wards"
                search={{ ward: a.ward_id }}
                className="rounded-md border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                VIEW WARD
              </Link>
              <span className="ml-auto flex items-center gap-2">
                {[
                  { icon: Smartphone, label: "SMS" },
                  { icon: MessageSquare, label: "WhatsApp" },
                ].map(({ icon: Icon, label }) => (
                  <button
                    key={label}
                    onClick={() =>
                      toast(`${label} channel — API ready`, {
                        description: "Integration point prepared; no message sent in demo mode.",
                      })
                    }
                    className="flex items-center gap-1.5 rounded border border-border px-2 py-1 font-mono text-[10px] tracking-widest text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <Icon className="size-3" /> {label} · API READY
                  </button>
                ))}
              </span>
            </div>
          </article>
        ))}
      </Panel>

      <p className="text-[11px] text-muted-foreground">
        SMS and WhatsApp dispatch are integration-ready endpoints only. Statuses shown as
        &ldquo;SENT — DEMO&rdquo; reflect demo interactions, not real transmissions.
      </p>
    </>
  );
}
