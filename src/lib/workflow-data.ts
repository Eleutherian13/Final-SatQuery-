/**
 * Deep-workflow metadata for the prototype: query understanding, evidence
 * requirements, routing branches, specialist stages, verification checks and
 * answer claims. All values are deterministic DEMO fixtures.
 */
import type { AnalysisResult, EvidenceObject, Observation, TraceEvent } from "./types";
import { demoObservations, demoScenarios, makeObservation, previewAssets } from "./mock-data";
import type { DemoScenario } from "./mock-data";

export type MissionMode = "single" | "temporal" | "fusion";

export const MISSION_MODES: Array<{ id: MissionMode; label: string; requirement: string }> = [
  { id: "single", label: "single image", requirement: "1 observation" },
  { id: "temporal", label: "before / after", requirement: "2 temporal observations" },
  { id: "fusion", label: "optical + sar", requirement: "1 optical + 1 sar" },
];

export interface Understanding {
  intent: string;
  primaryTask: string;
  secondaryTasks: string[];
  target: string;
  secondaryTarget?: string;
  spatialRequest: string;
  evidenceRequired: string;
  outputMode: string;
  taskGraph: string[];
}

export interface VerificationCheck {
  label: string;
  status: "pass" | "warn" | "fail";
}

export interface Claim {
  id: string;
  text: string;
  supportedBy: string;
  evidenceId: string | null;
  confidence: number | null;
}

export interface SpecialistStage {
  id: string;
  label: string;
  tool: string;
  model: string;
  version: string;
  task: string;
}

export interface WorkflowPlan {
  mode: MissionMode;
  understanding: Understanding;
  evidenceRequirements: string[];
  routingBranches: string[];
  preconditions: "satisfied" | "blocked";
  specialists: SpecialistStage[];
  verification: VerificationCheck[];
  verificationStatus: "pass" | "warn" | "blocked";
  claims: Claim[];
}

/* ---------------- Golden single-image investigation ---------------- */

const goldenObservation: Observation = makeObservation({
  id: "obs-golden",
  filename: "cartosat_demo.tif",
  previewUrl: previewAssets.opticalBefore,
  role: "single",
});

const goldenEvidence: EvidenceObject[] = [
  {
    id: "ev-01",
    index: 1,
    type: "mask",
    label: "Water body — grounded region",
    sourceTool: "grounding",
    sourceVersion: "v0.1.0",
    confidence: 0.91,
    regionDescription: "North-eastern portion",
    geometry: { x: 0.54, y: 0.04, w: 0.42, h: 0.3 },
    coordinates: "23.231°N, 77.446°E",
    quality: "Good",
    createdAt: "2026-09-16T11:02:04Z",
    layer: "before",
  },
  {
    id: "ev-02",
    index: 2,
    type: "bounding_box",
    label: "Surrounding land cover — built-up + vegetation",
    sourceTool: "scene_analysis",
    sourceVersion: "v0.1.0",
    confidence: 0.84,
    regionDescription: "Central and southern sectors",
    geometry: { x: 0.18, y: 0.32, w: 0.5, h: 0.46 },
    coordinates: "23.204°N, 77.412°E",
    quality: "Good",
    createdAt: "2026-09-16T11:02:05Z",
    layer: "before",
  },
];

function ev(
  requestId: string,
  n: number,
  stage: string,
  component: string,
  runtimeMs: number | null,
  extra: Partial<TraceEvent> = {},
): TraceEvent {
  return {
    requestId,
    eventId: `evt-g${String(n).padStart(2, "0")}`,
    timestamp: `2026-09-16T11:02:${String(n).padStart(2, "0")}Z`,
    stage,
    component,
    tool: null,
    modelVersion: null,
    status: "complete",
    runtimeMs,
    parameters: {},
    inputArtifacts: [],
    outputArtifacts: [],
    error: null,
    message: null,
    ...extra,
  };
}

const GOLDEN_REQ = "req_c71e0042";

const goldenResult: AnalysisResult = {
  requestId: GOLDEN_REQ,
  name: "SCENE-0042",
  createdAt: "2026-09-16T11:02:00Z",
  query:
    "Identify the major water body, highlight it, describe the surrounding land cover, and tell me whether built-up development is present.",
  workflow: {
    id: "grounding",
    label: "Single-image Grounding + VQA + Scene Analysis",
    requiredObservations: "1 observation",
  },
  intent: {
    workflow: "grounding",
    label: "MULTI-PART SCENE ANALYSIS",
    confidence: 0.95,
    entities: [
      { text: "water body", type: "object" },
      { text: "land cover", type: "class" },
      { text: "built-up development", type: "class" },
      { text: "highlight", type: "spatial_request" },
    ],
    requiredInput: "1 observation",
    currentInput: "1 observation",
    compatibility: "compatible",
  },
  route: [
    { id: "input", label: "INPUT", detail: "1 optical observation" },
    { id: "validator", label: "INPUT VALIDATOR", detail: "metadata + quality" },
    { id: "classifier", label: "QUERY CLASSIFIER", detail: "3 tasks" },
    { id: "planner", label: "EVIDENCE PLANNER" },
    { id: "router", label: "SPECIALIST ROUTER", detail: "grounding + vqa + scene" },
    { id: "grounding", label: "GROUNDING ENGINE" },
    { id: "vqa", label: "REMOTE-SENSING VQA" },
    { id: "scene", label: "SCENE / LAND-COVER ANALYSIS" },
    { id: "verifier", label: "EVIDENCE VERIFIER" },
    { id: "composer", label: "ANSWER COMPOSER" },
  ],
  observed: [
    "Contiguous low-reflectance region in the north-eastern portion",
    "Rooftop texture clusters adjacent to the water margin",
    "Vegetated and open cultivated parcels across the southern extent",
  ],
  answer:
    "A major water body is present in the north-eastern portion of the scene; the surrounding area contains mixed vegetation and built-up development.",
  detailedAnswer:
    "A single contiguous water body was grounded in the north-eastern portion of the scene (E1). Land-cover interpretation of the surrounding extent (E2) returned built-up, vegetation and open / cultivated classes, with built-up development concentrated along the southern and western margin of the water body. Built-up presence is therefore confirmed, and it is spatially supported by the grounded region.",
  interpretation:
    "The scene is consistent with a peri-urban settlement developed adjacent to a perennial water body.",
  dominantFeatures: ["Water body", "Built-up area", "Vegetation", "Open / cultivated land"],
  confidence: {
    level: "high",
    score: 0.89,
    factors: [
      { label: "Spatial grounding", status: "supporting", detail: "Mask E1 · 91%" },
      { label: "Specialist analysis", status: "supporting", detail: "3/3 tools complete" },
      { label: "Evidence verification", status: "supporting", detail: "5/5 checks passed" },
      { label: "Image quality", status: "supporting", detail: "Acceptable" },
      { label: "Query-output consistency", status: "supporting" },
      { label: "Land-cover share precision", status: "uncertain", detail: "Qualitative only" },
    ],
    limitations: [
      "Land-cover classes are qualitative; no per-class area statistics were computed.",
      "Water-body extent may vary seasonally; single-epoch input cannot show this.",
    ],
  },
  evidence: goldenEvidence,
  trace: [
    ev(1, 1, "input", "FILE RECEIVER", 180, {
      tool: "ingestion",
      message: "cartosat_demo.tif received",
      outputArtifacts: ["obs-golden"],
    }),
    ev(GOLDEN_REQ, 2, "validation", "INPUT VALIDATOR", 820, {
      tool: "metadata_validator",
      parameters: { strict_crs: true, min_bands: 3 },
      inputArtifacts: ["obs-golden"],
      outputArtifacts: ["manifest:obs-golden"],
      message: "7/7 checks passed",
    }),
    ev(GOLDEN_REQ, 3, "classification", "QUERY CLASSIFIER", 410, {
      tool: "query_router",
      modelVersion: "intent-clf v0.3.1",
      message: "single_grounding + single_vqa + scene_description",
    }),
    ev(GOLDEN_REQ, 4, "planning", "EVIDENCE PLANNER", 190, {
      tool: "evidence_planner",
      message: "6 evidence requirements determined",
    }),
    ev(GOLDEN_REQ, 5, "routing", "SPECIALIST ROUTER", 150, {
      tool: "query_router",
      message: "3 specialist capabilities required",
    }),
    ev(GOLDEN_REQ, 6, "preprocessing", "RASTER PREPARATION", 640, {
      tool: "optical_preprocessor",
      parameters: { resample: "bilinear", tile_px: 1024 },
    }),
    ev(GOLDEN_REQ, 7, "execution", "REMOTE-SENSING VQA", 1780, {
      tool: "rs_vqa",
      modelVersion: "rs-vlm v0.1.0",
      parameters: { max_tokens: 160, temperature: 0 },
      inputArtifacts: ["obs-golden"],
    }),
    ev(GOLDEN_REQ, 8, "execution", "REGION GROUNDING", 1520, {
      tool: "grounding",
      modelVersion: "rs-vlm v0.1.0",
      parameters: { target: "water body", box_threshold: 0.35 },
      outputArtifacts: ["ev-01"],
    }),
    ev(GOLDEN_REQ, 9, "execution", "SCENE / LAND-COVER ANALYSIS", 1240, {
      tool: "captioning",
      modelVersion: "rs-vlm v0.1.0",
      outputArtifacts: ["ev-02"],
    }),
    ev(GOLDEN_REQ, 10, "verification", "EVIDENCE VERIFIER", 560, {
      tool: "evidence_verifier",
      modelVersion: "verifier v0.1.0",
      inputArtifacts: ["ev-01", "ev-02"],
      message: "All claims spatially supported",
    }),
    ev(GOLDEN_REQ, 11, "composition", "ANSWER COMPOSER", 470, {
      tool: "answer_composer",
      inputArtifacts: ["ev-01", "ev-02"],
    }),
    ev(GOLDEN_REQ, 12, "complete", "RESULT DELIVERED", 60, {
      tool: "response",
      message: "2 evidence objects · confidence high",
    }),
  ],
  tool: { name: "grounding", version: "v0.1.0" },
  model: { name: "Remote-Sensing VLM", version: "v0.1.0" },
  runtimeMs: 8020,
  source: "demo",
};

export const goldenScenario: DemoScenario = {
  id: "golden",
  code: "GOLDEN",
  title: "Water body + land cover",
  description:
    "Flagship end-to-end single-image investigation: grounding + VQA + scene analysis.",
  observations: [goldenObservation],
  query: goldenResult.query,
  result: goldenResult,
};

/* ---------------- Optical + optical incompatible input ---------------- */

const incompatibleResult: AnalysisResult = {
  ...goldenResult,
  requestId: "req_71ba0c93",
  name: "FUSION-0008",
  query: "Identify built-up and water-covered regions using both observations.",
  workflow: {
    id: "unsupported",
    label: "Refused — modality pair incompatible",
    requiredObservations: "1 optical + 1 SAR",
  },
  intent: {
    workflow: "optical_sar",
    label: "OPTICAL-SAR FUSION",
    confidence: 0.93,
    entities: [
      { text: "built-up", type: "class" },
      { text: "water-covered", type: "class" },
    ],
    requiredInput: "1 optical + 1 SAR",
    currentInput: "2 optical",
    compatibility: "incompatible",
  },
  route: [
    { id: "input", label: "INPUT", detail: "2 optical" },
    { id: "validator", label: "INPUT VALIDATOR" },
    { id: "modality", label: "MODALITY CHECK", detail: "FAILED" },
    { id: "halt", label: "FUSION NOT EXECUTED" },
  ],
  observed: [],
  answer: "",
  detailedAnswer: "",
  interpretation: "",
  dominantFeatures: undefined,
  confidence: {
    level: "unsupported",
    score: null,
    factors: [{ label: "Required modality pair present", status: "missing" }],
    limitations: ["Cross-modal fusion requires one optical and one SAR observation."],
  },
  evidence: [],
  trace: [
    ev("req_71ba0c93", 1, "input", "FILE RECEIVER", 160, { tool: "ingestion" }),
    ev("req_71ba0c93", 2, "validation", "INPUT VALIDATOR", 780, { tool: "metadata_validator" }),
    ev("req_71ba0c93", 3, "constraints", "MODALITY CHECK", 90, {
      tool: "constraints",
      status: "failed",
      error: "expected optical+sar, received optical+optical",
    }),
    ev("req_71ba0c93", 4, "execution", "FUSION", null, {
      status: "skipped",
      message: "Routing blocked — no fusion executed",
    }),
  ],
  tool: { name: "constraints", version: "v0.1.0" },
  model: { name: "—", version: "—" },
  runtimeMs: 1030,
  temporal: undefined,
  modalityContributions: undefined,
  refusal: {
    title: "INPUT INCOMPATIBLE",
    required: "1 OPTICAL + 1 SAR",
    received: "2 OPTICAL",
    action: "ROUTING BLOCKED — NO FUSION EXECUTED",
    actionHint: "Replace the second observation with a co-registered SAR acquisition.",
  },
};

const opticalTwin: Observation = makeObservation({
  id: "obs-opt-2",
  filename: "resourcesat_optical_b.tif",
  previewUrl: previewAssets.opticalAfter,
  role: "optical",
});

export const incompatibleFusionScenario: DemoScenario = {
  id: "demo-07",
  code: "DEMO 07",
  title: "Incompatible modality pair",
  description: "Fusion requested with two optical observations — routing blocked.",
  observations: [demoObservations.optical, opticalTwin],
  query: incompatibleResult.query,
  result: incompatibleResult,
};

/* ---------------- Scenario catalogue ---------------- */

export const scenarios: DemoScenario[] = [
  goldenScenario,
  ...demoScenarios,
  incompatibleFusionScenario,
];

export const SCENARIO_MODE: Record<string, MissionMode> = {
  golden: "single",
  "demo-01": "single",
  "demo-02": "single",
  "demo-03": "temporal",
  "demo-04": "fusion",
  "demo-05": "single",
  "demo-06": "single",
  "demo-07": "fusion",
};

/* ---------------- Plans ---------------- */

const goldenPlan: WorkflowPlan = {
  mode: "single",
  understanding: {
    intent: "Multi-part scene analysis",
    primaryTask: "Region grounding",
    secondaryTasks: ["Visual question answering", "Scene / land-cover understanding"],
    target: "Water body",
    secondaryTarget: "Built-up area",
    spatialRequest: "Highlight / locate region",
    evidenceRequired: "Spatial mask + grounding region",
    outputMode: "Answer + visual evidence",
    taskGraph: ["single_grounding", "single_vqa", "scene_description"],
  },
  evidenceRequirements: [
    "Water-body localisation",
    "Land-cover interpretation",
    "Built-up detection",
    "Spatial evidence objects",
    "Confidence assessment",
    "Answer verification",
  ],
  routingBranches: ["GROUNDING ENGINE", "REMOTE-SENSING VQA", "SCENE ANALYSIS"],
  preconditions: "satisfied",
  specialists: [
    {
      id: "vqa",
      label: "Remote-sensing VQA",
      tool: "rs_vqa",
      model: "GeoChat-style RS VLM",
      version: "v0.1.0",
      task: "single_vqa",
    },
    {
      id: "grounding",
      label: "Region grounding",
      tool: "grounding",
      model: "RS VLM grounding head",
      version: "v0.1.0",
      task: "single_grounding",
    },
    {
      id: "scene",
      label: "Land-cover analysis",
      tool: "captioning",
      model: "Scene / land-cover head",
      version: "v0.1.0",
      task: "scene_description",
    },
    {
      id: "evidence",
      label: "Evidence generation",
      tool: "evidence_builder",
      model: "—",
      version: "v0.1.0",
      task: "evidence_objects",
    },
  ],
  verification: [
    { label: "Water region ↔ image support", status: "pass" },
    { label: "Built-up claim ↔ spatial support", status: "pass" },
    { label: "Query ↔ output consistency", status: "pass" },
    { label: "Grounding ↔ detection consistency", status: "pass" },
    { label: "Evidence completeness", status: "pass" },
  ],
  verificationStatus: "pass",
  claims: [
    {
      id: "c1",
      text: "Water body located in the north-eastern portion of the scene",
      supportedBy: "Grounding model · rs-vlm v0.1.0",
      evidenceId: "ev-01",
      confidence: 0.91,
    },
    {
      id: "c2",
      text: "Built-up development is present around the water margin",
      supportedBy: "Scene analysis / VQA · rs-vlm v0.1.0",
      evidenceId: "ev-02",
      confidence: 0.84,
    },
    {
      id: "c3",
      text: "Surrounding land cover is mixed vegetation and open / cultivated land",
      supportedBy: "Scene analysis · rs-vlm v0.1.0",
      evidenceId: "ev-02",
      confidence: 0.79,
    },
  ],
};

const temporalPlan: WorkflowPlan = {
  mode: "temporal",
  understanding: {
    intent: "Bi-temporal change analysis",
    primaryTask: "Bi-temporal change VQA",
    secondaryTasks: ["Change detection", "Change classification", "Change localisation"],
    target: "Built-up area",
    secondaryTarget: "Vegetation",
    spatialRequest: "Change direction + location",
    evidenceRequired: "Change mask + change class + spatial localisation",
    outputMode: "Answer + change overlay",
    taskGraph: ["bitemporal_change_detection", "change_vqa", "change_localisation"],
  },
  evidenceRequirements: [
    "Temporal compatibility",
    "Spatial registration quality",
    "Change mask",
    "Change class assignment",
    "Per-region localisation",
    "Answer verification",
  ],
  routingBranches: ["CHANGE DETECTOR", "CHANGE CLASSIFIER", "EVIDENCE VERIFIER"],
  preconditions: "satisfied",
  specialists: [
    {
      id: "reg",
      label: "Spatial registration",
      tool: "spatial_registration",
      model: "phase correlation",
      version: "v0.2.0",
      task: "registration",
    },
    {
      id: "cd",
      label: "Change detection",
      tool: "change_detector",
      model: "Bi-temporal CD",
      version: "v0.4.2",
      task: "change_detection",
    },
    {
      id: "clf",
      label: "Change classification",
      tool: "change_vqa",
      model: "Change classifier",
      version: "v0.4.2",
      task: "change_vqa",
    },
    {
      id: "evidence",
      label: "Evidence generation",
      tool: "evidence_builder",
      model: "—",
      version: "v0.1.0",
      task: "evidence_objects",
    },
  ],
  verification: [
    { label: "Temporal order valid", status: "pass" },
    { label: "Registration residual within tolerance", status: "warn" },
    { label: "Change regions supported in both epochs", status: "pass" },
    { label: "Change class ↔ evidence consistency", status: "pass" },
    { label: "Query ↔ output consistency", status: "pass" },
  ],
  verificationStatus: "pass",
  claims: [
    {
      id: "c1",
      text: "Built-up area increased between T₁ and T₂",
      supportedBy: "Change detector · bitemporal-cd v0.4.2",
      evidenceId: "ev-01",
      confidence: 0.89,
    },
    {
      id: "c2",
      text: "Expansion is concentrated in the eastern and south-eastern sectors",
      supportedBy: "Change classifier · change-clf v0.4.2",
      evidenceId: "ev-02",
      confidence: 0.73,
    },
    {
      id: "c3",
      text: "A southern access corridor was constructed",
      supportedBy: "Change classifier · change-clf v0.4.2",
      evidenceId: "ev-03",
      confidence: 0.81,
    },
  ],
};

const fusionPlan: WorkflowPlan = {
  mode: "fusion",
  understanding: {
    intent: "Multimodal joint interpretation",
    primaryTask: "Optical-SAR fusion analysis",
    secondaryTasks: ["Optical branch analysis", "SAR branch analysis", "Cross-modal agreement"],
    target: "Built-up regions",
    secondaryTarget: "Water-covered regions",
    spatialRequest: "Locate class regions in both observations",
    evidenceRequired: "Optical evidence + SAR evidence + fused evidence",
    outputMode: "Answer + per-modality evidence",
    taskGraph: ["optical_branch", "sar_branch", "cross_modal_fusion"],
  },
  evidenceRequirements: [
    "Modality pair validity",
    "Co-registration",
    "Optical (spectral / contextual) support",
    "SAR (structural / scattering) support",
    "Cross-modal agreement",
    "Answer verification",
  ],
  routingBranches: ["OPTICAL BRANCH", "SAR BRANCH", "CROSS-MODAL FUSION"],
  preconditions: "satisfied",
  specialists: [
    {
      id: "opt",
      label: "Optical encoder",
      tool: "optical_encoder",
      model: "RS VLM optical",
      version: "v0.1.0",
      task: "optical_branch",
    },
    {
      id: "sar",
      label: "SAR encoder",
      tool: "sar_encoder",
      model: "SAR encoder",
      version: "v0.2.0",
      task: "sar_branch",
    },
    {
      id: "fusion",
      label: "Cross-modal fusion",
      tool: "optical_sar_fusion",
      model: "Fusion head",
      version: "v0.2.0",
      task: "cross_modal_fusion",
    },
    {
      id: "evidence",
      label: "Evidence generation",
      tool: "evidence_builder",
      model: "—",
      version: "v0.1.0",
      task: "evidence_objects",
    },
  ],
  verification: [
    { label: "Modality pair optical + SAR", status: "pass" },
    { label: "Co-registration acceptable", status: "pass" },
    { label: "Optical ↔ SAR agreement", status: "pass" },
    { label: "Resolution mismatch handled", status: "warn" },
    { label: "Evidence completeness", status: "pass" },
  ],
  verificationStatus: "pass",
  claims: [
    {
      id: "c1",
      text: "Built-up candidates confirmed by both modalities",
      supportedBy: "Fusion head · fusion v0.2.0",
      evidenceId: "ev-03",
      confidence: 0.92,
    },
    {
      id: "c2",
      text: "Water-covered regions confirmed by specular low backscatter",
      supportedBy: "SAR encoder · sar-enc v0.2.0",
      evidenceId: "ev-04",
      confidence: 0.9,
    },
  ],
};

const refusalPlan: WorkflowPlan = {
  mode: "single",
  understanding: {
    intent: "Bi-temporal change analysis",
    primaryTask: "Bi-temporal change VQA",
    secondaryTasks: ["Change detection"],
    target: "Scene change",
    spatialRequest: "Change direction + location",
    evidenceRequired: "Change mask (2 temporal observations)",
    outputMode: "Blocked — preconditions unmet",
    taskGraph: ["bitemporal_change_detection"],
  },
  evidenceRequirements: [
    "2 temporally corresponding observations",
    "Spatial correspondence",
    "Change mask",
  ],
  routingBranches: ["CHANGE DETECTOR — UNAVAILABLE"],
  preconditions: "blocked",
  specialists: [],
  verification: [{ label: "Required observations present", status: "fail" }],
  verificationStatus: "blocked",
  claims: [],
};

const incompatiblePlan: WorkflowPlan = {
  ...refusalPlan,
  mode: "fusion",
  understanding: {
    ...fusionPlan.understanding,
    outputMode: "Blocked — modality pair incompatible",
  },
  evidenceRequirements: ["1 optical + 1 SAR observation", "Co-registration", "Cross-modal agreement"],
  routingBranches: ["CROSS-MODAL FUSION — BLOCKED"],
  verification: [{ label: "Modality pair optical + SAR", status: "fail" }],
};

const lowConfidencePlan: WorkflowPlan = {
  ...goldenPlan,
  understanding: {
    intent: "Object presence question",
    primaryTask: "Visual question answering",
    secondaryTasks: ["Candidate structure detection"],
    target: "Informal settlements",
    spatialRequest: "Northern sector",
    evidenceRequired: "Structure candidates + class support",
    outputMode: "Answer + stated uncertainty",
    taskGraph: ["single_vqa", "structure_candidates"],
  },
  evidenceRequirements: [
    "Structure candidate detection",
    "Class separation support",
    "Spatial evidence",
    "Confidence assessment",
  ],
  routingBranches: ["REMOTE-SENSING VQA", "SCENE ANALYSIS"],
  specialists: [
    {
      id: "vqa",
      label: "Remote-sensing VQA",
      tool: "rs_vqa",
      model: "GeoChat-style RS VLM",
      version: "v0.1.0",
      task: "single_vqa",
    },
    {
      id: "scene",
      label: "Structure candidates",
      tool: "captioning",
      model: "Scene head",
      version: "v0.1.0",
      task: "scene_description",
    },
  ],
  verification: [
    { label: "Candidate ↔ image support", status: "warn" },
    { label: "Class separation validated", status: "fail" },
    { label: "Query ↔ output consistency", status: "pass" },
  ],
  verificationStatus: "warn",
  claims: [
    {
      id: "c1",
      text: "A potential built-up / structure region exists in the northern sector",
      supportedBy: "RS VQA · rs-vlm v0.1.0",
      evidenceId: "ev-01",
      confidence: 0.41,
    },
    {
      id: "c2",
      text: "Exact settlement boundary and class — UNSUPPORTED",
      supportedBy: "No verified evidence",
      evidenceId: null,
      confidence: null,
    },
  ],
};

const vqaPlan: WorkflowPlan = {
  ...goldenPlan,
  understanding: {
    intent: "Scene composition question",
    primaryTask: "Visual question answering",
    secondaryTasks: ["Scene / land-cover understanding"],
    target: "Dominant land cover",
    spatialRequest: "Full scene extent",
    evidenceRequired: "Scene crops + class support",
    outputMode: "Answer + visual evidence",
    taskGraph: ["single_vqa", "scene_description"],
  },
  evidenceRequirements: [
    "Land-cover interpretation",
    "Spatial evidence",
    "Confidence assessment",
    "Answer verification",
  ],
  routingBranches: ["REMOTE-SENSING VQA", "SCENE ANALYSIS"],
  claims: [
    {
      id: "c1",
      text: "Built-up and vegetated classes dominate the scene",
      supportedBy: "RS VQA · rs-vlm v0.1.0",
      evidenceId: "ev-01",
      confidence: 0.82,
    },
    {
      id: "c2",
      text: "Vegetated parcels occur on the northern and eastern margin",
      supportedBy: "Scene analysis · rs-vlm v0.1.0",
      evidenceId: "ev-02",
      confidence: 0.68,
    },
  ],
};

const groundingPlan: WorkflowPlan = {
  ...goldenPlan,
  understanding: {
    intent: "Spatial localisation request",
    primaryTask: "Region grounding",
    secondaryTasks: [],
    target: "Water body",
    spatialRequest: "Highlight / locate region",
    evidenceRequired: "Spatial mask",
    outputMode: "Answer + mask overlay",
    taskGraph: ["single_grounding"],
  },
  evidenceRequirements: ["Water-body localisation", "Spatial evidence", "Answer verification"],
  routingBranches: ["GROUNDING ENGINE"],
  specialists: [
    {
      id: "grounding",
      label: "Region grounding",
      tool: "grounding",
      model: "RS VLM grounding head",
      version: "v0.1.0",
      task: "single_grounding",
    },
    {
      id: "evidence",
      label: "Evidence generation",
      tool: "evidence_builder",
      model: "—",
      version: "v0.1.0",
      task: "evidence_objects",
    },
  ],
  claims: [
    {
      id: "c1",
      text: "Water body grounded along the northern channel",
      supportedBy: "Grounding model · rs-vlm v0.1.0",
      evidenceId: "ev-01",
      confidence: 0.91,
    },
  ],
};

export const PLANS: Record<string, WorkflowPlan> = {
  golden: goldenPlan,
  "demo-01": vqaPlan,
  "demo-02": groundingPlan,
  "demo-03": temporalPlan,
  "demo-04": fusionPlan,
  "demo-05": refusalPlan,
  "demo-06": lowConfidencePlan,
  "demo-07": incompatiblePlan,
};

/* ---------------- Adaptation / dataset provenance ---------------- */

export const adaptationProvenance = [
  { dataset: "BigEarthNet", role: "Multispectral pretraining / land-cover priors" },
  { dataset: "VRSBench", role: "Captioning · grounding · VQA benchmark" },
  { dataset: "RSVQA", role: "Remote-sensing visual question answering" },
  { dataset: "GeoChat", role: "Grounded remote-sensing VLM capability" },
];

/* ---------------- Input inspection fixtures ---------------- */

export const VALIDATOR_CHECKS = [
  "File structure",
  "CRS",
  "Bands",
  "Image dimensions",
  "Spatial resolution",
  "Nodata",
  "Image quality",
];
