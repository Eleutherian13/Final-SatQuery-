import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { demoHealth } from "@/lib/mock-data";

const NAV = [
  { to: "/", label: "Workspace" },
  { to: "/history", label: "History" },
  { to: "/registry", label: "Registry" },
] as const;

const HEALTH: Array<{ label: string; value: string; tone: string }> = [
  { label: "api", value: "online", tone: "bg-success shadow-[0_0_6px_var(--color-success)]" },
  { label: "inference", value: demoHealth.inference, tone: "bg-success shadow-[0_0_6px_var(--color-success)]" },
  { label: "gpu", value: demoHealth.gpu, tone: "bg-success shadow-[0_0_6px_var(--color-success)]" },
  { label: "cache", value: "warm", tone: "bg-success shadow-[0_0_6px_var(--color-success)]" },
  {
    label: "tools",
    value: `${demoHealth.toolsOnline}/${demoHealth.toolsTotal}`,
    tone: demoHealth.toolsOnline === demoHealth.toolsTotal ? "bg-success" : "bg-warning",
  },
];

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background font-sans text-foreground">
      <header className="sticky top-0 z-30 border-b border-border bg-panel/95 backdrop-blur-md">
        <div className="flex h-11 items-stretch">
          {/* Workstation Brand & Spec Title */}
          <Link
            to="/"
            className="flex items-center gap-2.5 border-r border-border px-3.5 transition-colors hover:bg-panel-raised"
            aria-label="SatQuery AI home"
          >
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-primary pulse-dot" />
              <span className="font-mono text-[13px] font-bold tracking-[0.24em] text-foreground">
                SATQUERY
              </span>
              <span className="font-mono text-[10px] font-extrabold tracking-[0.3em] text-primary">
                AI
              </span>
            </div>
            <span className="hidden font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground/80 md:inline">
              · PS-26167 WORKSTATION
            </span>
          </Link>

          {/* Primary Navigation */}
          <nav className="flex items-stretch">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                activeOptions={{ exact: item.to === "/" }}
                className="flex items-center border-r border-border px-4 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground transition-all hover:bg-panel-raised hover:text-foreground"
                activeProps={{
                  className:
                    "bg-panel-raised text-foreground font-bold shadow-[inset_0_-2px_0_0_var(--primary)] text-primary",
                }}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Telemetry Status Widget */}
          <div className="ml-auto hidden items-center gap-4 border-l border-border px-4 lg:flex">
            {HEALTH.map((h) => (
              <span key={h.label} className="flex items-center gap-1.5 font-mono text-[10px]">
                <span className={`h-1.5 w-1.5 rounded-full ${h.tone}`} />
                <span className="uppercase tracking-[0.14em] text-muted-foreground/80">
                  {h.label}
                </span>
                <span className="uppercase tracking-[0.14em] text-foreground font-medium">
                  {h.value}
                </span>
              </span>
            ))}
          </div>

          {/* Environment Status Badge */}
          <div className="flex items-center gap-2 border-l border-border px-3.5">
            <span className="h-1.5 w-1.5 rounded-full bg-warning pulse-dot" />
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-warning font-semibold">
              DEMO ENV
            </span>
            <span className="hidden font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground xl:inline">
              LOCAL / SIMULATED
            </span>
          </div>
        </div>
      </header>
      <main className="flex-1 min-w-0 max-w-full overflow-x-hidden">{children}</main>
    </div>
  );
}

/** Section frame: a labelled instrument panel, not a generic card. */
export function Panel({
  title,
  meta,
  children,
  className = "",
  bodyClassName = "",
  actions,
}: {
  title: string;
  meta?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
  actions?: ReactNode;
}) {
  return (
    <section
      className={`flex min-h-0 min-w-0 max-w-full flex-col overflow-hidden bg-panel transition-colors ${className}`}
    >
      <header className="flex h-8 shrink-0 items-center justify-between gap-2 border-b border-border bg-panel/80 px-3">
        <div className="flex items-center gap-2 min-w-0">
          <span className="h-1.5 w-1.5 rounded-xs bg-primary/60" />
          <h2 className="truncate font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            {title}
          </h2>
        </div>
        <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
          {meta}
          {actions}
        </div>
      </header>
      <div className={`min-h-0 flex-1 ${bodyClassName || "p-3"}`}>{children}</div>
    </section>
  );
}

export function StatusDot({ status }: { status: "pass" | "warn" | "fail" | "skipped" }) {
  const tone =
    status === "pass"
      ? "bg-success shadow-[0_0_4px_var(--color-success)]"
      : status === "warn"
        ? "bg-warning shadow-[0_0_4px_var(--color-warning)]"
        : status === "fail"
          ? "bg-destructive shadow-[0_0_4px_var(--color-destructive)]"
          : "bg-border";
  return <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${tone}`} />;
}

