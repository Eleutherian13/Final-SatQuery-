import { createFileRoute } from "@tanstack/react-router";

import { AppShell, Panel } from "@/components/app-shell";
import { demoHistory } from "@/lib/mock-data";

export const Route = createFileRoute("/history")({
  head: () => ({
    meta: [
      { title: "Analysis History — SatQuery AI" },
      {
        name: "description",
        content:
          "Past SatQuery AI analyses with workflow, input summary, confidence level, status and runtime.",
      },
      { property: "og:title", content: "Analysis History — SatQuery AI" },
      {
        property: "og:description",
        content: "Review completed, refused and failed geospatial analysis requests.",
      },
    ],
  }),
  component: History,
});

const STATUS: Record<string, string> = {
  completed: "text-success",
  refused: "text-warning",
  failed: "text-destructive",
};

function History() {
  return (
    <AppShell>
      <h1 className="mb-4 text-lg font-semibold tracking-tight">Analysis history</h1>
      <Panel title="Requests" meta={`${demoHistory.length} entries`}>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                <th className="py-2 pr-3 font-medium">Time</th>
                <th className="py-2 pr-3 font-medium">Query</th>
                <th className="py-2 pr-3 font-medium">Workflow</th>
                <th className="py-2 pr-3 font-medium">Input</th>
                <th className="py-2 pr-3 font-medium">Confidence</th>
                <th className="py-2 pr-3 font-medium">Status</th>
                <th className="py-2 font-medium">Runtime</th>
              </tr>
            </thead>
            <tbody>
              {demoHistory.map((h) => (
                <tr key={h.id} className="border-t border-border align-top">
                  <td className="py-2 pr-3 font-mono text-[11px] text-muted-foreground">{h.time}</td>
                  <td className="max-w-[380px] py-2 pr-3 text-foreground">{h.query}</td>
                  <td className="py-2 pr-3 text-muted-foreground">{h.workflowLabel}</td>
                  <td className="py-2 pr-3 text-muted-foreground">{h.inputSummary}</td>
                  <td className="py-2 pr-3 font-mono text-[11px] uppercase text-muted-foreground">
                    {h.confidence}
                  </td>
                  <td className={`py-2 pr-3 font-mono text-[11px] uppercase ${STATUS[h.status]}`}>
                    {h.status}
                  </td>
                  <td className="py-2 font-mono text-[11px] text-muted-foreground">
                    {(h.runtimeMs / 1000).toFixed(1)}s
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </AppShell>
  );
}
