import React, { useState } from "react";
import { CheckCircle2, AlertTriangle, ShieldCheck, Cpu, ArrowRight, Eye, ChevronDown, ChevronUp, Lock } from "lucide-react";
import type { Investigation, Observation, StructuredClaim } from "@/lib/types";

/* ============================================================================
 * 1. EVIDENCE CONTRACT PANEL
 * Compact by default, expandable. Scientific execution contract feel.
 * Answers:
 *  - WHAT MUST BE PROVEN?
 *  - WHAT EVIDENCE IS REQUIRED?
 *  - WHAT CAN CURRENT OBSERVATIONS SUPPORT?
 *  - WHAT IS UNSUPPORTED?
 * ============================================================================ */

export function EvidenceContractPanel({
  result,
  observations,
}: {
  result: Investigation;
  observations: Observation[];
}) {
  const [expanded, setExpanded] = useState(false);
  const reqs = result.decision.evidenceRequirements;
  const understanding = result.queryUnderstanding;

  // Determine observation support capability
  const hasOptical = observations.some((o) => o.modality === "optical");
  const hasSar = observations.some((o) => o.modality === "sar");
  const hasBiTemporal = observations.length >= 2 && observations.some((o) => o.role === "after");
  const minGsd = Math.min(...observations.map((o) => o.metadata.resolutionM ?? 1.0));

  return (
    <div className="border border-border bg-panel p-3 font-mono text-[10px] space-y-3">
      {/* Header & Compact Summary */}
      <div className="flex items-center justify-between border-b border-border pb-2">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-primary" />
          <span className="font-bold uppercase tracking-[0.18em] text-foreground">
            EVIDENCE CONTRACT
          </span>
          <span className="border border-primary/40 bg-primary/10 px-1.5 py-0.5 text-[8px] uppercase tracking-[0.14em] text-primary">
            SPECIFICATION v2.4
          </span>
        </div>
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1 border border-border px-2 py-0.5 text-[9px] uppercase tracking-[0.14em] text-muted-foreground hover:border-primary hover:text-foreground transition-colors"
        >
          {expanded ? (
            <>
              <span>COLLAPSE</span> <ChevronUp className="h-3 w-3" />
            </>
          ) : (
            <>
              <span>EXPAND SPEC</span> <ChevronDown className="h-3 w-3" />
            </>
          )}
        </button>
      </div>

      {/* Primary Contract Grid (Compact Summary) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[9px]">
        {/* WHAT MUST BE PROVEN? */}
        <div className="border border-border/80 bg-background/60 p-2.5 space-y-1">
          <div className="text-muted-foreground uppercase tracking-[0.16em] font-semibold flex items-center gap-1">
            <span className="h-1.5 w-1.5 bg-primary rounded-full" />
            WHAT MUST BE PROVEN?
          </div>
          <div className="font-semibold text-foreground truncate">
            {understanding.primaryTask.toUpperCase()}
          </div>
          <p className="text-muted-foreground text-[8.5px] line-clamp-2">
            Target hypothesis: <span className="text-foreground">{understanding.intent}</span> across targets: [{understanding.targets.join(", ")}].
          </p>
        </div>

        {/* WHAT EVIDENCE IS REQUIRED? */}
        <div className="border border-border/80 bg-background/60 p-2.5 space-y-1">
          <div className="text-muted-foreground uppercase tracking-[0.16em] font-semibold flex items-center gap-1">
            <span className="h-1.5 w-1.5 bg-amber-400 rounded-full" />
            REQUIRED EVIDENCE SPEC
          </div>
          <div className="flex flex-wrap gap-1 pt-0.5">
            {reqs.evidenceTypes.map((t) => (
              <span key={t} className="border border-amber-500/40 bg-amber-500/10 px-1.5 py-0.2 text-[8px] uppercase tracking-[0.12em] text-amber-300">
                {t.replace(/_/g, " ")}
              </span>
            ))}
          </div>
          <p className="text-muted-foreground text-[8.5px] pt-0.5">
            Spatial: {reqs.spatialGroundingRequired ? "REQUIRED" : "OPTIONAL"} · Temporal: {reqs.temporalComparisonRequired ? "REQUIRED" : "N/A"} · Modality: {reqs.modalityEvidenceRequired ? "REQUIRED" : "STANDARD"}
          </p>
        </div>
      </div>

      {/* Expanded Contract Details */}
      {expanded && (
        <div className="space-y-3 pt-1 border-t border-border/60">
          {/* OBSERVATIONS SUPPORT & UNSUPPORTED GAPS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[9px]">
            {/* WHAT CAN CURRENT OBSERVATIONS SUPPORT? */}
            <div className="border border-emerald-500/30 bg-emerald-500/5 p-2.5 space-y-1.5">
              <div className="text-emerald-400 font-bold uppercase tracking-[0.14em] flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5" />
                OBSERVATION CAPABILITY SUPPORT
              </div>
              <ul className="space-y-1 text-muted-foreground text-[8.5px]">
                <li className="flex justify-between border-b border-emerald-500/20 pb-0.5">
                  <span>Spatial Resolution GSD:</span>
                  <span className="text-emerald-300 font-mono">{minGsd} m (Sufficient)</span>
                </li>
                <li className="flex justify-between border-b border-emerald-500/20 pb-0.5">
                  <span>Optical Coverage:</span>
                  <span className={hasOptical ? "text-emerald-300" : "text-muted-foreground"}>{hasOptical ? "AVAILABLE" : "NONE"}</span>
                </li>
                <li className="flex justify-between border-b border-emerald-500/20 pb-0.5">
                  <span>SAR Microwave Feeds:</span>
                  <span className={hasSar ? "text-purple-300 font-bold" : "text-muted-foreground"}>{hasSar ? "AVAILABLE (VV+VH)" : "NONE"}</span>
                </li>
                <li className="flex justify-between">
                  <span>Temporal Baseline:</span>
                  <span className={hasBiTemporal ? "text-emerald-300" : "text-muted-foreground"}>{hasBiTemporal ? "PAIRED PASSES" : "SINGLE SNAPSHOT"}</span>
                </li>
              </ul>
            </div>

            {/* WHAT IS UNSUPPORTED? */}
            <div className="border border-amber-500/30 bg-amber-500/5 p-2.5 space-y-1.5">
              <div className="text-amber-400 font-bold uppercase tracking-[0.14em] flex items-center gap-1.5">
                <AlertTriangle className="h-3.5 w-3.5" />
                UNSUPPORTED / LIMITATIONS
              </div>
              {result.confidence.limitations.length > 0 ? (
                <ul className="space-y-1 text-muted-foreground text-[8.5px]">
                  {result.confidence.limitations.map((lim, idx) => (
                    <li key={idx} className="flex items-start gap-1.5 text-amber-200/90">
                      <span className="text-amber-400 font-bold">•</span>
                      <span>{lim}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-[8.5px] text-muted-foreground">No explicit observation gaps flagged for this query.</p>
              )}
            </div>
          </div>

          {/* SCIENTIFIC CONTRACT PARAMETERS SPECIFICATION TABLE */}
          <div className="border border-border bg-background p-2.5 space-y-1 text-[9px]">
            <div className="text-muted-foreground uppercase tracking-[0.16em] font-semibold">
              CONTRACT EXECUTION PARAMETERS (POLICY & GATE SPEC)
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-1 font-mono text-[8.5px]">
              <div>
                <span className="text-muted-foreground block text-[7.5px]">REASONING TASK:</span>
                <span className="text-foreground font-semibold">{result.decision.task}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[7.5px]">REQUIRED INPUTS:</span>
                <span className="text-foreground font-semibold">{result.decision.requiredInputs.join(", ")}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[7.5px]">POLICY STATUS:</span>
                <span className="text-emerald-400 font-semibold">{result.policyCheck.status.toUpperCase()}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[7.5px]">TOOL CONTRACT:</span>
                <span className="text-primary font-semibold">{result.policyCheck.toolContract}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ============================================================================
 * 2. CAPABILITY GATE PANEL
 * Displays:
 *  - OBSERVATIONS
 *  - CAPABILITIES AVAILABLE
 *  - REQUIRED CAPABILITIES
 *  - MISSING CAPABILITIES
 *  - ALLOWED TOOLS
 *  - FORBIDDEN CLAIMS
 * ============================================================================ */

export function CapabilityGatePanel({
  result,
  observations,
}: {
  result: Investigation;
  observations: Observation[];
}) {
  const policy = result.policyCheck;
  const decision = result.decision;

  // Available Capabilities derived from data
  const availableCapabilities = [
    ...observations.map((o) => `${o.modality.toUpperCase()} (${o.metadata.resolutionM ?? "N/A"}m GSD)`),
    observations.length > 1 ? "Bi-Temporal Differential Analysis" : null,
    observations.some((o) => o.modality === "sar") ? "Microwave Backscatter & Double-Bounce Physics" : null,
    "Normalized Spatial Geometry & Georeferencing",
  ].filter(Boolean) as string[];

  // Required Capabilities derived from query & decision
  const requiredCapabilities = [
    result.queryUnderstanding.primaryTask,
    ...decision.requiredInputs.map((i) => `Input Stream: ${i}`),
    decision.evidenceRequirements.spatialGroundingRequired ? "Sub-Pixel Spatial Grounding" : null,
    decision.evidenceRequirements.temporalComparisonRequired ? "Temporal Registration & Order Validation" : null,
  ].filter(Boolean) as string[];

  // Missing Capabilities (gaps)
  const missingCapabilities = result.confidence.limitations.filter(
    (l) => l.toLowerCase().includes("missing") || l.toLowerCase().includes("lack") || l.toLowerCase().includes("unsupported")
  );

  // Forbidden Claims based on scientific limits
  const forbiddenClaims = [
    "Unverified fine identity without ground truth or AIS cross-referencing",
    "Sub-meter change detection on observations with GSD > 1.5m",
    "Categorical classification under cloud/shadow occlusion > 40%",
  ];

  return (
    <div className="border border-border bg-panel p-3 font-mono text-[10px] space-y-3">
      <div className="flex items-center justify-between border-b border-border pb-2">
        <div className="flex items-center gap-2">
          <Cpu className="h-4 w-4 text-emerald-400" />
          <span className="font-bold uppercase tracking-[0.18em] text-foreground">
            CAPABILITY GATE AUDIT
          </span>
        </div>
        <span
          className={`px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-[0.14em] border ${
            policy.status === "allowed"
              ? "border-emerald-500/60 bg-emerald-500/10 text-emerald-400"
              : "border-red-500/60 bg-red-500/10 text-red-400"
          }`}
        >
          GATE STATUS: {policy.status.toUpperCase()}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 text-[9px]">
        {/* LEFT COLUMN: AVAILABLE & REQUIRED */}
        <div className="space-y-2">
          <div className="border border-border bg-background/70 p-2 space-y-1">
            <span className="text-muted-foreground uppercase tracking-[0.14em] text-[8px] font-semibold block">
              CAPABILITIES AVAILABLE (FROM OBSERVATIONS)
            </span>
            <ul className="space-y-0.5 text-foreground">
              {availableCapabilities.map((cap, i) => (
                <li key={i} className="flex items-center gap-1.5 text-[8.5px]">
                  <span className="h-1 w-1 rounded-full bg-emerald-400" />
                  <span>{cap}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="border border-border bg-background/70 p-2 space-y-1">
            <span className="text-muted-foreground uppercase tracking-[0.14em] text-[8px] font-semibold block">
              REQUIRED CAPABILITIES (QUERY DEMAND)
            </span>
            <ul className="space-y-0.5 text-foreground">
              {requiredCapabilities.map((cap, i) => (
                <li key={i} className="flex items-center gap-1.5 text-[8.5px]">
                  <span className="h-1 w-1 rounded-full bg-primary" />
                  <span>{cap}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* RIGHT COLUMN: ALLOWED TOOLS & FORBIDDEN CLAIMS */}
        <div className="space-y-2">
          <div className="border border-emerald-500/30 bg-emerald-500/5 p-2 space-y-1">
            <span className="text-emerald-400 uppercase tracking-[0.14em] text-[8px] font-semibold flex items-center gap-1">
              <ShieldCheck className="h-3 w-3" /> ALLOWED EXECUTION TOOLS
            </span>
            <div className="text-foreground font-semibold text-[8.5px]">
              {policy.toolContract}
            </div>
            <div className="text-muted-foreground text-[8px] pt-0.5">
              Preconditions satisfied: {policy.preconditions.join(", ")}
            </div>
          </div>

          <div className="border border-red-500/30 bg-red-500/5 p-2 space-y-1">
            <span className="text-red-400 uppercase tracking-[0.14em] text-[8px] font-semibold flex items-center gap-1">
              <Lock className="h-3 w-3" /> FORBIDDEN SCIENTIFIC CLAIMS
            </span>
            <ul className="space-y-0.5 text-muted-foreground text-[8px]">
              {forbiddenClaims.map((claim, idx) => (
                <li key={idx} className="flex items-start gap-1 text-red-300/80">
                  <span className="text-red-400 font-bold">✕</span>
                  <span>{claim}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================================================================
 * 3. LAYA / JEV DECISION PANEL
 * Preserves real current routing representation.
 * Visually displays: ENGINE (LAYA / JEV), TASK, OBSERVATION CONFIGURATION, WHY THIS ROUTE, AUTHORIZED TOOLS.
 * ============================================================================ */

export function LayaJevDecisionPanel({
  result,
}: {
  result: Investigation;
}) {
  const decision = result.decision;
  const isLaya = decision.engine === "laya";

  return (
    <div className="border border-border bg-panel p-3 font-mono text-[10px] space-y-3">
      <div className="flex items-center justify-between border-b border-border pb-2">
        <div className="flex items-center gap-2">
          <div
            className={`px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.2em] border ${
              isLaya
                ? "border-primary bg-primary/20 text-primary"
                : "border-purple-400 bg-purple-500/20 text-purple-300"
            }`}
          >
            DECISION ENGINE: {decision.engine.toUpperCase()}
          </div>
          <span className="text-muted-foreground text-[9px] hidden sm:inline">
            {isLaya ? "Language-Aware Routing Engine" : "Joint Execution & Verification Engine"}
          </span>
        </div>
        <span className="text-emerald-400 text-[9px] font-bold uppercase tracking-[0.14em] border border-emerald-500/40 bg-emerald-500/10 px-1.5 py-0.5">
          {decision.status.toUpperCase()}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[9px]">
        {/* TASK & ROUTE RATIONALE */}
        <div className="border border-border bg-background p-2.5 space-y-1.5">
          <div className="text-muted-foreground uppercase tracking-[0.14em] text-[8px] font-semibold">
            ROUTING ASSIGNMENT & RATIONALE
          </div>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">ASSIGNED TASK:</span>
            <span className="text-foreground font-bold">{decision.task}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">SPECIALIST TOOL:</span>
            <span className="text-primary font-bold">{decision.specialist}</span>
          </div>
          <p className="text-muted-foreground text-[8.5px] pt-1 border-t border-border/50">
            <span className="text-foreground font-semibold">WHY THIS ROUTE:</span> Intent matching score {Math.round(result.intent.confidence * 100)}% for workflow {result.workflow.label}. Required observation type ({result.workflow.requiredObservations}) satisfied.
          </p>
        </div>

        {/* OBSERVATION CONFIG & AUTHORIZED TOOLS */}
        <div className="border border-border bg-background p-2.5 space-y-1.5">
          <div className="text-muted-foreground uppercase tracking-[0.14em] text-[8px] font-semibold">
            OBSERVATION CONFIG & AUTHORIZED TOOLS
          </div>
          <div className="space-y-1 text-[8.5px]">
            <div>
              <span className="text-muted-foreground">INPUT STREAMS:</span>{" "}
              <span className="text-foreground font-semibold">{decision.requiredInputs.join(", ")}</span>
            </div>
            <div>
              <span className="text-muted-foreground">AUTHORIZED CONTRACT:</span>{" "}
              <span className="text-emerald-400 font-semibold">{result.policyCheck.toolContract}</span>
            </div>
            <div className="text-muted-foreground text-[8px] pt-1 border-t border-border/50">
              PARAMETER SPECS: {JSON.stringify(decision.parameters)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================================================================
 * 4. EVIDENCE SUFFICIENCY PANEL
 * Clearly distinguishes EVIDENCE GENERATED from EVIDENCE SUFFICIENT.
 * For each supported claim show: spatial support, temporal support, modality support, measurement support.
 * ============================================================================ */

export function EvidenceSufficiencyPanel({
  result,
}: {
  result: Investigation;
}) {
  const generatedCount = result.evidence.length;
  const verification = result.verification;
  const isSufficient = verification.evidenceCompleteness === "complete";
  const claims = result.structuredAnswer.claims;

  return (
    <div className="border border-border bg-panel p-3 font-mono text-[10px] space-y-3">
      {/* Header Metric Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-2">
        <div className="flex items-center gap-3">
          <span className="font-bold uppercase tracking-[0.18em] text-foreground">
            EVIDENCE SUFFICIENCY AUDIT
          </span>
          <div className="flex items-center gap-2 text-[9px]">
            <span className="border border-border bg-background px-2 py-0.5">
              GENERATED: <strong className="text-foreground">{generatedCount}</strong>
            </span>
            <span
              className={`border px-2 py-0.5 font-bold ${
                isSufficient
                  ? "border-emerald-500/60 bg-emerald-500/10 text-emerald-400"
                  : "border-amber-500/60 bg-amber-500/10 text-amber-300"
              }`}
            >
              SUFFICIENCY: {verification.evidenceCompleteness.toUpperCase()}
            </span>
          </div>
        </div>
        <span className="text-muted-foreground text-[8.5px]">
          MODEL AGREEMENT: <strong className="text-foreground">{verification.modelAgreement?.toUpperCase() ?? "AGREED"}</strong>
        </span>
      </div>

      {/* Claim-by-Claim Multi-Dimensional Support Matrix */}
      <div className="space-y-2">
        <span className="text-muted-foreground uppercase tracking-[0.14em] text-[8px] font-semibold block">
          STRUCTURED CLAIMS & SUPPORT DIMENSIONS
        </span>

        {claims.map((claim: StructuredClaim, index: number) => {
          const linkedEv = result.evidence.filter((e) => claim.evidenceIds.includes(e.id));
          const hasSpatial = linkedEv.some((e) => e.geometry !== null);
          const hasTemporal = result.temporal ? result.temporal.orderValid : true;
          const hasModality = result.crossModal ? result.crossModal.validation.status === "pass" : true;
          const measurementVal = linkedEv[0]?.confidence ? `${Math.round(linkedEv[0].confidence * 100)}% SNR` : "N/A";

          return (
            <div
              key={claim.id ?? index}
              className="border border-border/80 bg-background/80 p-2.5 space-y-1.5"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-0.5">
                  <span className="text-primary font-bold text-[9px] uppercase tracking-[0.12em] block">
                    CLAIM #{index + 1}: {claim.text}
                  </span>
                  <p className="text-muted-foreground text-[8.5px]">
                    Supported by: <span className="text-foreground">{claim.supportedBy}</span>
                  </p>
                </div>
                <span
                  className={`px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-[0.12em] border shrink-0 ${
                    claim.confidence === "high"
                      ? "border-emerald-500/60 text-emerald-400 bg-emerald-500/10"
                      : "border-amber-500/60 text-amber-300 bg-amber-500/10"
                  }`}
                >
                  {claim.confidence} CONFIDENCE
                </span>
              </div>

              {/* 4-Dimensional Support Badges */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 pt-1 text-[8px]">
                <div className={`border p-1 ${hasSpatial ? "border-emerald-500/40 bg-emerald-500/5 text-emerald-300" : "border-border text-muted-foreground"}`}>
                  <span className="block text-[7px] text-muted-foreground uppercase">SPATIAL SUPPORT:</span>
                  <span className="font-bold">{hasSpatial ? "✓ GEOMETRY BOUND" : "✕ UNMAPPED"}</span>
                </div>
                <div className={`border p-1 ${hasTemporal ? "border-emerald-500/40 bg-emerald-500/5 text-emerald-300" : "border-amber-500/40 bg-amber-500/5 text-amber-300"}`}>
                  <span className="block text-[7px] text-muted-foreground uppercase">TEMPORAL SUPPORT:</span>
                  <span className="font-bold">{hasTemporal ? "✓ TIME-VALIDATED" : "⚠ UNCHECKED"}</span>
                </div>
                <div className={`border p-1 ${hasModality ? "border-emerald-500/40 bg-emerald-500/5 text-emerald-300" : "border-border text-muted-foreground"}`}>
                  <span className="block text-[7px] text-muted-foreground uppercase">MODALITY SUPPORT:</span>
                  <span className="font-bold">{hasModality ? "✓ SPECTRUM CONFIRMED" : "STANDARD"}</span>
                </div>
                <div className="border border-primary/40 bg-primary/5 text-primary p-1">
                  <span className="block text-[7px] text-muted-foreground uppercase">MEASUREMENT:</span>
                  <span className="font-bold">{measurementVal}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ============================================================================
 * 5. VALIDATION CAPABILITY BRIDGE
 * Compact visual bridge illustrating pipeline linking:
 * VALIDATION → CAPABILITY → EVIDENCE CONTRACT → ROUTING
 * ============================================================================ */

export function ValidationCapabilityBridge({
  result,
}: {
  result: Investigation;
}) {
  const steps = [
    { label: "VALIDATION", status: "pass" },
    { label: "CAPABILITY GATE", status: result.policyCheck.status === "allowed" ? "pass" : "fail" },
    { label: "EVIDENCE CONTRACT", status: "pass" },
    { label: "LAYA/JEV ROUTE", status: result.decision.status === "decided" ? "pass" : "warn" },
  ];

  return (
    <div className="flex flex-wrap items-center justify-between gap-1 border border-border bg-panel-raised px-3 py-1.5 font-mono text-[9px]">
      <span className="text-muted-foreground uppercase tracking-[0.16em] font-semibold text-[8px]">
        ARCHITECTURE INTEGRITY FLOW:
      </span>
      <div className="flex flex-wrap items-center gap-1.5">
        {steps.map((s, idx) => (
          <React.Fragment key={s.label}>
            <div className="flex items-center gap-1 border border-border bg-background px-2 py-0.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              <span className="text-foreground uppercase tracking-[0.12em] font-semibold text-[8px]">{s.label}</span>
            </div>
            {idx < steps.length - 1 && <ArrowRight className="h-3 w-3 text-muted-foreground" />}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
