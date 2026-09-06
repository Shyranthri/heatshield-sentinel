import type { ShapFactor } from "@/data/wards";
import { cn } from "@/lib/utils";

/** Signed SHAP contribution bars — positive pushes risk up, negative pulls it down. */
export function ShapBars({ factors, className }: { factors: ShapFactor[]; className?: string }) {
  const max = Math.max(...factors.map((f) => Math.abs(f.contribution)), 0.01);
  return (
    <div className={cn("space-y-2.5", className)}>
      {factors.map((f) => {
        const pct = (Math.abs(f.contribution) / max) * 100;
        const up = f.contribution >= 0;
        return (
          <div key={f.feature}>
            <div className="flex items-baseline justify-between gap-3 text-xs">
              <span className="truncate text-foreground/90">{f.feature}</span>
              <span
                className={cn("font-mono tabular-nums", up ? "text-risk-extreme" : "text-risk-low")}
              >
                {up ? "+" : ""}
                {f.contribution.toFixed(3)}
              </span>
            </div>
            <div className="mt-1 flex h-2 items-center gap-px">
              <div className="flex h-full flex-1 justify-end">
                {!up && (
                  <div
                    className="h-full rounded-l bg-risk-low/80"
                    style={{ width: `${pct}%` }}
                  />
                )}
              </div>
              <div className="h-3 w-px bg-border-strong" />
              <div className="flex h-full flex-1">
                {up && (
                  <div
                    className="h-full rounded-r bg-risk-extreme/85"
                    style={{ width: `${pct}%` }}
                  />
                )}
              </div>
            </div>
          </div>
        );
      })}
      <p className="pt-1 text-[11px] text-muted-foreground">
        Model explanation — SHAP. Bars right of the axis increase the ward risk score; bars left
        reduce it.
      </p>
    </div>
  );
}

export function ImpactBars({
  items,
  className,
}: {
  items: { feature: string; impact: number }[];
  className?: string;
}) {
  return (
    <div className={cn("space-y-2.5", className)}>
      {items.map((it) => (
        <div key={it.feature}>
          <div className="flex items-baseline justify-between text-xs">
            <span className="text-foreground/90">{it.feature}</span>
            <span className="font-mono tabular-nums text-muted-foreground">
              {it.impact.toFixed(2)}
            </span>
          </div>
          <div className="mt-1 h-2 overflow-hidden rounded bg-surface-2">
            <div
              className="h-full rounded bg-risk-high"
              style={{ width: `${Math.max(4, it.impact * 100)}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
