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
      <div className="grid divide-border xl:grid-cols-[minmax(0,1fr)_300px] xl:divide-x">
        <div className="divide-y divide-border">
          <Panel
            title="Specialist models"
            meta={`${models.length} entries`}
            bodyClassName=""
            actions={
              <input
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                placeholder="filter"
                aria-label="Filter registry"
                className="w-28 border border-border bg-background px-1.5 py-0.5 font-mono text-[10px] text-foreground outline-none focus:border-primary"
              />
            }
          >
            <h1 className="sr-only">SatQuery AI model and tool registry</h1>
            <ul className="divide-y divide-border">
              {models.map((m) => (
                <li
                  key={m.id}
                  className="grid gap-x-4 gap-y-0.5 px-3 py-2 md:grid-cols-[220px_minmax(0,1fr)_minmax(0,1fr)_90px]"
                >
                  <div>
                    <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-foreground">
                      {m.name}
                    </p>
                    <p className="font-mono text-[10px] text-primary">{m.version}</p>
                  </div>
                  <Contract label="input contract" value={m.input} />
                  <Contract label="output contract" value={m.output} />
                  <div className="flex items-start gap-1.5 md:justify-end">
                    <span
                      className={`mt-1 h-1.5 w-1.5 rounded-full ${
                        m.status === "ready"
                          ? "bg-success"
                          : m.status === "loading"
                            ? "bg-warning"
                            : "bg-destructive"
                      }`}
                    />
                    <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                      {m.status}
                    </span>
                  </div>
                  <p className="col-span-full font-mono text-[9px] uppercase tracking-[0.14em] text-muted-foreground">
                    roles · {m.roles.join(" / ")}
                  </p>
                </li>
              ))}
            </ul>
          </Panel>

          <Panel title="Orchestration tools" meta={`${tools.length} entries`} bodyClassName="">
            <ul className="divide-y divide-border">
              {tools.map((t) => (
                <li
                  key={t.id}
                  className="grid gap-x-4 gap-y-0.5 px-3 py-2 md:grid-cols-[220px_minmax(0,1fr)_minmax(0,1fr)_90px]"
                >
                  <div>
                    <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-foreground">
                      {t.name}
                    </p>
                    <p className="font-mono text-[10px] text-primary">{t.version}</p>
                  </div>
                  <Contract label="accepts" value={t.acceptedInputs} />
                  <Contract label="outputs" value={t.outputs} />
                  <div className="flex items-start gap-1.5 md:justify-end">
                    <span
                      className={`mt-1 h-1.5 w-1.5 rounded-full ${
                        t.status === "online" ? "bg-success" : "bg-destructive"
                      }`}
                    />
                    <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                      {t.status}
                    </span>
                  </div>
                  <p className="col-span-full font-mono text-[9px] uppercase tracking-[0.14em] text-muted-foreground">
                    required metadata · {t.requiredMetadata}
                  </p>
                </li>
              ))}
            </ul>
          </Panel>
        </div>

        <Panel title="System health" bodyClassName="">
          <ul className="divide-y divide-border">
            {[
              ["api", demoHealth.api, demoHealth.api === "online"],
              ["inference", demoHealth.inference, demoHealth.inference === "ready"],
              ["gpu / compute", demoHealth.gpu, true],
              ["model cache", "warm", true],
              ["storage", "available", true],
              ["validator", "online", true],
              [
                "tools",
                `${demoHealth.toolsOnline} / ${demoHealth.toolsTotal} ready`,
                demoHealth.toolsOnline === demoHealth.toolsTotal,
              ],
            ].map(([label, value, ok]) => (
              <li
                key={String(label)}
                className="flex items-center justify-between gap-2 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.14em]"
              >
                <span className="text-muted-foreground">{label}</span>
                <span className="flex items-center gap-1.5 text-foreground">
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${ok ? "bg-success" : "bg-warning"}`}
                  />
                  {value}
                </span>
              </li>
            ))}
          </ul>
          <p className="border-t border-border p-3 font-mono text-[10px] uppercase tracking-[0.14em] text-warning">
            demo environment — inference simulated / local
          </p>
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
      <p className="font-mono text-[10px] text-foreground">{value}</p>
    </div>
  );
}
