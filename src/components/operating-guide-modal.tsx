import { useState } from "react";
import { scenarios } from "@/lib/workflow-data";

interface OperatingGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectScenario: (scenarioId: string) => void;
}

type GuideTab = "QUICK_START" | "DEMO_COOKBOOK" | "JUDGE_SCRIPT" | "SYSTEM_REALITY";

export function OperatingGuideModal({ isOpen, onClose, onSelectScenario }: OperatingGuideModalProps) {
  const [activeTab, setActiveTab] = useState<GuideTab>("QUICK_START");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-md p-4 sm:p-6">
      <div className="flex flex-col w-full max-w-5xl h-[85vh] max-h-[800px] border border-border bg-panel shadow-2xl overflow-hidden font-sans">
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b border-border bg-panel-raised px-4 py-3 shrink-0">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            <span className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-foreground">
              SATQUERY AI — OPERATING GUIDE & DEMO MANUAL
            </span>
            <span className="border border-primary/40 bg-primary/10 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider text-primary">
              CURRENT VERSION v2.4
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="border border-border bg-background px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-muted-foreground hover:bg-panel hover:text-foreground transition-colors"
          >
            [ESC / CLOSE]
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-border bg-background px-4 font-mono text-[10px] overflow-x-auto whitespace-nowrap scrollbar-none shrink-0">
          {[
            { id: "QUICK_START", label: "⚡ QUICK START (9 STEPS)" },
            { id: "DEMO_COOKBOOK", label: "🧪 DEMO SCENARIO COOKBOOK" },
            { id: "JUDGE_SCRIPT", label: "⚖️ SIH JUDGE 5-MIN WALKTHROUGH" },
            { id: "SYSTEM_REALITY", label: "🔍 IMPLEMENTATION REALITY" },
          ].map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setActiveTab(t.id as GuideTab)}
              className={`border-b-2 px-4 py-2.5 uppercase tracking-wider transition-colors min-h-[36px] ${
                activeTab === t.id
                  ? "border-primary text-primary font-extrabold bg-panel"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Modal Content Scroll Area */}
        <div className="flex-1 overflow-y-auto p-6 font-mono text-xs text-foreground leading-relaxed space-y-6">
          {activeTab === "QUICK_START" && (
            <div className="space-y-6">
              <div className="border border-primary/30 bg-primary/5 p-4 rounded-none">
                <h3 className="font-mono text-sm font-bold uppercase tracking-wider text-primary mb-1">
                  How to Operate SatQuery AI in 9 Steps
                </h3>
                <p className="font-sans text-xs text-muted-foreground">
                  Follow this canonical execution sequence to evaluate any satellite query or bi-temporal investigation scenario.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-sans text-xs">
                <div className="border border-border bg-panel-raised p-4 space-y-2">
                  <div className="font-mono text-xs font-extrabold text-primary">STEP 01 · SELECT SCENARIO</div>
                  <p className="text-muted-foreground">
                    Click any scenario badge in the top bar (e.g. <strong className="text-foreground">GOLDEN</strong> or <strong className="text-foreground">DEMO-01..08</strong>). This loads pre-configured satellite observations (T1 optical/SAR, T2).
                  </p>
                </div>

                <div className="border border-border bg-panel-raised p-4 space-y-2">
                  <div className="font-mono text-xs font-extrabold text-primary">STEP 02 · INSPECT OBSERVATIONS</div>
                  <p className="text-muted-foreground">
                    In the left panel, inspect input metadata: timestamps, resolution (0.3m/px), satellite sensors (Sentinel-2, TerraSAR-X), and bounding coordinates.
                  </p>
                </div>

                <div className="border border-border bg-panel-raised p-4 space-y-2">
                  <div className="font-mono text-xs font-extrabold text-primary">STEP 03 · ENTER / SELECT QUERY</div>
                  <p className="text-muted-foreground">
                    In the query input field, enter a natural-language question or select a preset suggestion tailored to the active scenario.
                  </p>
                </div>

                <div className="border border-border bg-panel-raised p-4 space-y-2">
                  <div className="font-mono text-xs font-extrabold text-primary">STEP 04 · EXECUTE INVESTIGATION</div>
                  <p className="text-muted-foreground">
                    Click the bright <strong className="text-primary">[RUN QUERY]</strong> button. The agentic state machine executes validation, evidence planning, and adversarial verification.
                  </p>
                </div>

                <div className="border border-border bg-panel-raised p-4 space-y-2">
                  <div className="font-mono text-xs font-extrabold text-primary">STEP 05 · FOLLOW STATE WORKFLOW</div>
                  <p className="text-muted-foreground">
                    Watch the workflow bar progress through: <em className="text-foreground">INGESTION → CONTRACT → ROUTING → VERIFICATION → ANSWER</em>. Use Step/Pause controls if needed.
                  </p>
                </div>

                <div className="border border-border bg-panel-raised p-4 space-y-2">
                  <div className="font-mono text-xs font-extrabold text-primary">STEP 06 · INSPECT GEOVIEWER</div>
                  <p className="text-muted-foreground">
                    Examine spatial evidence overlays in GeoViewer. Toggle view modes (<strong className="text-foreground">SINGLE, SWIPE, SPLIT, DIFF, FUSED</strong>) and observe <span className="text-primary">🎯 TARGET MATCH</span> boxes.
                  </p>
                </div>

                <div className="border border-border bg-panel-raised p-4 space-y-2">
                  <div className="font-mono text-xs font-extrabold text-primary">STEP 07 · ADVERSARIAL VERIFICATION</div>
                  <p className="text-muted-foreground">
                    Switch to the <strong className="text-foreground">VERIFICATION</strong> bottom tab to review the Proposer vs Skeptic debate, contested regions, and confidence adjustments.
                  </p>
                </div>

                <div className="border border-border bg-panel-raised p-4 space-y-2">
                  <div className="font-mono text-xs font-extrabold text-primary">STEP 08 · DEEP TECHNICAL TABS</div>
                  <p className="text-muted-foreground">
                    Inspect the <strong className="text-foreground">Passport</strong>, <strong className="text-foreground">Evidence Contract</strong>, <strong className="text-foreground">Capability Gate</strong>, and <strong className="text-foreground">Execution Trace</strong> for full auditability.
                  </p>
                </div>

                <div className="border border-border bg-panel-raised p-4 space-y-2">
                  <div className="font-mono text-xs font-extrabold text-primary">STEP 09 · DOWNLOAD AUDIT REPORT</div>
                  <p className="text-muted-foreground">
                    Click <strong className="text-foreground">[EXPORT REPORT]</strong> in the right inspector or bottom tab to download a complete cryptographic JSON/Markdown report.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "DEMO_COOKBOOK" && (
            <div className="space-y-4">
              <div className="border border-primary/30 bg-primary/5 p-4">
                <h3 className="font-mono text-sm font-bold uppercase tracking-wider text-primary mb-1">
                  Demo Scenario Inventory & Capabilities
                </h3>
                <p className="font-sans text-xs text-muted-foreground">
                  Select any scenario below to activate it immediately in the workspace.
                </p>
              </div>

              <div className="space-y-3 font-sans text-xs">
                {scenarios.map((s) => (
                  <div key={s.id} className="border border-border bg-panel-raised p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="space-y-1 max-w-2xl">
                      <div className="flex items-center gap-2 font-mono">
                        <span className="border border-primary bg-primary/20 text-primary px-2 py-0.5 text-xs font-bold">
                          {s.code}
                        </span>
                        <span className="font-bold text-foreground text-sm">{s.title}</span>
                      </div>
                      <p className="text-muted-foreground">{s.description}</p>
                      <div className="font-mono text-[10px] text-muted-foreground/80 flex flex-wrap gap-2">
                        <span><strong>QUERY:</strong> "{s.query}"</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        onSelectScenario(s.id);
                        onClose();
                      }}
                      className="border border-primary bg-primary text-primary-foreground font-mono text-xs font-bold px-3 py-1.5 uppercase tracking-wider hover:bg-primary/90 transition-colors shrink-0"
                    >
                      LOAD THIS DEMO →
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "JUDGE_SCRIPT" && (
            <div className="space-y-6 font-sans text-xs">
              <div className="border border-primary/30 bg-primary/5 p-4 font-mono">
                <h3 className="text-sm font-bold uppercase tracking-wider text-primary mb-1">
                  SIH Judge & Evaluator 5-Minute Demonstration Script
                </h3>
                <p className="text-xs text-muted-foreground">
                  Follow this exact minute-by-minute sequence during live judging for maximum impact.
                </p>
              </div>

              <div className="space-y-4">
                <div className="border border-border bg-panel-raised p-4 space-y-2">
                  <div className="font-mono text-xs font-bold text-primary">0:00 – 0:45 · INTRODUCTION & SCENARIO LOAD</div>
                  <ul className="list-disc pl-5 text-muted-foreground space-y-1">
                    <li>Select the <strong className="text-foreground">GOLDEN</strong> scenario (Primary End-to-End Walkthrough).</li>
                    <li>Point to the <strong className="text-foreground">Observation List</strong> in the left dock showing T1 (March 2024 Optical/SAR) and T2 (September 2024 Optical).</li>
                    <li>Explain: <em>"SatQuery AI accepts multi-modal satellite observations and converts natural language queries into evidence-backed GEOINT answers."</em></li>
                  </ul>
                </div>

                <div className="border border-border bg-panel-raised p-4 space-y-2">
                  <div className="font-mono text-xs font-bold text-primary">0:45 – 1:45 · QUERY EXECUTION & EVIDENCE CONTRACT</div>
                  <ul className="list-disc pl-5 text-muted-foreground space-y-1">
                    <li>Highlight the pre-loaded query: <em>"Detect structural change in port container facilities between T1 and T2..."</em></li>
                    <li>Click <strong className="text-primary">[RUN QUERY]</strong>. Observe the state machine advance from Ingestion to Contract.</li>
                    <li>Open the <strong className="text-foreground">Evidence Contract</strong> tab: show the system explicitly stating what must be proven and what observations support it.</li>
                  </ul>
                </div>

                <div className="border border-border bg-panel-raised p-4 space-y-2">
                  <div className="font-mono text-xs font-bold text-primary">1:45 – 3:00 · GEOVIEWER SPATIAL INSPECTION & VIEW MODES</div>
                  <ul className="list-disc pl-5 text-muted-foreground space-y-1">
                    <li>Point to GeoViewer: show the highlighted change area with <span className="text-primary">🎯 TARGET MATCH</span> and confidence score.</li>
                    <li>Switch GeoViewer view modes: demo <strong className="text-foreground">SINGLE</strong>, <strong className="text-foreground">SWIPE</strong> slider, and <strong className="text-foreground">DIFFERENCE</strong> mode to prove bi-temporal spatial transformation correctness.</li>
                  </ul>
                </div>

                <div className="border border-border bg-panel-raised p-4 space-y-2">
                  <div className="font-mono text-xs font-bold text-primary">3:00 – 4:00 · ADVERSARIAL VERIFICATION (PROPOSER vs SKEPTIC)</div>
                  <ul className="list-disc pl-5 text-muted-foreground space-y-1">
                    <li>Click the <strong className="text-foreground">VERIFICATION</strong> tab at the bottom.</li>
                    <li>Explain: <em>"To prevent AI hallucinations, SatQuery uses a Proposer network to claim changes, and an independent Skeptic network to challenge boundary instabilities or registration residuals."</em></li>
                    <li>Show how Skeptic disputed regions adjust the final confidence rating deterministically.</li>
                  </ul>
                </div>

                <div className="border border-border bg-panel-raised p-4 space-y-2">
                  <div className="font-mono text-xs font-bold text-primary">4:00 – 5:00 · AUDIT REPORT & SYSTEM NAVIGATION</div>
                  <ul className="list-disc pl-5 text-muted-foreground space-y-1">
                    <li>Click <strong className="text-foreground">[EXPORT REPORT]</strong> to demonstrate instant generation of downloadable audit files.</li>
                    <li>Click <strong className="text-foreground">History</strong> in top navigation to show past investigation logs.</li>
                    <li>Click <strong className="text-foreground">Registry</strong> in top navigation to show model tool contracts and capability manifests.</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {activeTab === "SYSTEM_REALITY" && (
            <div className="space-y-6 font-sans text-xs">
              <div className="border border-primary/30 bg-primary/5 p-4 font-mono">
                <h3 className="text-sm font-bold uppercase tracking-wider text-primary mb-1">
                  Implementation Truth & Backend Dependency Matrix
                </h3>
                <p className="text-xs text-muted-foreground">
                  SatQuery AI explicitly distinguishes client-side frontend execution from backend AI model inference.
                </p>
              </div>

              <div className="space-y-3 font-mono text-xs">
                <div className="border border-emerald-500/40 bg-emerald-500/10 p-3">
                  <div className="font-bold text-emerald-400 mb-1">✅ REAL (FULLY IMPLEMENTED IN FRONTEND)</div>
                  <ul className="list-disc pl-5 text-emerald-200/90 font-sans space-y-0.5">
                    <li>Deterministic spatial transform pipeline (RenderedImageRect, SVG bounding boxes, target match highlights).</li>
                    <li>Agent state machine lifecycle (Ingestion, Validation, Contract, Routing, Verification, Answer).</li>
                    <li>Bidirectional evidence selection & synchronization between panel lists and GeoViewer overlays.</li>
                    <li>GeoViewer multi-view rendering engine (Single, Swipe slider, Side-by-Side split, Temporal Diff, Fused).</li>
                    <li>Audit report generator with downloadable JSON & Markdown artifacts.</li>
                    <li>Complete client-side routing (`/`, `/history`, `/registry`).</li>
                  </ul>
                </div>

                <div className="border border-amber-500/40 bg-amber-500/10 p-3">
                  <div className="font-bold text-amber-400 mb-1">🧪 SIMULATED / DEMO FIXTURES</div>
                  <ul className="list-disc pl-5 text-amber-200/90 font-sans space-y-0.5">
                    <li>Laya / Jev decision engine routing score calculation (uses deterministic scenario rules).</li>
                    <li>Proposer vs Skeptic adversarial debate (pre-composed ground-truth scenario fixtures).</li>
                    <li>Physics-aware SAR backscatter extraction & optical cloud cover filtering.</li>
                  </ul>
                </div>

                <div className="border border-sky-500/40 bg-sky-500/10 p-3">
                  <div className="font-bold text-sky-400 mb-1">⚡ BACKEND REQUIRED FOR PRODUCTION</div>
                  <ul className="list-disc pl-5 text-sky-200/90 font-sans space-y-0.5">
                    <li>Live PyTorch/CUDA GPU inference for real-time SAM-2 / EarthVQA / ChangeFormer model execution.</li>
                    <li>STAC API catalog connection for live Sentinel/Landsat satellite scene fetching.</li>
                    <li>PostGIS spatial database for vector geospatial indexing.</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Bar */}
        <div className="border-t border-border bg-panel-raised px-4 py-3 flex items-center justify-between font-mono text-[10px] shrink-0">
          <span className="text-muted-foreground">
            SatQuery AI — Evidence-Gated Satellite Intelligence Platform
          </span>
          <button
            type="button"
            onClick={onClose}
            className="border border-primary bg-primary text-primary-foreground font-bold uppercase tracking-wider px-4 py-1 hover:bg-primary/90 transition-colors"
          >
            RETURN TO WORKSPACE
          </button>
        </div>
      </div>
    </div>
  );
}
