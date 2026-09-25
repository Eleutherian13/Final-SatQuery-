import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";

import { AppShell, Panel } from "@/components/app-shell";
import { GeoViewer } from "@/components/geo-viewer";
import { OrbitView } from "@/components/orbit-view";
import { WorkflowIndicator } from "@/components/workflow-indicator";
import { TrustExplainabilityView } from "@/components/trust-explainability";
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
import { goldenScenario, scenarios } from "@/lib/workflow-data";
import { useWorkflow } from "@/lib/workflow/use-workflow";
import { toCanonicalInvestigation } from "@/lib/investigation-engine";
import type { EvidenceObject, Investigation } from "@/lib/types";

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

type BottomTab = "evidence" | "timeline" | "trace" | "acquisition" | "trust";
type NarrowScreenView = "canvas" | "input" | "results";

function Workspace() {
  const workflow = useWorkflow(goldenScenario, scenarios);
  const scenario = workflow.scenario;
  const result: Investigation = useMemo(() => toCanonicalInvestigation(scenario), [scenario]);

  const [activeEvidence, setActiveEvidence] = useState<string | null>(null);
  const [hoveredEvidence, setHoveredEvidence] = useState<string | null>(null);
  const [activeObservation, setActiveObservation] = useState<string | null>(null);
  const [tab, setTab] = useState<BottomTab>("trace");
  const [narrowView, setNarrowView] = useState<NarrowScreenView>("canvas");

  const selected = result.evidence.find((e: EvidenceObject) => e.id === activeEvidence) ?? null;

  return (
    <AppShell>
      <h1 className="sr-only">SatQuery AI remote sensing analysis workspace</h1>

      {/* scenario / request bar */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-b border-border bg-panel px-3 py-1.5">
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          dataset · cartosat / risat demo set
        </span>
        <div className="flex flex-wrap items-center gap-px">
          {scenarios.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => {
                workflow.setScenarioId(s.id);
                setActiveEvidence(null);
                setHoveredEvidence(null);
              }}
              title={s.description}
              className={`border px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.12em] transition-colors ${
                s.id === scenario.id
                  ? "border-primary bg-primary/10 text-primary font-bold shadow-[inset_0_0_0_1px_var(--primary)]"
                  : "border-border text-muted-foreground hover:bg-panel-raised hover:text-foreground"
              }`}
            >
              {s.code} · {s.title}
            </button>
          ))}
        </div>

        {/* Narrow viewport panel switcher (< xl) */}
        <div className="flex items-center gap-1 border-l border-border pl-3 xl:hidden">
          <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-muted-foreground">
            view:
          </span>
          {(["canvas", "input", "results"] as NarrowScreenView[]).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setNarrowView(v)}
              className={`border px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.12em] transition-colors ${
                narrowView === v
                  ? "border-primary bg-primary/10 text-primary font-bold"
                  : "border-border text-muted-foreground hover:bg-panel-raised hover:text-foreground"
              }`}
            >
              {v}
            </button>
          ))}
        </div>

        <span className="ml-auto font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
          request <span className="text-foreground">{result.requestId}</span> ·{" "}
          {(result.runtimeMs / 1000).toFixed(1)} s
        </span>
      </div>

      {/* Investigation Lifecycle Engine Bar */}
      <WorkflowIndicator workflow={workflow} />

      <div className="grid min-h-0 min-w-0 max-w-full grid-cols-1 divide-border xl:grid-cols-[320px_minmax(0,1fr)_360px] xl:divide-x">
        {/* left rail */}
        <div
          className={`min-w-0 max-w-full flex-col divide-y divide-border border-b border-border xl:flex xl:border-b-0 ${
            narrowView === "input" ? "flex" : "hidden xl:flex"
          }`}
        >
          <Panel title="Query" meta={result.intent.compatibility} bodyClassName="">
            <QueryComposer
              query={scenario.query}
              result={result}
              workflow={workflow}
              onRun={() => {
                setActiveEvidence(null);
                setHoveredEvidence(null);
              }}
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
              workflow={workflow}
            />
          </Panel>
          <Panel
            title="Routing"
            meta={`${Math.round(result.intent.confidence * 100)}% intent`}
            bodyClassName=""
          >
            <RoutingStack result={result} workflow={workflow} />
          </Panel>
        </div>

        {/* primary canvas */}
        <div
          className={`min-w-0 max-w-full flex-col ${
            narrowView === "canvas" ? "flex" : "hidden xl:flex"
          }`}
        >
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
              hoveredEvidenceId={hoveredEvidence}
              onSelectEvidence={setActiveEvidence}
              onHoverEvidence={setHoveredEvidence}
              workflowState={workflow.state}
            />
          </Panel>
        </div>

        {/* right rail */}
        <div
          className={`min-w-0 max-w-full flex-col divide-y divide-border border-t border-border xl:flex xl:border-t-0 ${
            narrowView === "results" ? "flex" : "hidden xl:flex"
          }`}
        >
          <Panel title="Analysis result" bodyClassName="">
            <AnalysisResultPanel
              result={result}
              workflow={workflow}
              onSwitchToTemporal={() => workflow.setScenarioId("demo-03")}
              onSwitchToMultimodal={() => workflow.setScenarioId("demo-04")}
            />
          </Panel>
          <Panel title="Confidence assessment" bodyClassName="">
            <ConfidenceBlock result={result} workflow={workflow} />
          </Panel>
          <Panel
            title="Evidence inspector"
            meta={selected ? selected.id : "none selected"}
            bodyClassName=""
          >
            <EvidenceInspector
              evidence={selected}
              observations={scenario.observations}
              onFocusInViewer={(ev) => {
                setActiveEvidence(ev.id);
                setNarrowView("canvas");
              }}
            />
          </Panel>
        </div>
      </div>

      {/* bottom instrument bar */}
      <div className="border-t border-border bg-panel min-w-0 max-w-full overflow-hidden">
        <div className="flex items-stretch border-b border-border overflow-x-auto">
          {(["trace", "evidence", "timeline", "acquisition", "trust"] as BottomTab[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`border-r border-border px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.16em] transition-colors shrink-0 ${
                tab === t
                  ? "bg-panel-raised text-foreground shadow-[inset_0_-2px_0_0_var(--primary)]"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t}
            </button>
          ))}
          <span className="ml-auto hidden items-center px-3 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground sm:flex">
            {result.trace.length} stages · {result.evidence.length} evidence objects
          </span>
        </div>
        {tab === "trace" && <ExecutionTrace trace={result.trace} />}
        {tab === "evidence" && (
          <div className="grid md:grid-cols-2 md:divide-x md:divide-border min-w-0 max-w-full">
            <EvidenceList
              evidence={result.evidence}
              activeId={activeEvidence}
              hoveredId={hoveredEvidence}
              onSelect={(id) => {
                setActiveEvidence(id);
                setNarrowView("canvas");
              }}
              onHover={setHoveredEvidence}
            />
            <EvidenceInspector
              evidence={selected}
              observations={scenario.observations}
              onFocusInViewer={(ev) => {
                setActiveEvidence(ev.id);
                setNarrowView("canvas");
              }}
            />
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
        {tab === "trust" && (
          <TrustExplainabilityView investigation={result} onSelectEvidence={setActiveEvidence} />
        )}
      </div>
    </AppShell>
  );
}
