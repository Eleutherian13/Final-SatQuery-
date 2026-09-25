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
  format?: string | null | undefined;
  dataType?: string | null | undefined;
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
  registration?:
    | undefined
    | {
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

/** Explicit coordinate frame for spatial artifacts — GEOMETRY SAFETY RULE. */
export type CoordinateFrame =
  "PIXEL_IMAGE" | "NORMALIZED_IMAGE" | "GEOREFERENCED" | "OTHER_EXPLICIT_FRAME";

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
  /** Coordinate frame — must be explicit per GEOMETRY SAFETY RULE. */
  coordinateFrame: CoordinateFrame;
  polygon?: Array<[number, number]> | undefined;
  coordinates: string | null;
  quality: string | null;
  createdAt: string;
  category?: ChangeCategory | undefined;
  layer?: "before" | "after" | "change" | "optical" | "sar" | "fused" | undefined;
}

export type ChangeCategory =
  "built_up_expansion" | "vegetation_change" | "water_change" | "infrastructure" | "unknown";

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

/* ---------- Canonical Investigation Objects ---------- */

export interface QueryUnderstanding {
  intent: string;
  primaryTask: string;
  secondaryTasks: string[];
  targets: string[];
  spatialRequirement: string;
  evidenceRequirement: string;
}

export interface EvidenceRequirement {
  evidenceTypes: EvidenceType[];
  spatialGroundingRequired: boolean;
  temporalComparisonRequired: boolean;
  modalityEvidenceRequired: boolean;
}

export type DecisionEngineId = "laya" | "jev";

export interface Decision {
  task: string;
  specialist: string;
  requiredInputs: string[];
  parameters: Record<string, string | number | boolean>;
  evidenceRequirements: EvidenceRequirement;
  engine: DecisionEngineId;
  status: "decided" | "fallback" | "blocked";
}

export type PolicyCheckStatus = "allowed" | "blocked";

export interface PolicyCheck {
  status: PolicyCheckStatus;
  reason: string | null;
  toolContract: string;
  preconditions: string[];
  parameterValidation: "pass" | "fail";
}

export type SpecialistExecutionStatus = "pending" | "running" | "complete" | "failed" | "skipped";

export interface SpecialistExecution {
  id: string;
  tool: string;
  status: SpecialistExecutionStatus;
  inputIds: string[];
  modelVersion: string | null;
  toolVersion: string | null;
  producedArtifacts: string[];
  runtimeMs: number | null;
}

export interface VerificationCheck {
  label: string;
  status: "pass" | "warn" | "fail";
  detail?: string | undefined;
}

export interface Verification {
  checks: VerificationCheck[];
  overallStatus: "pass" | "warn" | "fail";
  contradictions: string[];
  registrationQuality: RegistrationQuality | null;
  evidenceCompleteness: "complete" | "partial" | "insufficient";
  modelAgreement: "agreed" | "partial" | "disagreed" | null;
}

export interface StructuredClaim {
  id: string;
  text: string;
  evidenceIds: string[];
  confidence: ConfidenceLevel;
  supportedBy: string;
}

export interface StructuredAnswer {
  claims: StructuredClaim[];
  targets: string[];
  classification: string | null;
  evidenceIds: string[];
  confidence: ConfidenceLevel;
  limitations: string[];
  workflow: WorkflowId;
}

/* ---------- Bi-Temporal & Proposer/Skeptic Domain Model ---------- */

export interface TemporalValidationInfo {
  imageCount: number;
  beforeDate: string;
  afterDate: string;
  orderValid: boolean;
  deltaDays: number;
  spatialCorrespondence: {
    overlapPercent: number;
    footprintMatch: boolean;
    intersectionAreaKm2: number;
  };
  crsCompatibility: {
    beforeCrs: string;
    afterCrs: string;
    compatible: boolean;
  };
  registration: {
    status: "registered" | "low_quality" | "unregistered";
    quality: RegistrationQuality;
    residualPx: number | null;
    tolerancePx: number;
    warning?: string | null;
  };
}

export interface CandidateChangeRegion {
  id: string;
  label: string;
  areaKm2: number;
  rawDifferenceScore: number;
  spectralShift: string;
  geometry: NormalisedBox;
}

export interface ChangeMeasurement {
  tool: string;
  version: string;
  method: string;
  totalChangeAreaKm2: number;
  pixelDifferenceThreshold: number;
  candidateRegions: CandidateChangeRegion[];
}

export interface ProposedChange {
  regionId: string;
  label: string;
  classLabel: string;
  confidence: number;
  rationale: string;
}

export interface ProposerInterpretation {
  model: string;
  hypothesis: string;
  proposedChanges: ProposedChange[];
  summary: string;
}

export interface SkepticCritique {
  model: string;
  registrationVulnerability: {
    couldBeArtifact: boolean;
    residualPx: number | null;
    analysis: string;
  };
  spatialCoherence: {
    coherent: boolean;
    analysis: string;
  };
  evidenceSufficiency: {
    sufficient: boolean;
    analysis: string;
  };
  contradictions: string[];
  alternativeExplanations: string[];
  verdict: "supported_with_reservations" | "supported" | "contested" | "refuted";
}

export interface DisagreementItem {
  topic: string;
  proposerClaim: string;
  skepticContestation: string;
  resolution: string;
  impactOnConfidence: "none" | "slight_reduction" | "significant_reduction";
}

export interface AdversarialVerification {
  proposerHypothesis: string;
  skepticCritique: string;
  disagreements: DisagreementItem[];
  verifiedInterpretation: string;
  verifiedStatus: "verified" | "qualified" | "contested";
  registrationWarning?: string | null;
}

export interface BiTemporalInvestigationData {
  validation: TemporalValidationInfo;
  measurement: ChangeMeasurement;
  proposer: ProposerInterpretation;
  skeptic: SkepticCritique;
  adversarial: AdversarialVerification;
}

/* ---------- Cross-Modal / Optical + SAR Types ---------- */

export interface CrossModalValidationInfo {
  opticalObservationId: string;
  sarObservationId: string;
  crsAlignment: "exact" | "reprojected" | "mismatch";
  crsTarget: string;
  opticalGsdM: number;
  sarGsdM: number;
  resolutionRatio: number;
  spatialOverlapPercent: number;
  temporalDeltaDays: number;
  polarization: "VV" | "VH" | "VV+VH" | "HH+HV" | "unknown";
  incidenceAngleDeg: number;
  status: "pass" | "warn" | "fail";
  detail: string;
}

export interface SarPhysicsFeatures {
  doubleBounceIntensityDb: number;
  surfaceRoughness: "low" | "medium" | "high";
  shadowLayoverIdentified: boolean;
  polarizationRatioVvVh: number;
  dielectricMoistureEstimate: "dry" | "moderate" | "saturated";
  speckleFilterApplied: string;
  incidenceAngleDeg: number;
}

export interface OpticalPhysicsFeatures {
  ndbiBuiltUpIndex: number;
  ndviVegetationSuppression: number;
  ndwiWaterSuppression: number;
  edgeDensity: number;
  spectralBrightnessAvg: number;
  cloudShadowOcclusionPercent: number;
}

export interface PhysicsSideFeatures {
  sar: SarPhysicsFeatures;
  optical: OpticalPhysicsFeatures;
  physicsInsight: string;
}

export interface AlignmentAdapter {
  method: "affine" | "homography" | "grid_resample";
  sourceCrs: string;
  targetCrs: string;
  subPixelResidualPx: number;
  resamplingFilter: "bilinear" | "bicubic" | "nearest";
  coverageOverlapAreaKm2: number;
}

export interface SpecialistBranchExecution {
  modality: "optical" | "sar";
  modelName: string;
  modelVersion: string;
  runtimeMs: number;
  featuresExtracted: string[];
  candidateRegionsCount: number;
  primaryConfidence: number;
  modalitySummary: string;
}

export interface CrossModalFusion {
  fusionMethod: "decision_level" | "feature_level" | "adversarial_consensus";
  opticalWeight: number;
  sarWeight: number;
  consensusRegionsCount: number;
  opticalOnlyRegionsCount: number;
  sarOnlyRegionsCount: number;
  consensusConfidence: number;
  agreementRatePercent: number;
  fusionSummary: string;
}

export interface CrossModalInvestigationData {
  validation: CrossModalValidationInfo;
  physicsSideFeatures: PhysicsSideFeatures;
  alignmentAdapter: AlignmentAdapter;
  opticalBranch: SpecialistBranchExecution;
  sarBranch: SpecialistBranchExecution;
  fusion: CrossModalFusion;
}

/* ---------- Analysis ---------- */

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
  temporal?:
    | undefined
    | {
        beforeDate: string;
        afterDate: string;
        orderValid: boolean;
        registration: RegistrationQuality;
      };
  biTemporal?: BiTemporalInvestigationData | undefined;
  crossModal?: CrossModalInvestigationData | undefined;
  source: "demo" | "live";
  /** Canonical investigation fields — required on Investigation, optional here for backward compat. */
  observations?: Observation[] | undefined;
  queryUnderstanding?: QueryUnderstanding | undefined;
  decision?: Decision | undefined;
  policyCheck?: PolicyCheck | undefined;
  specialists?: SpecialistExecution[] | undefined;
  verification?: Verification | undefined;
  structuredAnswer?: StructuredAnswer | undefined;
}

/**
 * Canonical investigation: the single object connecting all investigation phases.
 * Extends AnalysisResult with required observations, canonical sub-objects, and
 * the geometry-safe evidence model. Workspace, History, Registry, and Demo Mode
 * all consume this type.
 */
export interface Investigation extends AnalysisResult {
  observations: Observation[];
  queryUnderstanding: QueryUnderstanding;
  decision: Decision;
  policyCheck: PolicyCheck;
  specialists: SpecialistExecution[];
  verification: Verification;
  structuredAnswer: StructuredAnswer;
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
