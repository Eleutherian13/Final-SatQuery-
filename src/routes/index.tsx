import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";

import { AppShell, Panel } from "@/components/app-shell";
import { GeoViewer } from "@/components/geo-viewer";
import { OrbitView } from "@/components/orbit-view";
import {
  AnalysisResultPanel,
  ConfidenceBlock,
  EvidenceInspector,
  EvidenceList,
  ExecutionTrace,
  ObservationList,
  QueryComposer,
  RoutingStack,
  Timeline,
} from "@/components/workspace-panels";
import { demoScenarios } from "@/lib/mock-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SatQuery AI — Remote Sensing Analysis Workspace" },
      {
        name: "description",
        content:
          "Analyst workstation for natural-language satellite image analysis: validation, workflow routing, specialist models, spatial evidence, confidence and full execution trace.",
      },
      { property: "og:title", content: "SatQuery AI — Remote Sensing Analysis Workspace" },
      {
        property: "og:description",
        content:
          "Query optical, SAR and bi-temporal imagery in natural language with auditable evidence and execution trace.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Workspace,
});

type BottomTab = "evidence" | "timeline" | "trace" | "acquisition";

function Workspace() {
  const defaultScenario = demoScenarios[2] ?? demoScenarios[0]!;
  const [scenarioId, setScenarioId] = useState(defaultScenario.id);
  const [activeEvidence, setActiveEvidence] = useState<string | null>(null);
  const [activeObservation, setActiveObservation] = useState<string | null>(null);
  const [tab, setTab] = useState<BottomTab>("trace");

  const scenario = useMemo(
    () => demoScenarios.find((s) => s.id === scenarioId) ?? defaultScenario,
    [scenarioId, defaultScenario],
  );
  const result = scenario.result;
  const selected = result.evidence.find((e) => e.id === activeEvidence) ?? null;

  return (
    <AppShell>
      <h1 className="sr-only">SatQuery AI remote sensing analysis workspace</h1>

      {/* scenario / request bar */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-b border-border bg-panel px-3 py-1.5">
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          dataset · cartosat / risat demo set
        </span>
        <div className="flex flex-wrap items-center gap-px">
          {demoScenarios.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => {
                setScenarioId(s.id);
                setActiveEvidence(null);
              }}
              title={s.description}
              className={`border px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.12em] transition-colors ${
                s.id === scenarioId
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:bg-panel-raised hover:text-foreground"
              }`}
            >
              {s.code} · {s.title}
            </button>
          ))}
        </div>
        <span className="ml-auto font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
          request <span className="text-foreground">{result.requestId}</span> ·{" "}
          {(result.runtimeMs / 1000).toFixed(1)} s
        </span>
      </div>

      <div className="grid min-h-0 grid-cols-1 divide-border xl:grid-cols-[320px_minmax(0,1fr)_360px] xl:divide-x">
        {/* left rail */}
        <div className="flex min-w-0 flex-col divide-y divide-border border-b border-border xl:border-b-0">
          <Panel title="Query" meta={result.intent.compatibility} bodyClassName="">
            <QueryComposer
              query={scenario.query}
              result={result}
              onRun={() => setActiveEvidence(null)}
            />
          </Panel>
          <Panel
            title="Observations"
            meta={`${scenario.observations.length} loaded`}
            bodyClassName=""
          >
            <ObservationList
              observations={scenario.observations}
              activeId={activeObservation}
              onSelect={setActiveObservation}
            />
          </Panel>
          <Panel title="Routing" meta={`${Math.round(result.intent.confidence * 100)}% intent`} bodyClassName="">
            <RoutingStack result={result} />
          </Panel>
        </div>

        {/* primary canvas */}
        <div className="flex min-w-0 flex-col">
          <Panel
            title="Geo view"
            meta={`${scenario.observations.map((o) => o.modality).join(" + ")} · ${result.workflow.label}`}
            bodyClassName=""
            className="min-h-[520px] flex-1"
          >
            <GeoViewer
              observations={scenario.observations}
              evidence={result.evidence}
              activeEvidenceId={activeEvidence}
              onSelectEvidence={setActiveEvidence}
            />
          </Panel>
        </div>

        {/* right rail */}
        <div className="flex min-w-0 flex-col divide-y divide-border border-t border-border xl:border-t-0">
          <Panel title="Analysis result" bodyClassName="">
            <AnalysisResultPanel result={result} />
          </Panel>
          <Panel title="Confidence assessment" bodyClassName="">
            <ConfidenceBlock result={result} />
          </Panel>
          <Panel title="Evidence inspector" meta={selected ? selected.id : "none selected"} bodyClassName="">
            <EvidenceInspector evidence={selected} observations={scenario.observations} />
          </Panel>
        </div>
      </div>

      {/* bottom instrument bar */}
      <div className="border-t border-border bg-panel">
        <div className="flex items-stretch border-b border-border">
          {(["trace", "evidence", "timeline", "acquisition"] as BottomTab[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`border-r border-border px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.16em] transition-colors ${
                tab === t
                  ? "bg-panel-raised text-foreground shadow-[inset_0_-2px_0_0_var(--primary)]"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t}
            </button>
          ))}
          <span className="ml-auto flex items-center px-3 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
            {result.trace.length} stages · {result.evidence.length} evidence objects
          </span>
        </div>
        {tab === "trace" && <ExecutionTrace trace={result.trace} />}
        {tab === "evidence" && (
          <div className="grid md:grid-cols-2 md:divide-x md:divide-border">
            <EvidenceList
              evidence={result.evidence}
              activeId={activeEvidence}
              onSelect={setActiveEvidence}
            />
            <EvidenceInspector evidence={selected} observations={scenario.observations} />
          </div>
        )}
        {tab === "timeline" && <Timeline result={result} />}
        {tab === "acquisition" && (
          <div className="grid md:grid-cols-[minmax(0,1fr)_320px] md:divide-x md:divide-border">
            <OrbitView observations={scenario.observations} />
            <div className="p-3">
              <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-muted-foreground">
                acquisition geometry — demo positions
              </p>
              <ul className="mt-1 space-y-1">
                {scenario.observations.map((o) => (
                  <li key={o.id} className="font-mono text-[10px] text-muted-foreground">
                    <span className={o.modality === "sar" ? "text-sar" : "text-optical"}>
                      {o.modality.toUpperCase()}
                    </span>{" "}
                    {o.metadata.sensor} · {o.metadata.acquiredAt} · gsd {o.metadata.resolutionM} m
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
