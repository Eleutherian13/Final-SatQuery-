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
import {
  EvidenceContractPanel,
  CapabilityGatePanel,
  LayaJevDecisionPanel,
  EvidenceSufficiencyPanel,
  ValidationCapabilityBridge,
} from "@/components/evidence-contract-gate";
import { TargetedAcquisitionPanel } from "@/components/targeted-acquisition-panel";
import { UnifiedVerificationModel } from "@/components/verification-model";
import { GroundingCompletenessPanel } from "@/components/grounding-completeness";
import {
  InvestigationPassport,
  StructuredAnswerView,
  UpgradedTraceView,
} from "@/components/investigation-passport";
import { goldenScenario, scenarios } from "@/lib/workflow-data";
import { useWorkflow } from "@/lib/workflow/use-workflow";
import { toCanonicalInvestigation } from "@/lib/investigation-engine";
import { OperatingGuideModal } from "@/components/operating-guide-modal";
import type { EvidenceObject, Investigation, NormalisedBox } from "@/lib/types";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SatQuery AI — Remote Sensing Analysis Workspace" },
      {
        name: "description",
        content:
          "Analyst workstation for natural-language satellite image analysis: investigation passport, evidence contract, capability gate, LAYA/JEV routing, adversarial verification, GeoMeasure, targeted acquisition, confidence and full execution trace.",
      },
      { property: "og:title", content: "SatQuery AI — Remote Sensing Analysis Workspace" },
      {
        property: "og:description",
        content:
          "Query optical, SAR and bi-temporal imagery in natural language with evidence contracts, adversarial verification, and deterministic GeoMeasure.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Workspace,
});

type BottomTab =
  | "passport"
  | "contract"
  | "gate"
  | "verification"
  | "grounding"
  | "sufficiency"
  | "acquisition"
  | "trace"
  | "evidence"
  | "timeline"
  | "trust";

type RightRailTab =
  | "passport"
  | "contract"
  | "gate"
  | "verification"
  | "grounding"
  | "results"
  | "sufficiency";

type NarrowScreenView = "OBSERVE" | "QUERY" | "CANVAS" | "EVIDENCE" | "RESULT" | "TRACE";

function Workspace() {
  const workflow = useWorkflow(goldenScenario, scenarios);
  const scenario = workflow.scenario;
  const result: Investigation = useMemo(() => toCanonicalInvestigation(scenario), [scenario]);

  const [activeEvidence, setActiveEvidence] = useState<string | null>(null);
  const [hoveredEvidence, setHoveredEvidence] = useState<string | null>(null);
  const [activeObservation, setActiveObservation] = useState<string | null>(null);
  const [acquisitionTarget, setAcquisitionTarget] = useState<{ geometry: NormalisedBox; label: string } | null>(null);
  const [tab, setTab] = useState<BottomTab>("passport");
  const [rightTab, setRightTab] = useState<RightRailTab>("passport");
  const [narrowView, setNarrowView] = useState<NarrowScreenView>("CANVAS");

  const [leftRailCollapsed, setLeftRailCollapsed] = useState(false);
  const [rightRailCollapsed, setRightRailCollapsed] = useState(false);
  const [scenarioDrawerOpen, setScenarioDrawerOpen] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);

  const selected = result.evidence.find((e: EvidenceObject) => e.id === activeEvidence) ?? null;

  return (
    <AppShell>
      <h1 className="sr-only">SatQuery AI remote sensing analysis workspace</h1>

      {/* Scenario / Request Bar — Aerospace Mission Selector */}
      <div className="flex items-center justify-between gap-3 border-b border-border bg-panel px-3 py-1.5 font-mono text-[10px] overflow-x-auto whitespace-nowrap scrollbar-none">
        {/* Left: Current Scenario & Desktop Segmented Control */}
        <div className="flex items-center gap-2 min-w-0 shrink-0">
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            <span className="hidden uppercase tracking-[0.2em] text-muted-foreground font-semibold sm:inline font-sans">
              DATASET
            </span>
          </div>

          {/* Desktop Scenario Switcher (>= 1440px) */}
          <div className="hidden items-center gap-1 2xl:flex shrink-0">
            {scenarios.map((s) => {
              const isActive = s.id === scenario.id;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => {
                    workflow.setScenarioId(s.id);
                    setActiveEvidence(null);
                    setHoveredEvidence(null);
                    setAcquisitionTarget(null);
                  }}
                  title={s.description}
                  aria-label={`Select scenario ${s.code}: ${s.title}`}
                  className={`border px-2 py-1 uppercase tracking-[0.14em] transition-colors min-h-[28px] ${
                    isActive
                      ? "border-primary bg-primary text-primary-foreground font-extrabold shadow-sm"
                      : "border-border text-muted-foreground hover:bg-panel-raised hover:text-foreground"
                  }`}
                >
                  <span className={isActive ? "text-primary-foreground font-bold" : "text-muted-foreground/70"}>
                    {s.code}
                  </span>{" "}
                  · {s.title}
                </button>
              );
            })}
          </div>

          {/* Medium Desktop / Tablet / Mobile Scenario Select Drawer (< 1440px) */}
          <div className="relative 2xl:hidden shrink-0">
            <button
              type="button"
              onClick={() => setScenarioDrawerOpen((v) => !v)}
              aria-expanded={scenarioDrawerOpen}
              aria-label="Select active scenario dataset"
              className="flex items-center gap-2 border border-primary bg-primary/20 px-2.5 py-1 text-primary font-bold uppercase tracking-[0.14em] min-h-[32px] sm:min-h-[28px]"
            >
              <span>{scenario.code}</span>
              <span>·</span>
              <span className="truncate max-w-[160px] sm:max-w-[240px]">{scenario.title}</span>
              <span className="text-[8px] text-primary">▼</span>
            </button>

            {scenarioDrawerOpen && (
              <div className="absolute left-0 top-full z-50 mt-1 w-72 border border-border bg-panel-raised p-1.5 shadow-xl backdrop-blur-md">
                <div className="mb-1 border-b border-border px-2 py-1 font-mono text-[9px] uppercase tracking-[0.18em] text-muted-foreground">
                  Select Scenario Fixture
                </div>
                <div className="space-y-1 max-h-60 overflow-y-auto">
                  {scenarios.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => {
                        workflow.setScenarioId(s.id);
                        setActiveEvidence(null);
                        setHoveredEvidence(null);
                        setAcquisitionTarget(null);
                        setScenarioDrawerOpen(false);
                      }}
                      className={`w-full text-left border px-2 py-1.5 font-mono text-[10px] uppercase tracking-[0.12em] transition-colors min-h-[36px] ${
                        s.id === scenario.id
                          ? "border-primary bg-primary text-primary-foreground font-bold"
                          : "border-transparent text-muted-foreground hover:bg-background hover:text-foreground"
                      }`}
                    >
                      <div className="font-bold text-foreground">{s.code} · {s.title}</div>
                      <div className="text-[9px] text-muted-foreground truncate">{s.description}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Controls & Telemetry */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setGuideOpen(true)}
            aria-label="Open Master Operating Guide & Demo Manual"
            className="border border-primary bg-primary/20 hover:bg-primary/30 text-primary font-bold uppercase tracking-[0.14em] px-2.5 py-1 text-[10px] transition-colors shrink-0 flex items-center gap-1.5 shadow-sm"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
            <span>[OPERATING GUIDE]</span>
          </button>

          {/* Rail Collapse Controls for Desktop */}
          <div className="hidden items-center gap-1 border-l border-border pl-3 xl:flex shrink-0">
            <button
              type="button"
              onClick={() => setLeftRailCollapsed((v) => !v)}
              className={`border px-2 py-1 uppercase tracking-[0.12em] transition-colors min-h-[28px] ${
                leftRailCollapsed
                  ? "border-primary bg-primary/20 text-primary font-bold"
                  : "border-border text-muted-foreground hover:text-foreground"
              }`}
              title="Toggle input & routing rail"
            >
              {leftRailCollapsed ? "+ INPUT DOCK" : "− INPUT DOCK"}
            </button>
            <button
              type="button"
              onClick={() => setRightRailCollapsed((v) => !v)}
              className={`border px-2 py-1 uppercase tracking-[0.12em] transition-colors min-h-[28px] ${
                rightRailCollapsed
                  ? "border-primary bg-primary/20 text-primary font-bold"
                  : "border-border text-muted-foreground hover:text-foreground"
              }`}
              title="Toggle intelligence inspector rail"
            >
              {rightRailCollapsed ? "+ INSPECTOR" : "− INSPECTOR"}
            </button>
          </div>

          {/* Touch-Safe Mobile / Tablet Responsive Mode Switcher (< xl) */}
          <div className="flex items-center gap-1 border-l border-border pl-2.5 xl:hidden shrink-0">
            <span className="hidden uppercase tracking-[0.14em] text-muted-foreground sm:inline font-sans text-[9px]">MODE:</span>
            {(["OBSERVE", "QUERY", "CANVAS", "EVIDENCE", "RESULT", "TRACE"] as NarrowScreenView[]).map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setNarrowView(v)}
                aria-label={`Switch to ${v} workspace view`}
                className={`border px-2 py-1 text-[9px] uppercase tracking-[0.12em] transition-colors min-h-[36px] sm:min-h-[28px] ${
                  narrowView === v
                    ? "border-primary bg-primary text-primary-foreground font-extrabold shadow-sm"
                    : "border-border text-muted-foreground hover:bg-panel-raised hover:text-foreground"
                }`}
              >
                {v}
              </button>
            ))}
          </div>

          {/* Request ID & Runtime Telemetry */}
          <span className="hidden uppercase tracking-[0.14em] text-muted-foreground md:inline font-mono shrink-0">
            REQUEST <span className="text-foreground font-semibold">{result.requestId}</span> ·{" "}
            <span className="text-primary font-bold">{(result.runtimeMs / 1000).toFixed(1)}s</span>
          </span>
        </div>
      </div>

      {/* Investigation Lifecycle Engine Bar */}
      <WorkflowIndicator workflow={workflow} />

      {/* Phase 1 Validation & Architecture Integrity Flow Bridge */}
      <ValidationCapabilityBridge result={result} />

      {/* Main Workstation Analysis Canvas Grid */}
      <div
        className={`grid min-h-0 min-w-0 max-w-full grid-cols-1 divide-border xl:divide-x transition-all ${
          leftRailCollapsed && rightRailCollapsed
            ? "xl:grid-cols-1"
            : leftRailCollapsed
              ? "xl:grid-cols-[minmax(0,1fr)_440px]"
              : rightRailCollapsed
                ? "xl:grid-cols-[320px_minmax(0,1fr)]"
                : "xl:grid-cols-[320px_minmax(0,1fr)_440px]"
        }`}
      >
        {/* Left Rail: Query, Observations, Routing & Decision Engine */}
        {!leftRailCollapsed && (
          <div
            className={`min-w-0 max-w-full flex-col divide-y divide-border border-b border-border xl:flex xl:border-b-0 ${
              narrowView === "OBSERVE" || narrowView === "QUERY" ? "flex" : "hidden xl:flex"
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
                  setAcquisitionTarget(null);
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
              title="LAYA / JEV Routing Engine"
              meta={result.decision.engine.toUpperCase()}
              bodyClassName=""
            >
              <div className="space-y-3 p-1">
                <LayaJevDecisionPanel result={result} />
                <RoutingStack result={result} workflow={workflow} />
              </div>
            </Panel>
          </div>
        )}

        {/* Primary Recomposed Geo Analysis Canvas (Canvas-Dominant Instrument) */}
        <div
          className={`min-w-0 max-w-full flex-col ${
            narrowView === "CANVAS" ? "flex" : "hidden xl:flex"
          }`}
        >
          <GeoViewer
            observations={scenario.observations}
            evidence={result.evidence}
            activeEvidenceId={activeEvidence}
            hoveredEvidenceId={hoveredEvidence}
            onSelectEvidence={setActiveEvidence}
            onHoverEvidence={setHoveredEvidence}
            acquisitionTarget={acquisitionTarget}
            workflowState={workflow.state}
            query={scenario.query}
            result={result}
            className="min-h-[580px] flex-1"
          />
        </div>

        {/* Right Rail: Evidence Contract, Capability Gate, Verification, Grounding & Results */}
        {!rightRailCollapsed && (
          <div
            className={`min-w-0 max-w-full flex-col divide-y divide-border border-t border-border xl:flex xl:border-t-0 ${
              narrowView === "EVIDENCE" || narrowView === "RESULT" || narrowView === "TRACE" ? "flex" : "hidden xl:flex"
            }`}
          >
            {/* Right Inspector Mode Segmented Control */}
            <div className="flex items-center border-b border-border bg-panel px-2 py-1 font-mono text-[9px] uppercase tracking-[0.14em] overflow-x-auto whitespace-nowrap scrollbar-none">
              {(["passport", "contract", "gate", "verification", "grounding", "results", "sufficiency"] as RightRailTab[]).map((rt) => (
                <button
                  key={rt}
                  type="button"
                  onClick={() => setRightTab(rt)}
                  className={`px-2.5 py-1 transition-colors border-b-2 shrink-0 ${
                    rightTab === rt
                      ? "border-primary text-foreground font-extrabold bg-primary/20"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {rt}
                </button>
              ))}
            </div>

            {rightTab === "passport" && (
              <Panel title="Investigation Passport" meta="SUMMARY LEDGER" bodyClassName="p-2">
                <InvestigationPassport
                  result={result}
                  onSelectStage={() => setTab("trace")}
                  onSelectEvidence={(evId) => {
                    setActiveEvidence(evId);
                    setNarrowView("CANVAS");
                  }}
                />
              </Panel>
            )}

            {rightTab === "contract" && (
              <Panel title="Evidence Contract" meta="SPECIFICATIONS" bodyClassName="p-2">
                <EvidenceContractPanel result={result} observations={scenario.observations} />
              </Panel>
            )}

            {rightTab === "gate" && (
              <Panel title="Capability Gate" meta={result.policyCheck.status.toUpperCase()} bodyClassName="p-2">
                <CapabilityGatePanel result={result} observations={scenario.observations} />
              </Panel>
            )}

            {rightTab === "verification" && (
              <Panel title="Unified Verification Engine" meta={result.verification.overallStatus.toUpperCase()} bodyClassName="p-2">
                <UnifiedVerificationModel
                  result={result}
                  observations={scenario.observations}
                  onSelectDisputedRegion={(target) => {
                    setAcquisitionTarget(target);
                    setNarrowView("CANVAS");
                  }}
                />
              </Panel>
            )}

            {rightTab === "grounding" && (
              <Panel title="Grounding Completeness & GeoMeasure" meta="DETERMINISTIC" bodyClassName="p-2">
                <GroundingCompletenessPanel
                  result={result}
                  onSelectEvidence={(id) => {
                    setActiveEvidence(id);
                    setNarrowView("CANVAS");
                  }}
                />
              </Panel>
            )}

            {rightTab === "results" && (
              <>
                <Panel title="Analysis Result" bodyClassName="">
                  <AnalysisResultPanel
                    result={result}
                    workflow={workflow}
                    onSwitchToTemporal={() => workflow.setScenarioId("demo-03")}
                    onSwitchToMultimodal={() => workflow.setScenarioId("demo-04")}
                  />
                </Panel>
                <Panel title="Confidence Assessment" bodyClassName="">
                  <ConfidenceBlock result={result} workflow={workflow} />
                </Panel>
                <Panel
                  title="Evidence Inspector"
                  meta={selected ? selected.id : "none selected"}
                  bodyClassName=""
                >
                  <EvidenceInspector
                    evidence={selected}
                    observations={scenario.observations}
                    onFocusInViewer={(ev) => {
                      setActiveEvidence(ev.id);
                      setNarrowView("CANVAS");
                    }}
                  />
                </Panel>
              </>
            )}

            {rightTab === "sufficiency" && (
              <Panel title="Evidence Sufficiency Matrix" meta={result.verification.evidenceCompleteness.toUpperCase()} bodyClassName="p-2">
                <EvidenceSufficiencyPanel result={result} />
              </Panel>
            )}
          </div>
        )}
      </div>

      {/* Bottom Instrument Bar — Contextual Instrument Panel */}
      <div className="border-t border-border bg-panel min-w-0 max-w-full overflow-hidden">
        <div className="flex items-stretch border-b border-border overflow-x-auto whitespace-nowrap scrollbar-none">
          {(["passport", "contract", "gate", "verification", "grounding", "sufficiency", "acquisition", "trace", "evidence", "timeline", "trust"] as BottomTab[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`border-r border-border px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.16em] transition-colors shrink-0 min-h-[36px] ${
                tab === t
                  ? "bg-primary/25 text-foreground font-extrabold shadow-[inset_0_-2px_0_0_var(--primary)] border-b-2 border-primary"
                  : "text-muted-foreground hover:bg-panel-raised/60 hover:text-foreground"
              }`}
            >
              {t}
            </button>
          ))}
          <span className="ml-auto hidden items-center px-3.5 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground sm:flex shrink-0">
            {result.trace.length} STAGES · {result.evidence.length} EVIDENCE OBJECTS
          </span>
        </div>

        {tab === "passport" && (
          <div className="p-3 space-y-3">
            <InvestigationPassport
              result={result}
              onSelectStage={() => setTab("trace")}
              onSelectEvidence={(evId) => {
                setActiveEvidence(evId);
                setNarrowView("CANVAS");
              }}
            />
            <StructuredAnswerView
              result={result}
              onSelectEvidence={(evId) => {
                setActiveEvidence(evId);
                setNarrowView("CANVAS");
              }}
            />
          </div>
        )}

        {tab === "contract" && (
          <div className="p-3">
            <EvidenceContractPanel result={result} observations={scenario.observations} />
          </div>
        )}

        {tab === "gate" && (
          <div className="p-3">
            <CapabilityGatePanel result={result} observations={scenario.observations} />
          </div>
        )}

        {tab === "verification" && (
          <div className="p-3">
            <UnifiedVerificationModel
              result={result}
              observations={scenario.observations}
              onSelectDisputedRegion={(target) => {
                setAcquisitionTarget(target);
                setNarrowView("CANVAS");
              }}
            />
          </div>
        )}

        {tab === "grounding" && (
          <div className="p-3">
            <GroundingCompletenessPanel
              result={result}
              onSelectEvidence={(id) => {
                setActiveEvidence(id);
                setNarrowView("CANVAS");
              }}
            />
          </div>
        )}

        {tab === "sufficiency" && (
          <div className="p-3">
            <EvidenceSufficiencyPanel result={result} />
          </div>
        )}

        {tab === "acquisition" && (
          <div className="grid md:grid-cols-[minmax(0,1fr)_340px] md:divide-x md:divide-border">
            <TargetedAcquisitionPanel
              result={result}
              observations={scenario.observations}
              onSelectTargetRegion={(target) => {
                setAcquisitionTarget(target);
                setNarrowView("CANVAS");
              }}
            />
            <div className="p-3 font-mono space-y-2">
              <OrbitView observations={scenario.observations} />
              <div className="border-t border-border/40 pt-2">
                <p className="text-[9px] uppercase tracking-[0.18em] text-muted-foreground font-semibold">
                  ACQUISITION GEOMETRY — SENSORS
                </p>
                <ul className="mt-1.5 space-y-1">
                  {scenario.observations.map((o) => (
                    <li key={o.id} className="text-[9.5px] text-muted-foreground border-b border-border/40 pb-1">
                      <span className={o.modality === "sar" ? "text-sar font-bold" : "text-optical font-bold"}>
                        {o.modality.toUpperCase()}
                      </span>{" "}
                      · {o.metadata.sensor} · GSD {o.metadata.resolutionM} m
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {tab === "trace" && <UpgradedTraceView result={result} />}

        {tab === "evidence" && (
          <div className="grid md:grid-cols-2 md:divide-x md:divide-border min-w-0 max-w-full">
            <EvidenceList
              evidence={result.evidence}
              activeId={activeEvidence}
              hoveredId={hoveredEvidence}
              onSelect={(id) => {
                setActiveEvidence(id);
                setNarrowView("CANVAS");
              }}
              onHover={setHoveredEvidence}
            />
            <EvidenceInspector
              evidence={selected}
              observations={scenario.observations}
              onFocusInViewer={(ev) => {
                setActiveEvidence(ev.id);
                setNarrowView("CANVAS");
              }}
            />
          </div>
        )}

        {tab === "timeline" && <Timeline result={result} />}

        {tab === "trust" && (
          <TrustExplainabilityView investigation={result} onSelectEvidence={setActiveEvidence} />
        )}
      </div>

      <OperatingGuideModal
        isOpen={guideOpen}
        onClose={() => setGuideOpen(false)}
        onSelectScenario={(id) => {
          workflow.setScenarioId(id);
          setActiveEvidence(null);
          setHoveredEvidence(null);
          setAcquisitionTarget(null);
        }}
      />
    </AppShell>
  );
}
