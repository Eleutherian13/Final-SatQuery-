/**
 * SatQuery AI — Automated Test Suite for Spatial Evidence Transform Pipeline
 *
 * Verifies the 7 mandatory requirements:
 * 1. Normalized bbox transform
 * 2. Pixel bbox transform
 * 3. Resize behavior
 * 4. Zoom/pan behavior
 * 5. Aspect-ratio preservation
 * 6. Mask alignment
 * 7. Evidence selection synchronization
 */

import {
  computeRenderedImageRect,
  sourceToNormalizedBox,
  sourceToNormalizedPolygon,
  normalizedBoxToScreenRect,
  normalizedPointToScreen,
  screenToNormalizedPoint,
  computeCropFocusTransform,
  validateMaskAlignment,
  type NormalizedBox,
  type PixelBox,
} from "./spatial-transform";

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
console.log("TEST 1: Normalized BBox Transform");
console.log("=======================================================");
{
  const normBox: NormalizedBox = { x: 0.1, y: 0.2, w: 0.4, h: 0.3 };
  const mapped = sourceToNormalizedBox(normBox, "NORMALIZED_IMAGE", 8192, 8192);
  assert(mapped !== null, "NORMALIZED_IMAGE must resolve valid box");
  assert(
    mapped!.x === 0.1 && mapped!.y === 0.2,
    "Coordinates must preserve exact normalized origin",
  );
  assert(mapped!.w === 0.4 && mapped!.h === 0.3, "Dimensions must preserve exact normalized span");

  // Out of bounds clamping
  const oobBox: NormalizedBox = { x: -0.1, y: 0.9, w: 0.5, h: 0.3 };
  const clamped = sourceToNormalizedBox(oobBox, "NORMALIZED_IMAGE", 8192, 8192);
  assert(clamped !== null, "Clamped box must not be null");
  assert(clamped!.x === 0, "Negative x clamped to 0");
  assert(clamped!.y === 0.9, "y preserved at 0.9");
  assert(approxEqual(clamped!.h, 0.1), "Height clamped to fit [0, 1]");

  // Safe rejection of unmapped coordinate frames
  const unmapped = sourceToNormalizedBox(normBox, "GEOREFERENCED", 8192, 8192);
  assert(
    unmapped === null,
    "GEOREFERENCED without affine contract must safely return null (Spatial evidence unavailable)",
  );
}

console.log("\n=======================================================");
console.log("TEST 2: Pixel BBox Transform");
console.log("=======================================================");
{
  const pixelBox: PixelBox = { x: 819.2, y: 1638.4, w: 2457.6, h: 3276.8 };
  const mapped = sourceToNormalizedBox(pixelBox, "PIXEL_IMAGE", 8192, 8192);
  assert(mapped !== null, "PIXEL_IMAGE must resolve to normalized box");
  assert(approxEqual(mapped!.x, 0.1), `x: 819.2 / 8192 should be 0.1, got ${mapped!.x}`);
  assert(approxEqual(mapped!.y, 0.2), `y: 1638.4 / 8192 should be 0.2, got ${mapped!.y}`);
  assert(approxEqual(mapped!.w, 0.3), `w: 2457.6 / 8192 should be 0.3, got ${mapped!.w}`);
  assert(approxEqual(mapped!.h, 0.4), `h: 3276.8 / 8192 should be 0.4, got ${mapped!.h}`);

  // Test polygon pixel mapping
  const pixelPoly: Array<[number, number]> = [
    [0, 0],
    [4096, 2048],
    [8192, 8192],
  ];
  const normPoly = sourceToNormalizedPolygon(pixelPoly, "PIXEL_IMAGE", 8192, 8192);
  assert(normPoly !== null, "Polygon must map to normalized coordinates");
  assert(
    normPoly![1]![0] === 0.5 && normPoly![1]![1] === 0.25,
    "Intermediate vertex mapped accurately",
  );
}

console.log("\n=======================================================");
console.log("TEST 3: Resize Behavior");
console.log("=======================================================");
{
  // Small container (800x600) with square 8192x8192 image
  const smallRect = computeRenderedImageRect(800, 600, 8192, 8192);
  assert(
    smallRect.width === 600,
    `Small container width should be 600 (height-constrained), got ${smallRect.width}`,
  );
  assert(smallRect.height === 600, `Small container height should be 600, got ${smallRect.height}`);
  assert(smallRect.left === 100, `Horizontal centering left should be 100, got ${smallRect.left}`);
  assert(smallRect.top === 0, `Vertical top should be 0, got ${smallRect.top}`);

  // Large container (1200x900)
  const largeRect = computeRenderedImageRect(1200, 900, 8192, 8192);
  assert(largeRect.width === 900, `Large container width should be 900, got ${largeRect.width}`);
  assert(largeRect.height === 900, `Large container height should be 900, got ${largeRect.height}`);
  assert(largeRect.left === 150, `Horizontal centering left should be 150, got ${largeRect.left}`);

  // Normalized box anchored across both resizes
  const box: NormalizedBox = { x: 0.25, y: 0.25, w: 0.5, h: 0.5 };
  const smallScreen = normalizedBoxToScreenRect(
    box,
    smallRect,
    { zoom: 1, panX: 0, panY: 0 },
    800,
    600,
  );
  const largeScreen = normalizedBoxToScreenRect(
    box,
    largeRect,
    { zoom: 1, panX: 0, panY: 0 },
    1200,
    900,
  );

  // In small: image left = 100, box.x = 0.25 * 600 = 150 -> screenLeft = 250
  assert(
    approxEqual(smallScreen.left, 250),
    `Small screen left should be 250, got ${smallScreen.left}`,
  );
  // In large: image left = 150, box.x = 0.25 * 900 = 225 -> screenLeft = 375
  assert(
    approxEqual(largeScreen.left, 375),
    `Large screen left should be 375, got ${largeScreen.left}`,
  );
  assert(smallScreen.width === 300, "Small box width scaled by container");
  assert(largeScreen.width === 450, "Large box width scaled by container");
}

console.log("\n=======================================================");
console.log("TEST 4: Zoom / Pan Behavior");
console.log("=======================================================");
{
  const containerW = 1000;
  const containerH = 1000;
  const renderedRect = computeRenderedImageRect(containerW, containerH, 1000, 1000);
  const box: NormalizedBox = { x: 0.4, y: 0.4, w: 0.2, h: 0.2 };

  // At 1x zoom, 0 pan: center of container is 500,500. Box is centered at 0.5,0.5 -> width 200, left 400
  const baseScreen = normalizedBoxToScreenRect(
    box,
    renderedRect,
    { zoom: 1, panX: 0, panY: 0 },
    containerW,
    containerH,
  );
  assert(baseScreen.left === 400 && baseScreen.top === 400, "Base screen left and top 400");
  assert(baseScreen.width === 200 && baseScreen.height === 200, "Base screen width and height 200");

  // At 2x zoom centered: box width doubles to 400, left moves to 300
  const zoomedScreen = normalizedBoxToScreenRect(
    box,
    renderedRect,
    { zoom: 2, panX: 0, panY: 0 },
    containerW,
    containerH,
  );
  assert(zoomedScreen.width === 400, `Zoomed box width should be 400, got ${zoomedScreen.width}`);
  assert(zoomedScreen.left === 300, `Zoomed box left should be 300, got ${zoomedScreen.left}`);

  // With pan: panX = +50, panY = -30
  const pannedScreen = normalizedBoxToScreenRect(
    box,
    renderedRect,
    { zoom: 2, panX: 50, panY: -30 },
    containerW,
    containerH,
  );
  assert(pannedScreen.left === 350, `Panned box left should be 350, got ${pannedScreen.left}`);
  assert(pannedScreen.top === 270, `Panned box top should be 270, got ${pannedScreen.top}`);

  // Invert screen coordinate back to normalized point
  const pt = screenToNormalizedPoint(
    350 + 200,
    270 + 200,
    renderedRect,
    { zoom: 2, panX: 50, panY: -30 },
    containerW,
    containerH,
  );
  assert(pt !== null, "Inverted point must be within bounds");
  assert(approxEqual(pt!.x, 0.5), `Inverted x should be box center 0.5, got ${pt!.x}`);
  assert(approxEqual(pt!.y, 0.5), `Inverted y should be box center 0.5, got ${pt!.y}`);
}

console.log("\n=======================================================");
console.log("TEST 5: Aspect-Ratio Preservation");
console.log("=======================================================");
{
  // Wide 16:9 raster in a 4:3 container
  const wideRect = computeRenderedImageRect(800, 600, 1920, 1080);
  assert(approxEqual(wideRect.aspectRatio, 16 / 9), "Wide raster aspect ratio preserved at 16:9");
  assert(wideRect.width === 800, "Width takes container width");
  assert(
    approxEqual(wideRect.height, 800 / (16 / 9)),
    "Height precisely calculated from aspect ratio",
  );
  assert(wideRect.top > 0, "Vertical letterboxing applied");

  // Tall 1:2 strip in a 16:9 container
  const tallRect = computeRenderedImageRect(1600, 900, 1000, 2000);
  assert(tallRect.height === 900, "Tall raster height fills container height");
  assert(tallRect.width === 450, "Tall raster width constrained to 450 (1:2 ratio)");
  assert(tallRect.left === (1600 - 450) / 2, "Horizontal pillarboxing centered");
}

console.log("\n=======================================================");
console.log("TEST 6: Mask Alignment Contract");
console.log("=======================================================");
{
  // Valid matching mask
  const validMask = validateMaskAlignment(
    { width: 4096, height: 4096 },
    { width: 8192, height: 8192 },
  );
  assert(validMask.valid === true, "Square mask matches square base raster");

  // Divergent mask aspect ratio
  const divergentMask = validateMaskAlignment(
    { width: 1920, height: 1080 },
    { width: 1024, height: 1024 },
  );
  assert(divergentMask.valid === false, "Divergent aspect ratio mask rejected safely");
  assert(divergentMask.reason!.includes("diverges"), "Helpful reason reported");
}

console.log("\n=======================================================");
console.log("TEST 7: Evidence Selection & Crop Focus Synchronization");
console.log("=======================================================");
{
  const containerW = 1000;
  const containerH = 800;
  const renderedRect = computeRenderedImageRect(containerW, containerH, 2000, 1600);
  // Evidence region in upper-right quadrant
  const targetEvidence: NormalizedBox = { x: 0.7, y: 0.2, w: 0.2, h: 0.2 };

  const focusTransform = computeCropFocusTransform(
    targetEvidence,
    renderedRect,
    containerW,
    containerH,
    4.0,
  );
  assert(focusTransform.zoom > 1.0, `Focus transform should zoom in (got ${focusTransform.zoom}x)`);

  // Target center under focus transform must now land at container center (500, 400)
  const targetCenterNorm = {
    x: targetEvidence.x + targetEvidence.w / 2,
    y: targetEvidence.y + targetEvidence.h / 2,
  };
  const screenCenter = normalizedPointToScreen(
    targetCenterNorm,
    renderedRect,
    focusTransform,
    containerW,
    containerH,
  );

  assert(
    approxEqual(screenCenter.x, containerW / 2, 2.0),
    `Target center X (${screenCenter.x}) should align with container center (${containerW / 2})`,
  );
  assert(
    approxEqual(screenCenter.y, containerH / 2, 2.0),
    `Target center Y (${screenCenter.y}) should align with container center (${containerH / 2})`,
  );
}

console.log("\n=======================================================");
console.log("ALL 7 SPATIAL EVIDENCE TRANSFORM TESTS PASSED!");
console.log("=======================================================\n");
