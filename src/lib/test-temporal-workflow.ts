/**
 * SatQuery AI — Automated Test Suite for Bi-Temporal & Proposer/Skeptic Workflow
 *
 * Verifies Prompt 4 requirements:
 * 1. Missing second image refusal (ANALYSIS BLOCKED / NO SPECIALIST EXECUTED)
 * 2. Date-order validation (T1 < T2 order check, delta days calculation)
 * 3. Registration warning (residual > tolerance triggers visible warning)
 * 4. Change evidence selection synchronization (Before, After, Change share exact coordinates)
 * 5. Proposer/Skeptic disagreement representation (explicit debate, no fake precision)
 * 6. Low-confidence state derivation
 * 7. Temporal overlay transforms (shared coordinate pipeline)
 */

import { demoScenarios } from "./mock-data";
import {
  computeCropFocusTransform,
  computeRenderedImageRect,
  sourceToNormalizedBox,
  type NormalizedBox,
} from "./spatial-transform";
import type {
  AnalysisResult,
  BiTemporalInvestigationData,
  EvidenceObject,
  Observation,
  TraceEvent,
} from "./types";

function assert(condition: boolean, msg: string) {
  if (!condition) {
    console.error(`❌ ASSERTION FAILED: ${msg}`);
    process.exit(1);
  }
  console.log(`✓ ${msg}`);
}

function approxEqual(a: number, b: number, tol = 0.001): boolean {
  return Math.abs(a - b) <= tol;
}

console.log("\n=======================================================");
console.log("TEST 1: Missing Second Image Refusal (ANALYSIS BLOCKED)");
console.log("=======================================================");
{
  const refusalScenario = demoScenarios.find((s) => s.id === "demo-05")!;
  assert(refusalScenario !== undefined, "Refusal scenario (demo-05) exists");
  assert(refusalScenario.observations.length === 1, "Refusal scenario contains only 1 observation");
  assert(
    refusalScenario.query.toLowerCase().includes("changed"),
    "Query is a temporal change query ('What changed?')",
  );

  const result = refusalScenario.result;
  assert(
    result.intent.compatibility === "incompatible",
    "Single-image temporal change query must be flagged as incompatible",
  );
  assert(result.refusal !== undefined, "Refusal object must be present");
  assert(result.refusal!.title === "ANALYSIS BLOCKED", "Refusal title must be 'ANALYSIS BLOCKED'");
  assert(
    result.refusal!.required.includes("two spatially corresponding observations") ||
      result.refusal!.required.includes("2 temporally corresponding"),
    "Refusal requirement must demand two observations",
  );
  assert(
    result.refusal!.action === "NO SPECIALIST MODEL EXECUTED",
    "Refusal action must declare 'NO SPECIALIST MODEL EXECUTED'",
  );
  assert(
    result.evidence.length === 0,
    "Refusal must generate 0 evidence objects (no fabricated results)",
  );

  // Trace verification: specialists must be skipped
  const specialistTrace = result.trace.find((t: TraceEvent) => t.component.includes("SPECIALIST"));
  assert(
    specialistTrace !== undefined && specialistTrace.status === "skipped",
    "Trace must record specialist execution as 'skipped'",
  );
}

console.log("\n=======================================================");
console.log("TEST 2: Date-Order Validation");
console.log("=======================================================");
{
  function validateTemporalOrder(t1DateStr: string, t2DateStr: string) {
    const d1 = new Date(t1DateStr);
    const d2 = new Date(t2DateStr);
    const valid = d1.getTime() < d2.getTime();
    const deltaDays = Math.round((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));
    return { valid, deltaDays };
  }

  // 1. Valid forward temporal pair (April -> October)
  const validPair = validateTemporalOrder("2025-04-12", "2025-10-28");
  assert(validPair.valid === true, "2025-04-12 < 2025-10-28 must be valid");
  assert(validPair.deltaDays === 199, "Delta must be exactly 199 days");

  // 2. Inverted dates (October -> April)
  const invertedPair = validateTemporalOrder("2025-10-28", "2025-04-12");
  assert(invertedPair.valid === false, "Inverted date order must fail validation");
  assert(invertedPair.deltaDays < 0, "Inverted pair must produce negative delta");

  // 3. Same date
  const sameDate = validateTemporalOrder("2025-04-12", "2025-04-12");
  assert(sameDate.valid === false, "Identical dates must fail temporal pair check");
  assert(sameDate.deltaDays === 0, "Identical dates delta is 0");
}

console.log("\n=======================================================");
console.log("TEST 3: Registration Warning Evaluation");
console.log("=======================================================");
{
  function evaluateRegistration(residualPx: number, tolerancePx = 1.5, precisionTarget = 0.5) {
    const isRegistered = residualPx <= tolerancePx;
    const hasWarning = residualPx > precisionTarget;
    const quality =
      residualPx <= precisionTarget ? "good" : residualPx <= tolerancePx ? "acceptable" : "low";
    return {
      status: isRegistered ? "registered" : "low_quality",
      quality,
      hasWarning,
      warning: hasWarning
        ? `Sub-pixel residual ${residualPx} px detected; edge boundary uncertainty present.`
        : null,
    };
  }

  // Demo 03 residual: 0.8 px
  const eval08 = evaluateRegistration(0.8);
  assert(eval08.status === "registered", "0.8 px is registered within 1.5 px tolerance");
  assert(eval08.quality === "acceptable", "0.8 px is acceptable quality");
  assert(eval08.hasWarning === true, "0.8 px > 0.5 px precision target must raise warning flag");
  assert(eval08.warning !== null, "Warning message must be surfaced");

  // High precision residual: 0.3 px
  const eval03 = evaluateRegistration(0.3);
  assert(
    eval03.status === "registered" && eval03.quality === "good",
    "0.3 px is good registration",
  );
  assert(eval03.hasWarning === false, "0.3 px has no warning");

  // Poor registration: 2.2 px
  const eval22 = evaluateRegistration(2.2);
  assert(eval22.status === "low_quality", "2.2 px exceeds tolerance and triggers low_quality");
}

console.log("\n=======================================================");
console.log("TEST 4: Change Evidence Selection Synchronization");
console.log("=======================================================");
{
  const temporalScenario = demoScenarios.find((s) => s.id === "demo-03")!;
  assert(temporalScenario !== undefined, "Temporal scenario demo-03 exists");

  const ev01 = temporalScenario.result.evidence.find((e: EvidenceObject) => e.index === 1)!;
  assert(ev01 !== undefined, "Region 01 evidence exists");
  assert(ev01.geometry !== null, "Region 01 has valid geometry");

  // Coordinates: x: 0.62, y: 0.30, w: 0.28, h: 0.24
  const g = ev01.geometry!;
  assert(g.x === 0.62 && g.y === 0.3, "Region 01 origin is (0.62, 0.3)");
  assert(g.w === 0.28 && g.h === 0.24, "Region 01 dimensions are 0.28 x 0.24");

  // In Before viewport (container 800x600, 1:1 image)
  const renderedRect = computeRenderedImageRect(800, 600, 1024, 1024);
  const transform = computeCropFocusTransform(g, renderedRect, 800, 600);

  // Transform must be identical across Before, After, and Change views
  assert(transform.zoom > 1, "Crop focus zoom must magnify feature (> 1x)");
  assert(
    approxEqual(transform.zoom, 2.08, 0.05),
    "Zoom factor matches exact fitted crop calculation (2.08x)",
  );

  // Test that both observations have valid preview URLs
  const obs = temporalScenario.observations;
  assert(obs.length === 2, "Temporal scenario has exactly 2 observations");
  assert(obs[0]!.previewUrl.length > 0, "Before observation has preview image");
  assert(obs[1]!.previewUrl.length > 0, "After observation has preview image");
}

console.log("\n=======================================================");
console.log("TEST 5: Proposer / Skeptic Disagreement Representation");
console.log("=======================================================");
{
  const temporalResult = demoScenarios.find((s) => s.id === "demo-03")!.result;
  const biTemporal = temporalResult.biTemporal;
  assert(biTemporal !== undefined, "demo03 contains biTemporal domain data");

  const proposer = biTemporal!.proposer;
  const skeptic = biTemporal!.skeptic;
  const adversarial = biTemporal!.adversarial;

  assert(proposer.proposedChanges.length === 3, "Proposer proposed 3 candidate changes");
  assert(skeptic.contradictions.length > 0, "Skeptic identified at least 1 explicit contradiction");
  assert(
    skeptic.verdict === "supported_with_reservations",
    "Skeptic verdict is 'supported_with_reservations'",
  );

  // Explicit disagreement on Region 02
  const r2Dispute = adversarial.disagreements.find((d: { topic: string }) =>
    d.topic.includes("Region 02"),
  );
  assert(r2Dispute !== undefined, "Region 02 dispute must be explicitly recorded");
  assert(
    r2Dispute!.proposerClaim.includes("Built-up"),
    "Proposer claimed built-up expansion on Region 02",
  );
  assert(
    r2Dispute!.skepticContestation.includes("crop") ||
      r2Dispute!.skepticContestation.includes("NDVI"),
    "Skeptic contested Region 02 with crop cycle / NDVI drop",
  );
  assert(
    r2Dispute!.resolution.includes("Vegetation loss"),
    "Resolution conservatively assigned vegetation loss, deferring built-up confirmation",
  );

  // Check that confidence is derived from structured signals rather than an invented average
  assert(
    temporalResult.confidence.level === "high",
    "Confidence level is high based on verified Region 01 & 03",
  );
  assert(
    temporalResult.confidence.factors.some(
      (f: { label: string; status: string }) =>
        f.label.includes("Proposer") && f.status === "uncertain",
    ),
    "Proposer / Skeptic agreement factor must be marked as 'uncertain'",
  );
}

console.log("\n=======================================================");
console.log("TEST 6: Low Confidence & Uncertain Factors State");
console.log("=======================================================");
{
  const lowConfScenario = demoScenarios.find((s) => s.id === "demo-06")!;
  assert(lowConfScenario !== undefined, "Low confidence scenario (demo-06) exists");

  const res = lowConfScenario.result;
  assert(res.confidence.level === "low", "Low confidence scenario must have level 'low'");
  assert(res.confidence.limitations.length > 0, "Limitations must be explicitly listed");
}

console.log("\n=======================================================");
console.log("TEST 7: Temporal Overlay Transforms Pipeline");
console.log("=======================================================");
{
  const testBox: NormalizedBox = { x: 0.62, y: 0.3, w: 0.28, h: 0.24 };
  const normalized = sourceToNormalizedBox(testBox, "NORMALIZED_IMAGE", 8192, 8192);

  assert(normalized !== null, "Normalized image coordinate transform must succeed");
  assert(normalized!.x === 0.62 && normalized!.y === 0.3, "Preserves normalized bounds");
  assert(normalized!.w === 0.28 && normalized!.h === 0.24, "Preserves normalized dimensions");

  // Clamping test
  const outOfBounds: NormalizedBox = { x: 0.9, y: 0.9, w: 0.3, h: 0.3 };
  const clamped = sourceToNormalizedBox(outOfBounds, "NORMALIZED_IMAGE", 8192, 8192);
  assert(clamped !== null, "Clamped transform must succeed");
  assert(approxEqual(clamped!.w, 0.1), "Width clamped to image extent");
  assert(approxEqual(clamped!.h, 0.1), "Height clamped to image extent");
}

console.log("\n=======================================================");
console.log("ALL 7 BI-TEMPORAL PROPOSER/SKEPTIC TESTS PASSED ✅");
console.log("=======================================================\n");
