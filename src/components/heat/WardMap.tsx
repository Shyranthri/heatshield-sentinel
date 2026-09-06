import { useMemo, useRef, useState } from "react";
import type { WardFeatureCollection, WardRisk } from "@/data/wards";
import { riskVar } from "@/lib/risk";
import { cn } from "@/lib/utils";

/**
 * GeoJSON-driven ward choropleth. Accepts any Polygon FeatureCollection in
 * EPSG:4326 with a numeric `ward_id` property, so official CMC ward boundaries
 * can replace the demo geometry with no component changes.
 */

type Metric = "risk" | "wbgt" | "vulnerability";

interface Props {
  geo: WardFeatureCollection;
  wards: WardRisk[];
  metric?: Metric;
  selectedWard?: number | null;
  visibleWards?: Set<number> | null;
  onSelect?: (wardId: number) => void;
  height?: number;
  showControls?: boolean;
  className?: string;
}

const VB = 1000;

export function WardMap({
  geo,
  wards,
  metric = "risk",
  selectedWard = null,
  visibleWards = null,
  onSelect,
  height = 460,
  showControls = false,
  className,
}: Props) {
  const [hover, setHover] = useState<number | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const drag = useRef<{ x: number; y: number } | null>(null);

  const byId = useMemo(() => new Map(wards.map((w) => [w.ward_id, w])), [wards]);

  const { project, ratio } = useMemo(() => {
    const lons: number[] = [];
    const lats: number[] = [];
    for (const f of geo.features) {
      for (const ring of f.geometry.coordinates) {
        for (const [lon, lat] of ring) {
          lons.push(lon);
          lats.push(lat);
        }
      }
    }
    const minLon = Math.min(...lons);
    const maxLon = Math.max(...lons);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const w = maxLon - minLon;
    const h = maxLat - minLat;
    return {
      ratio: h / w,
      project: ([lon, lat]: [number, number]) =>
        [((lon - minLon) / w) * VB, ((maxLat - lat) / h) * VB * (h / w)] as [number, number],
    };
  }, [geo]);

  const fill = (w: WardRisk | undefined) => {
    if (!w) return "var(--surface-2)";
    if (metric === "risk") return riskVar[w.risk_level];
    if (metric === "wbgt")
      return w.wbgt >= 33
        ? riskVar.EXTREME
        : w.wbgt >= 31
          ? riskVar.HIGH
          : w.wbgt >= 29
            ? riskVar.MODERATE
            : riskVar.LOW;
    return w.vulnerability_score >= 0.7
      ? riskVar.EXTREME
      : w.vulnerability_score >= 0.55
        ? riskVar.HIGH
        : w.vulnerability_score >= 0.42
          ? riskVar.MODERATE
          : riskVar.LOW;
  };

  const hovered = hover ? byId.get(hover) : undefined;
  const vbH = VB * ratio;

  return (
    <div className={cn("relative overflow-hidden rounded-md bg-background", className)} style={{ height }}>
      <svg
        viewBox={`0 0 ${VB} ${vbH}`}
        className="h-full w-full cursor-grab active:cursor-grabbing"
        onMouseDown={(e) => (drag.current = { x: e.clientX, y: e.clientY })}
        onMouseUp={() => (drag.current = null)}
        onMouseLeave={() => {
          drag.current = null;
          setHover(null);
        }}
        onMouseMove={(e) => {
          if (!drag.current) return;
          const dx = e.clientX - drag.current.x;
          const dy = e.clientY - drag.current.y;
          drag.current = { x: e.clientX, y: e.clientY };
          setPan((p) => ({ x: p.x + dx, y: p.y + dy }));
        }}
      >
        <g transform={`translate(${pan.x} ${pan.y}) scale(${zoom})`} style={{ transformOrigin: "center" }}>
          <g opacity={0.25} stroke="var(--border)" strokeWidth={1}>
            {Array.from({ length: 12 }, (_, i) => (
              <line key={`v${i}`} x1={(i * VB) / 11} y1={0} x2={(i * VB) / 11} y2={vbH} />
            ))}
            {Array.from({ length: 10 }, (_, i) => (
              <line key={`h${i}`} x1={0} y1={(i * vbH) / 9} x2={VB} y2={(i * vbH) / 9} />
            ))}
          </g>
          {geo.features.map((f) => {
            const id = f.properties.ward_id;
            const w = byId.get(id);
            const dimmed = visibleWards ? !visibleWards.has(id) : false;
            const isSel = selectedWard === id;
            const pts = (f.geometry.coordinates[0] ?? [])
              .map((c) => project(c).join(","))
              .join(" ");
            const c = project(
              (f.geometry.coordinates[0] ?? []).reduce(
                (acc, p) => [acc[0] + p[0] / (f.geometry.coordinates[0]!.length - 1), acc[1] + p[1] / (f.geometry.coordinates[0]!.length - 1)] as [number, number],
                [0, 0] as [number, number],
              ),
            );
            return (
              <g key={id}>
                <polygon
                  points={pts}
                  fill={fill(w)}
                  fillOpacity={dimmed ? 0.08 : hover === id || isSel ? 0.95 : 0.68}
                  stroke={isSel ? "var(--foreground)" : "var(--background)"}
                  strokeWidth={isSel ? 4 : 2}
                  className="cursor-pointer transition-[fill-opacity] duration-150"
                  onMouseEnter={() => setHover(id)}
                  onClick={() => onSelect?.(id)}
                />
                <text
                  x={c[0]}
                  y={c[1] + 5}
                  textAnchor="middle"
                  fontSize={17}
                  fontFamily="var(--font-mono)"
                  fill="var(--background)"
                  fillOpacity={dimmed ? 0.3 : 0.85}
                  pointerEvents="none"
                >
                  {id}
                </text>
              </g>
            );
          })}
        </g>
      </svg>

      {hovered && (
        <div className="pointer-events-none absolute left-3 top-3 rounded-md border border-border-strong bg-popover/95 px-3 py-2 text-xs shadow-lg backdrop-blur">
          <div className="font-mono text-[11px] tracking-widest text-muted-foreground">
            WARD {hovered.ward_id}
          </div>
          <div className="mt-0.5 font-medium">{hovered.ward_name}</div>
          <div className="mt-1 flex gap-4 font-mono text-[11px]">
            <span>RISK {hovered.risk_level}</span>
            <span>WBGT {hovered.wbgt.toFixed(1)}°C</span>
          </div>
        </div>
      )}

      {showControls && (
        <div className="absolute bottom-3 right-3 flex flex-col gap-1">
          {[
            { label: "+", fn: () => setZoom((z) => Math.min(3, Number((z + 0.25).toFixed(2)))) },
            { label: "−", fn: () => setZoom((z) => Math.max(0.6, Number((z - 0.25).toFixed(2)))) },
            {
              label: "⟲",
              fn: () => {
                setZoom(1);
                setPan({ x: 0, y: 0 });
              },
            },
          ].map((b) => (
            <button
              key={b.label}
              onClick={b.fn}
              className="size-8 rounded border border-border bg-surface font-mono text-sm text-foreground transition-colors hover:bg-accent"
              aria-label={b.label === "⟲" ? "Reset map" : b.label === "+" ? "Zoom in" : "Zoom out"}
            >
              {b.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function MapLegend({ className }: { className?: string }) {
  return (
    <div className={cn("flex flex-wrap items-center gap-4", className)}>
      {(
        [
          ["LOW", "bg-risk-low"],
          ["MODERATE", "bg-risk-moderate"],
          ["HIGH", "bg-risk-high"],
          ["EXTREME", "bg-risk-extreme"],
        ] as const
      ).map(([label, c]) => (
        <span key={label} className="flex items-center gap-2">
          <span className={cn("size-3 rounded-sm", c)} />
          <span className="label-mono">{label}</span>
        </span>
      ))}
    </div>
  );
}
