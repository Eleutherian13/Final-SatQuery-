import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { demoHealth } from "@/lib/mock-data";

const NAV = [
  { to: "/", label: "Workspace" },
  { to: "/history", label: "History" },
  { to: "/registry", label: "Registry" },
] as const;

const HEALTH: Array<{ label: string; value: string; tone: string }> = [
  { label: "api", value: "online", tone: "bg-success" },
  { label: "inference", value: demoHealth.inference, tone: "bg-success" },
  { label: "gpu", value: demoHealth.gpu, tone: "bg-success" },
  { label: "cache", value: "warm", tone: "bg-success" },
  {
    label: "tools",
    value: `${demoHealth.toolsOnline}/${demoHealth.toolsTotal}`,
    tone: demoHealth.toolsOnline === demoHealth.toolsTotal ? "bg-success" : "bg-warning",
  },
];

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background font-sans text-foreground">
      <header className="sticky top-0 z-30 border-b border-border bg-panel">
        <div className="flex h-11 items-stretch">
          <Link
            to="/"
            className="flex items-center gap-2 border-r border-border px-4"
            aria-label="SatQuery AI home"
          >
            <span className="font-mono text-[13px] font-semibold tracking-[0.24em] text-foreground">
              SATQUERY
            </span>
            <span className="font-mono text-[10px] tracking-[0.3em] text-primary">AI</span>
          </Link>
          <nav className="flex items-stretch">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                activeOptions={{ exact: item.to === "/" }}
                className="flex items-center border-r border-border px-4 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:bg-panel-raised hover:text-foreground"
                activeProps={{
                  className: "bg-panel-raised text-foreground shadow-[inset_0_-2px_0_0_var(--primary)]",
                }}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="ml-auto hidden items-center gap-4 border-l border-border px-4 lg:flex">
            {HEALTH.map((h) => (
              <span key={h.label} className="flex items-center gap-1.5">
                <span className={`h-1.5 w-1.5 rounded-full ${h.tone}`} />
                <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                  {h.label}
                </span>
                <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-foreground">
                  {h.value}
                </span>
              </span>
            ))}
          </div>
          <div className="flex items-center gap-2 border-l border-border px-4">
            <span className="h-1.5 w-1.5 rounded-full bg-warning pulse-dot" />
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-warning">
              demo environment
            </span>
            <span className="hidden font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground xl:inline">
              inference simulated / local
            </span>
          </div>
        </div>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}

/** Section frame: a labelled region of the instrument, not a floating card. */
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
    <section className={`flex min-h-0 flex-col bg-panel ${className}`}>
      <header className="flex h-8 shrink-0 items-center justify-between gap-2 border-b border-border px-3">
        <h2 className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          {title}
        </h2>
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
      ? "bg-success"
      : status === "warn"
        ? "bg-warning"
        : status === "fail"
          ? "bg-destructive"
          : "bg-border";
  return <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${tone}`} />;
}
