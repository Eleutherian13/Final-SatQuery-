import React, { useState } from "react";
import {
  FileText,
  ShieldCheck,
  Cpu,
  Layers,
  CheckCircle2,
  AlertTriangle,
  Compass,
  ArrowRight,
  Clock,
  Zap,
  ChevronDown,
  ChevronUp,
  Activity,
  Split,
  Scale,
  Database,
  Search,
} from "lucide-react";
import type { EvidenceObject, Investigation, TraceEvent } from "@/lib/types";

export interface PassportProps {
  result: Investigation;
  onSelectStage?: (stageId: string) => void;
  onSelectEvidence?: (evidenceId: string) => void;
}

/* ============================================================================
 * 1. INVESTIGATION PASSPORT SUMMARY (ANSWERS: "WHAT HAPPENED?")
 * ============================================================================ */

export function InvestigationPassport({ result, onSelectStage, onSelectEvidence }: PassportProps) {
  const [activeSection, setActiveSection] = useState<string | null>(null);

  const passportStages = [
    {
      id: "REQUEST",
      label: "1. REQUEST & INTENT",
      value: result.query,
      meta: `Intent: ${result.intent.label} (${Math.round(result.intent.confidence * 100)}%)`,
      status: "pass",
    },
    {
      id: "WORKFLOW",
      label: "2. WORKFLOW ROUTE",
      value: result.workflow.label,
      meta: `Required: ${result.workflow.requiredObservations}`,
      status: "pass",
    },
    {
      id: "OBSERVATIONS",
      label: "3. OBSERVATIONS",
      value: `${result.observations.length} Feeds Loaded`,
      meta: result.observations.map((o) => `${o.modality.toUpperCase()} (${o.metadata.resolutionM ?? 1.0}m)`).join(" + "),
      status: "pass",
    },
    {
      id: "DECISION",
      label: "4. ROUTING ENGINE",
      value: `${result.decision.engine.toUpperCase()} Engine`,
      meta: `Task: ${result.decision.task} → Tool: ${result.decision.specialist}`,
      status: result.decision.status === "decided" ? "pass" : "warn",
    },
    {
      id: "CONTRACT",
      label: "5. EVIDENCE CONTRACT",
      value: `Policy: ${result.policyCheck.status.toUpperCase()}`,
      meta: `Contract: ${result.policyCheck.toolContract}`,
      status: result.policyCheck.status === "allowed" ? "pass" : "fail",
    },
    {
      id: "EVIDENCE",
      label: "6. EVIDENCE OBJECTS",
      value: `${result.evidence.length} Artifacts Generated`,
      meta: `Types: ${Array.from(new Set(result.evidence.map((e) => e.type))).join(", ")}`,
      status: "pass",
    },
    {
      id: "STABILITY",
      label: "7. CHANGE STABILITY",
      value: result.biTemporal ? `Residual ${result.biTemporal.validation.registration.residualPx}px` : "Tolerances OK",
      meta: result.biTemporal?.validation.registration.residualPx && result.biTemporal.validation.registration.residualPx > 0.5 ? "Sub-pixel residual warning" : "Risk within tolerance",
      status: result.biTemporal?.validation.registration.residualPx && result.biTemporal.validation.registration.residualPx > 0.5 ? "warn" : "pass",
    },
    {
      id: "VERIFICATION",
      label: "8. ADVERSARIAL VERIFICATION",
      value: `Verdict: ${result.verification.overallStatus.toUpperCase()}`,
      meta: `Model Agreement: ${result.verification.modelAgreement?.toUpperCase() ?? "AGREED"}`,
      status: result.verification.overallStatus === "pass" ? "pass" : "warn",
    },
    {
      id: "RESULT",
      label: "9. STRUCTURED RESULT",
      value: `Confidence: ${result.confidence.level.toUpperCase()}`,
      meta: `${result.structuredAnswer.claims.length} Claims Synthesized`,
      status: result.confidence.level === "high" ? "pass" : "warn",
    },
    {
      id: "NOT_ESTABLISHED",
      label: "10. NOT ESTABLISHED",
      value: "2 Unestablished Claims",
      meta: "Socio-economic cause & Title deed boundaries",
      status: "fail",
    },
  ];

  return (
    <div className="border border-border bg-panel p-3 font-mono text-[10px] space-y-3">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-2">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-primary" />
          <span className="font-bold uppercase tracking-[0.18em] text-foreground">
            INVESTIGATION PASSPORT (SUMMARY LEDGER)
          </span>
        </div>
        <div className="flex items-center gap-2 text-[8.5px]">
          <span className="border border-primary/40 bg-primary/10 px-2 py-0.5 text-primary font-bold uppercase">
            REQ #{result.requestId}
          </span>
          <span className="text-muted-foreground">RUNTIME: {(result.runtimeMs / 1000).toFixed(1)}s</span>
        </div>
      </div>

      {/* Passport Stages Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-1.5">
        {passportStages.map((stage) => {
          const isPass = stage.status === "pass";
          const isWarn = stage.status === "warn";
          return (
            <button
              key={stage.id}
              type="button"
              onClick={() => {
                setActiveSection(activeSection === stage.id ? null : stage.id);
                if (onSelectStage) onSelectStage(stage.id);
              }}
              className={`border p-2 text-left space-y-1 transition-all ${
                activeSection === stage.id
                  ? "border-primary bg-primary/15 text-primary shadow-[0_0_8px_rgba(0,229,255,0.2)]"
                  : isPass
                    ? "border-border/80 bg-background/60 hover:border-primary/60 hover:bg-panel-raised"
                    : isWarn
                      ? "border-amber-500/40 bg-amber-500/5 hover:border-amber-400"
                      : "border-red-500/40 bg-red-500/5 hover:border-red-400"
              }`}
            >
              <div className="flex items-center justify-between text-[8px] font-bold uppercase tracking-[0.12em]">
                <span className="truncate">{stage.label}</span>
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    isPass ? "bg-emerald-400" : isWarn ? "bg-amber-400" : "bg-red-400"
                  }`}
                />
              </div>
              <div className="font-semibold text-foreground truncate text-[9px]">{stage.value}</div>
              <div className="text-[7.5px] text-muted-foreground truncate">{stage.meta}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ============================================================================
 * 2. STRUCTURED ANSWER VIEW (PROGRESSIVE DISCLOSURE SUBSTRATE)
 * ============================================================================ */

export function StructuredAnswerView({ result, onSelectEvidence }: PassportProps) {
  const answer = result.structuredAnswer;
  const claims = answer.claims;

  return (
    <div className="border border-border bg-panel p-3 font-mono text-[10px] space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-2">
        <div className="flex items-center gap-2">
          <Database className="h-4 w-4 text-emerald-400" />
          <span className="font-bold uppercase tracking-[0.18em] text-foreground">
            STRUCTURED ANALYTICAL SUBSTRATE
          </span>
        </div>
        <span
          className={`border px-2 py-0.5 text-[8.5px] font-bold uppercase ${
            answer.confidence === "high"
              ? "border-emerald-500/60 bg-emerald-500/10 text-emerald-400"
              : "border-amber-500/60 bg-amber-500/10 text-amber-300"
          }`}
        >
          CONFIDENCE: {answer.confidence.toUpperCase()}
        </span>
      </div>

      {/* Answer & Substrate Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[9px]">
        {/* ANSWER & TARGETS */}
        <div className="border border-border bg-background p-2.5 space-y-2">
          <span className="text-muted-foreground uppercase tracking-[0.14em] text-[8px] font-semibold block">
            NATURAL LANGUAGE SYNTHESIS & TARGETS
          </span>
          <p className="text-foreground leading-relaxed text-[9.5px]">
            {result.answer}
          </p>
          <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-border/40 text-[8px]">
            <span className="text-muted-foreground">IDENTIFIED TARGETS:</span>
            {answer.targets.map((t) => (
              <span key={t} className="border border-primary/40 bg-primary/10 px-1.5 py-0.2 text-primary uppercase font-bold">
                {t}
              </span>
            ))}
          </div>
        </div>

        {/* WORKFLOW & LIMITATIONS */}
        <div className="border border-border bg-background p-2.5 space-y-2">
          <span className="text-muted-foreground uppercase tracking-[0.14em] text-[8px] font-semibold block">
            WORKFLOW ROUTE & LIMITATIONS
          </span>
          <div className="text-[8.5px] space-y-1">
            <div>
              <span className="text-muted-foreground">WORKFLOW:</span>{" "}
              <span className="text-foreground font-semibold">{result.workflow.label}</span>
            </div>
            <div>
              <span className="text-muted-foreground">LIMITATIONS ({answer.limitations.length}):</span>
              <ul className="mt-0.5 space-y-0.5 text-amber-300 text-[8px]">
                {answer.limitations.map((lim, idx) => (
                  <li key={idx}>• {lim}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* CLAIMS MATRIX */}
      <div className="space-y-1.5 pt-1">
        <span className="text-muted-foreground uppercase tracking-[0.14em] text-[8px] font-semibold block">
          SYNTHESIZED CLAIMS SUBSTRATE ({claims.length} CLAIMS)
        </span>
        <div className="space-y-1">
          {claims.map((claim, idx) => (
            <div
              key={claim.id}
              className="border border-border/80 bg-background/80 p-2 flex items-center justify-between gap-2 text-[8.5px]"
            >
              <div className="space-y-0.5">
                <span className="text-foreground font-semibold block">
                  #{idx + 1}: {claim.text}
                </span>
                <span className="text-muted-foreground text-[8px]">
                  Supported by: <strong className="text-primary">{claim.supportedBy}</strong>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="border border-emerald-500/40 bg-emerald-500/10 px-1.5 py-0.2 text-emerald-300 font-bold uppercase text-[7.5px]">
                  {claim.confidence}
                </span>
                {claim.evidenceIds.length > 0 && onSelectEvidence && (
                  <button
                    type="button"
                    onClick={() => onSelectEvidence(claim.evidenceIds[0]!)}
                    className="border border-border bg-panel px-1.5 py-0.2 text-[7.5px] uppercase text-muted-foreground hover:text-foreground"
                  >
                    EVIDENCE →
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ============================================================================
 * 3. UPGRADED TRACE VIEW (11-STAGE PIPELINE)
 * ============================================================================ */

export function UpgradedTraceView({ result }: { result: Investigation }) {
  const trace = result.trace;

  const pipelineStages = [
    "VALIDATION",
    "QUERY UNDERSTANDING",
    "EVIDENCE CONTRACT",
    "DECISION ENGINE",
    "POLICY/CAPABILITY",
    "SPECIALIST",
    "EVIDENCE",
    "SUFFICIENCY",
    "ACQUISITION",
    "VERIFICATION",
    "STRUCTURED ANSWER",
  ];

  return (
    <div className="border border-border bg-panel p-3 font-mono text-[10px] space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-2">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-primary" />
          <span className="font-bold uppercase tracking-[0.18em] text-foreground">
            END-TO-END EXECUTION TRACE PIPELINE
          </span>
        </div>
        <span className="text-[8.5px] text-muted-foreground">
          {trace.length} LOGGED EVENTS
        </span>
      </div>

      {/* Stage Progression Ribbon */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[7.5px]">
        {pipelineStages.map((stg, i) => (
          <React.Fragment key={stg}>
            <span className="border border-border bg-background px-2 py-0.5 text-foreground font-semibold uppercase tracking-[0.1em] shrink-0">
              {stg}
            </span>
            {i < pipelineStages.length - 1 && <ArrowRight className="h-2.5 w-2.5 text-muted-foreground shrink-0" />}
          </React.Fragment>
        ))}
      </div>

      {/* Trace Log Events Table */}
      <div className="space-y-1.5 max-h-80 overflow-y-auto pt-1">
        {trace.map((evt: TraceEvent, idx: number) => (
          <div
            key={evt.eventId ?? idx}
            className="border border-border/80 bg-background/80 p-2 font-mono text-[8.5px] space-y-1"
          >
            <div className="flex items-center justify-between text-foreground">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">[{evt.timestamp.split(" ")[1] ?? evt.timestamp}]</span>
                <span className="font-bold text-primary uppercase">{evt.stage}</span>
                <span className="text-muted-foreground">· {evt.component}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-emerald-400 font-bold uppercase">{evt.status}</span>
                {evt.runtimeMs && <span className="text-muted-foreground">{evt.runtimeMs}ms</span>}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-[8px] text-muted-foreground pt-0.5 border-t border-border/40">
              {evt.tool && <span>TOOL: <strong className="text-foreground">{evt.tool}</strong></span>}
              {evt.modelVersion && <span>MODEL: <strong className="text-foreground">{evt.modelVersion}</strong></span>}
              {evt.message && <span>MESSAGE: <strong className="text-foreground">{evt.message}</strong></span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
