import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { AppShell, Panel } from "@/components/app-shell";
import { demoHealth, demoModels, demoTools } from "@/lib/mock-data";

export const Route = createFileRoute("/registry")({
  head: () => ({
    meta: [
      { title: "Model & Tool Registry — SatQuery AI" },
      {
        name: "description",
        content:
          "Registry of SatQuery AI specialist models and tools with versions, input/output contracts, supported modalities and readiness status.",
      },
      { property: "og:title", content: "Model & Tool Registry — SatQuery AI" },
      {
        property: "og:description",
        content: "Versioned specialist models and orchestration tools behind every analysis.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Registry,
});

function Registry() {
  const [filter, setFilter] = useState("");
  const q = filter.trim().toLowerCase();
  const models = demoModels.filter(
    (m) => !q || m.name.toLowerCase().includes(q) || m.roles.join(" ").toLowerCase().includes(q),
  );
  const tools = demoTools.filter((t) => !q || t.name.toLowerCase().includes(q));

  return (
    <AppShell>
      <div className="grid divide-border xl:grid-cols-[minmax(0,1fr)_340px] xl:divide-x min-h-[calc(100vh-44px)]">
        <div className="divide-y divide-border font-mono">
          <Panel
            title="Specialist Models"
            meta={`${models.length} registered`}
            bodyClassName=""
            actions={
              <input
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                placeholder="filter registry..."
                aria-label="Filter registry"
                className="w-36 border border-border bg-background px-2 py-0.5 text-[10px] text-foreground outline-none focus:border-primary placeholder:text-muted-foreground/60"
              />
            }
          >
            <h1 className="sr-only">SatQuery AI model and tool registry</h1>
            <ul className="divide-y divide-border">
              {models.map((m) => (
                <li
                  key={m.id}
                  className="grid gap-x-4 gap-y-1.5 px-3.5 py-3 hover:bg-panel-raised/60 transition-colors md:grid-cols-[240px_minmax(0,1fr)_minmax(0,1fr)_100px]"
                >
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-foreground">
                      {m.name}
                    </p>
                    <p className="text-[10px] text-primary font-semibold">{m.version}</p>
                  </div>
                  <Contract label="input contract" value={m.input} />
                  <Contract label="output contract" value={m.output} />
                  <div className="flex items-center gap-1.5 md:justify-end">
                    <span
                      className={`h-2 w-2 rounded-full ${
                        m.status === "ready"
                          ? "bg-success shadow-[0_0_6px_var(--color-success)]"
                          : m.status === "loading"
                            ? "bg-warning shadow-[0_0_6px_var(--color-warning)]"
                            : "bg-destructive shadow-[0_0_6px_var(--color-destructive)]"
                      }`}
                    />
                    <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-foreground">
                      {m.status}
                    </span>
                  </div>
                  <p className="col-span-full text-[9px] uppercase tracking-[0.16em] text-muted-foreground pt-1 border-t border-border/40">
                    roles · <span className="text-foreground">{m.roles.join(" / ")}</span>
                  </p>
                </li>
              ))}
            </ul>
          </Panel>

          <Panel title="Orchestration Tools" meta={`${tools.length} registered`} bodyClassName="">
            <ul className="divide-y divide-border">
              {tools.map((t) => (
                <li
                  key={t.id}
                  className="grid gap-x-4 gap-y-1.5 px-3.5 py-3 hover:bg-panel-raised/60 transition-colors md:grid-cols-[240px_minmax(0,1fr)_minmax(0,1fr)_100px]"
                >
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-foreground">
                      {t.name}
                    </p>
                    <p className="text-[10px] text-primary font-semibold">{t.version}</p>
                  </div>
                  <Contract label="accepts" value={t.acceptedInputs} />
                  <Contract label="outputs" value={t.outputs} />
                  <div className="flex items-center gap-1.5 md:justify-end">
                    <span
                      className={`h-2 w-2 rounded-full ${
                        t.status === "online"
                          ? "bg-success shadow-[0_0_6px_var(--color-success)]"
                          : "bg-destructive"
                      }`}
                    />
                    <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-foreground">
                      {t.status}
                    </span>
                  </div>
                  <p className="col-span-full text-[9px] uppercase tracking-[0.16em] text-muted-foreground pt-1 border-t border-border/40">
                    required metadata · <span className="text-foreground">{t.requiredMetadata}</span>
                  </p>
                </li>
              ))}
            </ul>
          </Panel>
        </div>

        <Panel title="System Health & Compute" bodyClassName="">
          <ul className="divide-y divide-border font-mono">
            {[
              ["api gateway", demoHealth.api, demoHealth.api === "online"],
              ["inference engine", demoHealth.inference, demoHealth.inference === "ready"],
              ["gpu / compute cluster", demoHealth.gpu, true],
              ["model cache status", "warm", true],
              ["raster storage", "available", true],
              ["input validator", "online", true],
              [
                "specialist tools",
                `${demoHealth.toolsOnline} / ${demoHealth.toolsTotal} ready`,
                demoHealth.toolsOnline === demoHealth.toolsTotal,
              ],
            ].map(([label, value, ok]) => (
              <li
                key={String(label)}
                className="flex items-center justify-between gap-2 px-3.5 py-2.5 text-[10px] uppercase tracking-[0.14em]"
              >
                <span className="text-muted-foreground font-medium">{label}</span>
                <span className="flex items-center gap-1.5 text-foreground font-semibold">
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      ok ? "bg-success shadow-[0_0_4px_var(--color-success)]" : "bg-warning"
                    }`}
                  />
                  {value}
                </span>
              </li>
            ))}
          </ul>
          <div className="border-t border-border p-3.5 font-mono text-[10px] uppercase tracking-[0.14em] text-warning bg-warning/5">
            <span className="font-bold block mb-1">DEMO ENVIRONMENT SEAM</span>
            Model inference local / simulated. Backend API contracts operational.
          </div>
        </Panel>
      </div>
    </AppShell>
  );
}

function Contract({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-muted-foreground">
        {label}
      </p>
      <p className="font-mono text-[10px] text-foreground font-medium">{value}</p>
    </div>
  );
}

