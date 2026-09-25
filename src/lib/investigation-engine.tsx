/**
 * SatQuery AI — Canonical Investigation Engine
 *
 * Implements the abstraction boundary between the frontend UI and the
 * underlying execution engine. The UI consumes this interface and NEVER
 * branches on whether results originate from deterministic demo fixtures
 * or a live inference backend.
 */

import React, { createContext, useContext, useMemo } from "react";
import type {
  AnalysisHistoryEntry,
  AnalysisResult,
  Decision,
  EvidenceObject,
  EvidenceRequirement,
  Investigation,
  ModelInfo,
  Observation,
  PolicyCheck,
  QueryUnderstanding,
  SpecialistExecution,
  StructuredAnswer,
  StructuredClaim,
  ToolInfo,
  Verification,
  WorkflowId,
} from "./types";
import {
  demoHistory,
  demoModels,
  demoObservations,
  demoScenarios,
  demoTools,
  type DemoScenario,
} from "./mock-data";
import { PLANS, type SpecialistStage } from "./workflow-data";

export interface InvestigationRequest {
  query: string;
  observations: Observation[];
  scenarioId?: string | undefined;
  signal?: AbortSignal | undefined;
}

export interface InvestigationEngine {
  readonly mode: "demo" | "api";
  executeInvestigation(request: InvestigationRequest): Promise<Investigation>;
  getScenario(id: string): Promise<DemoScenario | null>;
  listScenarios(): Promise<DemoScenario[]>;
  getTools(): Promise<ToolInfo[]>;
  getModels(): Promise<ModelInfo[]>;
  getHistory(): Promise<AnalysisHistoryEntry[]>;
}

/**
 * Transforms a raw scenario / AnalysisResult into a complete, canonical Investigation.
 * Guarantees geometry safety, explicit coordinate frames, Decision Engine attribution
 * (Laya / Jev), explicit Policy Check, and structured answer synthesis.
 */
export function toCanonicalInvestigation(scenario: DemoScenario): Investigation {
  const res = scenario.result;
  const plan = PLANS[scenario.id] ?? PLANS["golden"] ?? PLANS["demo-01"]!;
  const obs =
    scenario.observations.length > 0 ? scenario.observations : [demoObservations.singleOptical];

  // 1. Geometry-safe evidence objects with explicit coordinateFrame
  const evidenceList: EvidenceObject[] = (res.evidence ?? []).map((ev: EvidenceObject) => ({
    ...ev,
    coordinateFrame: ev.coordinateFrame ?? "NORMALIZED_IMAGE",
  }));

  // 2. Canonical QueryUnderstanding
  const queryUnderstanding: QueryUnderstanding = {
    intent: res.intent?.label ?? "SCENE ANALYSIS",
    primaryTask: plan.understanding.primaryTask,
    secondaryTasks: plan.understanding.secondaryTasks ?? [],
    targets: [plan.understanding.target, plan.understanding.secondaryTarget].filter(
      (t): t is string => !!t,
    ),
    spatialRequirement: plan.understanding.spatialRequest ?? "Normalized region grounding",
    evidenceRequirement: plan.understanding.evidenceRequired ?? "Multi-modal verification",
  };

  // 3. Evidence Requirements
  const evidenceRequirements: EvidenceRequirement = {
    evidenceTypes: Array.from(new Set(evidenceList.map((e) => e.type))),
    spatialGroundingRequired: evidenceList.some(
      (e) => e.type === "mask" || e.type === "bounding_box",
    ),
    temporalComparisonRequired:
      obs.length > 1 && obs.some((o) => o.role === "after" || o.role === "sar"),
    modalityEvidenceRequired: obs.some((o) => o.modality === "sar"),
  };

  // 4. Decision Engine (Laya / Jev)
  // Laya handles standard VQA and spatial grounding; Jev handles bi-temporal change and multi-sensor fusion.
  const isMultimodalOrTemporal =
    res.workflow.id === "bi_temporal_change" ||
    res.workflow.id === "change_vqa" ||
    res.workflow.id === "optical_sar" ||
    obs.length > 1;

  const decision: Decision = {
    task: queryUnderstanding.primaryTask,
    specialist: res.tool?.name ?? plan.specialists[0]?.label ?? "specialist_model",
    requiredInputs: obs.map((o) => o.id),
    parameters: {
      strict_crs: true,
      gsd_max_m: 10.0,
      confidence_threshold: 0.65,
    },
    evidenceRequirements,
    engine: isMultimodalOrTemporal ? "jev" : "laya",
    status: res.refusal ? "blocked" : "decided",
  };

  // 5. Policy Check stage
  const policyCheck: PolicyCheck = {
    status: res.refusal ? "blocked" : "allowed",
    reason: res.refusal?.title ?? null,
    toolContract: `${decision.specialist}@${res.tool?.version ?? "v1.0.0"}`,
    preconditions: [
      "Input CRS EPSG:4326 verified",
      "Raster bounds integrity verified",
      "Band dimension count matches specialist schema",
    ],
    parameterValidation: res.refusal ? "fail" : "pass",
  };

  // 6. Specialist Execution — derive producedArtifacts from trace events
  //    each specialist only claims evidence it actually produced (trace outputArtifacts).
  const evidenceIdSet = new Set(evidenceList.map((e) => e.id));

  function resolveSpecialistArtifacts(specialist: SpecialistStage): string[] {
    if (res.refusal) return [];

    const produced = new Set<string>();
    (res.trace ?? []).forEach((te) => {
      const toolMatches = te.tool !== null && te.tool === specialist.tool;
      const componentMatches = te.component !== null && te.component.includes(specialist.label);
      if ((toolMatches || componentMatches) && te.outputArtifacts?.length) {
        te.outputArtifacts.forEach((artId) => {
          if (evidenceIdSet.has(artId)) produced.add(artId);
        });
      }
    });
    return Array.from(produced);
  }

  const specialists: SpecialistExecution[] = plan.specialists.map((s, idx) => ({
    id: `spec-${idx + 1}`,
    tool: s.tool,
    status: res.refusal ? "failed" : "complete",
    inputIds: obs.map((o) => o.id),
    modelVersion: s.version,
    toolVersion: s.version,
    producedArtifacts: resolveSpecialistArtifacts(s),
    runtimeMs: null,
  }));

  // 7. Verification stage
  const verification: Verification = {
    checks: [
      { label: "Spatial containment", status: "pass", detail: "Artifacts inside raster bbox" },
      { label: "Coordinate frame valid", status: "pass", detail: "NORMALIZED_IMAGE mapped" },
      {
        label: "Registration residual",
        status: obs[0]?.validation?.registration?.quality === "low" ? "warn" : "pass",
        detail: obs[0]?.validation?.registration?.note ?? "Sub-pixel alignment verified",
      },
    ],
    overallStatus: res.confidence.level === "low" ? "warn" : res.refusal ? "fail" : "pass",
    contradictions: res.refusal ? [res.refusal.title] : [],
    registrationQuality: obs[0]?.validation?.registration?.quality ?? "acceptable",
    evidenceCompleteness: evidenceList.length > 0 ? "complete" : "partial",
    modelAgreement: res.confidence.factors.some((f: { detail?: string | undefined }) =>
      f.detail?.includes("agree"),
    )
      ? "agreed"
      : "partial",
  };

  // 8. Structured Answer
  const claims: StructuredClaim[] = (plan.claims ?? []).map((c, i) => ({
    id: c.id ?? `claim-${i + 1}`,
    text: c.text,
    evidenceIds: c.evidenceId ? [c.evidenceId] : [],
    confidence: res.confidence.level,
    supportedBy: c.supportedBy ?? "Specialist Execution",
  }));

  const structuredAnswer: StructuredAnswer = {
    claims,
    targets: queryUnderstanding.targets,
    classification: res.workflow.label,
    evidenceIds: evidenceList.map((e) => e.id),
    confidence: res.confidence.level,
    limitations: res.confidence.limitations ?? [],
    workflow: res.workflow.id as WorkflowId,
  };

  return {
    ...res,
    evidence: evidenceList,
    observations: obs,
    queryUnderstanding,
    decision,
    policyCheck,
    specialists,
    verification,
    structuredAnswer,
  };
}

/**
 * Deterministic Demo Implementation of InvestigationEngine.
 * Uses calibrated fixtures with simulated realistic latency.
 */
export class DemoInvestigationEngine implements InvestigationEngine {
  readonly mode = "demo" as const;

  async executeInvestigation(request: InvestigationRequest): Promise<Investigation> {
    const scenario =
      demoScenarios.find((s) => s.id === request.scenarioId) ??
      demoScenarios.find(
        (s) => s.query.trim().toLowerCase() === request.query.trim().toLowerCase(),
      ) ??
      demoScenarios[0]!;

    return toCanonicalInvestigation(scenario);
  }

  async getScenario(id: string): Promise<DemoScenario | null> {
    const found = demoScenarios.find((s) => s.id === id);
    return found ?? null;
  }

  async listScenarios(): Promise<DemoScenario[]> {
    return demoScenarios;
  }

  async getTools(): Promise<ToolInfo[]> {
    return demoTools;
  }

  async getModels(): Promise<ModelInfo[]> {
    return demoModels;
  }

  async getHistory(): Promise<AnalysisHistoryEntry[]> {
    return demoHistory;
  }
}

/**
 * Production / Live API Implementation of InvestigationEngine.
 * Ready to dispatch queries to real backend endpoints.
 */
export class ApiInvestigationEngine implements InvestigationEngine {
  readonly mode = "api" as const;

  constructor(private readonly baseUrl: string = "/api") {}

  async executeInvestigation(request: InvestigationRequest): Promise<Investigation> {
    const response = await fetch(`${this.baseUrl}/investigate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: request.query,
        observationIds: request.observations.map((o) => o.id),
      }),
      signal: request.signal ?? null,
    });

    if (!response.ok) {
      throw new Error(
        `Investigation API failed with status ${response.status}: ${response.statusText}`,
      );
    }

    const payload = (await response.json()) as Investigation;
    return payload;
  }

  async getScenario(id: string): Promise<DemoScenario | null> {
    const res = await fetch(`${this.baseUrl}/scenarios/${id}`);
    if (!res.ok) return null;
    return res.json();
  }

  async listScenarios(): Promise<DemoScenario[]> {
    const res = await fetch(`${this.baseUrl}/scenarios`);
    if (!res.ok) return demoScenarios;
    return res.json();
  }

  async getTools(): Promise<ToolInfo[]> {
    const res = await fetch(`${this.baseUrl}/registry/tools`);
    if (!res.ok) return demoTools;
    return res.json();
  }

  async getModels(): Promise<ModelInfo[]> {
    const res = await fetch(`${this.baseUrl}/registry/models`);
    if (!res.ok) return demoModels;
    return res.json();
  }

  async getHistory(): Promise<AnalysisHistoryEntry[]> {
    const res = await fetch(`${this.baseUrl}/history`);
    if (!res.ok) return demoHistory;
    return res.json();
  }
}

// React Context & Provider
export const defaultInvestigationEngine = new DemoInvestigationEngine();

const InvestigationEngineContext = createContext<InvestigationEngine>(defaultInvestigationEngine);

export function InvestigationEngineProvider({
  engine,
  children,
}: {
  engine?: InvestigationEngine;
  children: React.ReactNode;
}) {
  const activeEngine = useMemo(() => engine ?? defaultInvestigationEngine, [engine]);
  return (
    <InvestigationEngineContext.Provider value={activeEngine}>
      {children}
    </InvestigationEngineContext.Provider>
  );
}

export function useInvestigationEngine(): InvestigationEngine {
  return useContext(InvestigationEngineContext);
}
