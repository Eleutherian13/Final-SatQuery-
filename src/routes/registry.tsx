import { createFileRoute } from "@tanstack/react-router";

import { AppShell, Panel } from "@/components/app-shell";
import { demoModels, demoTools } from "@/lib/mock-data";

export const Route = createFileRoute("/registry")({
  head: () => ({
    meta: [
      { title: "Model & Tool Registry — SatQuery AI" },
      {
        name: "description",
        content:
          "Registered SatQuery AI models and tools with versions, accepted inputs, required metadata and outputs.",
      },
      { property: "og:title", content: "Model & Tool Registry — SatQuery AI" },
      {
        property: "og:description",
        content: "Inspect which models and tools are online and what each one accepts and returns.",
      },
    ],
  }),
  component: Registry,
});

function Registry() {
  return (
    <AppShell>
      <h1 className="mb-4 text-lg font-semibold tracking-tight">Registry</h1>
      <div className="grid gap-4 xl:grid-cols-2">
        <Panel title="Models" meta={`${demoModels.length} registered`}>
          <ul className="space-y-2">
            {demoModels.map((m) => (
              <li key={m.id} className="rounded-sm border border-border p-2">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-sm text-foreground">{m.name}</span>
                  <span
                    className={`font-mono text-[10px] uppercase tracking-widest ${
                      m.status === "ready" ? "text-success" : "text-warning"
                    }`}
                  >
                    {m.status} · {m.version}
                  </span>
                </div>
                <p className="mt-1 font-mono text-[10px] text-muted-foreground">
                  {m.roles.join(" · ")}
                </p>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  in: {m.input} → out: {m.output}
                </p>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel title="Tools" meta={`${demoTools.length} registered`}>
          <ul className="space-y-2">
            {demoTools.map((t) => (
              <li key={t.id} className="rounded-sm border border-border p-2">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="font-mono text-xs text-foreground">{t.name}</span>
                  <span
                    className={`font-mono text-[10px] uppercase tracking-widest ${
                      t.status === "online" ? "text-success" : "text-destructive"
                    }`}
                  >
                    {t.status} · {t.version}
                  </span>
                </div>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  accepts: {t.acceptedInputs}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  requires: {t.requiredMetadata} · outputs: {t.outputs}
                </p>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </AppShell>
  );
}
