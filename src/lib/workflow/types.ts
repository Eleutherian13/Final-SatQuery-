/**
 * SatQuery AI — Workflow State Machine Types
 *
 * Implements the domain contracts for the core workflow state machine
 * and analytical investigation lifecycle.
 */

export type LifecycleState =
  | "IDLE"
  | "UPLOADING"
  | "INSPECTING"
  | "VALIDATING"
  | "READY"
  | "QUERY_RECEIVED"
  | "QUERY_UNDERSTANDING"
  | "TASK_CLASSIFIED"
  | "EVIDENCE_PLANNING"
  | "ROUTING"
  | "EXECUTING"
  | "EVIDENCE_GENERATED"
  | "VERIFYING"
  | "COMPOSING"
  | "COMPLETE"
  | "VALIDATION_FAILED"
  | "UNSUPPORTED_QUERY"
  | "ROUTING_BLOCKED"
  | "LOW_CONFIDENCE";

export type FailureState =
  "VALIDATION_FAILED" | "UNSUPPORTED_QUERY" | "ROUTING_BLOCKED" | "LOW_CONFIDENCE";

export const FAILURE_STATES: FailureState[] = [
  "VALIDATION_FAILED",
  "UNSUPPORTED_QUERY",
  "ROUTING_BLOCKED",
  "LOW_CONFIDENCE",
];

export function isFailureState(state: LifecycleState): state is FailureState {
  return (FAILURE_STATES as LifecycleState[]).includes(state);
}

export type MacroStage = "OBSERVATIONS" | "QUERY" | "ANALYSIS" | "EVIDENCE" | "RESULT";

export interface MacroStageInfo {
  id: MacroStage;
  label: string;
  order: number;
  description: string;
}

export const MACRO_STAGES: MacroStageInfo[] = [
  {
    id: "OBSERVATIONS",
    label: "OBSERVATIONS",
    order: 1,
    description: "Dataset ingestion & validation",
  },
  { id: "QUERY", label: "QUERY", order: 2, description: "Intent parsing & task classification" },
  {
    id: "ANALYSIS",
    label: "ANALYSIS",
    order: 3,
    description: "Routing & specialist model execution",
  },
  {
    id: "EVIDENCE",
    label: "EVIDENCE",
    order: 4,
    description: "Spatial evidence generation & verification",
  },
  {
    id: "RESULT",
    label: "RESULT",
    order: 5,
    description: "Answer composition & auditable delivery",
  },
];

export const STATE_TO_MACRO_STAGE: Record<LifecycleState, MacroStage> = {
  IDLE: "OBSERVATIONS",
  UPLOADING: "OBSERVATIONS",
  INSPECTING: "OBSERVATIONS",
  VALIDATING: "OBSERVATIONS",
  VALIDATION_FAILED: "OBSERVATIONS",
  READY: "OBSERVATIONS",

  QUERY_RECEIVED: "QUERY",
  QUERY_UNDERSTANDING: "QUERY",
  TASK_CLASSIFIED: "QUERY",
  UNSUPPORTED_QUERY: "QUERY",

  EVIDENCE_PLANNING: "ANALYSIS",
  ROUTING: "ANALYSIS",
  ROUTING_BLOCKED: "ANALYSIS",
  EXECUTING: "ANALYSIS",

  EVIDENCE_GENERATED: "EVIDENCE",
  VERIFYING: "EVIDENCE",
  LOW_CONFIDENCE: "EVIDENCE",

  COMPOSING: "RESULT",
  COMPLETE: "RESULT",
};

/** Ordered nominal progression for linear tracking */
export const NOMINAL_ORDER: LifecycleState[] = [
  "IDLE",
  "UPLOADING",
  "INSPECTING",
  "VALIDATING",
  "READY",
  "QUERY_RECEIVED",
  "QUERY_UNDERSTANDING",
  "TASK_CLASSIFIED",
  "EVIDENCE_PLANNING",
  "ROUTING",
  "EXECUTING",
  "EVIDENCE_GENERATED",
  "VERIFYING",
  "COMPOSING",
  "COMPLETE",
];

export interface StateTimingConfig {
  state: LifecycleState;
  durationMs: number;
  label: string;
  detail: string;
}

/** Deterministic timing profile for smooth, realistic analyst workflow */
export const DEFAULT_STATE_TIMINGS: Record<
  LifecycleState,
  { durationMs: number; label: string; detail: string }
> = {
  IDLE: { durationMs: 0, label: "Idle", detail: "Awaiting analyst input" },
  UPLOADING: {
    durationMs: 420,
    label: "Uploading",
    detail: "Streaming raster dataset to staging buffer",
  },
  INSPECTING: {
    durationMs: 640,
    label: "Inspecting",
    detail: "Extracting raster metadata, CRS & band headers",
  },
  VALIDATING: {
    durationMs: 580,
    label: "Validating",
    detail: "Verifying raster bounds, GSD, and integrity",
  },
  READY: {
    durationMs: 0,
    label: "Ready",
    detail: "Observations validated and staged for analysis",
  },
  QUERY_RECEIVED: {
    durationMs: 320,
    label: "Query Ingested",
    detail: "Analyst query received into dispatcher",
  },
  QUERY_UNDERSTANDING: {
    durationMs: 720,
    label: "Understanding",
    detail: "Extracting target features, spatial intents & entities",
  },
  TASK_CLASSIFIED: {
    durationMs: 520,
    label: "Task Classified",
    detail: "Classified into primary and auxiliary task graphs",
  },
  EVIDENCE_PLANNING: {
    durationMs: 580,
    label: "Evidence Planning",
    detail: "Formulating required spatial evidence constraints",
  },
  ROUTING: {
    durationMs: 600,
    label: "Routing",
    detail: "Dispatching to registered specialist workflow",
  },
  EXECUTING: {
    durationMs: 1400,
    label: "Executing Specialist",
    detail: "Running specialist model and feature extractors",
  },
  EVIDENCE_GENERATED: {
    durationMs: 680,
    label: "Evidence Generated",
    detail: "Rendering masks, bounding geometries & crops",
  },
  VERIFYING: {
    durationMs: 620,
    label: "Verifying Evidence",
    detail: "Performing spatial consistency and support checks",
  },
  COMPOSING: {
    durationMs: 540,
    label: "Composing Result",
    detail: "Synthesizing answer claims, limits and confidence",
  },
  COMPLETE: {
    durationMs: 0,
    label: "Investigation Complete",
    detail: "Full analytical package ready",
  },

  // Failure states (terminal when reached)
  VALIDATION_FAILED: {
    durationMs: 0,
    label: "Validation Failed",
    detail: "Raster corrupt, missing metadata, or invalid CRS",
  },
  UNSUPPORTED_QUERY: {
    durationMs: 0,
    label: "Unsupported Query",
    detail: "Query outside registered capabilities of specialist models",
  },
  ROUTING_BLOCKED: {
    durationMs: 0,
    label: "Routing Blocked",
    detail: "Preconditions not satisfied for selected workflow",
  },
  LOW_CONFIDENCE: {
    durationMs: 0,
    label: "Low Confidence Alert",
    detail: "Insufficient evidence to support reliable conclusion",
  },
};

export interface ToolExecutionRecord {
  id: string;
  name: string;
  tool: string;
  model: string;
  version: string;
  status: "pending" | "running" | "completed" | "failed";
  runtimeMs?: number;
}

export interface AnalysisJob {
  jobId: string;
  scenarioId: string;
  query: string;
  state: LifecycleState;
  macroStage: MacroStage;
  startTime: number | null;
  endTime: number | null;
  elapsedMs: number;
  failureOverride?: FailureState | null;
}
