/**
 * Deterministic demo fixtures. Used only when demo mode is active.
 * Every payload here is clearly labelled DEMO in the UI — never presented as
 * real inference output.
 */
import opticalBefore from "@/assets/optical-before.jpg";
import opticalAfter from "@/assets/optical-after.jpg";
import sarImage from "@/assets/sar.jpg";

import type {
  AnalysisHistoryEntry,
  AnalysisResult,
  EvidenceObject,
  HealthStatus,
  ModelInfo,
  Observation,
  ToolInfo,
  TraceEvent,
} from "./types";

export const previewAssets = {
  opticalBefore,
  opticalAfter,
  sar: sarImage,
};

const validatedChecks = (pair: boolean) => [
  { id: "readable", label: "File readable", status: "pass" as const },
  { id: "raster", label: "Raster structure valid", status: "pass" as const },
  { id: "metadata", label: "Metadata extracted", status: "pass" as const },
  { id: "modality", label: "Modality detected", status: "pass" as const },
  { id: "crs", label: "CRS detected", status: "pass" as const },
  {
    id: "pair",
    label: "Pair compatibility checked",
    status: pair ? ("pass" as const) : ("skipped" as const),
    detail: pair ? undefined : "Single observation — no pair to compare",
  },
];

export function makeObservation(
  partial: Partial<Observation> & Pick<Observation, "id" | "filename" | "previewUrl">,
): Observation {
  return {
    sizeBytes: 184_320_000,
    modality: "optical",
    role: "single",
    metadata: {
      width: 8192,
      height: 8192,
      bands: 4,
      crs: "EPSG:4326",
      resolutionM: 0.6,
      nodata: 0,
      acquiredAt: "2025-04-12",
      sensor: "Cartosat-3 MX",
    },
    validation: {
      status: "validated",
      checks: validatedChecks(false),
    },
    ...partial,
  } as Observation;
}

export const demoObservations = {
  singleOptical: makeObservation({
    id: "obs-01",
    filename: "cartosat_scene_01.tif",
    previewUrl: opticalBefore,
    role: "single",
  }),
  before: makeObservation({
    id: "obs-before",
    filename: "cartosat_before.tif",
    previewUrl: opticalBefore,
    role: "before",
    validation: { status: "validated", checks: validatedChecks(true) },
  }),
  after: makeObservation({
    id: "obs-after",
    filename: "cartosat_after.tif",
    previewUrl: opticalAfter,
    role: "after",
    metadata: {
      width: 8192,
      height: 8192,
      bands: 4,
      crs: "EPSG:4326",
      resolutionM: 0.6,
      nodata: 0,
      acquiredAt: "2025-10-28",
      sensor: "Cartosat-3 MX",
    },
    validation: {
      status: "validated",
      checks: validatedChecks(true),
      registration: { quality: "acceptable", note: "Sub-pixel residual 0.8 px" },
    },
  }),
  optical: makeObservation({
    id: "obs-opt",
    filename: "resourcesat_optical.tif",
    previewUrl: opticalBefore,
    role: "optical",
    validation: { status: "validated", checks: validatedChecks(true) },
  }),
  sar: makeObservation({
    id: "obs-sar",
    filename: "eos04_sar_vv.tif",
    previewUrl: sarImage,
    role: "sar",
    modality: "sar",
    metadata: {
      width: 6144,
      height: 6144,
      bands: 1,
      crs: "EPSG:4326",
      resolutionM: 6,
      nodata: null,
      acquiredAt: "2025-10-30",
      sensor: "EOS-04 C-band VV",
    },
    validation: {
      status: "validated",
      checks: validatedChecks(true),
      registration: { quality: "good" },
    },
  }),
};

/* ---------- Trace helpers ---------- */

let eventCounter = 0;
function traceEvent(
  requestId: string,
  stage: string,
  component: string,
  runtimeMs: number | null,
  extra: Partial<TraceEvent> = {},
): TraceEvent {
  eventCounter += 1;
  return {
    requestId,
    eventId: `evt-${String(eventCounter).padStart(4, "0")}`,
    timestamp: "2026-09-07T12:41:0" + (eventCounter % 10) + "Z",
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

/* ---------- Evidence helpers ---------- */

function evidence(
  index: number,
  partial: Omit<EvidenceObject, "index" | "id" | "createdAt">,
): EvidenceObject {
  return {
    id: `ev-${String(index).padStart(2, "0")}`,
    index,
    createdAt: "2026-09-07T12:41:06Z",
    ...partial,
  };
}

/* ---------- DEMO 01 — Single-image VQA ---------- */

const demo01: AnalysisResult = {
  requestId: "req_8f31c07a",
  name: "SCENE-0031",
  createdAt: "2026-09-07T12:36:11Z",
  query: "What is the dominant land cover in this scene?",
  workflow: {
    id: "single_image_vqa",
    label: "Single-Image VQA",
    requiredObservations: "1 observation",
  },
  intent: {
    workflow: "single_image_vqa",
    label: "SINGLE-IMAGE VQA",
    confidence: 0.94,
    entities: [
      { text: "dominant land cover", type: "attribute" },
      { text: "scene", type: "extent" },
    ],
    requiredInput: "1 observation",
    currentInput: "1 observation",
    compatibility: "compatible",
  },
  route: [
    { id: "input", label: "INPUT", detail: "1 image" },
    { id: "validator", label: "VALIDATOR", detail: "Single optical" },
    { id: "router", label: "ROUTER", detail: "Single-image VQA" },
    { id: "vqa", label: "RS VQA TOOL" },
    { id: "verifier", label: "EVIDENCE VERIFIER" },
    { id: "composer", label: "ANSWER COMPOSER" },
  ],
  observed: [
    "Dense low-rise rooftop texture across the central scene",
    "Contiguous vegetated field parcels on the scene periphery",
    "Two linear water features along the north and west edges",
  ],
  answer: "Built-up and vegetated regions dominate the scene.",
  detailedAnswer:
    "The scene is dominated by a contiguous low-rise built-up settlement occupying the central extent, bordered by agricultural and vegetated parcels. Linear water features are present along the northern and western margins but cover a minor share of the extent.",
  interpretation:
    "Land-cover composition is consistent with a peri-urban settlement surrounded by cultivated land.",
  dominantFeatures: ["Built-up area", "Vegetation", "Water", "Road network"],
  confidence: {
    level: "medium",
    score: 0.71,
    factors: [
      { label: "Evidence completeness", status: "supporting" },
      { label: "Input quality", status: "supporting" },
      { label: "Model agreement", status: "uncertain", detail: "Two of three heads agree" },
    ],
    limitations: [
      "Land-cover shares are qualitative; no per-class area statistics were computed.",
    ],
  },
  evidence: [
    evidence(1, {
      type: "crop",
      label: "Scene crop — central settlement",
      sourceTool: "rs_vqa",
      sourceVersion: "v0.1.0",
      confidence: 0.82,
      regionDescription: "Central sector",
      geometry: { x: 0.28, y: 0.26, w: 0.44, h: 0.46 },
      coordinates: "23.204°N, 77.412°E",
      quality: "Good",
      layer: "before",
    }),
    evidence(2, {
      type: "bounding_box",
      label: "Candidate vegetated parcels",
      sourceTool: "rs_vqa",
      sourceVersion: "v0.1.0",
      confidence: 0.68,
      regionDescription: "Northern and eastern margin",
      geometry: { x: 0.6, y: 0.05, w: 0.36, h: 0.3 },
      coordinates: "23.219°N, 77.441°E",
      quality: "Moderate",
      layer: "before",
    }),
  ],
  trace: [
    traceEvent("req_8f31c07a", "validation", "INPUT VALIDATOR", 900, {
      tool: "metadata_validator",
      parameters: { strict_crs: true },
      outputArtifacts: ["manifest:obs-01"],
    }),
    traceEvent("req_8f31c07a", "classification", "QUERY CLASSIFIER", 380, {
      tool: "query_router",
      modelVersion: "intent-clf v0.3.1",
      parameters: { top_k: 3 },
    }),
    traceEvent("req_8f31c07a", "routing", "WORKFLOW ROUTER", 160, { tool: "query_router" }),
    traceEvent("req_8f31c07a", "execution", "RS VQA", 2100, {
      tool: "rs_vqa",
      modelVersion: "rs-vlm v0.1.0",
      parameters: { max_tokens: 128, temperature: 0 },
      inputArtifacts: ["obs-01"],
      outputArtifacts: ["ev-01", "ev-02"],
    }),
    traceEvent("req_8f31c07a", "verification", "EVIDENCE VERIFIER", 540, {
      tool: "evidence_verifier",
    }),
    traceEvent("req_8f31c07a", "composition", "ANSWER COMPOSER", 420, {
      tool: "answer_composer",
    }),
  ],
  tool: { name: "rs_vqa", version: "v0.1.0" },
  model: { name: "Remote-Sensing VLM", version: "v0.1.0" },
  runtimeMs: 4500,
  source: "demo",
};

/* ---------- DEMO 02 — Grounding ---------- */

const demo02: AnalysisResult = {
  ...demo01,
  requestId: "req_4b90ad12",
  name: "GROUND-0018",
  query: "Highlight the water body.",
  workflow: { id: "grounding", label: "Region Grounding", requiredObservations: "1 observation" },
  intent: {
    workflow: "grounding",
    label: "REGION GROUNDING",
    confidence: 0.97,
    entities: [{ text: "water body", type: "object" }],
    requiredInput: "1 observation",
    currentInput: "1 observation",
    compatibility: "compatible",
  },
  route: [
    { id: "input", label: "INPUT", detail: "1 image" },
    { id: "validator", label: "VALIDATOR" },
    { id: "router", label: "ROUTER", detail: "Grounding" },
    { id: "grounding", label: "GROUNDING TOOL" },
    { id: "verifier", label: "EVIDENCE VERIFIER" },
    { id: "composer", label: "ANSWER COMPOSER" },
  ],
  observed: ["Low-reflectance elongated region along the northern channel"],
  answer: "The water body is grounded along the northern channel of the scene.",
  detailedAnswer:
    "A single contiguous water region was grounded along the northern channel. Spectral response is consistent with open surface water; the mask boundary follows the channel bank.",
  interpretation: "The grounded region corresponds to a perennial river channel.",
  dominantFeatures: undefined,
  confidence: {
    level: "high",
    score: 0.91,
    factors: [
      { label: "Evidence completeness", status: "supporting" },
      { label: "Model agreement", status: "supporting" },
      { label: "Input quality", status: "supporting" },
    ],
    limitations: ["Narrow tributaries below 2 px width may not be delineated."],
  },
  evidence: [
    evidence(1, {
      type: "mask",
      label: "Water body mask",
      sourceTool: "grounding",
      sourceVersion: "v0.1.0",
      confidence: 0.91,
      regionDescription: "Northern channel",
      geometry: { x: 0.2, y: 0.02, w: 0.62, h: 0.28 },
      coordinates: "23.231°N, 77.398°E",
      quality: "Good",
      layer: "before",
    }),
  ],
  tool: { name: "grounding", version: "v0.1.0" },
  runtimeMs: 3800,
};

/* ---------- DEMO 03 — Bi-temporal change VQA ---------- */

const demo03: AnalysisResult = {
  requestId: "req_c71e0042",
  name: "TEMPORAL-0042",
  createdAt: "2026-09-07T12:41:00Z",
  query: "Has the built-up area increased between these two dates, and where?",
  workflow: {
    id: "change_vqa",
    label: "Bi-Temporal Change VQA",
    requiredObservations: "2 temporal observations",
  },
  intent: {
    workflow: "change_vqa",
    label: "BI-TEMPORAL CHANGE VQA",
    confidence: 0.96,
    entities: [
      { text: "built-up area", type: "class" },
      { text: "increase", type: "change_direction" },
      { text: "where", type: "localisation" },
    ],
    requiredInput: "2 temporal observations",
    currentInput: "2 observations",
    compatibility: "compatible",
  },
  route: [
    { id: "input", label: "INPUT", detail: "2 images" },
    { id: "validator", label: "VALIDATOR", detail: "Temporal pair" },
    { id: "router", label: "ROUTER", detail: "Change VQA" },
    { id: "detector", label: "CHANGE DETECTOR" },
    { id: "classifier", label: "CHANGE CLASSIFIER" },
    { id: "verifier", label: "EVIDENCE VERIFIER" },
    { id: "composer", label: "ANSWER COMPOSER" },
  ],
  observed: [
    "Change mask detected over 3 contiguous regions",
    "New rooftop texture present in AFTER, absent in BEFORE (eastern sector)",
    "Loss of vegetated parcel signature in south-eastern sector",
  ],
  answer:
    "Built-up area appears to have increased, concentrated primarily in the eastern and southeastern portions of the scene.",
  detailedAnswer:
    "Comparison of the registered temporal pair indicates net built-up expansion between 12 Apr 2025 and 28 Oct 2025. Three change regions were detected and classified: two as built-up expansion (eastern and southeastern sectors) and one as vegetation loss adjacent to the southeastern expansion front. No built-up removal was detected.",
  interpretation:
    "The pattern is consistent with settlement expansion onto previously cultivated parcels.",
  confidence: {
    level: "high",
    score: 0.88,
    factors: [
      { label: "Evidence completeness", status: "supporting" },
      { label: "Registration quality", status: "supporting", detail: "Residual 0.8 px" },
      { label: "Model agreement", status: "supporting" },
      { label: "Input quality", status: "supporting" },
      { label: "Small-object sensitivity", status: "uncertain" },
    ],
    limitations: [
      "Small objects below the validated resolution threshold may be missed.",
      "Seasonal difference between acquisitions may affect vegetation classes.",
    ],
  },
  evidence: [
    evidence(1, {
      type: "change_region",
      label: "Region 01 — built-up expansion",
      sourceTool: "change_detector",
      sourceVersion: "v0.4.2",
      confidence: 0.89,
      regionDescription: "Eastern sector",
      geometry: { x: 0.62, y: 0.3, w: 0.28, h: 0.24 },
      coordinates: "23.208°N, 77.449°E",
      quality: "Good",
      category: "built_up_expansion",
      layer: "change",
    }),
    evidence(2, {
      type: "change_region",
      label: "Region 02 — vegetation loss",
      sourceTool: "change_detector",
      sourceVersion: "v0.4.2",
      confidence: 0.73,
      regionDescription: "South-eastern sector",
      geometry: { x: 0.56, y: 0.62, w: 0.22, h: 0.2 },
      coordinates: "23.191°N, 77.443°E",
      quality: "Moderate",
      category: "vegetation_change",
      layer: "change",
    }),
    evidence(3, {
      type: "change_mask",
      label: "Region 03 — infrastructure",
      sourceTool: "change_classifier",
      sourceVersion: "v0.4.2",
      confidence: 0.81,
      regionDescription: "Southern access corridor",
      geometry: { x: 0.3, y: 0.74, w: 0.3, h: 0.12 },
      coordinates: "23.184°N, 77.418°E",
      quality: "Good",
      category: "infrastructure",
      layer: "change",
    } as never),
  ],
  trace: [
    traceEvent("req_c71e0042", "validation", "INPUT VALIDATOR", 1200, {
      tool: "metadata_validator",
      parameters: { strict_crs: true, require_pair: true },
      inputArtifacts: ["obs-before", "obs-after"],
      outputArtifacts: ["manifest:pair-0042"],
    }),
    traceEvent("req_c71e0042", "validation", "TEMPORAL COMPATIBILITY", 300, {
      tool: "compatibility",
      message: "Acquisition order valid (2025-04-12 → 2025-10-28)",
    }),
    traceEvent("req_c71e0042", "preprocessing", "REGISTRATION", 700, {
      tool: "spatial_registration",
      parameters: { method: "phase_correlation" },
      message: "Residual 0.8 px — acceptable",
    }),
    traceEvent("req_c71e0042", "classification", "QUERY CLASSIFIER", 400, {
      tool: "query_router",
      modelVersion: "intent-clf v0.3.1",
    }),
    traceEvent("req_c71e0042", "routing", "WORKFLOW ROUTER", 200, { tool: "query_router" }),
    traceEvent("req_c71e0042", "execution", "CHANGE DETECTOR", 2800, {
      tool: "change_detector",
      modelVersion: "bitemporal-cd v0.4.2",
      parameters: { threshold: 0.55, min_region_px: 256 },
      outputArtifacts: ["ev-01", "ev-02", "ev-03"],
    }),
    traceEvent("req_c71e0042", "execution", "CHANGE CLASSIFIER", 1400, {
      tool: "change_vqa",
      modelVersion: "change-clf v0.4.2",
    }),
    traceEvent("req_c71e0042", "verification", "EVIDENCE VERIFIER", 600, {
      tool: "evidence_verifier",
      message: "3/3 regions supported by both observations",
    }),
    traceEvent("req_c71e0042", "composition", "ANSWER COMPOSER", 500, {
      tool: "answer_composer",
    }),
  ],
  tool: { name: "change_vqa", version: "v0.4.2" },
  model: { name: "Bi-Temporal Change Detector", version: "v0.4.2" },
  runtimeMs: 6400,
  temporal: {
    beforeDate: "12 APR 2025",
    afterDate: "28 OCT 2025",
    orderValid: true,
    registration: "acceptable",
  },
  source: "demo",
};

/* ---------- DEMO 04 — Optical + SAR fusion ---------- */

const demo04: AnalysisResult = {
  requestId: "req_2a55b9de",
  name: "FUSION-0007",
  createdAt: "2026-09-07T12:48:12Z",
  query: "Use the optical and SAR images together to identify built-up and water-covered regions.",
  workflow: {
    id: "optical_sar",
    label: "Optical-SAR Multimodal Analysis",
    requiredObservations: "1 optical + 1 SAR observation",
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
    currentInput: "1 optical + 1 SAR",
    compatibility: "compatible",
  },
  route: [
    { id: "input", label: "INPUT", detail: "Optical + SAR" },
    { id: "validator", label: "VALIDATOR" },
    { id: "prep_opt", label: "OPTICAL PREPROCESSOR" },
    { id: "prep_sar", label: "SAR PREPROCESSOR" },
    { id: "fusion", label: "FUSION" },
    { id: "verifier", label: "EVIDENCE VERIFIER" },
    { id: "composer", label: "ANSWER COMPOSER" },
  ],
  observed: [
    "High backscatter clusters in SAR co-located with rooftop texture in optical",
    "Low backscatter smooth regions in SAR co-located with dark optical response",
  ],
  answer:
    "Built-up candidates were identified where high SAR backscatter coincides with optical rooftop texture; water-covered regions where low backscatter coincides with low optical reflectance.",
  detailedAnswer:
    "Joint interpretation of the optical and SAR observations produced two class groups. Built-up candidates are supported by strong structural scattering in SAR and rooftop/edge texture in optical. Water-covered regions are supported by specular low backscatter in SAR and low visible reflectance in optical. Both modalities contribute strongly; disagreement is limited to vegetated field edges.",
  interpretation:
    "Cross-modality agreement raises confidence for both class groups relative to single-modality analysis.",
  confidence: {
    level: "high",
    score: 0.92,
    factors: [
      { label: "Evidence completeness", status: "supporting" },
      { label: "Cross-modality agreement", status: "supporting" },
      { label: "Registration quality", status: "supporting" },
      { label: "Resolution mismatch (0.6 m / 6 m)", status: "uncertain" },
    ],
    limitations: [
      "Contribution indicators are relative model signals, not scientific certainty.",
      "SAR resolution is coarser than optical; small structures may be merged.",
    ],
  },
  evidence: [
    evidence(1, {
      type: "optical_evidence",
      label: "Optical rooftop texture",
      sourceTool: "optical_encoder",
      sourceVersion: "v0.2.0",
      confidence: 0.88,
      regionDescription: "Central settlement",
      geometry: { x: 0.24, y: 0.28, w: 0.4, h: 0.4 },
      coordinates: "23.204°N, 77.412°E",
      quality: "Good",
      layer: "optical",
    }),
    evidence(2, {
      type: "sar_evidence",
      label: "High backscatter cluster",
      sourceTool: "sar_encoder",
      sourceVersion: "v0.2.0",
      confidence: 0.86,
      regionDescription: "Central settlement",
      geometry: { x: 0.26, y: 0.3, w: 0.38, h: 0.38 },
      coordinates: "23.204°N, 77.412°E",
      quality: "Good",
      layer: "sar",
    }),
    evidence(3, {
      type: "fused_evidence",
      label: "Built-up candidate (fused)",
      sourceTool: "optical_sar_fusion",
      sourceVersion: "v0.2.0",
      confidence: 0.92,
      regionDescription: "Central settlement",
      geometry: { x: 0.25, y: 0.29, w: 0.39, h: 0.39 },
      coordinates: "23.204°N, 77.412°E",
      quality: "Good",
      layer: "fused",
    }),
    evidence(4, {
      type: "fused_evidence",
      label: "Water-covered candidate (fused)",
      sourceTool: "optical_sar_fusion",
      sourceVersion: "v0.2.0",
      confidence: 0.9,
      regionDescription: "Southern reservoir",
      geometry: { x: 0.05, y: 0.62, w: 0.5, h: 0.34 },
      coordinates: "23.181°N, 77.392°E",
      quality: "Good",
      layer: "fused",
    }),
  ],
  trace: [
    traceEvent("req_2a55b9de", "validation", "INPUT VALIDATOR", 1100, {
      tool: "metadata_validator",
      message: "Modality pair optical+sar accepted",
    }),
    traceEvent("req_2a55b9de", "preprocessing", "OPTICAL PREPROCESSOR", 900, {
      tool: "optical_preprocessor",
      parameters: { toa_correction: true },
    }),
    traceEvent("req_2a55b9de", "preprocessing", "SAR PREPROCESSOR", 1300, {
      tool: "sar_preprocessor",
      parameters: { speckle_filter: "lee", db_scale: true },
    }),
    traceEvent("req_2a55b9de", "execution", "OPTICAL ENCODER", 1500, {
      tool: "optical_encoder",
      modelVersion: "rs-vlm v0.1.0",
    }),
    traceEvent("req_2a55b9de", "execution", "SAR ENCODER", 1600, {
      tool: "sar_encoder",
      modelVersion: "sar-enc v0.2.0",
    }),
    traceEvent("req_2a55b9de", "execution", "FUSION", 2100, {
      tool: "optical_sar_fusion",
      modelVersion: "fusion v0.2.0",
      outputArtifacts: ["ev-03", "ev-04"],
    }),
    traceEvent("req_2a55b9de", "verification", "EVIDENCE VERIFIER", 600, {
      tool: "evidence_verifier",
    }),
    traceEvent("req_2a55b9de", "composition", "ANSWER COMPOSER", 500, {
      tool: "answer_composer",
    }),
  ],
  tool: { name: "optical_sar_fusion", version: "v0.2.0" },
  model: { name: "Optical-SAR Fusion", version: "v0.2.0" },
  runtimeMs: 9600,
  modalityContributions: [
    { modality: "optical", contribution: "high", note: "Spectral / visual context" },
    { modality: "sar", contribution: "high", note: "Structural / scattering response" },
  ],
  fusionConfidence: 0.92,
  source: "demo",
};

/* ---------- DEMO 05 — Refusal ---------- */

const demo05: AnalysisResult = {
  requestId: "req_bd1140f9",
  name: "REFUSAL-0003",
  createdAt: "2026-09-07T12:52:40Z",
  query: "What changed?",
  workflow: {
    id: "unsupported",
    label: "Refused — Incompatible Input",
    requiredObservations: "2 temporal observations",
  },
  intent: {
    workflow: "change_vqa",
    label: "BI-TEMPORAL CHANGE VQA",
    confidence: 0.95,
    entities: [{ text: "changed", type: "change_direction" }],
    requiredInput: "2 temporal observations",
    currentInput: "1 observation",
    compatibility: "incompatible",
  },
  route: [
    { id: "input", label: "INPUT", detail: "1 image" },
    { id: "validator", label: "VALIDATOR" },
    { id: "classifier", label: "QUERY CLASSIFIER", detail: "Change VQA" },
    { id: "compat", label: "COMPATIBILITY CHECK", detail: "FAILED" },
    { id: "halt", label: "SPECIALIST TOOLS NOT EXECUTED" },
  ],
  observed: [],
  answer: "",
  detailedAnswer: "",
  interpretation: "",
  confidence: {
    level: "unsupported",
    score: null,
    factors: [{ label: "Required inputs present", status: "missing" }],
    limitations: ["Change analysis requires two temporally corresponding observations."],
  },
  evidence: [],
  trace: [
    traceEvent("req_bd1140f9", "validation", "INPUT VALIDATOR", 850, {
      tool: "metadata_validator",
    }),
    traceEvent("req_bd1140f9", "classification", "QUERY CLASSIFIER", 380, {
      tool: "query_router",
      modelVersion: "intent-clf v0.3.1",
      message: "Intent: change_vqa",
    }),
    traceEvent("req_bd1140f9", "constraints", "COMPATIBILITY CHECK", 120, {
      tool: "constraints",
      status: "failed",
      error: "requires 2 temporal observations, received 1",
    }),
    traceEvent("req_bd1140f9", "execution", "SPECIALIST TOOLS", null, {
      status: "skipped",
      message: "Not executed — incompatible input",
    }),
  ],
  tool: { name: "constraints", version: "v0.1.0" },
  model: { name: "—", version: "—" },
  runtimeMs: 1350,
  refusal: {
    title: "CANNOT EXECUTE",
    required: "2 temporally corresponding observations",
    received: "1 image",
    action: "UPLOAD SECOND OBSERVATION",
    actionHint: "Add an observation acquired at a different date to enable change analysis.",
  },
  source: "demo",
};

/* ---------- DEMO 06 — Low confidence ---------- */

const demo06: AnalysisResult = {
  ...demo01,
  requestId: "req_66a2f4c1",
  name: "SCENE-0032",
  query: "Are there any informal settlements in the northern sector?",
  observed: ["Weak, discontinuous rooftop texture in the northern sector"],
  answer:
    "The available evidence is insufficient for a high-confidence conclusion about informal settlements.",
  detailedAnswer:
    "Candidate structures were detected in the northern sector, but their extent and texture do not reliably separate informal settlement from mixed agricultural infrastructure at this resolution. Model heads disagree on the class assignment.",
  interpretation: "No supported interpretation. Review the evidence before drawing conclusions.",
  dominantFeatures: undefined,
  confidence: {
    level: "low",
    score: 0.34,
    factors: [
      { label: "Evidence completeness", status: "uncertain", detail: "Partial" },
      { label: "Model agreement", status: "missing", detail: "Low" },
      { label: "Input quality", status: "uncertain", detail: "Moderate" },
    ],
    limitations: [
      "Structure class separation is not validated at this ground sampling distance.",
    ],
  },
  evidence: [
    evidence(1, {
      type: "bounding_box",
      label: "Candidate structures (unverified)",
      sourceTool: "rs_vqa",
      sourceVersion: "v0.1.0",
      confidence: 0.41,
      regionDescription: "Northern sector",
      geometry: { x: 0.34, y: 0.06, w: 0.26, h: 0.2 },
      coordinates: "23.226°N, 77.418°E",
      quality: "Low",
      layer: "before",
    }),
  ],
  runtimeMs: 4100,
};

export interface DemoScenario {
  id: string;
  code: string;
  title: string;
  description: string;
  observations: Observation[];
  query: string;
  result: AnalysisResult;
}

export const demoScenarios: DemoScenario[] = [
  {
    id: "demo-01",
    code: "DEMO 01",
    title: "Single-image VQA",
    description: "One optical scene, natural-language scene question.",
    observations: [demoObservations.singleOptical],
    query: demo01.query,
    result: demo01,
  },
  {
    id: "demo-02",
    code: "DEMO 02",
    title: "Grounding",
    description: "Locate a named object and return a spatial mask.",
    observations: [demoObservations.singleOptical],
    query: demo02.query,
    result: demo02,
  },
  {
    id: "demo-03",
    code: "DEMO 03",
    title: "Bi-temporal change",
    description: "Registered temporal pair, change detection + change VQA.",
    observations: [demoObservations.before, demoObservations.after],
    query: demo03.query,
    result: demo03,
  },
  {
    id: "demo-04",
    code: "DEMO 04",
    title: "Optical-SAR fusion",
    description: "Multimodal joint interpretation with contribution indicators.",
    observations: [demoObservations.optical, demoObservations.sar],
    query: demo04.query,
    result: demo04,
  },
  {
    id: "demo-05",
    code: "DEMO 05",
    title: "Invalid input",
    description: "Change question with a single image — refused before inference.",
    observations: [demoObservations.singleOptical],
    query: demo05.query,
    result: demo05,
  },
  {
    id: "demo-06",
    code: "DEMO 06",
    title: "Low confidence",
    description: "Insufficient evidence — uncertainty is surfaced, not hidden.",
    observations: [demoObservations.singleOptical],
    query: demo06.query,
    result: demo06,
  },
];

export const demoResults: AnalysisResult[] = demoScenarios.map((s) => s.result);

export const demoHistory: AnalysisHistoryEntry[] = [
  {
    id: demo03.requestId,
    time: "12:41",
    query: demo03.query,
    workflowLabel: "Bi-temporal Change VQA",
    inputSummary: "2 images",
    confidence: "high",
    status: "completed",
    runtimeMs: 6400,
  },
  {
    id: demo04.requestId,
    time: "12:48",
    query: demo04.query,
    workflowLabel: "Optical-SAR Fusion",
    inputSummary: "optical + SAR",
    confidence: "high",
    status: "completed",
    runtimeMs: 9600,
  },
  {
    id: demo05.requestId,
    time: "12:52",
    query: demo05.query,
    workflowLabel: "Refused — incompatible",
    inputSummary: "1 image",
    confidence: "unsupported",
    status: "refused",
    runtimeMs: 1350,
  },
  {
    id: demo01.requestId,
    time: "12:36",
    query: demo01.query,
    workflowLabel: "Single-image VQA",
    inputSummary: "1 image",
    confidence: "medium",
    status: "completed",
    runtimeMs: 4500,
  },
  {
    id: demo02.requestId,
    time: "12:29",
    query: demo02.query,
    workflowLabel: "Grounding",
    inputSummary: "1 image",
    confidence: "high",
    status: "completed",
    runtimeMs: 3800,
  },
  {
    id: demo06.requestId,
    time: "12:18",
    query: demo06.query,
    workflowLabel: "Single-image VQA",
    inputSummary: "1 image",
    confidence: "low",
    status: "completed",
    runtimeMs: 4100,
  },
];

export const demoModels: ModelInfo[] = [
  {
    id: "rs-vlm",
    name: "Remote-Sensing VLM",
    roles: ["VQA", "Captioning", "Grounding"],
    version: "v0.1.0",
    status: "ready",
    input: "1 optical raster + text",
    output: "Answer, caption, regions",
  },
  {
    id: "bitemporal-cd",
    name: "Bi-Temporal Change Detector",
    roles: ["Change Detection"],
    version: "v0.4.2",
    status: "ready",
    input: "2 registered rasters",
    output: "Change mask, regions",
  },
  {
    id: "change-clf",
    name: "Change Classifier",
    roles: ["Change VQA"],
    version: "v0.4.2",
    status: "ready",
    input: "Change regions + text",
    output: "Change category, answer",
  },
  {
    id: "fusion",
    name: "Optical-SAR Fusion",
    roles: ["Multimodal Analysis"],
    version: "v0.2.0",
    status: "ready",
    input: "1 optical + 1 SAR raster",
    output: "Fused evidence, contributions",
  },
  {
    id: "intent-clf",
    name: "Intent Classifier",
    roles: ["Query Classification"],
    version: "v0.3.1",
    status: "ready",
    input: "Query text + input manifest",
    output: "Workflow, entities",
  },
];

export const demoTools: ToolInfo[] = [
  {
    id: "metadata_validator",
    name: "metadata_validator",
    acceptedInputs: "GeoTIFF, TIFF, PNG, JPEG",
    requiredMetadata: "Raster structure",
    outputs: "Manifest, validation report",
    version: "v0.1.0",
    status: "online",
  },
  {
    id: "query_router",
    name: "query_router",
    acceptedInputs: "Query text + manifest",
    requiredMetadata: "Modality, count",
    outputs: "Workflow, entities",
    version: "v0.3.1",
    status: "online",
  },
  {
    id: "rs_vqa",
    name: "rs_vqa",
    acceptedInputs: "1 optical raster + text",
    requiredMetadata: "Bands, CRS",
    outputs: "Answer, crop evidence",
    version: "v0.1.0",
    status: "online",
  },
  {
    id: "captioning",
    name: "captioning",
    acceptedInputs: "1 raster",
    requiredMetadata: "Bands",
    outputs: "Scene description, features",
    version: "v0.1.0",
    status: "online",
  },
  {
    id: "grounding",
    name: "grounding",
    acceptedInputs: "1 raster + target phrase",
    requiredMetadata: "CRS, resolution",
    outputs: "Mask, box",
    version: "v0.1.0",
    status: "online",
  },
  {
    id: "change_detector",
    name: "change_detector",
    acceptedInputs: "2 registered rasters",
    requiredMetadata: "CRS, acquisition dates",
    outputs: "Change mask, regions",
    version: "v0.4.2",
    status: "online",
  },
  {
    id: "change_vqa",
    name: "change_vqa",
    acceptedInputs: "Change regions + text",
    requiredMetadata: "Temporal order",
    outputs: "Answer, categories",
    version: "v0.4.2",
    status: "online",
  },
  {
    id: "optical_sar_fusion",
    name: "optical_sar_fusion",
    acceptedInputs: "1 optical + 1 SAR",
    requiredMetadata: "CRS, modality",
    outputs: "Fused evidence",
    version: "v0.2.0",
    status: "online",
  },
  {
    id: "evidence_verifier",
    name: "evidence_verifier",
    acceptedInputs: "Evidence set",
    requiredMetadata: "Source artifacts",
    outputs: "Verification report",
    version: "v0.1.0",
    status: "online",
  },
  {
    id: "answer_composer",
    name: "answer_composer",
    acceptedInputs: "Evidence + confidence",
    requiredMetadata: "—",
    outputs: "Answer, limitations",
    version: "v0.1.0",
    status: "online",
  },
  {
    id: "report_generator",
    name: "report_generator",
    acceptedInputs: "Analysis record",
    requiredMetadata: "Trace, evidence",
    outputs: "Markdown, PDF",
    version: "v0.1.0",
    status: "online",
  },
];

export const demoHealth: HealthStatus = {
  api: "online",
  inference: "ready",
  gpu: "1 × A100 40GB",
  toolsOnline: 5,
  toolsTotal: 5,
};
