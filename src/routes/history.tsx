import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";

import { AppShell, Panel } from "@/components/app-shell";
import { demoHistory } from "@/lib/mock-data";

export const Route = createFileRoute("/history")({
  head: () => ({
    meta: [
      { title: "Investigation Archive — SatQuery AI" },
      {
        name: "description",
        content:
          "Archive of SatQuery AI analysis requests: query, input configuration, workflow, confidence, status and runtime for every investigation.",
      },
      { property: "og:title", content: "Investigation Archive — SatQuery AI" },
      {
        property: "og:description",
        content: "Reopen completed, refused and failed remote-sensing analysis requests.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: History,
});

const STATUS_TONE: Record<string, string> = {
  completed: "text-success border-success/60 bg-success/10",
  refused: "text-warning border-warning/60 bg-warning/10",
  failed: "text-destructive border-destructive/60 bg-destructive/10",
};

const FILTERS = ["all", "completed", "refused", "failed"] as const;

function History() {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("all");
  const [selected, setSelected] = useState(demoHistory[0]?.id ?? null);

  const rows = useMemo(
    () => (filter === "all" ? demoHistory : demoHistory.filter((h) => h.status === filter)),
    [filter],
  );
  const active = demoHistory.find((h) => h.id === selected) ?? null;

  return (
    <AppShell>
      <div className="grid divide-border xl:grid-cols-[minmax(0,1fr)_420px] xl:divide-x min-h-[calc(100vh-44px)]">
        {/* Left Rail: Investigation Log List */}
        <Panel
          title="Investigation Archive"
          meta={`${rows.length} / ${demoHistory.length} requests`}
          bodyClassName=""
          actions={
            <div className="flex items-center gap-1 font-mono">
              {FILTERS.map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFilter(f)}
                  className={`border px-2 py-0.5 text-[10px] uppercase tracking-[0.14em] transition-all ${
                    filter === f
                      ? "border-primary bg-primary/15 text-primary font-bold shadow-[0_0_6px_rgba(0,229,255,0.2)]"
                      : "border-border text-muted-foreground hover:bg-panel-raised hover:text-foreground"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          }
        >
          <h1 className="sr-only">SatQuery AI investigation archive</h1>
          {/* Scrollable Table Container for Mobile/Tablet */}
          <div className="overflow-x-auto min-w-full">
            <div className="min-w-[600px]">
              {/* Table Header Row */}
              <div className="grid grid-cols-[110px_minmax(0,1fr)_150px_90px_70px] border-b border-border bg-panel-raised/50 px-3.5 py-1.5 font-mono text-[9px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                <span>REQUEST ID</span>
                <span>ANALYST QUERY</span>
                <span>WORKFLOW</span>
                <span>STATUS</span>
                <span className="text-right">RUNTIME</span>
              </div>

              <ul className="divide-y divide-border">
                {rows.map((h) => {
                  const isSel = selected === h.id;
                  return (
                    <li key={h.id}>
                      <button
                        type="button"
                        onClick={() => setSelected(h.id)}
                        className={`grid w-full grid-cols-[110px_minmax(0,1fr)_150px_90px_70px] items-center gap-3 px-3.5 py-2.5 text-left font-mono transition-all ${
                          isSel
                            ? "bg-panel-raised text-foreground shadow-[inset_3px_0_0_0_var(--primary)] font-medium"
                            : "hover:bg-panel-raised/70 text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        <span className="text-[10px] uppercase tracking-[0.14em] font-semibold text-primary">
                          {h.id}
                        </span>
                        <span className="truncate text-xs text-foreground font-sans font-medium">
                          {h.query}
                        </span>
                        <span className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground truncate">
                          {h.workflowLabel}
                        </span>
                        <span
                          className={`border px-1.5 py-0.5 text-center text-[9px] font-bold uppercase tracking-[0.14em] ${STATUS_TONE[h.status]}`}
                        >
                          {h.status}
                        </span>
                        <span className="text-right text-[10px] text-muted-foreground font-mono">
                          {(h.runtimeMs / 1000).toFixed(1)}s
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </Panel>

        {/* Right Detail Sheet: Case Summary & Technical Parameters */}
        <Panel title="Investigation Case Detail" meta={active ? active.id : "—"} bodyClassName="">
          {active ? (
            <div className="space-y-4 p-4 font-mono">
              {/* Ingested Query Box */}
              <div className="border border-border bg-background p-3">
                <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-muted-foreground mb-1">
                  ANALYST QUERY
                </p>
                <p className="text-[13px] font-sans font-medium leading-relaxed text-foreground">
                  {active.query}
                </p>
              </div>

              {/* Progressive Disclosure Section: Core Parameters */}
              <dl className="grid grid-cols-2 gap-x-4 gap-y-2 border-y border-border py-3 text-[10px]">
                <div className="flex flex-col gap-0.5 truncate">
                  <dt className="uppercase tracking-[0.16em] text-muted-foreground text-[9px]">
                    REQUEST ID
                  </dt>
                  <dd className="truncate text-primary font-bold">{active.id}</dd>
                </div>
                <div className="flex flex-col gap-0.5 truncate">
                  <dt className="uppercase tracking-[0.16em] text-muted-foreground text-[9px]">
                    TIMESTAMP
                  </dt>
                  <dd className="truncate text-foreground font-semibold">{active.time}</dd>
                </div>
                <div className="flex flex-col gap-0.5 truncate">
                  <dt className="uppercase tracking-[0.16em] text-muted-foreground text-[9px]">
                    WORKFLOW
                  </dt>
                  <dd className="truncate text-foreground font-semibold">{active.workflowLabel}</dd>
                </div>
                <div className="flex flex-col gap-0.5 truncate">
                  <dt className="uppercase tracking-[0.16em] text-muted-foreground text-[9px]">
                    STATUS
                  </dt>
                  <dd className={`truncate font-bold ${active.status === "completed" ? "text-success" : active.status === "refused" ? "text-warning" : "text-destructive"}`}>
                    {active.status.toUpperCase()}
                  </dd>
                </div>
                <div className="flex flex-col gap-0.5 truncate col-span-2 border-t border-border/40 pt-1.5">
                  <dt className="uppercase tracking-[0.16em] text-muted-foreground text-[9px]">
                    OBSERVATIONS ATTACHED
                  </dt>
                  <dd className="truncate text-foreground font-mono">{active.inputSummary}</dd>
                </div>
                <div className="flex flex-col gap-0.5 truncate col-span-2">
                  <dt className="uppercase tracking-[0.16em] text-muted-foreground text-[9px]">
                    CONFIDENCE ASSESSMENT
                  </dt>
                  <dd className="truncate text-success font-semibold">{active.confidence}</dd>
                </div>
              </dl>

              {/* Policy note */}
              <div className="border border-sky-500/40 bg-sky-500/10 p-3 text-[10px] text-sky-400">
                <span className="font-bold uppercase tracking-[0.16em] block mb-1">
                  CASE ARCHIVE SNAPSHOT
                </span>
                Reopening an archival investigation restores its deterministic snapshot and spatial evidence layers in the primary workspace canvas.
              </div>
            </div>
          ) : (
            <p className="p-4 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
              Select an investigation request to inspect full case parameters.
            </p>
          )}
        </Panel>
      </div>
    </AppShell>
  );
}


