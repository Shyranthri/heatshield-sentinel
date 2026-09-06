import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { PageHeader, Panel } from "@/components/heat/Panel";
import { RiskBadge } from "@/components/heat/RiskBadge";
import { AdvisoryCard } from "@/components/heat/AdvisoryCard";
import { actionsQuery, wardsQuery } from "@/services/queries";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/actions")({
  head: () => ({
    meta: [
      { title: "Action Center — HEATSHIELD" },
      {
        name: "description",
        content:
          "Decision support for Coimbatore heat response: critical ward situations, recommended actions, owners and duty-officer review of AI-drafted advisories.",
      },
      { property: "og:title", content: "Action Center — HEATSHIELD" },
      {
        property: "og:description",
        content: "Turn ward heat risk into reviewed, assigned official action.",
      },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(wardsQuery),
  component: ActionCenter,
});

function ActionCenter() {
  const { data: wards } = useSuspenseQuery(wardsQuery);
  const { data: actions } = useSuspenseQuery(actionsQuery);
  const [reviewed, setReviewed] = useState<Set<string>>(new Set());
  const [advisoryWard, setAdvisoryWard] = useState<number>(
    [...wards].sort((a, b) => b.risk_score - a.risk_score)[0]!.ward_id,
  );

  const critical = [...wards].sort((a, b) => b.risk_score - a.risk_score).slice(0, 8);
  const ward = wards.find((w) => w.ward_id === advisoryWard)!;

  return (
    <>
      <PageHeader
        title="ACTION CENTER"
        subtitle="Model risk output translated into concrete, assignable municipal response — every item requires duty-officer review before release."
      />

      <Panel
        title="Critical Situations"
        subtitle="Highest-risk wards with expected timing, recommended first action and current status"
        bodyClassName="p-0"
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                {["Ward", "Risk", "Expected timing", "Recommended action", "Status", ""].map((h) => (
                  <th key={h} className="label-mono px-4 py-2.5 font-normal">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {critical.map((w, i) => (
                <tr key={w.ward_id} className="border-b border-border/70 last:border-0">
                  <td className="px-4 py-3">
                    <div className="font-medium">{w.ward_name}</div>
                    <div className="font-mono text-[11px] text-muted-foreground">{w.zone}</div>
                  </td>
                  <td className="px-4 py-3">
                    <RiskBadge level={w.risk_level} />
                    <div className="mt-1 font-mono text-[11px] text-muted-foreground">
                      {w.risk_score.toFixed(2)} · {w.wbgt.toFixed(1)}°C
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs">
                    {i === 0 ? "Within 18 hours" : `T+${i < 4 ? 1 : 3} window`}
                  </td>
                  <td className="max-w-[300px] px-4 py-3 text-xs text-foreground/90">
                    {w.advisory.recommended_action[0]}
                  </td>
                  <td className="px-4 py-3 font-mono text-[11px] text-risk-moderate">
                    {w.advisory.review_status}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      to="/wards"
                      search={{ ward: w.ward_id }}
                      className="label-mono hover:text-foreground"
                    >
                      VIEW →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {actions.map((a) => {
          const done = reviewed.has(a.id);
          return (
            <article key={a.id} className="panel flex flex-col p-4">
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-sm font-semibold tracking-wide">{a.title}</h3>
                <span
                  className={cn(
                    "shrink-0 rounded border px-2 py-0.5 font-mono text-[10px] tracking-widest",
                    a.priority === "P1"
                      ? "border-risk-extreme/50 bg-risk-extreme/12 text-risk-extreme"
                      : a.priority === "P2"
                        ? "border-risk-high/50 bg-risk-high/12 text-risk-high"
                        : "border-border text-muted-foreground",
                  )}
                >
                  {a.priority}
                </span>
              </div>
              <p className="mt-2 flex-1 text-xs leading-relaxed text-muted-foreground">
                {a.description}
              </p>
              <div className="mt-3 space-y-2 border-t border-border pt-3">
                <div>
                  <div className="label-mono">Affected wards</div>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {a.wards.map((id) => (
                      <Link
                        key={id}
                        to="/wards"
                        search={{ ward: id }}
                        className="rounded border border-border bg-surface-2 px-1.5 py-0.5 font-mono text-[10px] hover:border-border-strong"
                      >
                        {id}
                      </Link>
                    ))}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="label-mono">Status</div>
                    <div
                      className={cn(
                        "mt-0.5 font-mono text-[11px]",
                        done ? "text-risk-low" : "text-risk-moderate",
                      )}
                    >
                      {done ? "REVIEWED BY DUTY OFFICER" : a.status}
                    </div>
                    <div className="mt-0.5 text-[11px] text-muted-foreground">{a.owner}</div>
                  </div>
                  <button
                    onClick={() => {
                      setReviewed((p) => new Set(p).add(a.id));
                      toast.success(`${a.title} marked reviewed`, {
                        description: "Demo interaction — no dispatch performed.",
                      });
                    }}
                    className="rounded-md border border-border-strong px-3 py-1.5 text-xs font-medium transition-colors hover:bg-accent"
                  >
                    {done ? "REVIEWED" : "REVIEW"}
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <div className="grid gap-4 xl:grid-cols-[1fr_1.3fr]">
        <Panel
          title="AI-Generated Advisory"
          subtitle="Generated by Gemini LLM from model risk + SHAP factors"
        >
          <div className="label-mono mb-1.5">Select ward</div>
          <select
            value={advisoryWard}
            onChange={(e) => setAdvisoryWard(Number(e.target.value))}
            className="w-full rounded-md border border-border bg-surface-2 px-3 py-2 text-sm outline-none focus:border-border-strong"
          >
            {critical.map((w) => (
              <option key={w.ward_id} value={w.ward_id}>
                {w.ward_name} — {w.risk_level}
              </option>
            ))}
          </select>
          <ul className="mt-4 space-y-2 text-xs text-muted-foreground">
            <li>· Input: ward information, final risk level, forecast WBGT, top SHAP factors.</li>
            <li>· Output: plain-language public health advisory with prioritised actions.</li>
            <li>· The model, not the LLM, produces the risk assessment.</li>
            <li>· Duty officer review required before official release.</li>
          </ul>
        </Panel>
        <AdvisoryCard ward={ward} advisory={ward.advisory} />
      </div>
    </>
  );
}
