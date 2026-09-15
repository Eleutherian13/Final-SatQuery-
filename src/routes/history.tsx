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
  completed: "text-success border-success",
  refused: "text-warning border-warning",
  failed: "text-destructive border-destructive",
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
      <div className="grid divide-border xl:grid-cols-[minmax(0,1fr)_360px] xl:divide-x">
        <Panel
          title="Investigation archive"
          meta={`${rows.length} / ${demoHistory.length} requests`}
          bodyClassName=""
          actions={
            <div className="flex items-center gap-px">
              {FILTERS.map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFilter(f)}
                  className={`border px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.12em] transition-colors ${
                    filter === f
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          }
        >
          <h1 className="sr-only">SatQuery AI investigation archive</h1>
          <ul className="divide-y divide-border">
            {rows.map((h) => (
              <li key={h.id}>
                <button
                  type="button"
                  onClick={() => setSelected(h.id)}
                  className={`grid w-full grid-cols-[110px_minmax(0,1fr)_160px_90px_80px] items-baseline gap-3 px-3 py-2 text-left transition-colors ${
                    selected === h.id
                      ? "bg-panel-raised shadow-[inset_2px_0_0_0_var(--primary)]"
                      : "hover:bg-panel-raised"
                  }`}
                >
                  <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-primary">
                    {h.id}
                  </span>
                  <span className="truncate text-xs text-foreground">{h.query}</span>
                  <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                    {h.workflowLabel}
                  </span>
                  <span
                    className={`border px-1 py-0.5 text-center font-mono text-[9px] uppercase tracking-[0.12em] ${STATUS_TONE[h.status]}`}
                  >
                    {h.status}
                  </span>
                  <span className="text-right font-mono text-[10px] text-muted-foreground">
                    {(h.runtimeMs / 1000).toFixed(1)} s
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel title="Request detail" meta={active ? active.id : "—"} bodyClassName="">
          {active ? (
            <div className="space-y-3 p-3">
              <p className="text-[13px] leading-snug text-foreground">{active.query}</p>
              <dl className="grid grid-cols-2 gap-x-4 gap-y-1 border-y border-border py-2 font-mono text-[10px]">
                {[
                  ["request", active.id],
                  ["time", active.time],
                  ["workflow", active.workflowLabel],
                  ["input", active.inputSummary],
                  ["confidence", active.confidence],
                  ["status", active.status],
                  ["runtime", `${(active.runtimeMs / 1000).toFixed(1)} s`],
                  ["inference", "simulated / local"],
                ].map(([k, v]) => (
                  <div key={k} className="flex items-baseline justify-between gap-2 truncate">
                    <dt className="uppercase tracking-[0.14em] text-muted-foreground">{k}</dt>
                    <dd className="truncate text-foreground">{v}</dd>
                  </div>
                ))}
              </dl>
              <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-warning">
                demo archive — reopening restores the deterministic demo state
              </p>
            </div>
          ) : (
            <p className="p-3 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
              select a request
            </p>
          )}
        </Panel>
      </div>
    </AppShell>
  );
}
