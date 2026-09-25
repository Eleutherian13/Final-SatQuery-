/**
 * SatQuery AI — Canonical Spatial Transform Pipeline
 *
 * Implements the CRITICAL GEOMETRY RULE:
 * The satellite image and every spatial overlay (masks, bounding boxes,
 * polygons, point markers, crops) MUST share one single coordinate transformation.
 *
 * Pipeline:
 * source geometry -> source coordinate frame -> normalized image space [0, 1]
 * -> rendered image rect (aspect ratio preserved) -> screen / viewport coordinates.
 */

export type CoordinateFrame =
  "PIXEL_IMAGE" | "NORMALIZED_IMAGE" | "GEOREFERENCED" | "OTHER_EXPLICIT_FRAME";

export interface NormalizedBox {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface PixelBox {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface NormalizedPoint {
  x: number;
  y: number;
}

export interface PixelPoint {
  x: number;
  y: number;
}

export interface ScreenPoint {
  x: number;
  y: number;
}

export interface ScreenRect {
  left: number;
  top: number;
  width: number;
  height: number;
}

export interface RenderedImageRect {
  left: number;
  top: number;
  width: number;
  height: number;
  scale: number;
  aspectRatio: number;
}

export interface ViewportTransform {
  zoom: number;
  panX: number;
  panY: number;
}

/**
 * Computes the exact rendered rectangle of an image within a container
 * while strictly preserving its natural aspect ratio ("contain" fit).
 */
export function computeRenderedImageRect(
  containerWidth: number,
  containerHeight: number,
  imageNaturalWidth: number,
  imageNaturalHeight: number,
): RenderedImageRect {
  if (
    containerWidth <= 0 ||
    containerHeight <= 0 ||
    imageNaturalWidth <= 0 ||
    imageNaturalHeight <= 0
  ) {
    return { left: 0, top: 0, width: 0, height: 0, scale: 1, aspectRatio: 1 };
  }

  const imageAspect = imageNaturalWidth / imageNaturalHeight;
  const containerAspect = containerWidth / containerHeight;

  let width: number;
  let height: number;

  if (imageAspect > containerAspect) {
    // Width constrained
    width = containerWidth;
    height = containerWidth / imageAspect;
  } else {
    // Height constrained
    height = containerHeight;
    width = containerHeight * imageAspect;
  }

  const left = (containerWidth - width) / 2;
  const top = (containerHeight - height) / 2;
  const scale = width / imageNaturalWidth;

  return {
    left,
    top,
    width,
    height,
    scale,
    aspectRatio: imageAspect,
  };
}

/**
 * Converts any source box into normalized image coordinates [0, 1].
 * Returns null if the coordinate frame is unmapped or unsupported,
 * fulfilling the requirement to reject invalid geometries rather than guessing.
 */
export function sourceToNormalizedBox(
  rawBox: NormalizedBox | PixelBox | null | undefined,
  coordinateFrame: CoordinateFrame,
  rasterWidth: number,
  rasterHeight: number,
): NormalizedBox | null {
  if (!rawBox) return null;

  if (coordinateFrame === "NORMALIZED_IMAGE") {
    // Validate range
    const x = Math.max(0, Math.min(1, rawBox.x));
    const y = Math.max(0, Math.min(1, rawBox.y));
    const w = Math.max(0, Math.min(1 - x, rawBox.w));
    const h = Math.max(0, Math.min(1 - y, rawBox.h));
    if (w <= 0 || h <= 0) return null;
    return { x, y, w, h };
  }

  if (coordinateFrame === "PIXEL_IMAGE") {
    if (rasterWidth <= 0 || rasterHeight <= 0) return null;
    const x = Math.max(0, Math.min(1, rawBox.x / rasterWidth));
    const y = Math.max(0, Math.min(1, rawBox.y / rasterHeight));
    const w = Math.max(0, Math.min(1 - x, rawBox.w / rasterWidth));
    const h = Math.max(0, Math.min(1 - y, rawBox.h / rasterHeight));
    if (w <= 0 || h <= 0) return null;
    return { x, y, w, h };
  }

  // GEOREFERENCED or unmapped without explicit affine/tiepoints -> reject safely
  return null;
}

/**
 * Converts source polygon vertices into normalized [0, 1] coordinates.
 */
export function sourceToNormalizedPolygon(
  rawPoints: Array<[number, number]> | null | undefined,
  coordinateFrame: CoordinateFrame,
  rasterWidth: number,
  rasterHeight: number,
): Array<[number, number]> | null {
  if (!rawPoints || rawPoints.length < 3) return null;

  if (coordinateFrame === "NORMALIZED_IMAGE") {
    return rawPoints.map(([x, y]) => [Math.max(0, Math.min(1, x)), Math.max(0, Math.min(1, y))]);
  }

  if (coordinateFrame === "PIXEL_IMAGE") {
    if (rasterWidth <= 0 || rasterHeight <= 0) return null;
    return rawPoints.map(([x, y]) => [
      Math.max(0, Math.min(1, x / rasterWidth)),
      Math.max(0, Math.min(1, y / rasterHeight)),
    ]);
  }

  return null;
}

/**
 * Converts a normalized box [0, 1] to screen / viewport coordinates
 * taking into account rendered image rect, container bounds, zoom, and pan.
 */
export function normalizedBoxToScreenRect(
  normBox: NormalizedBox,
  renderedRect: RenderedImageRect,
  transform: ViewportTransform,
  containerWidth: number,
  containerHeight: number,
): ScreenRect {
  const containerCenterX = containerWidth / 2;
  const containerCenterY = containerHeight / 2;

  // Position relative to container without zoom/pan
  const unscaledX = renderedRect.left + normBox.x * renderedRect.width;
  const unscaledY = renderedRect.top + normBox.y * renderedRect.height;
  const unscaledW = normBox.w * renderedRect.width;
  const unscaledH = normBox.h * renderedRect.height;

  // Apply zoom and pan from container center
  const screenLeft =
    containerCenterX + (unscaledX - containerCenterX) * transform.zoom + transform.panX;
  const screenTop =
    containerCenterY + (unscaledY - containerCenterY) * transform.zoom + transform.panY;
  const screenWidth = unscaledW * transform.zoom;
  const screenHeight = unscaledH * transform.zoom;

  return {
    left: screenLeft,
    top: screenTop,
    width: screenWidth,
    height: screenHeight,
  };
}

/**
 * Converts a normalized point [0, 1] to screen / viewport coordinates.
 */
export function normalizedPointToScreen(
  point: NormalizedPoint,
  renderedRect: RenderedImageRect,
  transform: ViewportTransform,
  containerWidth: number,
  containerHeight: number,
): ScreenPoint {
  const containerCenterX = containerWidth / 2;
  const containerCenterY = containerHeight / 2;

  const unscaledX = renderedRect.left + point.x * renderedRect.width;
  const unscaledY = renderedRect.top + point.y * renderedRect.height;

  return {
    x: containerCenterX + (unscaledX - containerCenterX) * transform.zoom + transform.panX,
    y: containerCenterY + (unscaledY - containerCenterY) * transform.zoom + transform.panY,
  };
}

/**
 * Converts a screen pointer coordinate back to normalized image coordinates [0, 1].
 * Returns null if the pointer is outside the rendered image.
 */
export function screenToNormalizedPoint(
  screenX: number,
  screenY: number,
  renderedRect: RenderedImageRect,
  transform: ViewportTransform,
  containerWidth: number,
  containerHeight: number,
): NormalizedPoint | null {
  if (renderedRect.width <= 0 || renderedRect.height <= 0 || transform.zoom <= 0) {
    return null;
  }

  const containerCenterX = containerWidth / 2;
  const containerCenterY = containerHeight / 2;

  // Invert pan and zoom
  const unscaledX =
    (screenX - transform.panX - containerCenterX) / transform.zoom + containerCenterX;
  const unscaledY =
    (screenY - transform.panY - containerCenterY) / transform.zoom + containerCenterY;

  // Invert image positioning
  const normX = (unscaledX - renderedRect.left) / renderedRect.width;
  const normY = (unscaledY - renderedRect.top) / renderedRect.height;

  if (normX < 0 || normX > 1 || normY < 0 || normY > 1) {
    return null;
  }

  return { x: normX, y: normY };
}

/**
 * Calculates the exact ViewportTransform (zoom and pan) required to focus
 * and center an evidence crop box in the viewport with comfortable margins.
 */
export function computeCropFocusTransform(
  targetBox: NormalizedBox,
  renderedRect: RenderedImageRect,
  containerWidth: number,
  containerHeight: number,
  maxZoom = 4.0,
  minZoom = 1.0,
  paddingFactor = 0.25,
): ViewportTransform {
  if (
    targetBox.w <= 0 ||
    targetBox.h <= 0 ||
    renderedRect.width <= 0 ||
    renderedRect.height <= 0 ||
    containerWidth <= 0 ||
    containerHeight <= 0
  ) {
    return { zoom: 1, panX: 0, panY: 0 };
  }

  const targetPixelW = targetBox.w * renderedRect.width;
  const targetPixelH = targetBox.h * renderedRect.height;

  // Target dimension with padding
  const fitZoomX = (containerWidth * (1 - paddingFactor * 2)) / targetPixelW;
  const fitZoomY = (containerHeight * (1 - paddingFactor * 2)) / targetPixelH;

  const desiredZoom = Math.max(minZoom, Math.min(maxZoom, Math.min(fitZoomX, fitZoomY)));

  // Center of the target box in rendered rect coordinates relative to image top-left
  const targetCenterX = renderedRect.left + (targetBox.x + targetBox.w / 2) * renderedRect.width;
  const targetCenterY = renderedRect.top + (targetBox.y + targetBox.h / 2) * renderedRect.height;

  const containerCenterX = containerWidth / 2;
  const containerCenterY = containerHeight / 2;

  // Pan needed so target center aligns with container center under desiredZoom
  const panX = (containerCenterX - targetCenterX) * desiredZoom;
  const panY = (containerCenterY - targetCenterY) * desiredZoom;

  return {
    zoom: Math.round(desiredZoom * 100) / 100,
    panX: Math.round(panX),
    panY: Math.round(panY),
  };
}

/**
 * Validates whether an overlay mask has compatible dimensions/aspect ratio
 * with the base raster image.
 */
export function validateMaskAlignment(
  maskDims: { width: number; height: number },
  imageDims: { width: number; height: number },
  tolerance = 0.02,
): { valid: boolean; reason?: string } {
  if (maskDims.width <= 0 || maskDims.height <= 0) {
    return { valid: false, reason: "Mask has zero or negative dimensions" };
  }
  if (imageDims.width <= 0 || imageDims.height <= 0) {
    return { valid: false, reason: "Base image has zero or negative dimensions" };
  }

  const maskAspect = maskDims.width / maskDims.height;
  const imageAspect = imageDims.width / imageDims.height;

  const diff = Math.abs(maskAspect - imageAspect) / imageAspect;
  if (diff > tolerance) {
    return {
      valid: false,
      reason: `Mask aspect ratio (${maskAspect.toFixed(3)}) diverges from image (${imageAspect.toFixed(3)}) by ${(diff * 100).toFixed(1)}%`,
    };
  }

  return { valid: true };
}
