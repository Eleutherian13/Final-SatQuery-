/**
 * Deterministic demo fixtures. Used only when demo mode is active.
 * Every payload here is clearly labelled DEMO in the UI — never presented as
 * real inference output.
 */

export const fallbackOpticalBefore = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="1024" height="1024">
  <defs>
    <radialGradient id="bg" cx="50%" cy="50%" r="70%">
      <stop offset="0%" stop-color="#1a2e26"/>
      <stop offset="50%" stop-color="#14241e"/>
      <stop offset="100%" stop-color="#0f1b16"/>
    </radialGradient>
    <linearGradient id="river" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f3b5f"/>
      <stop offset="50%" stop-color="#174f7c"/>
      <stop offset="100%" stop-color="#0c2d49"/>
    </linearGradient>
    <pattern id="urbanGrid" width="40" height="40" patternUnits="userSpaceOnUse">
      <rect width="36" height="36" fill="#334155" opacity="0.4" rx="2"/>
      <rect x="4" y="4" width="28" height="28" fill="#475569" opacity="0.3"/>
      <line x1="0" y1="38" x2="40" y2="38" stroke="#1e293b" stroke-width="2"/>
      <line x1="38" y1="0" x2="38" y2="40" stroke="#1e293b" stroke-width="2"/>
    </pattern>
  </defs>
  <rect width="1024" height="1024" fill="url(#bg)"/>
  <polygon points="40,80 320,60 360,280 80,300" fill="#2d4a3e" opacity="0.6"/>
  <polygon points="340,50 680,40 650,220 370,250" fill="#233d32" opacity="0.7"/>
  <polygon points="700,60 980,80 940,320 670,240" fill="#355849" opacity="0.5"/>
  <polygon points="60,650 400,600 450,920 80,960" fill="#254336" opacity="0.65"/>
  <polygon points="580,620 960,600 980,950 620,960" fill="#1e362c" opacity="0.75"/>
  <path d="M-20,420 C180,400 260,350 420,380 C580,410 650,560 760,540 C870,520 920,440 1040,460 L1040,580 C900,560 840,640 730,660 C610,680 520,530 380,500 C240,470 160,510 -20,540 Z" fill="url(#river)"/>
  <rect x="260" y="140" width="220" height="180" fill="url(#urbanGrid)"/>
  <rect x="540" y="120" width="260" height="200" fill="url(#urbanGrid)"/>
  <rect x="220" y="660" width="340" height="260" fill="url(#urbanGrid)"/>
  <path d="M-20,240 L1040,220" stroke="#64748b" stroke-width="4" opacity="0.6"/>
  <path d="M-20,780 L1040,760" stroke="#64748b" stroke-width="4" opacity="0.6"/>
  <path d="M480,-20 L500,1040" stroke="#64748b" stroke-width="4" opacity="0.6"/>
  <line x1="0" y1="512" x2="1024" y2="512" stroke="#94a3b8" stroke-width="1" stroke-dasharray="4,8" opacity="0.2"/>
  <line x1="512" y1="0" x2="512" y2="1024" stroke="#94a3b8" stroke-width="1" stroke-dasharray="4,8" opacity="0.2"/>
  <rect x="20" y="20" width="410" height="28" fill="#000" opacity="0.6" rx="3"/>
  <text x="30" y="39" fill="#38bdf8" font-family="monospace" font-size="11" font-weight="bold" letter-spacing="2">CARTOSAT-3 MX · 0.6m GSD · OPTICAL T1</text>
</svg>`)}`;

export const fallbackOpticalAfter = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="1024" height="1024">
  <defs>
    <radialGradient id="bg2" cx="50%" cy="50%" r="70%">
      <stop offset="0%" stop-color="#1a2e26"/>
      <stop offset="50%" stop-color="#14241e"/>
      <stop offset="100%" stop-color="#0f1b16"/>
    </radialGradient>
    <linearGradient id="river2" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f3b5f"/>
      <stop offset="50%" stop-color="#174f7c"/>
      <stop offset="100%" stop-color="#0c2d49"/>
    </linearGradient>
    <pattern id="urbanGrid2" width="40" height="40" patternUnits="userSpaceOnUse">
      <rect width="36" height="36" fill="#334155" opacity="0.4" rx="2"/>
      <rect x="4" y="4" width="28" height="28" fill="#475569" opacity="0.3"/>
      <line x1="0" y1="38" x2="40" y2="38" stroke="#1e293b" stroke-width="2"/>
      <line x1="38" y1="0" x2="38" y2="40" stroke="#1e293b" stroke-width="2"/>
    </pattern>
    <pattern id="newDev" width="30" height="30" patternUnits="userSpaceOnUse">
      <rect width="28" height="28" fill="#cbd5e1" opacity="0.5" rx="1"/>
      <line x1="0" y1="29" x2="30" y2="29" stroke="#94a3b8" stroke-width="1.5"/>
    </pattern>
  </defs>
  <rect width="1024" height="1024" fill="url(#bg2)"/>
  <polygon points="40,80 320,60 360,280 80,300" fill="#2d4a3e" opacity="0.6"/>
  <polygon points="340,50 680,40 650,220 370,250" fill="#233d32" opacity="0.7"/>
  <polygon points="700,60 980,80 940,320 670,240" fill="#355849" opacity="0.5"/>
  <polygon points="60,650 400,600 450,920 80,960" fill="#254336" opacity="0.65"/>
  <path d="M-20,420 C180,400 260,350 420,380 C580,410 650,560 760,540 C870,520 920,440 1040,460 L1040,580 C900,560 840,640 730,660 C610,680 520,530 380,500 C240,470 160,510 -20,540 Z" fill="url(#river2)"/>
  <rect x="260" y="140" width="220" height="180" fill="url(#urbanGrid2)"/>
  <rect x="540" y="120" width="260" height="200" fill="url(#urbanGrid2)"/>
  <rect x="220" y="660" width="340" height="260" fill="url(#urbanGrid2)"/>
  
  <!-- New expansion in south-east -->
  <rect x="580" y="640" width="360" height="280" fill="url(#newDev)"/>
  
  <path d="M-20,240 L1040,220" stroke="#64748b" stroke-width="4" opacity="0.6"/>
  <path d="M-20,780 L1040,760" stroke="#64748b" stroke-width="4" opacity="0.6"/>
  <path d="M480,-20 L500,1040" stroke="#64748b" stroke-width="4" opacity="0.6"/>
  <rect x="20" y="20" width="410" height="28" fill="#000" opacity="0.6" rx="3"/>
  <text x="30" y="39" fill="#38bdf8" font-family="monospace" font-size="11" font-weight="bold" letter-spacing="2">CARTOSAT-3 MX · OPTICAL T2 (AFTER)</text>
</svg>`)}`;

export const fallbackSar = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="1024" height="1024">
  <defs>
    <radialGradient id="sarBg" cx="50%" cy="50%" r="70%">
      <stop offset="0%" stop-color="#1e242b"/>
      <stop offset="50%" stop-color="#14181d"/>
      <stop offset="100%" stop-color="#0a0d10"/>
    </radialGradient>
    <pattern id="speckle" width="20" height="20" patternUnits="userSpaceOnUse">
      <circle cx="3" cy="7" r="1" fill="#fff" opacity="0.25"/>
      <circle cx="12" cy="4" r="0.8" fill="#fff" opacity="0.3"/>
      <circle cx="17" cy="15" r="1.2" fill="#fff" opacity="0.2"/>
      <circle cx="8" cy="18" r="0.6" fill="#fff" opacity="0.35"/>
    </pattern>
    <pattern id="doubleBounce" width="24" height="24" patternUnits="userSpaceOnUse">
      <rect width="20" height="20" fill="#e2e8f0" opacity="0.85"/>
      <rect x="2" y="2" width="16" height="16" fill="#ffffff" opacity="0.95"/>
    </pattern>
  </defs>
  <rect width="1024" height="1024" fill="url(#sarBg)"/>
  <rect width="1024" height="1024" fill="url(#speckle)"/>
  
  <!-- Smooth specular water body (Low backscatter - dark) -->
  <path d="M-20,420 C180,400 260,350 420,380 C580,410 650,560 760,540 C870,520 920,440 1040,460 L1040,580 C900,560 840,640 730,660 C610,680 520,530 380,500 C240,470 160,510 -20,540 Z" fill="#040608"/>

  <!-- High double-bounce structural clusters (Buildings) -->
  <rect x="260" y="140" width="220" height="180" fill="url(#doubleBounce)"/>
  <rect x="540" y="120" width="260" height="200" fill="url(#doubleBounce)"/>
  <rect x="220" y="660" width="340" height="260" fill="url(#doubleBounce)"/>

  <!-- Telemetry Stamp -->
  <rect x="20" y="20" width="410" height="28" fill="#000" opacity="0.6" rx="3"/>
  <text x="30" y="39" fill="#a855f7" font-family="monospace" font-size="11" font-weight="bold" letter-spacing="2">EOS-04 C-BAND SAR · VV+VH DUAL-POL</text>
</svg>`)}`;

const opticalBefore = fallbackOpticalBefore;
const opticalAfter = fallbackOpticalAfter;
const sarImage = fallbackSar;

export const previewAssets = {
  opticalBefore,
  opticalAfter,
  sar: sarImage,
};

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
  partial: Omit<EvidenceObject, "index" | "id" | "createdAt" | "coordinateFrame"> & {
    coordinateFrame?: EvidenceObject["coordinateFrame"];
  },
): EvidenceObject {
  return {
    id: `ev-${String(index).padStart(2, "0")}`,
    index,
    createdAt: "2026-09-07T12:41:06Z",
    coordinateFrame: "NORMALIZED_IMAGE",
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
    limitations: ["Land-cover shares are qualitative; no per-class area statistics were computed."],
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
    { id: "input", label: "INPUT", detail: "2 temporal images" },
    { id: "validator", label: "TEMPORAL VALIDATOR", detail: "order + registration" },
    { id: "planner", label: "EVIDENCE PLANNER", detail: "change constraints" },
    { id: "detector", label: "CHANGE DETECTOR", detail: "measurement (1.42 km²)" },
    { id: "proposer", label: "PROPOSER", detail: "interpretation hypothesis" },
    { id: "skeptic", label: "SKEPTIC", detail: "adversarial critique" },
    { id: "verifier", label: "EVIDENCE VERIFIER", detail: "adversarial resolution" },
    { id: "composer", label: "ANSWER COMPOSER" },
  ],
  observed: [
    "Change mask detected over 3 contiguous regions (1.42 km² total difference)",
    "New rooftop texture present in AFTER, absent in BEFORE (eastern sector)",
    "Loss of vegetated parcel signature in south-eastern sector (agricultural harvest context)",
  ],
  answer:
    "Built-up area appears to have increased, concentrated primarily in the eastern sector; southeastern sector vegetation loss qualified by seasonal phenology.",
  detailedAnswer:
    "Comparison of the registered temporal pair indicates confirmed built-up expansion in the eastern sector (Region 01) and new access corridor infrastructure (Region 03) between 12 Apr 2025 and 28 Oct 2025. Following adversarial review by the Skeptic auditor, Region 02 is qualified as vegetation loss rather than confirmed built-up expansion due to spectral consistency with seasonal crop harvest. A 0.8 px co-registration residual is an active limitation.",
  interpretation:
    "The pattern is consistent with settlement expansion onto previously cultivated parcels.",
  confidence: {
    level: "high",
    score: 0.88,
    factors: [
      { label: "Change evidence measurement", status: "supporting", detail: "3 candidate regions" },
      { label: "Registration quality", status: "supporting", detail: "Residual 0.8 px (warning)" },
      {
        label: "Proposer / Skeptic agreement",
        status: "uncertain",
        detail: "R02 contested by Skeptic",
      },
      { label: "Evidence completeness", status: "supporting", detail: "3/3 regions audited" },
      {
        label: "Seasonal phenology robustness",
        status: "uncertain",
        detail: "Dry vs post-monsoon",
      },
    ],
    limitations: [
      "Registration residual uncertainty (0.8 px) qualifies boundary precision in narrow linear features (Region 03).",
      "Seasonal agricultural phenology between April and October may account for vegetation reflectance drop in Region 02; built-up status deferred.",
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
      type: "change_region",
      label: "Region 03 — infrastructure corridor",
      sourceTool: "change_detector",
      sourceVersion: "v0.4.2",
      confidence: 0.81,
      regionDescription: "Southern access corridor",
      geometry: { x: 0.3, y: 0.74, w: 0.3, h: 0.12 },
      coordinates: "23.184°N, 77.418°E",
      quality: "Good",
      category: "infrastructure",
      layer: "change",
    }),
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
      message: "Acquisition order valid (2025-04-12 → 2025-10-28 · Δ 199 days)",
    }),
    traceEvent("req_c71e0042", "preprocessing", "REGISTRATION", 700, {
      tool: "spatial_registration",
      parameters: { method: "phase_correlation" },
      message: "Residual 0.8 px — warning flag raised for narrow linear boundaries",
    }),
    traceEvent("req_c71e0042", "classification", "QUERY CLASSIFIER", 400, {
      tool: "query_router",
      modelVersion: "intent-clf v0.3.1",
    }),
    traceEvent("req_c71e0042", "routing", "DECISION ENGINE", 200, {
      tool: "jev",
      message: "Routed to Change Detector, Proposer Agent, Skeptic Auditor, and Verifier",
    }),
    traceEvent("req_c71e0042", "measurement", "CHANGE DETECTOR", 2800, {
      tool: "bitemporal_cd",
      modelVersion: "v0.4.2",
      parameters: { threshold: 0.55, min_region_px: 256, method: "spectral_difference" },
      outputArtifacts: ["mask:change", "regions:r1_r2_r3"],
      message: "Measurement: 1.42 km² total difference detected across 3 candidate regions",
    }),
    traceEvent("req_c71e0042", "interpretation", "PROPOSER", 1200, {
      tool: "change_vqa_proposer",
      modelVersion: "rs-vqa v0.4.2",
      outputArtifacts: ["hypotheses:h1"],
      message: "Proposer: Built-up expansion hypothesized in eastern & southeastern sectors",
    }),
    traceEvent("req_c71e0042", "adversarial_critique", "SKEPTIC", 1100, {
      tool: "spatial_skeptic",
      modelVersion: "adversarial-auditor v0.4.2",
      outputArtifacts: ["critique:c1"],
      message: "Skeptic: 0.8px residual checked; Region 02 contested due to seasonal crop variance",
    }),
    traceEvent("req_c71e0042", "verification", "EVIDENCE VERIFIER", 600, {
      tool: "evidence_verifier",
      outputArtifacts: ["ev-01", "ev-02", "ev-03"],
      message:
        "Adversarial resolution: R01 confirmed, R02 qualified as vegetation loss, R03 road corridor confirmed",
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
  biTemporal: {
    validation: {
      imageCount: 2,
      beforeDate: "2025-04-12",
      afterDate: "2025-10-28",
      orderValid: true,
      deltaDays: 199,
      spatialCorrespondence: {
        overlapPercent: 99.4,
        footprintMatch: true,
        intersectionAreaKm2: 24.1,
      },
      crsCompatibility: {
        beforeCrs: "EPSG:4326 (WGS 84)",
        afterCrs: "EPSG:4326 (WGS 84)",
        compatible: true,
      },
      registration: {
        status: "registered",
        quality: "acceptable",
        residualPx: 0.8,
        tolerancePx: 1.5,
        warning: "Sub-pixel residual 0.8 px detected; edge boundary uncertainty present.",
      },
    },
    measurement: {
      tool: "bitemporal_cd",
      version: "v0.4.2",
      method: "Deep Spectral-Spatial Difference + Feature Correlation",
      totalChangeAreaKm2: 1.42,
      pixelDifferenceThreshold: 0.55,
      candidateRegions: [
        {
          id: "r1",
          label: "Region 01 — Eastern Sector",
          areaKm2: 0.58,
          rawDifferenceScore: 0.89,
          spectralShift: "Red/NIR reflectance surge + high texture contrast",
          geometry: { x: 0.62, y: 0.3, w: 0.28, h: 0.24 },
        },
        {
          id: "r2",
          label: "Region 02 — South-Eastern Sector",
          areaKm2: 0.44,
          rawDifferenceScore: 0.73,
          spectralShift: "NDVI decrease -0.38, moderate texture change",
          geometry: { x: 0.56, y: 0.62, w: 0.22, h: 0.2 },
        },
        {
          id: "r3",
          label: "Region 03 — Southern Access Corridor",
          areaKm2: 0.4,
          rawDifferenceScore: 0.81,
          spectralShift: "Linear high-reflectance feature, low backscatter",
          geometry: { x: 0.3, y: 0.74, w: 0.3, h: 0.12 },
        },
      ],
    },
    proposer: {
      model: "Change-VQA Proposer Agent v0.4.2",
      hypothesis:
        "Built-up area appears to have increased significantly between 12 Apr 2025 and 28 Oct 2025, concentrated in the eastern sector, accompanied by vegetation conversion in the southeast and new infrastructure development along the southern corridor.",
      proposedChanges: [
        {
          regionId: "r1",
          label: "Region 01",
          classLabel: "Built-up expansion",
          confidence: 0.92,
          rationale: "Rectilinear rooftop clusters and compacted foundation pads in T2.",
        },
        {
          regionId: "r2",
          label: "Region 02",
          classLabel: "Vegetation clearance / Built-up front",
          confidence: 0.84,
          rationale: "Vegetated parcel cleared for settlement expansion.",
        },
        {
          regionId: "r3",
          label: "Region 03",
          classLabel: "Infrastructure / Access road",
          confidence: 0.86,
          rationale: "Linear graded corridor connecting western parcel to main road.",
        },
      ],
      summary: "Net positive built-up growth across all 3 detected change clusters.",
    },
    skeptic: {
      model: "Adversarial Spatial Auditor v0.4.2",
      registrationVulnerability: {
        couldBeArtifact: true,
        residualPx: 0.8,
        analysis:
          "Sub-pixel residual is 0.8 px. For Region 01 (broad parcel), 0.8 px cannot create false positive rooftop clusters. For Region 03 (narrow corridor), edge aliasing inflates corridor width by up to 1.6 px. Boundary width is qualified.",
      },
      spatialCoherence: {
        coherent: true,
        analysis:
          "Region 01 is highly coherent (clustered buildings, 0.94 coherence index). Region 02 shows diffuse spectral shift consistent with dry-season senescence / harvest rather than permanent built-up impervious surface.",
      },
      evidenceSufficiency: {
        sufficient: true,
        analysis:
          "Region 01: High confidence. Sufficient. Region 02: Insufficient spectral proof of built-up paving; vegetation loss confirmed, but built-up status unverified. Region 03: Sufficient for roadway grading, insufficient for surface type.",
      },
      contradictions: [
        "Contradiction on Region 02: Proposer classified as built-up expansion; spectral signature matches seasonal fallow agricultural cycle (April pre-monsoon vs October post-monsoon harvest).",
      ],
      alternativeExplanations: [
        "Region 02: Agricultural crop cycle or seasonal soil exposure, not permanent urban fabric.",
      ],
      verdict: "supported_with_reservations",
    },
    adversarial: {
      proposerHypothesis:
        "Built-up area appears to have increased significantly between 12 Apr 2025 and 28 Oct 2025, concentrated in the eastern sector, accompanied by vegetation conversion in the southeast and new infrastructure development along the southern corridor.",
      skepticCritique:
        "Sub-pixel residual is 0.8 px. For Region 01 (broad parcel), 0.8 px cannot create false positive rooftop clusters. For Region 03 (narrow corridor), edge aliasing inflates corridor width by up to 1.6 px. Boundary width is qualified.",
      disagreements: [
        {
          topic: "Region 02 Classification (Vegetation vs Built-up)",
          proposerClaim: "Built-up expansion front replacing vegetation",
          skepticContestation:
            "Spectral drop in NDVI (-0.38) matches seasonal crop harvest/senescence; no rooftop or impervious structure detected",
          resolution:
            "Classified conservatively as 'Vegetation loss / open parcel' with built-up confirmation deferred. Net built-up calculation excludes Region 02.",
          impactOnConfidence: "slight_reduction",
        },
        {
          topic: "Region 03 Corridor Width Precision",
          proposerClaim: "18-meter wide paved arterial corridor",
          skepticContestation:
            "0.8 px registration residual inflates 0.6 m GSD corridor edges by ~1.2 m. True width ~15 m.",
          resolution:
            "Corridor presence confirmed; boundary metrics adjusted for registration tolerance.",
          impactOnConfidence: "none",
        },
      ],
      verifiedInterpretation:
        "Built-up area has confirmed increase concentrated in the eastern sector (Region 01). Southern corridor infrastructure confirmed (Region 03). Southeastern sector (Region 02) exhibits vegetation loss, but built-up classification is contested and qualified due to seasonal agricultural variance.",
      verifiedStatus: "qualified",
      registrationWarning:
        "Residual registration uncertainty (0.8 px) qualifies narrow linear boundaries in Region 03.",
    },
  },
  source: "demo",
};

/* ---------- DEMO 04 — Optical + SAR fusion ---------- */

const demo04: AnalysisResult = {
  requestId: "req_2a55b9de",
  name: "FUSION-0007",
  createdAt: "2026-09-07T12:48:12Z",
  query: "Identify built-up and water-covered regions using both observations.",
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
  crossModal: {
    validation: {
      opticalObservationId: "obs-opt",
      sarObservationId: "obs-sar",
      crsAlignment: "exact",
      crsTarget: "EPSG:4326 (WGS 84)",
      opticalGsdM: 0.6,
      sarGsdM: 6.0,
      resolutionRatio: 10.0,
      spatialOverlapPercent: 96.4,
      temporalDeltaDays: 2.1,
      polarization: "VV+VH",
      incidenceAngleDeg: 34.2,
      status: "pass",
      detail: "Spatial overlap > 95%, temporal baseline 2.1 days, dual-pol VV+VH available",
    },
    physicsSideFeatures: {
      sar: {
        doubleBounceIntensityDb: 14.2,
        surfaceRoughness: "low",
        shadowLayoverIdentified: true,
        polarizationRatioVvVh: 6.8,
        dielectricMoistureEstimate: "dry",
        speckleFilterApplied: "Refined Lee (5×5 window)",
        incidenceAngleDeg: 34.2,
      },
      optical: {
        ndbiBuiltUpIndex: 0.34,
        ndviVegetationSuppression: -0.12,
        ndwiWaterSuppression: 0.48,
        edgeDensity: 0.28,
        spectralBrightnessAvg: 612.4,
        cloudShadowOcclusionPercent: 1.8,
      },
      physicsInsight:
        "High SAR double-bounce backscatter (+14.2 dB) on dihedral building wall-ground interfaces decisively verifies built-up candidates detected via high optical edge density, while low specular SAR backscatter (-22.4 dB) corroborates low optical reflectance to definitively map the water reservoir.",
    },
    alignmentAdapter: {
      method: "homography",
      sourceCrs: "EPSG:32643 (UTM 43N)",
      targetCrs: "EPSG:4326 (WGS 84)",
      subPixelResidualPx: 0.28,
      resamplingFilter: "bilinear",
      coverageOverlapAreaKm2: 48.2,
    },
    opticalBranch: {
      modality: "optical",
      modelName: "RS VLM Optical Land-Cover Encoder",
      modelVersion: "v0.1.0",
      runtimeMs: 1500,
      featuresExtracted: [
        "Multispectral NDBI / NDVI / NDWI feature maps",
        "Canny edge density & structural linear patterns",
        "Rooftop spectral signature extraction",
      ],
      candidateRegionsCount: 6,
      primaryConfidence: 0.88,
      modalitySummary: "High-resolution spectral boundaries mapped with 0.6m spatial fidelity.",
    },
    sarBranch: {
      modality: "sar",
      modelName: "SAR Backscatter & Polarimetric Specialist",
      modelVersion: "v0.2.0",
      runtimeMs: 1600,
      featuresExtracted: [
        "VV/VH polarimetric decomposition",
        "Dihedral corner double-bounce candidate detection",
        "Specular water surface low-scattering segmentation",
      ],
      candidateRegionsCount: 5,
      primaryConfidence: 0.86,
      modalitySummary:
        "Dielectric and structural microwave scattering confirms building mass and excludes vegetation false alarms.",
    },
    fusion: {
      fusionMethod: "decision_level",
      opticalWeight: 0.55,
      sarWeight: 0.45,
      consensusRegionsCount: 5,
      opticalOnlyRegionsCount: 1,
      sarOnlyRegionsCount: 0,
      consensusConfidence: 0.92,
      agreementRatePercent: 91.4,
      fusionSummary:
        "Cross-modal fusion achieved 91.4% spatial agreement across built-up and water-covered regions. Dual confirmation eliminates shadow ambiguities and elevates overall certainty to 92%.",
    },
  },
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
    title: "ANALYSIS BLOCKED",
    required: "A bi-temporal comparison requires two spatially corresponding observations.",
    received: "1 observation (single epoch)",
    action: "NO SPECIALIST MODEL EXECUTED",
    actionHint:
      "A bi-temporal comparison requires two spatially corresponding observations. Upload a second acquisition date.",
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
    limitations: ["Structure class separation is not validated at this ground sampling distance."],
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

/* ---------- DEMO 07 — Modality Incompatible Refusal (Optical + Optical for Fusion Query) ---------- */

const demo07: AnalysisResult = {
  requestId: "req_incomp_opt_opt",
  name: "REFUSAL-INCOMPATIBLE-01",
  createdAt: "2026-09-07T13:10:00Z",
  query: "Use the optical and SAR images together to identify built-up regions.",
  workflow: {
    id: "unsupported",
    label: "Refused — Modality Incompatible",
    requiredObservations: "1 optical + 1 SAR observation",
  },
  intent: {
    workflow: "optical_sar",
    label: "OPTICAL-SAR FUSION",
    confidence: 0.94,
    entities: [{ text: "built-up", type: "class" }],
    requiredInput: "1 optical + 1 SAR",
    currentInput: "2 optical observations (Cartosat-3)",
    compatibility: "incompatible",
  },
  route: [
    { id: "input", label: "INPUT", detail: "2 Optical (Cartosat-3)" },
    { id: "validator", label: "MODALITY VALIDATOR", detail: "Incompatible Pair" },
    { id: "blocked", label: "ROUTING BLOCKED", detail: "Preconditions Unmet" },
  ],
  observed: [
    "Observation 1: Cartosat-3 MX (Optical, 4-Band, 0.6m GSD)",
    "Observation 2: Cartosat-3 MX (Optical, 4-Band, 0.6m GSD)",
    "Missing SAR observation for dielectric and backscatter cross-modal fusion",
  ],
  answer:
    "Routing Blocked: Modality pair is incompatible. The submitted query requires 1 optical and 1 SAR observation to perform cross-modal structural fusion. Two optical images were provided.",
  detailedAnswer:
    "Pre-flight modality audit rejected the input dataset. Joint optical-SAR fusion algorithms require distinct physical observation modalities: optical multispectral reflectance and SAR microwave backscatter. Presenting two optical scenes cannot satisfy SAR feature requirements (such as double-bounce dihedral scattering and dielectric surface roughness estimation). Ingestion was aborted at the routing stage to prevent erroneous model execution.",
  interpretation:
    "No fusion executed. Attach a SAR observation (e.g. RISAT-1A or EOS-04 C-Band SAR) to enable cross-modal analysis.",
  confidence: {
    level: "unsupported",
    score: null,
    factors: [
      {
        label: "Modality compatibility check",
        status: "missing",
        detail: "Optical+Optical received",
      },
      { label: "SAR structural scattering", status: "missing", detail: "No microwave raster" },
      { label: "Dielectric moisture profile", status: "missing", detail: "Requires SAR C/X band" },
    ],
    limitations: [
      "Analysis blocked at validator stage.",
      "Requires 1 optical and 1 SAR observation.",
    ],
  },
  evidence: [],
  trace: [
    traceEvent("req_incomp_opt_opt", "validation", "INPUT VALIDATOR", 400, {
      tool: "modality_compatibility_checker",
      status: "failed",
      message: "Modality mismatch: received optical+optical, required optical+sar",
    }),
    traceEvent("req_incomp_opt_opt", "routing", "ROUTING ENGINE", 250, {
      tool: "router",
      status: "skipped",
      message: "Routing blocked: preconditions unmet — no fusion executed",
    }),
  ],
  tool: { name: "modality_validator", version: "v0.3.0" },
  model: { name: "Input Validation Engine", version: "v0.3.0" },
  runtimeMs: 650,
  refusal: {
    title: "INPUT INCOMPATIBLE · ROUTING BLOCKED",
    required: "1 optical + 1 SAR observation",
    received: "2 optical observations (Cartosat-3 MX)",
    action:
      "Attach a SAR observation (e.g. RISAT-1A or EOS-04) to enable dielectric backscatter cross-modal fusion.",
    actionHint:
      "Optical-only scenes cannot provide microwave surface roughness and double-bounce scattering features.",
  },
  source: "demo",
};

/* ---------- DEMO 08 — Capability-Aware Refusal (Causal Query) ---------- */

const demo08: AnalysisResult = {
  requestId: "req_causal_9f1b",
  name: "REFUSAL-CAUSAL-01",
  createdAt: "2026-09-07T13:10:00Z",
  query: "Why was this area developed?",
  workflow: {
    id: "unsupported",
    label: "Refused — Exceeds Sensing Capability",
    requiredObservations: "Socioeconomic / cadastral records (non-observable)",
  },
  intent: {
    workflow: "unsupported",
    label: "CAUSAL INFERENCE QUERY",
    confidence: 0.98,
    entities: [{ text: "Why was this area developed", type: "causal_inquiry" }],
    requiredInput: "Cadastral and municipal zoning records",
    currentInput: "Optical satellite observation",
    compatibility: "incompatible",
  },
  route: [
    { id: "input", label: "INPUT", detail: "1 image" },
    { id: "validator", label: "VALIDATOR" },
    { id: "classifier", label: "QUERY CLASSIFIER", detail: "Causal Inference" },
    { id: "capability", label: "CAPABILITY CHECK", detail: "NON-OBSERVABLE" },
    { id: "halt", label: "DOWNSTREAM SPECIALISTS HALTED" },
  ],
  observed: ["Visible built-up structures and newly paved road segments"],
  answer:
    "Query not fully supported: satellite imagery cannot determine causal drivers of development.",
  detailedAnswer:
    "Visible built-up expansion is observable, but human intent, economic motivations, ownership deeds, and municipal legal status cannot be determined from top-of-atmosphere reflectance.",
  interpretation: "Causal inference refused to prevent hallucination.",
  confidence: {
    level: "unsupported",
    score: null,
    factors: [
      { label: "Physical observability", status: "missing", detail: "Non-observable intent" },
    ],
    limitations: [
      "Satellite sensors record physical surface reflectance, not administrative or causal decisions.",
    ],
  },
  evidence: [],
  trace: [
    traceEvent("req_causal_9f1b", "validation", "INPUT VALIDATOR", 420, {
      tool: "metadata_validator",
    }),
    traceEvent("req_causal_9f1b", "classification", "QUERY CLASSIFIER", 280, {
      tool: "query_router",
      modelVersion: "intent-clf v0.3.1",
      message: "Detected causal query: 'Why was this area developed?'",
    }),
    traceEvent("req_causal_9f1b", "constraints", "CAPABILITY CHECK", 110, {
      tool: "physical_grounding_verifier",
      status: "failed",
      error: "causal inference not supported by pixel radiance",
    }),
    traceEvent("req_causal_9f1b", "execution", "SPECIALIST TOOLS", null, {
      status: "skipped",
      message: "Refused — suggest: 'What changed in this region?'",
    }),
  ],
  tool: { name: "physical_grounding_verifier", version: "v0.1.0" },
  model: { name: "—", version: "—" },
  runtimeMs: 810,
  refusal: {
    title: "QUERY NOT FULLY SUPPORTED",
    required: "Socioeconomic and cadastral records",
    received: "1 optical raster",
    action: "TRY PHYSICAL QUERY",
    actionHint: "Run suggested query: 'What changed in this region?'",
  },
  source: "demo",
};

/* ---------- DEMO 09 — 8 Invalid Input Failure Modes ---------- */

const demo09: AnalysisResult = {
  requestId: "req_failure_suite",
  name: "FAILURE-SUITE-01",
  createdAt: "2026-09-07T13:15:00Z",
  query: "Run validation gateway diagnostics on uploaded rasters.",
  workflow: {
    id: "unsupported",
    label: "Input Incompatible Suite",
    requiredObservations: "Valid georeferenced observations",
  },
  intent: {
    workflow: "unsupported",
    label: "VALIDATION DIAGNOSTICS",
    confidence: 0.99,
    entities: [{ text: "validation", type: "diagnostic" }],
    requiredInput: "Valid raster",
    currentInput: "Diagnostic simulation",
    compatibility: "incompatible",
  },
  route: [
    { id: "input", label: "INPUT", detail: "File upload" },
    { id: "validator", label: "VALIDATOR", detail: "FAILED" },
    { id: "halt", label: "ROUTING BLOCKED" },
  ],
  observed: [],
  answer: "",
  detailedAnswer: "",
  interpretation: "",
  confidence: {
    level: "unsupported",
    score: null,
    factors: [{ label: "Input integrity", status: "missing", detail: "Validation check failed" }],
    limitations: ["Inspect specific failure code to resolve."],
  },
  evidence: [],
  trace: [
    traceEvent("req_failure_suite", "validation", "INPUT VALIDATOR", 120, {
      tool: "raster_validator",
      status: "failed",
      error: "input rejected by validation gateway",
    }),
  ],
  tool: { name: "raster_validator", version: "v0.1.0" },
  model: { name: "—", version: "—" },
  runtimeMs: 120,
  refusal: {
    title: "INPUT INCOMPATIBLE",
    required: "Valid georeferenced raster",
    received: "Invalid / incompatible input",
    action: "RESOLVE VIA INSPECTOR",
    actionHint: "Select failure mode to inspect root cause and required remediation.",
  },
  source: "demo",
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
  {
    id: "demo-07",
    code: "DEMO 07",
    title: "Optical+Optical Refusal",
    description: "Fusion query with 2 optical images — rejected before fusion execution.",
    observations: [demoObservations.before, demoObservations.after],
    query: demo07.query,
    result: demo07,
  },
  {
    id: "demo-08",
    code: "DEMO 08",
    title: "Causal query refusal",
    description: "Query 'Why was this area developed?' exceeds sensing capability.",
    observations: [demoObservations.singleOptical],
    query: demo08.query,
    result: demo08,
  },
  {
    id: "demo-09",
    code: "DEMO 09",
    title: "8 Failure modes suite",
    description: "Interactive inspector for all 8 invalid input failure states.",
    observations: [demoObservations.singleOptical],
    query: demo09.query,
    result: demo09,
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
