import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";

import { AppShell, Panel } from "@/components/app-shell";
import { ImageViewer } from "@/components/image-viewer";
import {
  AnswerPanel,
  ConfidencePanel,
  EvidencePanel,
  RoutePanel,
  TracePanel,
} from "@/components/analysis-panels";
import { demoScenarios } from "@/lib/mock-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SatQuery AI — Geospatial Analysis Workspace" },
      {
        name: "description",
        content:
          "Query satellite imagery in natural language: single-image VQA, grounding, bi-temporal change detection and optical-SAR fusion with traceable evidence.",
      },
      { property: "og:title", content: "SatQuery AI — Geospatial Analysis Workspace" },
      {
        property: "og:description",
        content:
          "Natural-language analysis over optical and SAR observations with evidence, confidence and full execution trace.",
      },
    ],
  }),
  component: Workspace,
});

function Workspace() {
  const defaultScenario = demoScenarios[2] ?? demoScenarios[0]!;
  const [scenarioId, setScenarioId] = useState(defaultScenario.id);
  const [activeEvidence, setActiveEvidence] = useState<string | null>(null);

  const scenario = useMemo(
    () => demoScenarios.find((s) => s.id === scenarioId) ?? defaultScenario,
    [scenarioId, defaultScenario],
  );
  const result = scenario.result;

  const evidenceFor = (role: string) =>
    result.evidence.filter((e) => {
      if (e.layer) return e.layer === role;
      return role === "single" || role === "after";
    });

  return (
    <AppShell>
      <h1 className="sr-only">SatQuery AI geospatial analysis workspace</h1>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-4">
          <Panel title="Demo scenario" meta={scenario.code}>
            <div className="flex flex-wrap gap-1.5">
              {demoScenarios.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => {
                    setScenarioId(s.id);
                    setActiveEvidence(null);
                  }}
                  className={`rounded-sm border px-2 py-1 text-left transition-colors ${
                    s.id === scenarioId
                      ? "border-primary bg-panel-raised"
                      : "border-border hover:bg-panel-raised"
                  }`}
                >
                  <span className="block font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                    {s.code}
                  </span>
                  <span className="block text-xs text-foreground">{s.title}</span>
                </button>
              ))}
            </div>
            <p className="mt-2 text-[11px] text-muted-foreground">{scenario.description}</p>
          </Panel>

          <Panel
            title="Query"
            meta={`${result.intent.label} · ${result.intent.compatibility}`}
          >
            <p className="rounded-sm border border-border bg-panel-raised px-3 py-2 text-sm text-foreground">
              {scenario.query}
            </p>
            <div className="mt-2 flex flex-wrap gap-3 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              <span>required: {result.intent.requiredInput}</span>
              <span>received: {result.intent.currentInput}</span>
            </div>
          </Panel>

          <Panel
            title="Observations"
            meta={`${scenario.observations.length} loaded`}
            className="overflow-hidden"
          >
            <div
              className={`grid gap-3 ${scenario.observations.length > 1 ? "md:grid-cols-2" : ""}`}
            >
              {scenario.observations.map((obs) => (
                <ImageViewer
                  key={obs.id}
                  observation={obs}
                  evidence={evidenceFor(obs.role)}
                  activeEvidenceId={activeEvidence}
                  onSelectEvidence={setActiveEvidence}
                />
              ))}
            </div>
          </Panel>

          <AnswerPanel result={result} />

          {result.modalityContributions ? (
            <Panel
              title="Modality contribution"
              meta={
                result.fusionConfidence != null
                  ? `fusion ${Math.round(result.fusionConfidence * 100)}%`
                  : undefined
              }
            >
              <div className="grid gap-2 sm:grid-cols-2">
                {result.modalityContributions.map((m) => (
                  <div key={m.modality} className="rounded-sm border border-border p-2">
                    <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                      {m.modality} · {m.contribution}
                    </p>
                    <p className="mt-1 text-xs text-foreground">{m.note}</p>
                  </div>
                ))}
              </div>
            </Panel>
          ) : null}
        </div>

        <div className="space-y-4">
          <RoutePanel result={result} />
          <ConfidencePanel result={result} />
          <EvidencePanel
            evidence={result.evidence}
            activeId={activeEvidence}
            onSelect={setActiveEvidence}
          />
          <TracePanel trace={result.trace} />
        </div>
      </div>
    </AppShell>
  );
}
