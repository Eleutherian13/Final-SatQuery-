import type { Investigation, EvidenceObject, StructuredClaim, ConfidenceFactor } from "./types";

export type GraphNodeType = "QUERY" | "TASK" | "TOOL" | "EVIDENCE" | "CLAIM";
export type EdgeType =
  "query-to-task" | "task-to-tool" | "tool-to-evidence" | "evidence-to-claim" | "claim-to-claim";

export interface GraphNode {
  id: string;
  type: GraphNodeType;
  label: string;
  subtitle?: string | undefined;
  confidence?: number | null;
  metadata?: Record<string, unknown> | undefined;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  type: EdgeType;
  label?: string | undefined;
  weight?: number | null;
}

export interface EvidenceGraph {
  nodes: GraphNode[];
  edges: GraphEdge[];
  rootId: string;
}

export type RefusalCategory =
  | "insufficient_input"
  | "modality_mismatch"
  | "capability_exceeded"
  | "temporal_requirement"
  | "spatial_resolution"
  | "data_unavailable";

export interface RefusalInfo {
  category: RefusalCategory;
  reason: string;
  capability: string;
  requiredByWorkflow: string;
  specialistRefused: string;
  action: string;
  actionHint?: string | undefined;
}

export interface LowConfidenceFactor {
  id: string;
  label: string;
  description: string;
  severity: "high" | "medium" | "low";
  value: string;
}

export interface LowConfidenceBreakdown {
  factors: LowConfidenceFactor[];
  summary: string;
}

export type TrustTraceStage =
  | "observation"
  | "query_understanding"
  | "task_classification"
  | "evidence_planning"
  | "routing"
  | "execution"
  | "verification"
  | "composition"
  | "complete";

export interface TraceEntry {
  stage: TrustTraceStage;
  label: string;
  icon: string;
  timestamp: string;
  status: "complete" | "pending" | "failed" | "skipped";
  detail?: string | undefined;
}

export interface ProvenanceSource {
  id: string;
  dataset: string;
  sensor: string;
  resolutionMeters: number | null;
  acquiredAt: string | null;
  confidence: number | null;
}

export interface ProvenanceInfo {
  sources: ProvenanceSource[];
  processingChain: string[];
}

export interface LedgerEntry {
  stage: string;
  hash: string;
  timestamp: string;
  parentHash: string | null;
  dataSummary: string;
}

export interface AuditLedger {
  entries: LedgerEntry[];
  genesisHash: string;
  isDemo: true;
}

export interface ReportSection {
  id: string;
  title: string;
  icon: string;
  status: "present" | "absent" | "failed";
  summary: string;
}

export interface ReportData {
  id: string;
  title: string;
  generatedAt: string;
  isDemo: true;
  summary: string;
  decision: string;
  sections: ReportSection[];
  structuredAnswer: string;
  evidenceCount: number;
  specialistCount: number;
  graph: EvidenceGraph;
  refusal: RefusalInfo | null;
  lowConfidence: LowConfidenceBreakdown | null;
  provenance: ProvenanceInfo;
  ledger: AuditLedger;
  trace: TraceEntry[];
}

function stableHash(input: string): string {
  let h = 0;
  for (let i = 0; i < input.length; i++) {
    h = (h * 31 + input.charCodeAt(i)) | 0;
    h >>>= 0;
  }
  return h.toString(36).padStart(8, "0");
}

function chainHash(stage: string, parentHash: string | null, data: string): string {
  const raw = `${parentHash ?? "genesis"}::${stage}::${data}`;
  return stableHash(raw);
}

export function buildEvidenceGraph(investigation: Investigation): EvidenceGraph {
  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];
  let edgeCounter = 0;

  const nextEdgeId = (): string => `edge-${edgeCounter++}`;

  const queryNode: GraphNode = {
    id: "query-root",
    type: "QUERY",
    label: investigation.queryUnderstanding?.primaryTask ?? investigation.query,
    subtitle: investigation.queryUnderstanding?.intent,
    confidence: investigation.confidence.score,
    metadata: {
      workflow: investigation.workflow.id,
      entities: investigation.intent.entities,
    },
  };
  nodes.push(queryNode);

  const taskNode: GraphNode = {
    id: "task-root",
    type: "TASK",
    label: investigation.decision.task,
    subtitle:
      investigation.decision.engine === "jev" ? "Decision Engine: Jev" : "Decision Engine: Laya",
    metadata: {
      engine: investigation.decision.engine,
      status: investigation.decision.status,
      requiredInputs: investigation.decision.requiredInputs,
    },
  };
  nodes.push(taskNode);
  edges.push({
    id: nextEdgeId(),
    source: "query-root",
    target: "task-root",
    type: "query-to-task",
  });

  investigation.specialists.forEach((spec) => {
    const isRefused = spec.status === "failed" || spec.status === "skipped";
    const toolNode: GraphNode = {
      id: `tool-${spec.id}`,
      type: "TOOL",
      label: spec.tool,
      subtitle: `${spec.status}${isRefused && spec.toolVersion ? ` · ${spec.toolVersion}` : ""}`,
      confidence: investigation.confidence.score,
      metadata: {
        specialistId: spec.id,
        status: spec.status,
        modelVersion: spec.modelVersion,
        toolVersion: spec.toolVersion,
        runtimeMs: spec.runtimeMs,
        inputIds: spec.inputIds,
      },
    };
    nodes.push(toolNode);
    edges.push({
      id: nextEdgeId(),
      source: "task-root",
      target: toolNode.id,
      type: "task-to-tool",
      weight: investigation.confidence.score,
    });

    const producedArtifactIds = new Set(spec.producedArtifacts);
    const evidenceForSpecialist = investigation.evidence.filter((e) =>
      producedArtifactIds.has(e.id),
    );

    evidenceForSpecialist.forEach((ev) => {
      nodes.push(buildEvidenceNode(ev));
    });

    evidenceForSpecialist.forEach((ev) => {
      edges.push({
        id: nextEdgeId(),
        source: toolNode.id,
        target: ev.id,
        type: "tool-to-evidence",
        weight: ev.confidence,
      });
    });

    const planClaims: StructuredClaim[] = investigation.structuredAnswer?.claims ?? [];
    const specialistClaims = planClaims.filter((c) => {
      return c.text.includes(spec.tool) || c.supportedBy.includes(spec.tool);
    });

    specialistClaims.forEach((claim) => {
      const claimNode: GraphNode = {
        id: `claim-${claim.id}`,
        type: "CLAIM",
        label: claim.text,
        subtitle: claim.supportedBy,
        confidence: claim.confidence === "high" ? 0.9 : claim.confidence === "medium" ? 0.7 : 0.3,
        metadata: {
          confidenceLevel: claim.confidence,
          domain: claim.id,
        },
      };
      nodes.push(claimNode);

      edges.push({
        id: nextEdgeId(),
        source: toolNode.id,
        target: claimNode.id,
        type: "tool-to-evidence",
        weight: claim.confidence === "high" ? 0.9 : claim.confidence === "medium" ? 0.7 : 0.3,
      });

      claim.evidenceIds.forEach((eid) => {
        edges.push({
          id: nextEdgeId(),
          source: eid,
          target: claimNode.id,
          type: "evidence-to-claim",
        });
      });
    });
  });

  const unmappedEvidence = investigation.evidence.filter(
    (e) => !investigation.specialists.some((s) => s.producedArtifacts.includes(e.id)),
  );
  unmappedEvidence.forEach((ev) => {
    if (!nodes.some((n) => n.id === ev.id)) {
      nodes.push(buildEvidenceNode(ev));
    }
  });

  return { nodes, edges, rootId: "query-root" };
}

function buildEvidenceNode(ev: EvidenceObject): GraphNode {
  return {
    id: ev.id,
    type: "EVIDENCE",
    label: ev.label,
    subtitle: ev.sourceTool,
    confidence: ev.confidence,
    metadata: {
      type: ev.type,
      modality: ev.layer,
      coordinates: ev.coordinates,
      quality: ev.quality,
      category: ev.category,
      geometry: ev.geometry,
      coordinateFrame: ev.coordinateFrame,
      createdAt: ev.createdAt,
      sourceVersion: ev.sourceVersion,
    },
  };
}

export function classifyRefusal(investigation: Investigation): RefusalInfo | null {
  const refusal = investigation.refusal;
  if (!refusal) return null;

  const workflowId = investigation.workflow.id;
  let category: RefusalCategory;

  if (workflowId === "optical_sar") {
    category = "modality_mismatch";
  } else if (workflowId === "bi_temporal_change" || workflowId === "change_vqa") {
    category = "temporal_requirement";
  } else if (refusal.title.includes("CAUSAL") || refusal.title.includes("NOT FULLY SUPPORTED")) {
    category = "capability_exceeded";
  } else if (refusal.title.includes("INCOMPATIBLE")) {
    category = "modality_mismatch";
  } else {
    category = "insufficient_input";
  }

  return {
    category,
    reason: refusal.action,
    capability: investigation.decision.specialist,
    requiredByWorkflow: workflowId,
    specialistRefused: investigation.decision.specialist,
    action: refusal.action,
    actionHint: refusal.actionHint,
  };
}

export function buildLowConfidenceBreakdown(
  investigation: Investigation,
): LowConfidenceBreakdown | null {
  const level = investigation.confidence.level;
  if (level !== "low" && level !== "medium") return null;

  const factors: LowConfidenceFactor[] = [];
  const score = investigation.confidence.score ?? 0;

  const confidenceFactors: ConfidenceFactor[] = investigation.confidence.factors ?? [];

  const evidenceCompleteness = confidenceFactors.find((f) =>
    f.label.toLowerCase().includes("completeness"),
  );
  if (evidenceCompleteness) {
    const status = evidenceCompleteness.status;
    const severity: "high" | "medium" | "low" =
      status === "missing" ? "high" : status === "uncertain" ? "medium" : "low";
    factors.push({
      id: "evidence_completeness",
      label: evidenceCompleteness.label,
      description:
        evidenceCompleteness.detail ??
        "Evidence coverage for the query is incomplete or unverified",
      severity,
      value: status,
    });
  }

  const modelAgreement = confidenceFactors.find((f) => f.label.toLowerCase().includes("agree"));
  if (modelAgreement) {
    const severity: "high" | "medium" | "low" =
      modelAgreement.status === "missing"
        ? "high"
        : modelAgreement.status === "uncertain"
          ? "medium"
          : "low";
    factors.push({
      id: "model_agreement",
      label: modelAgreement.label,
      description:
        modelAgreement.detail ?? "Specialist model heads show disagreement on key findings",
      severity,
      value: modelAgreement.status,
    });
  }

  const inputQuality = confidenceFactors.find(
    (f) => f.label.toLowerCase().includes("quality") || f.label.toLowerCase().includes("input"),
  );
  if (inputQuality) {
    const severity: "high" | "medium" | "low" =
      inputQuality.status === "missing"
        ? "high"
        : inputQuality.status === "uncertain"
          ? "medium"
          : "low";
    factors.push({
      id: "image_quality",
      label: inputQuality.label,
      description:
        inputQuality.detail ?? "Source imagery quality affects interpretation reliability",
      severity,
      value: inputQuality.status,
    });
  }

  const verification = investigation.verification;
  if (verification && verification.overallStatus !== "pass") {
    factors.push({
      id: "verification_status",
      label: "Verification Status",
      description: `Verification checks: ${verification.overallStatus}. ${verification.contradictions.length > 0 ? `Contradictions: ${verification.contradictions.join("; ")}` : ""}`,
      severity: verification.overallStatus === "fail" ? "high" : "medium",
      value: verification.overallStatus,
    });
  }

  if (verification && verification.modelAgreement === "disagreed") {
    factors.push({
      id: "adversarial_disagreement",
      label: "Adversarial Disagreement",
      description:
        "Proposer and Skeptic auditors reached conflicting conclusions on key change regions",
      severity: "high",
      value: "disagreed",
    });
  }

  const evidenceCount = investigation.evidence.length;
  if (evidenceCount < 2) {
    factors.push({
      id: "evidence_count",
      label: "Evidence Count",
      description: `Only ${evidenceCount} evidence object${evidenceCount === 1 ? "" : "s"} available for spatial grounding or change confirmation`,
      severity: evidenceCount === 0 ? "high" : "medium",
      value: `${evidenceCount} evidence objects`,
    });
  }

  if (factors.length === 0) {
    factors.push({
      id: "general_uncertainty",
      label: "General Uncertainty",
      description:
        investigation.confidence.limitations?.[0] ??
        "Overall confidence falls below the high-confidence threshold",
      severity: score < 0.4 ? "high" : "medium",
      value: `Score: ${score}`,
    });
  }

  const summary =
    factors.length > 0
      ? `${factors.length} factor${factors.length > 1 ? "s" : ""} contributing to reduced confidence`
      : "Confidence is below threshold";

  return { factors, summary };
}

export function buildProvenance(investigation: Investigation): ProvenanceInfo {
  const obs = investigation.observations ?? [];
  const evidence = investigation.evidence ?? [];

  const sources: ProvenanceSource[] = [];

  obs.forEach((observation) => {
    const matchingEvidence = evidence.filter((e) => {
      const spec = investigation.specialists.find((s) => s.producedArtifacts.includes(e.id));
      return spec !== undefined;
    });
    sources.push({
      id: observation.id,
      dataset: observation.filename,
      sensor: observation.metadata?.sensor ?? "unknown",
      resolutionMeters: observation.metadata?.resolutionM ?? null,
      acquiredAt: observation.metadata?.acquiredAt ?? null,
      confidence:
        matchingEvidence.length > 0
          ? Math.min(...matchingEvidence.map((e) => e.confidence ?? 0))
          : 0,
    });
  });

  evidence.forEach((ev) => {
    if (!sources.some((s) => s.id === ev.id)) {
      sources.push({
        id: ev.id,
        dataset: ev.sourceTool ?? "unknown",
        sensor: ev.sourceTool ?? "unknown",
        resolutionMeters: null,
        acquiredAt: ev.createdAt,
        confidence: ev.confidence,
      });
    }
  });

  const processingChain: string[] = [];
  const trace = investigation.trace ?? [];
  trace.forEach((te) => {
    if (te.component && !processingChain.includes(te.component)) {
      processingChain.push(te.component);
    }
  });

  if (processingChain.length === 0) {
    processingChain.push("Raw imagery ingestion");
    processingChain.push("Radiometric calibration");
    processingChain.push("Geometric correction");
    processingChain.push("Evidence extraction");
  }

  if (investigation.refusal) {
    processingChain.push("Refusal classification");
  } else {
    processingChain.push("Claim synthesis");
  }

  return { sources, processingChain };
}

export function buildAuditLedger(investigation: Investigation): AuditLedger {
  const entries: LedgerEntry[] = [];
  let parentHash: string | null = null;

  const stages: Array<{ stage: string; data: string }> = [
    { stage: "query_received", data: investigation.query },
    {
      stage: "query_understanding",
      data: JSON.stringify(investigation.queryUnderstanding),
    },
    { stage: "policy_check", data: JSON.stringify(investigation.policyCheck) },
    {
      stage: "specialists_executed",
      data: JSON.stringify(
        investigation.specialists.map((s) => ({ id: s.id, tool: s.tool, status: s.status })),
      ),
    },
    { stage: "verification", data: JSON.stringify(investigation.verification) },
    { stage: "decision", data: investigation.decision.status },
  ];

  stages.forEach((s) => {
    const hash = chainHash(s.stage, parentHash, s.data);
    entries.push({
      stage: s.stage,
      hash,
      timestamp: new Date().toISOString(),
      parentHash,
      dataSummary: s.data.slice(0, 80),
    });
    parentHash = hash;
  });

  return {
    entries,
    genesisHash: entries[0]?.parentHash ?? "genesis",
    isDemo: true,
  };
}

export function buildTrace(investigation: Investigation): TraceEntry[] {
  const trace = investigation.trace ?? [];
  const obsCount = investigation.observations.length;

  const entries: TraceEntry[] = [
    {
      stage: "observation",
      label: "Observation Received",
      icon: "📡",
      timestamp: trace[0]?.timestamp ?? new Date().toISOString(),
      status: "complete",
      detail:
        obsCount > 0 ? `${obsCount} observation${obsCount === 1 ? "" : "s"} received` : undefined,
    },
    {
      stage: "query_understanding",
      label: "Query Understanding",
      icon: "🧠",
      timestamp: trace.find((te) => te.stage.includes("classification"))?.timestamp ?? "",
      status: investigation.queryUnderstanding ? "complete" : "pending",
    },
    {
      stage: "task_classification",
      label: "Task Classification",
      icon: "🏷️",
      timestamp: trace.find((te) => te.stage.includes("routing"))?.timestamp ?? "",
      status: investigation.decision.status === "blocked" ? "failed" : "complete",
    },
    {
      stage: "evidence_planning",
      label: "Evidence Planning",
      icon: "📋",
      timestamp: trace.find((te) => te.stage.includes("planning"))?.timestamp ?? "",
      status: investigation.evidence.length > 0 ? "complete" : "pending",
    },
    {
      stage: "routing",
      label: "Routing",
      icon: "🔀",
      timestamp: trace.find((te) => te.stage === "routing")?.timestamp ?? "",
      status: investigation.decision.status === "blocked" ? "failed" : "complete",
    },
    {
      stage: "execution",
      label: "Specialist Execution",
      icon: "⚙️",
      timestamp:
        trace.find((te) => te.stage === "execution" || te.stage === "measurement")?.timestamp ?? "",
      status: investigation.specialists.every((s) => s.status === "complete")
        ? "complete"
        : investigation.specialists.some((s) => s.status === "failed" || s.status === "skipped")
          ? "failed"
          : "pending",
      detail: `${investigation.specialists.filter((s) => s.status === "complete").length}/${investigation.specialists.length} specialists completed`,
    },
    {
      stage: "verification",
      label: "Verification",
      icon: "✓",
      timestamp:
        trace.find((te) => te.stage === "verification" || te.stage.includes("adversarial"))
          ?.timestamp ?? "",
      status: investigation.verification
        ? investigation.verification.overallStatus === "pass"
          ? "complete"
          : investigation.verification.overallStatus === "warn"
            ? "skipped"
            : "failed"
        : "pending",
      detail: investigation.verification
        ? `Overall: ${investigation.verification.overallStatus}`
        : undefined,
    },
    {
      stage: "composition",
      label: "Response Composition",
      icon: "📝",
      timestamp: trace.find((te) => te.stage.includes("composition"))?.timestamp ?? "",
      status: investigation.structuredAnswer ? "complete" : "pending",
    },
    {
      stage: "complete",
      label: "Complete",
      icon: "✅",
      timestamp:
        trace.find((te) => te.stage.includes("composition"))?.timestamp ?? new Date().toISOString(),
      status: investigation.structuredAnswer ? "complete" : "pending",
    },
  ];

  return entries;
}

export function buildReportData(investigation: Investigation): ReportData {
  const graph = buildEvidenceGraph(investigation);
  const refusal = classifyRefusal(investigation);
  const lowConfidence = buildLowConfidenceBreakdown(investigation);
  const provenance = buildProvenance(investigation);
  const ledger = buildAuditLedger(investigation);
  const trace = buildTrace(investigation);

  const sectionIds = [
    "query",
    "policy",
    "specialists",
    "evidence",
    "verification",
    "answer",
    "refusal",
    "provenance",
  ];

  const sections: ReportSection[] = sectionIds.map((id) => {
    let title: string;
    let icon: string;
    let status: ReportSection["status"] = "absent";
    let summary = "";

    switch (id) {
      case "query":
        title = "Query Understanding";
        icon = "🧠";
        if (investigation.queryUnderstanding) {
          status = "present";
          summary = investigation.queryUnderstanding.intent;
        }
        break;
      case "policy":
        title = "Policy Check";
        icon = "🛡️";
        if (investigation.policyCheck) {
          status = investigation.policyCheck.status === "blocked" ? "failed" : "present";
          summary =
            investigation.policyCheck.status === "blocked"
              ? `Blocked: ${investigation.policyCheck.reason ?? ""}`
              : "All preconditions satisfied";
        }
        break;
      case "specialists":
        title = "Specialist Execution";
        icon = "⚙️";
        if (investigation.specialists.length > 0) {
          const succeeded = investigation.specialists.filter((s) => s.status === "complete");
          status = succeeded.length === investigation.specialists.length ? "present" : "failed";
          summary = `${succeeded.length}/${investigation.specialists.length} specialists completed`;
        }
        break;
      case "evidence":
        title = "Evidence Graph";
        icon = "📊";
        if (investigation.evidence.length > 0) {
          status = "present";
          summary = `${investigation.evidence.length} evidence objects in ${graph.nodes.length} graph nodes`;
        }
        break;
      case "verification":
        title = "Verification";
        icon = "✓";
        if (investigation.verification) {
          status = investigation.verification.overallStatus === "pass" ? "present" : "failed";
          summary = `Overall: ${investigation.verification.overallStatus} · ${investigation.verification.checks.length} checks`;
        }
        break;
      case "answer":
        title = "Structured Answer";
        icon = "📝";
        if (investigation.structuredAnswer) {
          status = "present";
          summary = `${investigation.structuredAnswer.claims.length} claims · Confidence: ${investigation.structuredAnswer.confidence}`;
        }
        break;
      case "refusal":
        title = "Refusal Analysis";
        icon = "🚫";
        if (refusal) {
          status = "failed";
          summary = `${refusal.category}: ${refusal.reason}`;
        }
        break;
      case "provenance":
        title = "Provenance & Ledger";
        icon = "🔗";
        status = "present";
        summary = `${provenance.sources.length} source${provenance.sources.length === 1 ? "" : "s"} · ${ledger.entries.length} ledger entries`;
        break;
      default:
        title = id;
        icon = "•";
    }

    return { id, title, icon, status, summary };
  });

  return {
    id: investigation.requestId,
    title: "SatQuery AI — Investigation Audit Report",
    generatedAt: new Date().toISOString(),
    isDemo: true,
    summary:
      investigation.answer ??
      investigation.detailedAnswer ??
      `Investigation — Decision: ${investigation.decision.status}`,
    decision: investigation.decision.status,
    sections,
    structuredAnswer: investigation.detailedAnswer ?? "",
    evidenceCount: investigation.evidence.length,
    specialistCount: investigation.specialists.length,
    graph,
    refusal,
    lowConfidence,
    provenance,
    ledger,
    trace,
  };
}
