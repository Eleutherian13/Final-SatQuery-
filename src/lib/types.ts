/**
 * SatQuery AI — frontend domain types.
 *
 * These mirror the Python contracts under satquery/schemas/ and are the only
 * shapes UI components consume. Backend payloads are translated in mapping.ts.
 */

export type Modality = "optical" | "sar" | "unknown";
export type ObservationRole = "single" | "before" | "after" | "optical" | "sar";

export interface RasterMetadata {
  width: number | null;
  height: number | null;
  bands: number | null;
  crs: string | null;
  resolutionM: number | null;
  nodata: number | string | null;
  acquiredAt: string | null;
  sensor: string | null;
}

export type ValidationCheckStatus = "pass" | "warn" | "fail" | "skipped";

export interface ValidationCheck {
  id: string;
  label: string;
  status: ValidationCheckStatus;
  detail?: string | undefined;
}

export type RegistrationQuality = "good" | "acceptable" | "low" | "not_applicable";

export interface ValidationResult {
  status: "validated" | "warning" | "invalid" | "pending";
  checks: ValidationCheck[];
  registration?: undefined | {
    quality: RegistrationQuality;
    note?: string | undefined;
  };
}

export interface Observation {
  id: string;
  filename: string;
  sizeBytes: number | null;
  modality: Modality;
  role: ObservationRole;
  metadata: RasterMetadata;
  validation: ValidationResult;
  /** Display-resolution preview (thumbnail / tile source), never the full raster. */
  previewUrl: string;
}

/* ---------- Workflows & routing ---------- */

export type WorkflowId =
  | "single_image_vqa"
  | "captioning"
  | "grounding"
  | "bi_temporal_change"
  | "change_vqa"
  | "optical_sar"
  | "unsupported";

export interface Workflow {
  id: WorkflowId;
  label: string;
  requiredObservations: string;
}

export interface QueryEntity {
  text: string;
  type: string;
}

export interface QueryIntent {
  workflow: WorkflowId;
  label: string;
  confidence: number;
  entities: QueryEntity[];
  requiredInput: string;
  currentInput: string;
  compatibility: "compatible" | "incompatible";
}

export interface RouteNode {
  id: string;
  label: string;
  detail?: string | undefined;
}

/* ---------- Evidence ---------- */

export type EvidenceType =
  | "mask"
  | "bounding_box"
  | "crop"
  | "change_region"
  | "optical_evidence"
  | "sar_evidence"
  | "fused_evidence";

/** Normalised geometry (0..1 of image extent) so any renderer can consume it. */
export interface NormalisedBox {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface EvidenceObject {
  id: string;
  index: number;
  type: EvidenceType;
  label: string;
  sourceTool: string;
  sourceVersion: string;
  confidence: number | null;
  regionDescription: string | null;
  geometry: NormalisedBox | null;
  polygon?: Array<[number, number]> | undefined;
  coordinates: string | null;
  quality: string | null;
  createdAt: string;
  category?: ChangeCategory | undefined;
  layer?: "before" | "after" | "change" | "optical" | "sar" | "fused" | undefined;
}

export type ChangeCategory =
  | "built_up_expansion"
  | "vegetation_change"
  | "water_change"
  | "infrastructure"
  | "unknown";

/* ---------- Confidence ---------- */

export type ConfidenceLevel = "high" | "medium" | "low" | "unsupported";

export interface ConfidenceFactor {
  label: string;
  status: "supporting" | "uncertain" | "missing";
  detail?: string | undefined;
}

export interface Confidence {
  level: ConfidenceLevel;
  score: number | null;
  factors: ConfidenceFactor[];
  limitations: string[];
}

/* ---------- Trace ---------- */

export type TraceStatus = "complete" | "running" | "pending" | "failed" | "skipped";

export interface TraceEvent {
  requestId: string;
  eventId: string;
  timestamp: string;
  stage: string;
  component: string;
  tool: string | null;
  modelVersion: string | null;
  status: TraceStatus;
  runtimeMs: number | null;
  parameters: Record<string, string | number | boolean>;
  inputArtifacts: string[];
  outputArtifacts: string[];
  error: string | null;
  message: string | null;
}

/* ---------- Analysis ---------- */

export type AnalysisState =
  | "IDLE"
  | "UPLOADING"
  | "VALIDATING"
  | "READY"
  | "CLASSIFYING"
  | "ROUTING"
  | "EXECUTING"
  | "VERIFYING"
  | "COMPOSING"
  | "COMPLETED"
  | "REFUSED"
  | "FAILED";

export interface AnalysisRequest {
  query: string;
  observationIds: string[];
}

export interface ModalityContribution {
  modality: "optical" | "sar";
  contribution: "high" | "medium" | "low";
  note: string;
}

export interface Refusal {
  title: string;
  required: string;
  received: string;
  action: string;
  actionHint?: string | undefined;
}

export interface AnalysisFailure {
  reason: string;
  file?: string | undefined;
  recommendedAction: string;
}

export interface AnalysisResult {
  requestId: string;
  name: string;
  createdAt: string;
  query: string;
  workflow: Workflow;
  intent: QueryIntent;
  route: RouteNode[];
  observed: string[];
  answer: string;
  detailedAnswer: string;
  interpretation: string;
  dominantFeatures?: string[] | undefined;
  confidence: Confidence;
  evidence: EvidenceObject[];
  trace: TraceEvent[];
  tool: { name: string; version: string };
  model: { name: string; version: string };
  runtimeMs: number;
  refusal?: Refusal | undefined;
  failure?: AnalysisFailure | undefined;
  modalityContributions?: ModalityContribution[] | undefined;
  fusionConfidence?: number | undefined;
  temporal?: undefined | {
    beforeDate: string;
    afterDate: string;
    orderValid: boolean;
    registration: RegistrationQuality;
  };
  source: "demo" | "live";
}

export interface AnalysisSession {
  id: string;
  name: string;
  state: AnalysisState;
  observations: Observation[];
  query: string;
  result: AnalysisResult | null;
}

export interface AnalysisHistoryEntry {
  id: string;
  time: string;
  query: string;
  workflowLabel: string;
  inputSummary: string;
  confidence: ConfidenceLevel;
  status: "completed" | "refused" | "failed";
  runtimeMs: number;
}

/* ---------- Registry ---------- */

export interface ModelInfo {
  id: string;
  name: string;
  roles: string[];
  version: string;
  status: "ready" | "loading" | "offline";
  input: string;
  output: string;
}

export interface ToolInfo {
  id: string;
  name: string;
  acceptedInputs: string;
  requiredMetadata: string;
  outputs: string;
  version: string;
  status: "online" | "offline";
}

export interface Report {
  requestId: string;
  generatedAt: string;
  analysis: AnalysisResult;
  markdown: string;
}

export interface HealthStatus {
  api: "online" | "offline";
  inference: "ready" | "warming" | "offline";
  gpu: string;
  toolsOnline: number;
  toolsTotal: number;
}
