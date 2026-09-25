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
  metadata: {
    width: 8192,
    height: 8192,
    bands: 4,
    crs: "EPSG:4326 (WGS 84)",
    resolutionM: 0.6,
    nodata: 0,
    acquiredAt: "2025-04-12 05:42:19 UTC",
    sensor: "Cartosat-3 MX",
    format: "GeoTIFF (Cloud Optimized)",
    dataType: "uint16",
  },
  validation: {
    status: "validated",
    checks: [
      { id: "readable", label: "File readable", status: "pass" },
      { id: "georeferenced", label: "Georeferenced", status: "pass" },
      { id: "metadata", label: "Metadata extracted", status: "pass" },
      { id: "raster", label: "File structure & IFD", status: "pass" },
      { id: "bands", label: "Band compatibility (4 bands)", status: "pass" },
      { id: "crs", label: "CRS valid (EPSG:4326)", status: "pass" },
      { id: "resolution", label: "Spatial resolution (0.6 m)", status: "pass" },
      { id: "quality", label: "Image quality check", status: "pass" },
    ],
  },
});

const goldenEvidence: EvidenceObject[] = [
  {
    id: "ev-01",
    index: 1,
    type: "mask",
    label: "Water body — grounded region",
    sourceTool: "Grounding Engine",
    sourceVersion: "rs-vlm v0.1.0",
    confidence: 0.91,
    coordinateFrame: "NORMALIZED_IMAGE",
    regionDescription: "North-eastern portion",
    geometry: { x: 0.54, y: 0.04, w: 0.42, h: 0.3 },
    polygon: [
      [0.55, 0.08],
      [0.63, 0.05],
      [0.74, 0.04],
      [0.86, 0.06],
      [0.95, 0.12],
      [0.94, 0.22],
      [0.84, 0.3],
      [0.72, 0.32],
      [0.61, 0.28],
      [0.54, 0.18],
      [0.55, 0.08],
    ],
    coordinates: "23.231°N, 77.446°E",
    quality: "High · Confirmed Grounding",
    createdAt: "2026-09-16T11:02:04Z",
    layer: "before",
  },
  {
    id: "ev-02",
    index: 2,
    type: "bounding_box",
    label: "Surrounding land cover — built-up development",
    sourceTool: "Scene Analysis",
    sourceVersion: "rs-vlm v0.1.0",
    confidence: 0.84,
    coordinateFrame: "NORMALIZED_IMAGE",
    regionDescription: "Central settlement & water margin",
    geometry: { x: 0.18, y: 0.32, w: 0.5, h: 0.46 },
    polygon: [
      [0.18, 0.34],
      [0.35, 0.32],
      [0.52, 0.36],
      [0.68, 0.45],
      [0.65, 0.68],
      [0.48, 0.78],
      [0.26, 0.75],
      [0.18, 0.58],
      [0.18, 0.34],
    ],
    coordinates: "23.204°N, 77.412°E",
    quality: "Good · High Texture Agreement",
    createdAt: "2026-09-16T11:02:05Z",
    layer: "before",
    category: "vegetation_change",
  },
  {
    id: "ev-03",
    index: 3,
    type: "crop",
    label: "Built-up development — structural patch & detection markers",
    sourceTool: "Remote-Sensing VQA",
    sourceVersion: "rs-vlm v0.1.0",
    confidence: 0.88,
    coordinateFrame: "NORMALIZED_IMAGE",
    regionDescription: "Southwest settlement parcel",
    geometry: { x: 0.22, y: 0.42, w: 0.3, h: 0.28 },
    polygon: [
      [0.22, 0.42],
      [0.52, 0.42],
      [0.52, 0.7],
      [0.22, 0.7],
      [0.22, 0.42],
    ],
    coordinates: "23.198°N, 77.405°E",
    quality: "High · Direct Rooftop Detection",
    createdAt: "2026-09-16T11:02:05Z",
    layer: "before",
    category: "built_up_expansion",
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
    "A single contiguous water body was grounded in the north-eastern portion of the scene (E1). Land-cover interpretation of the surrounding extent (E2) returned built-up, vegetation and open / cultivated classes, with built-up development concentrated along the southern and western margin of the water body. High-resolution patch inspection (E3) confirms rooftop and road infrastructure. Built-up presence is therefore confirmed, and it is spatially supported by the grounded region.",
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
    ev(GOLDEN_REQ, 1, "INPUT", "FILE RECEIVER", 180, {
      tool: "ingestion",
      message: "cartosat_demo.tif received and staged for inspection",
      outputArtifacts: ["obs-golden"],
    }),
    ev(GOLDEN_REQ, 2, "VALIDATION", "INPUT VALIDATOR", 820, {
      tool: "metadata_validator",
      parameters: { strict_crs: true, min_bands: 4, target_gsd: 0.6 },
      inputArtifacts: ["obs-golden"],
      outputArtifacts: ["manifest:obs-golden"],
      message: "6/6 checks passed · Ready for analysis",
    }),
    ev(GOLDEN_REQ, 3, "QUERY CLASSIFICATION", "QUERY CLASSIFIER", 410, {
      tool: "query_router",
      modelVersion: "intent-clf v0.3.1",
      message: "single_grounding + single_vqa + scene_analysis",
    }),
    ev(GOLDEN_REQ, 4, "EVIDENCE PLANNING", "EVIDENCE PLANNER", 190, {
      tool: "evidence_planner",
      message: "6 spatial evidence constraints formulated before inference",
    }),
    ev(GOLDEN_REQ, 5, "ROUTING", "QUERY ROUTER", 150, {
      tool: "query_router",
      message: "Auto-routed to Grounding, RS VQA, Scene Analysis & Verifier",
    }),
    ev(GOLDEN_REQ, 6, "VQA", "REMOTE-SENSING VQA", 1780, {
      tool: "rs_vqa",
      modelVersion: "rs-vlm v0.1.0",
      parameters: { prompt: "Is built-up development present?", max_tokens: 160 },
      inputArtifacts: ["obs-golden"],
      outputArtifacts: ["ev-03"],
      message: "Built-up development presence confirmed with high confidence (E3, 88%)",
    }),
    ev(GOLDEN_REQ, 7, "GROUNDING", "GROUNDING ENGINE", 1520, {
      tool: "grounding",
      modelVersion: "rs-vlm v0.1.0",
      parameters: { target: "water body", box_threshold: 0.35, polygon_refine: true },
      outputArtifacts: ["ev-01"],
      message: "Water body localized with bounding region & mask (E1, 91%)",
    }),
    ev(GOLDEN_REQ, 8, "SCENE ANALYSIS", "SCENE ANALYSIS", 1240, {
      tool: "scene_analyzer",
      modelVersion: "rs-vlm v0.1.0",
      outputArtifacts: ["ev-02"],
      message: "Surrounding land cover interpreted: mixed vegetation & built-up (E2, 84%)",
    }),
    ev(GOLDEN_REQ, 9, "VERIFICATION", "EVIDENCE VERIFIER", 560, {
      tool: "evidence_verifier",
      modelVersion: "verifier v0.1.0",
      inputArtifacts: ["ev-01", "ev-02", "ev-03"],
      message: "All 5 verification checks passed: spatial support confirmed",
    }),
    ev(GOLDEN_REQ, 10, "COMPOSITION", "ANSWER COMPOSER", 470, {
      tool: "answer_composer",
      inputArtifacts: ["ev-01", "ev-02", "ev-03"],
      message: "Structured analytical findings composed with evidence audit",
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
  description: "Flagship end-to-end single-image investigation: grounding + VQA + scene analysis.",
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
  "demo-08": "single",
  "demo-09": "single",
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
  routingBranches: [
    "GROUNDING ENGINE",
    "REMOTE-SENSING VQA",
    "SCENE ANALYSIS",
    "EVIDENCE VERIFIER",
  ],
  preconditions: "satisfied",
  specialists: [
    {
      id: "vqa",
      label: "REMOTE-SENSING VQA",
      tool: "rs_vqa",
      model: "GeoChat-style RS VLM",
      version: "v0.1.0",
      task: "single_vqa",
    },
    {
      id: "grounding",
      label: "GROUNDING",
      tool: "grounding",
      model: "RS VLM grounding head",
      version: "v0.1.0",
      task: "single_grounding",
    },
    {
      id: "scene",
      label: "SCENE ANALYSIS",
      tool: "captioning",
      model: "Scene / land-cover head",
      version: "v0.1.0",
      task: "scene_analysis",
    },
    {
      id: "evidence",
      label: "EVIDENCE GENERATION",
      tool: "evidence_builder",
      model: "evidence_gen v0.1.0",
      version: "v0.1.0",
      task: "evidence_objects",
    },
  ],
  verification: [
    { label: "WATER REGION ↔ IMAGE SUPPORT", status: "pass" },
    { label: "BUILT-UP CLAIM ↔ SPATIAL SUPPORT", status: "pass" },
    { label: "QUERY / OUTPUT ↔ CONSISTENT", status: "pass" },
    { label: "EVIDENCE COMPLETENESS ↔ PASS", status: "pass" },
  ],
  verificationStatus: "pass",
  claims: [
    {
      id: "c1",
      text: "Water body located in northeastern region",
      supportedBy: "Grounding Engine",
      evidenceId: "ev-01",
      confidence: 0.91,
    },
    {
      id: "c2",
      text: "Built-up development is present around the water margin",
      supportedBy: "Remote-Sensing VQA & Scene Analysis",
      evidenceId: "ev-02",
      confidence: 0.84,
    },
    {
      id: "c3",
      text: "High-resolution patch inspection confirms rooftop and road infrastructure",
      supportedBy: "Remote-Sensing VQA & Grounding Engine",
      evidenceId: "ev-03",
      confidence: 0.88,
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
  routingBranches: [
    "CHANGE DETECTOR (Measurement)",
    "PROPOSER AGENT (Interpretation)",
    "SKEPTIC AUDITOR (Adversarial Check)",
    "EVIDENCE VERIFIER",
  ],
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
      label: "Change detector (Measurement)",
      tool: "bitemporal_cd",
      model: "Spectral-Spatial CD",
      version: "v0.4.2",
      task: "pixel_measurement",
    },
    {
      id: "proposer",
      label: "Proposer Agent (Interpretation)",
      tool: "change_vqa_proposer",
      model: "RS VQA Proposer",
      version: "v0.4.2",
      task: "candidate_interpretation",
    },
    {
      id: "skeptic",
      label: "Skeptic Auditor (Critique)",
      tool: "spatial_skeptic",
      model: "Adversarial Invalidator",
      version: "v0.4.2",
      task: "adversarial_critique",
    },
    {
      id: "verifier",
      label: "Adversarial Verifier",
      tool: "evidence_verifier",
      model: "Resolution Engine",
      version: "v0.1.0",
      task: "evidence_synthesis",
    },
  ],
  verification: [
    { label: "Temporal order valid (T1 < T2 · 199d)", status: "pass" },
    { label: "Registration residual within tolerance (0.8 px)", status: "warn" },
    { label: "Change regions measured (1.42 km²)", status: "pass" },
    { label: "Proposer hypothesis consistency", status: "pass" },
    { label: "Skeptic adversarial critique evaluated", status: "pass" },
    { label: "Query ↔ output consistency", status: "pass" },
  ],
  verificationStatus: "pass",
  claims: [
    {
      id: "c1",
      text: "Built-up area increased in eastern sector (Region 01)",
      supportedBy: "Change detector & Proposer · bitemporal-cd v0.4.2",
      evidenceId: "ev-01",
      confidence: 0.89,
    },
    {
      id: "c2",
      text: "Vegetation loss detected in southeastern sector (Region 02); built-up status deferred due to crop cycle",
      supportedBy: "Skeptic auditor · adversarial-auditor v0.4.2",
      evidenceId: "ev-02",
      confidence: 0.73,
    },
    {
      id: "c3",
      text: "Southern access corridor infrastructure constructed (Region 03)",
      supportedBy: "Change detector & Verifier · bitemporal-cd v0.4.2",
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
  evidenceRequirements: [
    "1 optical + 1 SAR observation",
    "Co-registration",
    "Cross-modal agreement",
  ],
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

const causalRefusalPlan: WorkflowPlan = {
  mode: "single",
  understanding: {
    intent: "Causal inference query",
    primaryTask: "Why-was-it-built inquiry",
    secondaryTasks: [],
    target: "Site development",
    spatialRequest: "Physical evidence grounding only",
    evidenceRequired: "Socioeconomic / cadastral records (non-observable from raster)",
    outputMode: "Blocked — exceeds sensing capability",
    taskGraph: ["causal_inquiry"],
  },
  evidenceRequirements: [
    "Causal driver explanation (non-observable)",
    "Socioeconomic / cadastral records",
    "Administrative / legal documentation",
  ],
  routingBranches: ["CAUSAL INFERENCE — UNAVAILABLE"],
  preconditions: "blocked",
  specialists: [],
  verification: [{ label: "Physical observability of causal intent", status: "fail" }],
  verificationStatus: "blocked",
  claims: [],
};

const validationFailurePlan: WorkflowPlan = {
  mode: "single",
  understanding: {
    intent: "Validation diagnostics",
    primaryTask: "Input integrity scan",
    secondaryTasks: [],
    target: "Raster integrity",
    spatialRequest: "N/A — no valid input to ground",
    evidenceRequired: "Valid georeferenced raster",
    outputMode: "Blocked — input failed validation",
    taskGraph: ["raster_validation"],
  },
  evidenceRequirements: [
    "Valid georeferenced raster",
    "Raster structure integrity",
    "CRS compatibility",
  ],
  routingBranches: ["SPECIALIST TOOLS — NOT EXECUTED"],
  preconditions: "blocked",
  specialists: [],
  verification: [{ label: "Raster validation gateway", status: "fail" }],
  verificationStatus: "blocked",
  claims: [],
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
  "demo-08": causalRefusalPlan,
  "demo-09": validationFailurePlan,
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
