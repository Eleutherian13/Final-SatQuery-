import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { demoHealth } from "@/lib/mock-data";

const NAV = [
  { to: "/", label: "Workspace" },
  { to: "/history", label: "History" },
  { to: "/registry", label: "Registry" },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      <header className="sticky top-0 z-20 border-b border-border bg-panel/95 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-[1600px] items-center gap-6 px-4">
          <Link to="/" className="flex items-baseline gap-2">
            <span className="font-mono text-sm font-semibold tracking-[0.2em] text-foreground">
              SATQUERY
            </span>
            <span className="font-mono text-[10px] tracking-[0.3em] text-primary">AI</span>
          </Link>
          <nav className="flex items-center gap-1">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                activeOptions={{ exact: item.to === "/" }}
                className="rounded-sm px-3 py-1.5 text-xs font-medium tracking-wide text-muted-foreground transition-colors hover:text-foreground"
                activeProps={{ className: "bg-panel-raised text-foreground" }}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-4 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            <span className="rounded-sm border border-border px-2 py-1 text-warning">
              Demo mode
            </span>
            <span className="hidden sm:inline">
              api {demoHealth.api} · inference {demoHealth.inference}
            </span>
            <span className="hidden md:inline">
              tools {demoHealth.toolsOnline}/{demoHealth.toolsTotal}
            </span>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-[1600px] px-4 py-6">{children}</main>
    </div>
  );
}

export function Panel({
  title,
  meta,
  children,
  className = "",
}: {
  title: string;
  meta?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`rounded-md border border-border bg-panel ${className}`}>
      <header className="flex items-center justify-between gap-2 border-b border-border px-3 py-2">
        <h2 className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          {title}
        </h2>
        {meta ? <div className="font-mono text-[10px] text-muted-foreground">{meta}</div> : null}
      </header>
      <div className="p-3">{children}</div>
    </section>
  );
}
