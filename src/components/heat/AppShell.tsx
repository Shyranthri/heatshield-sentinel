import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import {
  Activity,
  AlertTriangle,
  Bell,
  ClipboardList,
  Gauge,
  LayoutDashboard,
  Map as MapIcon,
  ShieldAlert,
  TrendingUp,
  UserRound,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", label: "Command Center", icon: LayoutDashboard },
  { to: "/map", label: "Heat Risk Map", icon: MapIcon },
  { to: "/wards", label: "Ward Intelligence", icon: Gauge },
  { to: "/forecast", label: "Forecast & Early Warning", icon: TrendingUp },
  { to: "/explainability", label: "Risk Explainability", icon: Activity },
  { to: "/actions", label: "Action Center", icon: ClipboardList },
  { to: "/alerts", label: "Alerts", icon: Bell },
  { to: "/system", label: "System / Model Status", icon: ShieldAlert },
] as const;

function Clock() {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  if (!now) return <span className="font-mono text-xs text-muted-foreground">--:--:-- IST</span>;
  return (
    <span className="font-mono text-xs text-foreground/90">
      {now.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })} ·{" "}
      {now.toLocaleTimeString("en-IN", { hour12: false })} IST
    </span>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background lg:flex">
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-[264px] flex-col border-r border-border bg-surface transition-transform lg:static lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="border-b border-border px-5 py-5">
          <div className="flex items-center gap-2.5">
            <span className="grid size-8 place-items-center rounded bg-risk-extreme/15 text-risk-extreme">
              <AlertTriangle className="size-4" />
            </span>
            <div>
              <div className="font-mono text-base font-semibold tracking-[0.16em]">HEATSHIELD</div>
              <div className="text-[10px] tracking-wide text-muted-foreground">
                Thermal Risk Intelligence
              </div>
            </div>
          </div>
          <div className="mt-4 rounded-md border border-border bg-surface-2/60 px-3 py-2.5">
            <div className="text-xs font-medium leading-snug">Coimbatore Municipal Corporation</div>
            <div className="mt-1.5 flex items-center gap-1.5">
              <span className="live-dot size-1.5 rounded-full bg-risk-low" />
              <span className="font-mono text-[10px] tracking-widest text-risk-low">
                LIVE MONITORING
              </span>
            </div>
          </div>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {NAV.map((item, i) => {
            const active = pathname === item.to;
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors",
                  active
                    ? "bg-accent font-medium text-foreground"
                    : "text-muted-foreground hover:bg-accent/60 hover:text-foreground",
                )}
              >
                <span className="font-mono text-[10px] text-muted-foreground/70">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <Icon className="size-4 shrink-0" />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-border px-4 py-3 font-mono text-[10px] leading-relaxed tracking-wide text-muted-foreground">
          DEMO DATA — API READY
          <br />
          SIH 2026 · PS 26083
        </div>
      </aside>

      {mobileOpen && (
        <button
          aria-label="Close navigation"
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-30 bg-background/70 lg:hidden"
        />
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex items-center gap-4 border-b border-border bg-background/95 px-4 py-3 backdrop-blur sm:px-6">
          <button
            onClick={() => setMobileOpen(true)}
            className="rounded-md border border-border p-2 lg:hidden"
            aria-label="Open navigation"
          >
            <LayoutDashboard className="size-4" />
          </button>
          <Clock />
          <div className="ml-auto flex items-center gap-3 sm:gap-5">
            <span className="hidden items-center gap-2 rounded border border-risk-low/40 bg-risk-low/10 px-2.5 py-1 sm:flex">
              <span className="live-dot size-1.5 rounded-full bg-risk-low" />
              <span className="font-mono text-[10px] tracking-widest text-risk-low">
                SYSTEM OPERATIONAL
              </span>
            </span>
            <Link to="/alerts" className="relative text-muted-foreground hover:text-foreground">
              <Bell className="size-5" />
              <span className="absolute -right-1 -top-1 grid size-4 place-items-center rounded-full bg-risk-extreme font-mono text-[9px] text-background">
                4
              </span>
            </Link>
            <div className="flex items-center gap-2.5 border-l border-border pl-3 sm:pl-5">
              <span className="grid size-8 place-items-center rounded-full bg-surface-2 text-muted-foreground">
                <UserRound className="size-4" />
              </span>
              <div className="hidden sm:block">
                <div className="text-xs font-medium">Duty Officer</div>
                <div className="font-mono text-[10px] tracking-wide text-muted-foreground">
                  HEAT RESPONSE CELL
                </div>
              </div>
            </div>
          </div>
        </header>

        <main key={pathname} className="page-enter min-w-0 flex-1 space-y-6 px-4 py-6 sm:px-6">
          {children}
        </main>
      </div>
    </div>
  );
}
