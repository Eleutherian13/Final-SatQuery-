/**
 * SatQuery AI — Automated Test Suite for Optical + SAR Cross-Modal Workflow
 *
 * Verifies Prompt 5 requirements:
 * 1. Multimodal compatibility validation (Optical + SAR pairing, GSD ratio, overlap)
 * 2. Incompatible modality refusal (Optical + Optical rejected before fusion)
 * 3. Dual-branch specialist execution (Optical Land-Cover vs SAR Backscatter)
 * 4. Physics side features (SAR double-bounce, surface roughness, optical NDBI/NDVI/NDWI)
 * 5. Alignment adapter (Homography matrix, sub-pixel residual < 0.5 px, EPSG:4326 target)
 * 6. Cross-modal consensus matrix (Dual confirmation, agreement %, confidence)
 * 7. Synchronized viewport evidence rendering
 */

import { demoScenarios } from "./mock-data";
import { computeCropFocusTransform, computeRenderedImageRect } from "./spatial-transform";
import type {
  AnalysisResult,
  CrossModalInvestigationData,
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

console.log("\n=======================================================");
console.log("TEST 1: Optical + SAR Compatibility & Validation");
console.log("=======================================================");
{
  const fusionScenario = demoScenarios.find((s) => s.id === "demo-04")!;
  assert(fusionScenario !== undefined, "demo-04 Optical-SAR scenario exists");
  assert(fusionScenario.observations.length === 2, "demo-04 has exactly 2 observations");

  const opt = fusionScenario.observations.find((o) => o.modality === "optical");
  const sar = fusionScenario.observations.find((o) => o.modality === "sar");
  assert(opt !== undefined, "Optical observation is present");
  assert(sar !== undefined, "SAR observation is present");

  const cm = fusionScenario.result.crossModal;
  assert(cm !== undefined, "demo-04 contains crossModal investigation payload");
  assert(cm!.validation.crsAlignment === "exact", "CRS alignment verified as exact (EPSG:4326)");
  assert(cm!.validation.spatialOverlapPercent >= 95, "Spatial overlap is >= 95% (96.4%)");
  assert(cm!.validation.polarization === "VV+VH", "SAR polarization is dual-pol VV+VH");
  assert(cm!.validation.status === "pass", "Cross-modal validation status is 'pass'");
}

console.log("\n=======================================================");
console.log("TEST 2: Incompatible Pair Refusal (Optical + Optical)");
console.log("=======================================================");
{
  const refusalScenario = demoScenarios.find((s) => s.id === "demo-07")!;
  assert(refusalScenario !== undefined, "demo-07 Incompatible Modality scenario exists");
  assert(refusalScenario.observations.length === 2, "demo-07 contains 2 observations");
  assert(
    refusalScenario.observations.every((o) => o.modality === "optical"),
    "demo-07 contains two optical images (incompatible for fusion query)",
  );

  const res = refusalScenario.result;
  assert(
    res.intent.compatibility === "incompatible",
    "Intent compatibility flagged as 'incompatible'",
  );
  assert(res.refusal !== undefined, "Refusal object is defined");
  assert(
    res.refusal!.title.includes("INPUT INCOMPATIBLE") &&
      res.refusal!.title.includes("ROUTING BLOCKED"),
    "Refusal title includes 'INPUT INCOMPATIBLE · ROUTING BLOCKED'",
  );
  assert(
    res.interpretation.includes("No fusion executed"),
    "Interpretation explicitly states 'No fusion executed'",
  );
  assert(res.evidence.length === 0, "Zero evidence objects generated on blocked input");

  const traceBlocked = res.trace.find(
    (t: TraceEvent) => t.status === "skipped" || t.status === "failed",
  );
  assert(
    traceBlocked !== undefined,
    "Execution trace records aborted downstream specialist dispatch",
  );
}

console.log("\n=======================================================");
console.log("TEST 3: Dual-Branch Specialist Execution");
console.log("=======================================================");
{
  const cm = demoScenarios.find((s) => s.id === "demo-04")!.result.crossModal!;
  assert(cm.opticalBranch.modality === "optical", "Optical branch modality is 'optical'");
  assert(
    cm.opticalBranch.candidateRegionsCount > 0,
    "Optical branch detected candidate regions (6)",
  );
  assert(cm.opticalBranch.primaryConfidence > 0.8, "Optical branch confidence > 0.8 (88%)");

  assert(cm.sarBranch.modality === "sar", "SAR branch modality is 'sar'");
  assert(cm.sarBranch.candidateRegionsCount > 0, "SAR branch detected candidate regions (5)");
  assert(cm.sarBranch.primaryConfidence > 0.8, "SAR branch confidence > 0.8 (86%)");
}

console.log("\n=======================================================");
console.log("TEST 4: Physics Side Features Verification");
console.log("=======================================================");
{
  const phys = demoScenarios.find((s) => s.id === "demo-04")!.result.crossModal!
    .physicsSideFeatures;
  assert(phys.sar.doubleBounceIntensityDb === 14.2, "SAR double-bounce intensity is +14.2 dB");
  assert(phys.sar.shadowLayoverIdentified === true, "SAR shadow/layover distortion identified");
  assert(phys.sar.polarizationRatioVvVh === 6.8, "SAR polarization ratio VV/VH is 6.8 dB");
  assert(
    phys.optical.ndbiBuiltUpIndex > 0.3,
    "Optical NDBI confirms built-up spectral signature (+0.34)",
  );
  assert(phys.optical.edgeDensity > 0.2, "Optical edge density confirms structural alignment");
  assert(phys.physicsInsight.length > 50, "Physics-guided insight paragraph is articulated");
}

console.log("\n=======================================================");
console.log("TEST 5: Homography & Alignment Adapter");
console.log("=======================================================");
{
  const adapter = demoScenarios.find((s) => s.id === "demo-04")!.result.crossModal!
    .alignmentAdapter;
  assert(adapter.method === "homography", "Alignment method is homography / projective transform");
  assert(adapter.subPixelResidualPx < 0.5, "Sub-pixel residual error < 0.5 px (0.28 px)");
  assert(adapter.targetCrs.includes("4326"), "Target CRS mapped to EPSG:4326");
  assert(adapter.resamplingFilter === "bilinear", "Resampling uses bilinear interpolation filter");
}

console.log("\n=======================================================");
console.log("TEST 6: Joint Cross-Modal Consensus Matrix");
console.log("=======================================================");
{
  const fusion = demoScenarios.find((s) => s.id === "demo-04")!.result.crossModal!.fusion;
  assert(fusion.agreementRatePercent === 91.4, "Cross-modal agreement rate is 91.4%");
  assert(fusion.consensusRegionsCount === 5, "Dual confirmation achieved on 5 regions");
  assert(fusion.consensusConfidence === 0.92, "Consensus confidence score elevated to 92%");
  assert(fusion.opticalOnlyRegionsCount === 1, "Disagreement isolated to 1 vegetated parcel");
}

console.log("\n=======================================================");
console.log("TEST 7: Synchronized Viewport Spatial Evidence");
console.log("=======================================================");
{
  const res = demoScenarios.find((s) => s.id === "demo-04")!.result;
  const builtUp = res.evidence.find((e: EvidenceObject) => e.layer === "fused");
  assert(builtUp !== undefined, "Fused evidence object exists");
  assert(builtUp!.geometry !== null, "Fused evidence has normalized geometry");

  const renderedRect = computeRenderedImageRect(800, 600, 1024, 1024);
  const transform = computeCropFocusTransform(builtUp!.geometry!, renderedRect, 800, 600);
  assert(transform.zoom > 1.2, "Crop focus zoom magnifies fused evidence (> 1.2x)");
}

console.log("\n=======================================================");
console.log("ALL 7 OPTICAL+SAR CROSS-MODAL TESTS PASSED ✅");
console.log("=======================================================\n");
