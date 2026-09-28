/**
 * SatQuery AI — Canonical Spatial Evidence Viewer Engine
 *
 * Implements the single reusable spatial viewport engine for satellite
 * imagery and exact spatial evidence overlays.
 *
 * CRITICAL GEOMETRY RULE:
 * The satellite image and every spatial overlay (masks, bounding boxes,
 * polygons, point markers, crops) share ONE single coordinate transformation.
 * Overlays are transformed relative to the rendered image rect, NEVER relative
 * to the surrounding panel, card, or viewport.
 *
 * Features:
 * - Base satellite imagery with aspect-ratio containment and loading skeleton
 * - Multiple comparison modes: single, before, after, swipe, side-by-side, difference, change_mask, optical, sar, fused
 * - Polygon masks and bounding boxes with category styling
 * - Coordinate readout (raster pixel, CRS, coordinate frame verification)
 * - Interactive zoom (wheel + buttons), pan (drag), reset (fit-to-image), fullscreen
 * - Crop focus (smoothly centers and frames target evidence box)
 * - Bi-directional hover and selection synchronization
 * - Overlay opacity slider and layer visibility toggles
 * - Explicit "Spatial evidence unavailable" protection for unmapped geometries
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { EvidenceObject, Observation } from "@/lib/types";
import type { LifecycleState } from "@/lib/workflow/types";
import { fallbackOpticalBefore, fallbackOpticalAfter, fallbackSar } from "@/lib/mock-data";
import {
  computeCropFocusTransform,
  computeRenderedImageRect,
  sourceToNormalizedBox,
  sourceToNormalizedPolygon,
  type NormalizedBox,
  type RenderedImageRect,
  type ViewportTransform,
} from "@/lib/spatial-transform";

export type ViewMode =
  | "single"
  | "before"
  | "after"
  | "swipe"
  | "side_by_side"
  | "difference"
  | "change_mask"
  | "optical"
  | "sar"
  | "fused";

/* ---------- Category-Driven Evidence Styling ---------- */

type EvidenceCategoryKey =
  "water" | "built_up" | "vegetation" | "infrastructure" | "change" | "default";

interface CategoryColors {
  fill: string;
  fillActive: string;
  stroke: string;
  strokeActive: string;
  borderClass: string;
  borderActiveClass: string;
  labelBg: string;
  legendLabel: string;
  dashed: boolean;
}

const CATEGORY_COLORS: Record<EvidenceCategoryKey, CategoryColors> = {
  water: {
    fill: "rgba(14, 165, 233, 0.28)",
    fillActive: "rgba(14, 165, 233, 0.45)",
    stroke: "rgba(56, 189, 248, 0.85)",
    strokeActive: "#38bdf8",
    borderClass: "border-sky-400/70 border hover:border-sky-400 hover:bg-sky-500/5",
    borderActiveClass: "border-sky-400 border-2 bg-sky-500/10 ring-2 ring-sky-400/50",
    labelBg: "bg-slate-950/90 text-sky-400 border border-sky-400/60",
    legendLabel: "Water Body",
    dashed: false,
  },
  built_up: {
    fill: "rgba(245, 158, 11, 0.20)",
    fillActive: "rgba(245, 158, 11, 0.38)",
    stroke: "rgba(251, 191, 36, 0.85)",
    strokeActive: "#fbbf24",
    borderClass: "border-amber-400/70 border hover:border-amber-400 hover:bg-amber-500/5",
    borderActiveClass: "border-amber-400 border-2 bg-amber-500/10 ring-2 ring-amber-400/50",
    labelBg: "bg-slate-950/90 text-amber-400 border border-amber-400/60",
    legendLabel: "Built-Up",
    dashed: true,
  },
  vegetation: {
    fill: "rgba(16, 185, 129, 0.22)",
    fillActive: "rgba(16, 185, 129, 0.40)",
    stroke: "rgba(52, 211, 153, 0.85)",
    strokeActive: "#34d399",
    borderClass: "border-emerald-400/70 border hover:border-emerald-400 hover:bg-emerald-500/5",
    borderActiveClass: "border-emerald-400 border-2 bg-emerald-500/10 ring-2 ring-emerald-400/50",
    labelBg: "bg-slate-950/90 text-emerald-400 border border-emerald-400/60",
    legendLabel: "Vegetation",
    dashed: false,
  },
  infrastructure: {
    fill: "rgba(168, 85, 247, 0.22)",
    fillActive: "rgba(168, 85, 247, 0.40)",
    stroke: "rgba(192, 132, 252, 0.85)",
    strokeActive: "#c084fc",
    borderClass: "border-purple-400/70 border hover:border-purple-400 hover:bg-purple-500/5",
    borderActiveClass: "border-purple-400 border-2 bg-purple-500/10 ring-2 ring-purple-400/50",
    labelBg: "bg-slate-950/90 text-purple-400 border border-purple-400/60",
    legendLabel: "Infrastructure",
    dashed: false,
  },
  change: {
    fill: "rgba(239, 68, 68, 0.22)",
    fillActive: "rgba(239, 68, 68, 0.40)",
    stroke: "rgba(248, 113, 113, 0.85)",
    strokeActive: "#f87171",
    borderClass: "border-red-400/70 border hover:border-red-400 hover:bg-red-500/5",
    borderActiveClass: "border-red-400 border-2 bg-red-500/10 ring-2 ring-red-400/50",
    labelBg: "bg-slate-950/90 text-red-400 border border-red-400/60",
    legendLabel: "Change",
    dashed: true,
  },
  default: {
    fill: "rgba(148, 163, 184, 0.22)",
    fillActive: "rgba(148, 163, 184, 0.40)",
    stroke: "rgba(148, 163, 184, 0.85)",
    strokeActive: "#94a3b8",
    borderClass: "border-slate-400/70 border hover:border-slate-400 hover:bg-slate-500/5",
    borderActiveClass: "border-slate-400 border-2 bg-slate-500/10 ring-2 ring-slate-400/50",
    labelBg: "bg-slate-950/90 text-slate-400 border border-slate-400/60",
    legendLabel: "Evidence",
    dashed: false,
  },
};

/**
 * Resolves evidence category from the typed `category` field first,
 * with label-keyword fallback for backward compatibility.
 */
function resolveCategory(ev: EvidenceObject): EvidenceCategoryKey {
  if (ev.category) {
    switch (ev.category) {
      case "water_change":
        return "water";
      case "built_up_expansion":
        return "built_up";
      case "vegetation_change":
        return "vegetation";
      case "infrastructure":
        return "infrastructure";
      default:
        return "change";
    }
  }
  const label = ev.label.toLowerCase();
  if (
    label.includes("water") ||
    label.includes("lake") ||
    label.includes("river") ||
    label.includes("reservoir")
  )
    return "water";
  if (
    label.includes("built") ||
    label.includes("urban") ||
    label.includes("settlement") ||
    label.includes("development")
  )
    return "built_up";
  if (
    label.includes("vegetation") ||
    label.includes("forest") ||
    label.includes("green") ||
    label.includes("crop") ||
    label.includes("land cover")
  )
    return "vegetation";
  if (label.includes("road") || label.includes("infrastructure") || label.includes("bridge"))
    return "infrastructure";
  if (ev.type === "change_region") return "change";
  return "default";
}

export interface GeoViewerProps {
  observations: Observation[];
  evidence: EvidenceObject[];
  activeEvidenceId?: string | null;
  hoveredEvidenceId?: string | null;
  onSelectEvidence?: (id: string | null) => void;
  onHoverEvidence?: (id: string | null) => void;
  acquisitionTarget?: { geometry: NormalizedBox; label: string } | null;
  workflowState?: LifecycleState | undefined;
  query?: string | undefined;
  result?: any | undefined;
  className?: string;
  initialMode?: ViewMode;
}

export function GeoViewer({
  observations,
  evidence,
  activeEvidenceId = null,
  hoveredEvidenceId = null,
  onSelectEvidence,
  onHoverEvidence,
  acquisitionTarget = null,
  workflowState,
  query,
  result,
  className = "",
  initialMode,
}: GeoViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  // Observations resolution
  const primaryObs = observations[0] ?? null;
  const secondaryObs = observations[1] ?? null;
  const hasPair = Boolean(secondaryObs);

  const isTemporalPair =
    hasPair &&
    (primaryObs?.role === "before" ||
      secondaryObs?.role === "after" ||
      secondaryObs?.role === "before");
  const isMultimodalPair =
    hasPair &&
    (primaryObs?.modality === "optical" ||
      secondaryObs?.modality === "sar" ||
      primaryObs?.modality === "sar");

  // Determine initial view mode
  const defaultMode: ViewMode = useMemo(() => {
    if (initialMode) return initialMode;
    if (isTemporalPair) return "swipe";
    if (isMultimodalPair) return "fused";
    return "single";
  }, [initialMode, isTemporalPair, isMultimodalPair]);

  const [mode, setMode] = useState<ViewMode>(defaultMode);
  const [swipePercent, setSwipePercent] = useState(50);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0.85);

  // Visibility toggles
  const [showEvidence, setShowEvidence] = useState(true);
  const [showMasks, setShowMasks] = useState(true);
  const [showBoxes, setShowBoxes] = useState(true);
  const [showLabels, setShowLabels] = useState(true);
  const [showPoints, setShowPoints] = useState(true);
  const [showGrid, setShowGrid] = useState(true);

  // Loading and Natural Dimensions
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [naturalDimensions, setNaturalDimensions] = useState<{ width: number; height: number }>({
    width: primaryObs?.metadata.width ?? 8192,
    height: primaryObs?.metadata.height ?? 8192,
  });

  // Container dimensions from ResizeObserver
  const [containerSize, setContainerSize] = useState({ width: 800, height: 600 });
  const [cursorNorm, setCursorNorm] = useState<{ x: number; y: number } | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [internalHoveredId, setInternalHoveredId] = useState<string | null>(null);

  // Interaction refs
  const dragRef = useRef<{ startX: number; startY: number; panX: number; panY: number } | null>(
    null,
  );

  // Auto-clear loading skeleton safely so canvas never stays blocked
  useEffect(() => {
    const timer = setTimeout(() => {
      setImageLoaded(true);
    }, 100);
    return () => clearTimeout(timer);
  }, [primaryObs?.previewUrl, primaryObs?.id]);

  // Listen to container resizing
  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          setContainerSize({ width: Math.round(width), height: Math.round(height) });
        }
      }
    });

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Compute canonical RenderedImageRect
  const renderedRect: RenderedImageRect = useMemo(() => {
    return computeRenderedImageRect(
      containerSize.width,
      containerSize.height,
      naturalDimensions.width,
      naturalDimensions.height,
    );
  }, [containerSize, naturalDimensions]);

  // Viewport transform
  const viewportTransform: ViewportTransform = useMemo(
    () => ({ zoom, panX: pan.x, panY: pan.y }),
    [zoom, pan.x, pan.y],
  );

  // Filter evidence per geometry safety rule
  const { validEvidence, unmappedEvidence } = useMemo(() => {
    const valid: Array<{
      evidence: EvidenceObject;
      box: NormalizedBox;
      polygon: Array<[number, number]> | null;
    }> = [];
    const unmapped: EvidenceObject[] = [];

    for (const ev of evidence) {
      if (!ev.geometry) {
        continue;
      }
      const box = sourceToNormalizedBox(
        ev.geometry,
        ev.coordinateFrame,
        naturalDimensions.width,
        naturalDimensions.height,
      );
      if (box) {
        const polygon = sourceToNormalizedPolygon(
          ev.polygon,
          ev.coordinateFrame,
          naturalDimensions.width,
          naturalDimensions.height,
        );
        valid.push({ evidence: ev, box, polygon });
      } else {
        unmapped.push(ev);
      }
    }

    return { validEvidence: valid, unmappedEvidence: unmapped };
  }, [evidence, naturalDimensions]);

  // Center & Fit
  const handleFit = useCallback(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, []);

  // Fullscreen toggle
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  }, []);

  // Focus directly on target evidence crop
  const focusOnEvidence = useCallback(
    (ev: EvidenceObject) => {
      onSelectEvidence?.(ev.id);
      const box = sourceToNormalizedBox(
        ev.geometry,
        ev.coordinateFrame,
        naturalDimensions.width,
        naturalDimensions.height,
      );
      if (!box) return;

      const focus = computeCropFocusTransform(
        box,
        renderedRect,
        containerSize.width,
        containerSize.height,
        3.5,
      );
      setZoom(focus.zoom);
      setPan({ x: focus.panX, y: focus.panY });
    },
    [containerSize, naturalDimensions, onSelectEvidence, renderedRect],
  );

  // Focus when activeEvidenceId changes externally
  useEffect(() => {
    if (!activeEvidenceId) return;
    const item = evidence.find((e) => e.id === activeEvidenceId);
    if (item && item.geometry) {
      const box = sourceToNormalizedBox(
        item.geometry,
        item.coordinateFrame,
        naturalDimensions.width,
        naturalDimensions.height,
      );
      if (box && zoom === 1) {
        // Only auto-frame if currently at 1x fit
        const focus = computeCropFocusTransform(
          box,
          renderedRect,
          containerSize.width,
          containerSize.height,
          2.6,
        );
        setZoom(focus.zoom);
        setPan({ x: focus.panX, y: focus.panY });
      }
    }
  }, [activeEvidenceId, containerSize, evidence, naturalDimensions, renderedRect, zoom]);

  // Wheel Zoom
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.15 : 0.85;
    setZoom((prev) => {
      const next = Math.max(0.8, Math.min(8.0, +(prev * zoomFactor).toFixed(2)));
      return next;
    });
  }, []);

  // Pointer Drag Pan
  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      // Ignore if clicking on interactive buttons
      if ((e.target as HTMLElement).closest("button")) return;
      dragRef.current = {
        startX: e.clientX,
        startY: e.clientY,
        panX: pan.x,
        panY: pan.y,
      };
      e.currentTarget.setPointerCapture(e.pointerId);
    },
    [pan.x, pan.y],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      // Calculate normalized cursor relative to rendered image rect
      if (renderedRect.width > 0 && renderedRect.height > 0) {
        const rect = canvasRef.current?.getBoundingClientRect();
        if (rect) {
          const screenX = e.clientX - rect.left;
          const screenY = e.clientY - rect.top;
          const containerCenterX = containerSize.width / 2;
          const containerCenterY = containerSize.height / 2;

          const unscaledX = (screenX - pan.x - containerCenterX) / zoom + containerCenterX;
          const unscaledY = (screenY - pan.y - containerCenterY) / zoom + containerCenterY;

          const normX = (unscaledX - renderedRect.left) / renderedRect.width;
          const normY = (unscaledY - renderedRect.top) / renderedRect.height;

          if (normX >= 0 && normX <= 1 && normY >= 0 && normY <= 1) {
            setCursorNorm({ x: normX, y: normY });
          } else {
            setCursorNorm(null);
          }
        }
      }

      if (dragRef.current) {
        const dx = e.clientX - dragRef.current.startX;
        const dy = e.clientY - dragRef.current.startY;
        setPan({
          x: dragRef.current.panX + dx,
          y: dragRef.current.panY + dy,
        });
      }
    },
    [containerSize.height, containerSize.width, pan.x, pan.y, renderedRect, zoom],
  );

  const handlePointerUp = useCallback(() => {
    dragRef.current = null;
  }, []);

  // Keyboard shortcuts: 1-9 = focus evidence, Escape = reset
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (
        (e.target as HTMLElement).tagName === "INPUT" ||
        (e.target as HTMLElement).tagName === "TEXTAREA"
      )
        return;
      if (e.key === "Escape") {
        handleFit();
        onSelectEvidence?.(null);
        return;
      }
      const digit = parseInt(e.key, 10);
      if (digit >= 1 && digit <= 9 && digit <= validEvidence.length) {
        focusOnEvidence(validEvidence[digit - 1]!.evidence);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleFit, onSelectEvidence, validEvidence, focusOnEvidence]);

  // Coordinate Readout calculations
  const gsd = primaryObs?.metadata.resolutionM ?? 0.6;
  const rasterW = naturalDimensions.width;
  const rasterH = naturalDimensions.height;

  const readout = useMemo(() => {
    if (!cursorNorm) return null;
    return {
      px: Math.round(cursorNorm.x * rasterW),
      py: Math.round(cursorNorm.y * rasterH),
    };
  }, [cursorNorm, rasterW, rasterH]);

  // Layer image URL resolution based on mode
  const primaryUrl = primaryObs?.previewUrl ?? "";
  const secondaryUrl = secondaryObs?.previewUrl ?? primaryUrl;

  const activeHoverId = hoveredEvidenceId ?? internalHoveredId;

  return (
    <div
      ref={containerRef}
      className={`flex h-full min-h-0 min-w-0 max-w-full flex-col overflow-hidden bg-background text-foreground ${className}`}
    >
      {/* Main Canvas Viewport Area — Recomposed Canvas-Dominant Instrument */}
      <div
        ref={canvasRef}
        onWheel={handleWheel}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={() => {
          dragRef.current = null;
          setCursorNorm(null);
        }}
        className="relative min-h-[420px] flex-1 cursor-grab select-none overflow-hidden bg-slate-950 active:cursor-grabbing"
      >
        {/* Floating Contextual Instrument Bar (Canvas-Overlaid) */}
        <div className="pointer-events-auto absolute top-2.5 left-2.5 right-2.5 z-30 flex flex-wrap items-center justify-between gap-x-3 gap-y-1 rounded border border-border/80 bg-slate-950/85 p-1.5 font-mono text-[9.5px] backdrop-blur-md shadow-2xl">
          {/* Mode Selector */}
          {hasPair && (
            <ToolGroup label="mode">
              {isTemporalPair && (
                <>
                  <ToolButton active={mode === "swipe"} onClick={() => setMode("swipe")}>
                    swipe
                  </ToolButton>
                  <ToolButton
                    active={mode === "side_by_side"}
                    onClick={() => setMode("side_by_side")}
                  >
                    split
                  </ToolButton>
                  <ToolButton active={mode === "difference"} onClick={() => setMode("difference")}>
                    diff
                  </ToolButton>
                  <ToolButton active={mode === "change_mask"} onClick={() => setMode("change_mask")}>
                    change
                  </ToolButton>
                  <ToolButton active={mode === "before"} onClick={() => setMode("before")}>
                    t1
                  </ToolButton>
                  <ToolButton active={mode === "after"} onClick={() => setMode("after")}>
                    t2
                  </ToolButton>
                </>
              )}
              {isMultimodalPair && !isTemporalPair && (
                <>
                  <ToolButton active={mode === "fused"} onClick={() => setMode("fused")}>
                    fused
                  </ToolButton>
                  <ToolButton active={mode === "swipe"} onClick={() => setMode("swipe")}>
                    swipe
                  </ToolButton>
                  <ToolButton
                    active={mode === "side_by_side"}
                    onClick={() => setMode("side_by_side")}
                  >
                    split
                  </ToolButton>
                  <ToolButton active={mode === "optical"} onClick={() => setMode("optical")}>
                    optical
                  </ToolButton>
                  <ToolButton active={mode === "sar"} onClick={() => setMode("sar")}>
                    sar
                  </ToolButton>
                </>
              )}
            </ToolGroup>
          )}

          {/* Layer Toggles */}
          <ToolGroup label="layers">
            <ToolButton active={showEvidence} onClick={() => setShowEvidence((v) => !v)}>
              evidence
            </ToolButton>
            {showEvidence && (
              <>
                <ToolButton active={showMasks} onClick={() => setShowMasks((v) => !v)}>
                  mask
                </ToolButton>
                <ToolButton active={showBoxes} onClick={() => setShowBoxes((v) => !v)}>
                  bbox
                </ToolButton>
                <ToolButton active={showLabels} onClick={() => setShowLabels((v) => !v)}>
                  tag
                </ToolButton>
                <ToolButton active={showPoints} onClick={() => setShowPoints((v) => !v)}>
                  pin
                </ToolButton>
              </>
            )}
            <ToolButton active={showGrid} onClick={() => setShowGrid((v) => !v)}>
              grid
            </ToolButton>
          </ToolGroup>

          {/* Navigation & Controls */}
          <ToolGroup label="viewport">
            <ToolButton onClick={() => setZoom((z) => Math.min(8, +(z * 1.3).toFixed(2)))}>
              +
            </ToolButton>
            <ToolButton onClick={() => setZoom((z) => Math.max(0.8, +(z / 1.3).toFixed(2)))}>
              −
            </ToolButton>
            <ToolButton onClick={handleFit}>fit</ToolButton>
            <ToolButton active={isFullscreen} onClick={toggleFullscreen}>
              {isFullscreen ? "exit" : "full"}
            </ToolButton>
          </ToolGroup>

          {/* Opacity Slider */}
          <div className="flex items-center gap-1.5 pl-1">
            <span className="text-muted-foreground uppercase tracking-[0.14em]">alpha</span>
            <input
              type="range"
              min={0.1}
              max={1}
              step={0.05}
              value={opacity}
              aria-label="Evidence overlay opacity"
              onChange={(e) => setOpacity(Number(e.target.value))}
              className="h-1 w-12 cursor-pointer appearance-none bg-border accent-primary"
            />
          </div>

          {/* Truth & Provenance Status Pill */}
          <div className="flex items-center gap-1 border-l border-border/60 pl-2">
            <span className="border border-sky-500/40 bg-sky-500/10 px-1.5 py-0.5 text-[8.5px] font-bold uppercase tracking-wider text-sky-400">
              DEMO FIXTURE ASSET
            </span>
          </div>
        </div>
        {/* Loading skeleton */}
        {!imageLoaded && !imageError && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-2 bg-background/80 font-mono text-xs text-muted-foreground backdrop-blur-sm">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <span className="uppercase tracking-[0.18em]">Streaming Raster Dataset...</span>
          </div>
        )}

        {/* Error state */}
        {imageError && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-2 bg-background/90 p-4 text-center font-mono text-xs text-destructive">
            <span className="font-semibold uppercase tracking-[0.18em]">
              Raster Ingestion Error
            </span>
            <span className="text-[11px] text-muted-foreground">
              Unable to load preview tile for {primaryObs?.filename ?? "observation"}.
            </span>
          </div>
        )}

        {/* Unmapped evidence warning banner */}
        {unmappedEvidence.length > 0 && showEvidence && (
          <div className="absolute top-2 left-2 z-30 flex items-center gap-1.5 border border-amber-500/70 bg-background/95 px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.14em] text-amber-400 shadow backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
            <span>
              Spatial evidence unavailable for {unmappedEvidence.length} artifact(s) (unmapped
              coordinate frame)
            </span>
          </div>
        )}

        {/* Graticule grid backdrop */}
        {showGrid && (
          <div className="pointer-events-none absolute inset-0 grid-backdrop opacity-[0.12]" />
        )}

        {/* Workflow state badges */}
        {workflowState === "UPLOADING" && (
          <div className="pointer-events-none absolute left-3 top-3 z-10 flex items-center gap-1.5 border border-primary/60 bg-background/90 px-2 py-1 font-mono text-[9px] uppercase tracking-[0.16em] text-primary backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-primary pulse-dot" />
            STREAMING RASTER DATASET
          </div>
        )}
        {workflowState === "EXECUTING" && (
          <div className="pointer-events-none absolute left-3 top-3 z-10 flex items-center gap-1.5 border border-primary/60 bg-background/90 px-2 py-1 font-mono text-[9px] uppercase tracking-[0.16em] text-primary backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-primary pulse-dot" />
            SPECIALIST MODEL INFERENCE
          </div>
        )}

        {/* Side-by-side mode rendering */}
        {mode === "side_by_side" && secondaryObs ? (
          <div className="absolute inset-0 flex divide-x divide-border">
            {/* Left Pane (Primary) */}
            <div className="relative flex-1 overflow-hidden">
              <span className="absolute top-12 left-3 z-20 bg-slate-950/90 border border-border/80 px-2 py-1 font-mono text-[9.5px] font-bold uppercase tracking-[0.16em] text-foreground shadow-md backdrop-blur">
                {primaryObs?.role ?? "Primary"} · {primaryObs?.modality.toUpperCase()}
              </span>
              <RenderStage
                url={primaryUrl}
                renderedRect={renderedRect}
                transform={viewportTransform}
                opacity={1}
                alt="Primary observation"
                onLoad={(w, h) => {
                  setNaturalDimensions({ width: w, height: h });
                  setImageLoaded(true);
                }}
                onError={() => setImageError(true)}
              />
              {showEvidence && (
                <EvidenceOverlayStage
                  renderedRect={renderedRect}
                  transform={viewportTransform}
                  validEvidence={validEvidence}
                  activeEvidenceId={activeEvidenceId}
                  hoveredEvidenceId={activeHoverId}
                  showMasks={showMasks}
                  showBoxes={showBoxes}
                  showLabels={showLabels}
                  showPoints={showPoints}
                  opacity={opacity}
                  query={query}
                  result={result}
                  onSelect={focusOnEvidence}
                  onHover={(id) => {
                    setInternalHoveredId(id);
                    onHoverEvidence?.(id);
                  }}
                />
              )}
            </div>

            {/* Right Pane (Secondary) */}
            <div className="relative flex-1 overflow-hidden">
              <span className="absolute top-12 left-3 z-20 bg-slate-950/90 border border-border/80 px-2 py-1 font-mono text-[9.5px] font-bold uppercase tracking-[0.16em] text-foreground shadow-md backdrop-blur">
                {secondaryObs.role ?? "Secondary"} · {secondaryObs.modality.toUpperCase()}
              </span>
              <RenderStage
                url={secondaryUrl}
                renderedRect={renderedRect}
                transform={viewportTransform}
                opacity={1}
                alt="Secondary observation"
              />
              {showEvidence && (
                <EvidenceOverlayStage
                  renderedRect={renderedRect}
                  transform={viewportTransform}
                  validEvidence={validEvidence}
                  activeEvidenceId={activeEvidenceId}
                  hoveredEvidenceId={activeHoverId}
                  showMasks={showMasks}
                  showBoxes={showBoxes}
                  showLabels={showLabels}
                  showPoints={showPoints}
                  opacity={opacity}
                  query={query}
                  result={result}
                  onSelect={focusOnEvidence}
                  onHover={(id) => {
                    setInternalHoveredId(id);
                    onHoverEvidence?.(id);
                  }}
                />
              )}
            </div>
          </div>
        ) : (
          /* Standard Single/Swipe/Difference/Fused Stage */
          <div className="absolute inset-0 overflow-hidden">
            {/* Base Image Layer */}
            <RenderStage
              url={mode === "after" || mode === "sar" ? secondaryUrl : primaryUrl}
              renderedRect={renderedRect}
              transform={viewportTransform}
              opacity={1}
              alt="Base satellite raster"
              className={mode === "difference" ? "contrast-125 saturate-0" : ""}
              onLoad={(w, h) => {
                setNaturalDimensions({ width: w, height: h });
                setImageLoaded(true);
              }}
              onError={() => setImageError(true)}
            />

            {/* Secondary Layer for Swipe / Difference / Fused */}
            {secondaryObs && (mode === "swipe" || mode === "difference" || mode === "fused") && (
              <RenderStage
                url={secondaryUrl}
                renderedRect={renderedRect}
                transform={viewportTransform}
                opacity={mode === "fused" ? 0.75 : 1}
                alt="Secondary raster layer"
                className={
                  mode === "difference"
                    ? "saturate-0 contrast-150"
                    : mode === "fused"
                      ? "mix-blend-screen"
                      : ""
                }
                style={
                  mode === "swipe"
                    ? { clipPath: `inset(0 0 0 ${swipePercent}%)` }
                    : mode === "difference"
                      ? { mixBlendMode: "difference", opacity: 0.95 }
                      : undefined
                }
              />
            )}

            {/* Swipe Curtain Bar */}
            {secondaryObs && mode === "swipe" && (
              <>
                <div
                  className="pointer-events-none absolute inset-y-0 z-20 w-0.5 bg-primary shadow-lg"
                  style={{ left: `${swipePercent}%` }}
                >
                  <div className="absolute top-1/2 -left-3 -translate-y-1/2 rounded-full border border-primary bg-background p-1 text-[8px] text-primary shadow">
                    ◀▶
                  </div>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={swipePercent}
                  aria-label="Temporal comparison wipe slider"
                  onChange={(e) => setSwipePercent(Number(e.target.value))}
                  className="absolute inset-x-0 bottom-8 z-30 mx-auto h-1.5 w-[65%] cursor-ew-resize appearance-none bg-border/70 accent-primary"
                />
                <span className="absolute top-12 left-3 z-20 bg-slate-950/90 border border-border/80 px-2 py-1 font-mono text-[9.5px] font-bold uppercase tracking-[0.14em] text-foreground shadow-md backdrop-blur">
                  {primaryObs?.role} · {primaryObs?.metadata.acquiredAt}
                </span>
                <span className="absolute top-12 right-3 z-20 bg-slate-950/90 border border-border/80 px-2 py-1 font-mono text-[9.5px] font-bold uppercase tracking-[0.14em] text-foreground shadow-md backdrop-blur">
                  {secondaryObs.role} · {secondaryObs.metadata.acquiredAt}
                </span>
              </>
            )}

            {/* Canonical Spatial Evidence Overlay Stage */}
            {showEvidence && (
              <EvidenceOverlayStage
                renderedRect={renderedRect}
                transform={viewportTransform}
                validEvidence={validEvidence}
                activeEvidenceId={activeEvidenceId}
                hoveredEvidenceId={activeHoverId}
                showMasks={showMasks}
                showBoxes={showBoxes}
                showLabels={showLabels}
                showPoints={showPoints}
                opacity={opacity}
                query={query}
                result={result}
                onSelect={focusOnEvidence}
                onHover={(id) => {
                  setInternalHoveredId(id);
                  onHoverEvidence?.(id);
                }}
              />
            )}

            {/* Targeted Evidence Acquisition Focus Stage */}
            {acquisitionTarget && (
              <AcquisitionTargetStage
                renderedRect={renderedRect}
                transform={viewportTransform}
                target={acquisitionTarget}
              />
            )}
          </div>
        )}

        {/* Crosshair indicator */}
        {cursorNorm && (
          <Crosshair
            cursorNorm={cursorNorm}
            renderedRect={renderedRect}
            transform={viewportTransform}
          />
        )}

        {/* Category-Driven Evidence Legend */}
        {showEvidence && validEvidence.length > 0 && (
          <div className="pointer-events-none absolute bottom-3 left-3 z-20 flex flex-col gap-1 border border-border/80 bg-background/95 px-2.5 py-1.5 font-mono text-[9px] uppercase tracking-[0.14em] backdrop-blur">
            <span className="text-[8px] font-semibold text-muted-foreground">Evidence Legend</span>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              {Array.from(new Set(validEvidence.map(({ evidence: e }) => resolveCategory(e)))).map(
                (cat) => {
                  const cc = CATEGORY_COLORS[cat];
                  return (
                    <span key={cat} className="flex items-center gap-1.5">
                      <span
                        className="h-2 w-3 rounded-xs border"
                        style={{
                          borderColor: cc.strokeActive,
                          borderStyle: cc.dashed ? "dashed" : "solid",
                          backgroundColor: cc.fill,
                        }}
                      />
                      <span style={{ color: cc.strokeActive }}>{cc.legendLabel}</span>
                    </span>
                  );
                },
              )}
            </div>
          </div>
        )}

        {/* Minimap Context (visible when zoomed > 1.3×) */}
        {zoom > 1.3 && imageLoaded && (
          <Minimap
            imageUrl={primaryUrl}
            zoom={zoom}
            pan={pan}
            renderedRect={renderedRect}
            containerSize={containerSize}
            onNavigate={(normX, normY) => {
              const cCenterX = containerSize.width / 2;
              const cCenterY = containerSize.height / 2;
              const targetX = renderedRect.left + normX * renderedRect.width;
              const targetY = renderedRect.top + normY * renderedRect.height;
              setPan({
                x: (cCenterX - targetX) * zoom,
                y: (cCenterY - targetY) * zoom,
              });
            }}
          />
        )}

        {/* Floating Telemetry & Coordinate HUD */}
        <div className="pointer-events-none absolute bottom-3 right-3 z-30 flex items-center gap-3 border border-border/80 bg-slate-950/90 px-3 py-1 font-mono text-[9px] text-muted-foreground shadow-xl backdrop-blur-md rounded">
          <span className="flex items-center gap-1 text-foreground">
            <span>▲ N</span>
          </span>
          <span className="text-border">|</span>
          <span className="flex items-center gap-1">
            <span className="block h-1 w-10 border-x border-b border-primary" />
            <span className="text-primary font-bold">{Math.round((gsd * rasterW) / 10 / zoom)} m</span>
          </span>
          <span className="text-border">|</span>
          <span>{zoom.toFixed(2)}×</span>
          <span className="text-border">|</span>
          <span>PX: <strong className="text-foreground">{readout ? `${readout.px}, ${readout.py}` : "—"}</strong></span>
          <span className="text-border">|</span>
          <span>CRS: <strong className="text-foreground">{primaryObs?.metadata.crs ?? "EPSG:4326"}</strong></span>
        </div>
      </div>
    </div>
  );
}

/**
 * Base Raster Render Stage
 * Anchors the image strictly inside the computed aspect-ratio RenderedImageRect
 * and applies the hardware transform matrix.
 */
function RenderStage({
  url,
  renderedRect,
  transform,
  opacity = 1,
  alt,
  className = "",
  style,
  onLoad,
  onError,
}: {
  url: string;
  renderedRect: RenderedImageRect;
  transform: ViewportTransform;
  opacity?: number;
  alt: string;
  className?: string | undefined;
  style?: React.CSSProperties | undefined;
  onLoad?: ((naturalWidth: number, naturalHeight: number) => void) | undefined;
  onError?: (() => void) | undefined;
}) {
  const imgRef = useRef<HTMLImageElement>(null);
  const [currentSrc, setCurrentSrc] = useState(url || fallbackOpticalBefore);

  useEffect(() => {
    if (url) {
      setCurrentSrc(url);
    }
  }, [url]);

  useEffect(() => {
    if (imgRef.current?.complete && imgRef.current.naturalWidth > 0) {
      onLoad?.(imgRef.current.naturalWidth, imgRef.current.naturalHeight);
    }
  }, [currentSrc, onLoad]);

  const handleError = () => {
    const isSar = alt.toLowerCase().includes("sar") || url.includes("sar");
    const isAfter = alt.toLowerCase().includes("after") || alt.toLowerCase().includes("t2");
    const fallback = isSar ? fallbackSar : isAfter ? fallbackOpticalAfter : fallbackOpticalBefore;
    setCurrentSrc(fallback);
    onLoad?.(8192, 8192);
    onError?.();
  };

  return (
    <div
      className="absolute overflow-hidden"
      style={{
        left: `${renderedRect.left}px`,
        top: `${renderedRect.top}px`,
        width: `${renderedRect.width}px`,
        height: `${renderedRect.height}px`,
        transform: `translate(${transform.panX}px, ${transform.panY}px) scale(${transform.zoom})`,
        transformOrigin: "center",
        ...style,
      }}
    >
      <img
        ref={imgRef}
        src={currentSrc}
        alt={alt}
        draggable={false}
        onLoad={(e) => {
          const img = e.currentTarget;
          onLoad?.(img.naturalWidth || 8192, img.naturalHeight || 8192);
        }}
        onError={handleError}
        className={`h-full w-full object-fill ${className}`}
        style={{ opacity }}
      />
    </div>
  );
}

function isQueryMatch(ev: EvidenceObject, query?: string): boolean {
  if (!query) return false;
  const q = query.toLowerCase();
  const l = ev.label.toLowerCase();
  const cat = resolveCategory(ev);

  if (q.includes("water") && (cat === "water" || l.includes("water") || l.includes("lake"))) return true;
  if ((q.includes("built") || q.includes("building") || q.includes("structure")) && (cat === "built_up" || l.includes("built") || l.includes("urban"))) return true;
  if (q.includes("change") && (cat === "change" || ev.type === "change_region")) return true;
  if ((q.includes("vegetation") || q.includes("crop") || q.includes("land cover")) && (cat === "vegetation" || l.includes("vegetation"))) return true;
  if (q.includes("optical") || q.includes("sar") || q.includes("modality")) return true;
  return false;
}

/**
 * Canonical Evidence Overlay Stage — Category-Driven & Query-Responsive
 * Perfectly aligned with the RenderStage rect and inherits the identical transform.
 * Uses resolveCategory() for data-driven styling and anchors query-matched targets.
 */
function EvidenceOverlayStage({
  renderedRect,
  transform,
  validEvidence,
  activeEvidenceId,
  hoveredEvidenceId,
  showMasks,
  showBoxes,
  showLabels,
  showPoints,
  opacity,
  query,
  result,
  onSelect,
  onHover,
}: {
  renderedRect: RenderedImageRect;
  transform: ViewportTransform;
  validEvidence: Array<{
    evidence: EvidenceObject;
    box: NormalizedBox;
    polygon: Array<[number, number]> | null;
  }>;
  activeEvidenceId: string | null;
  hoveredEvidenceId: string | null;
  showMasks: boolean;
  showBoxes: boolean;
  showLabels: boolean;
  showPoints: boolean;
  opacity: number;
  query?: string | undefined;
  result?: any | undefined;
  onSelect: (ev: EvidenceObject) => void;
  onHover: (id: string | null) => void;
}) {
  return (
    <div
      className="pointer-events-none absolute"
      style={{
        left: `${renderedRect.left}px`,
        top: `${renderedRect.top}px`,
        width: `${renderedRect.width}px`,
        height: `${renderedRect.height}px`,
        transform: `translate(${transform.panX}px, ${transform.panY}px) scale(${transform.zoom})`,
        transformOrigin: "center",
      }}
    >
      {/* SVG Polygons Mask Layer */}
      {showMasks && (
        <svg
          className="pointer-events-none absolute inset-0 h-full w-full"
          viewBox="0 0 1000 1000"
          preserveAspectRatio="none"
          style={{ opacity }}
        >
          {validEvidence.map(({ evidence: e, polygon }) => {
            if (!polygon || polygon.length < 3) return null;
            const active = activeEvidenceId === e.id;
            const hovered = hoveredEvidenceId === e.id;
            const cat = resolveCategory(e);
            const cc = CATEGORY_COLORS[cat];
            const isMatch = isQueryMatch(e, query);
            const points = polygon
              .map(([x, y]) => `${Math.round(x * 1000)},${Math.round(y * 1000)}`)
              .join(" ");

            return (
              <polygon
                key={`poly-${e.id}`}
                points={points}
                fill={active || hovered || isMatch ? cc.fillActive : cc.fill}
                stroke={active || hovered || isMatch ? cc.strokeActive : cc.stroke}
                strokeWidth={active || hovered || isMatch ? "2.5" : "1.2"}
                strokeDasharray={cc.dashed ? "4 3" : undefined}
                className="transition-all"
              />
            );
          })}
        </svg>
      )}

      {/* Point Markers Layer */}
      {showPoints &&
        validEvidence.map(({ evidence: e, box }) => {
          const cat = resolveCategory(e);
          const cc = CATEGORY_COLORS[cat];
          const active = activeEvidenceId === e.id;
          const hovered = hoveredEvidenceId === e.id;
          const isMatch = isQueryMatch(e, query);
          const cx = (box.x + box.w / 2) * 100;
          const cy = (box.y + box.h / 2) * 100;

          return (
            <button
              key={`pin-${e.id}`}
              type="button"
              onClick={(ev) => {
                ev.stopPropagation();
                onSelect(e);
              }}
              onMouseEnter={() => onHover(e.id)}
              onMouseLeave={() => onHover(null)}
              className="pointer-events-auto absolute flex items-center justify-center cursor-pointer"
              style={{
                left: `${cx}%`,
                top: `${cy}%`,
                transform: "translate(-50%, -50%)",
                width: active || hovered || isMatch ? "16px" : "10px",
                height: active || hovered || isMatch ? "16px" : "10px",
                transition: "all 150ms ease-out",
              }}
              title={`${e.label} [E${e.index}]`}
            >
              <span
                className="block rounded-full shadow-lg"
                style={{
                  width: "100%",
                  height: "100%",
                  backgroundColor: active || hovered || isMatch ? cc.strokeActive : cc.stroke,
                  border: `2px solid ${active || hovered || isMatch ? "#fff" : "rgba(255,255,255,0.5)"}`,
                  boxShadow: active || hovered || isMatch ? `0 0 10px ${cc.strokeActive}` : undefined,
                }}
              />
            </button>
          );
        })}

      {/* Interactive Bounding Boxes & Anchored Labels */}
      {showBoxes &&
        validEvidence.map(({ evidence: e, box }) => {
          const active = activeEvidenceId === e.id;
          const hovered = hoveredEvidenceId === e.id;
          const cat = resolveCategory(e);
          const cc = CATEGORY_COLORS[cat];
          const isMatch = isQueryMatch(e, query);
          const isDisputed = result?.biTemporal?.adversarial?.disagreements?.some(
            (d: any) =>
              d.topic?.toLowerCase().includes(e.label.toLowerCase()) ||
              d.proposerClaim?.toLowerCase().includes(e.label.toLowerCase()),
          );

          const borderStyle = active || hovered || isMatch ? cc.borderActiveClass : cc.borderClass;

          return (
            <button
              key={e.id}
              type="button"
              onClick={(ev) => {
                ev.stopPropagation();
                onSelect(e);
              }}
              onMouseEnter={() => onHover(e.id)}
              onMouseLeave={() => onHover(null)}
              style={{
                left: `${box.x * 100}%`,
                top: `${box.y * 100}%`,
                width: `${box.w * 100}%`,
                height: `${box.h * 100}%`,
              }}
              className={`pointer-events-auto absolute text-left transition-all ${borderStyle} ${
                isMatch ? "ring-2 ring-primary shadow-[0_0_12px_rgba(0,240,255,0.5)]" : ""
              }`}
              title={`Inspect evidence ${e.id}: ${e.label}`}
            >
              {/* Anchored Label Tag */}
              {showLabels && (
                <div className="absolute -top-6 left-0 flex items-center gap-1 whitespace-nowrap shadow-md pointer-events-none">
                  <span
                    className={`flex items-center gap-1 px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-[0.14em] backdrop-blur ${cc.labelBg}`}
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-current" />
                    <span>E{e.index}</span>
                    <span>·</span>
                    <span>{e.label}</span>
                    {e.confidence != null && (
                      <span className="opacity-90 font-mono text-[8.5px]">
                        [{Math.round(e.confidence * 100)}%]
                      </span>
                    )}
                  </span>
                  {isMatch && (
                    <span className="border border-primary bg-primary text-primary-foreground font-extrabold px-1.5 py-0.5 font-mono text-[8px] uppercase tracking-[0.12em] shadow">
                      🎯 TARGET MATCH
                    </span>
                  )}
                  {isDisputed && (
                    <span className="border border-amber-400 bg-amber-500/25 text-amber-300 font-bold px-1.5 py-0.5 font-mono text-[8px] uppercase tracking-[0.12em] shadow">
                      ⚠️ SKEPTIC CONTESTED
                    </span>
                  )}
                </div>
              )}
            </button>
          );
        })}
    </div>
  );
}

/**
 * Crosshair Indicator
 */
function Crosshair({
  cursorNorm,
  renderedRect,
  transform,
}: {
  cursorNorm: { x: number; y: number };
  renderedRect: RenderedImageRect;
  transform: ViewportTransform;
}) {
  return (
    <div
      className="pointer-events-none absolute"
      style={{
        left: `${renderedRect.left}px`,
        top: `${renderedRect.top}px`,
        width: `${renderedRect.width}px`,
        height: `${renderedRect.height}px`,
        transform: `translate(${transform.panX}px, ${transform.panY}px) scale(${transform.zoom})`,
        transformOrigin: "center",
      }}
    >
      <div
        className="absolute inset-y-0 w-px bg-primary/40"
        style={{ left: `${cursorNorm.x * 100}%` }}
      />
      <div
        className="absolute inset-x-0 h-px bg-primary/40"
        style={{ top: `${cursorNorm.y * 100}%` }}
      />
    </div>
  );
}

/**
 * Minimap Context Overview
 * Shows a thumbnail of the full image with a viewport indicator rectangle
 * when zoomed beyond 1.3×.
 */
function Minimap({
  imageUrl,
  zoom,
  pan,
  renderedRect,
  containerSize,
  onNavigate,
}: {
  imageUrl: string;
  zoom: number;
  pan: { x: number; y: number };
  renderedRect: RenderedImageRect;
  containerSize: { width: number; height: number };
  onNavigate: (normX: number, normY: number) => void;
}) {
  const minimapSize = 140;
  const aspect = renderedRect.width > 0 ? renderedRect.height / renderedRect.width : 1;
  const mmW = minimapSize;
  const mmH = Math.round(minimapSize * aspect);

  const containerCenterX = containerSize.width / 2;
  const containerCenterY = containerSize.height / 2;

  const viewLeftNorm =
    ((0 - pan.x - containerCenterX) / zoom + containerCenterX - renderedRect.left) /
    renderedRect.width;
  const viewTopNorm =
    ((0 - pan.y - containerCenterY) / zoom + containerCenterY - renderedRect.top) /
    renderedRect.height;
  const viewRightNorm =
    ((containerSize.width - pan.x - containerCenterX) / zoom +
      containerCenterX -
      renderedRect.left) /
    renderedRect.width;
  const viewBottomNorm =
    ((containerSize.height - pan.y - containerCenterY) / zoom +
      containerCenterY -
      renderedRect.top) /
    renderedRect.height;

  const vx = Math.max(0, Math.min(1, viewLeftNorm));
  const vy = Math.max(0, Math.min(1, viewTopNorm));
  const vw = Math.max(0, Math.min(1, viewRightNorm)) - vx;
  const vh = Math.max(0, Math.min(1, viewBottomNorm)) - vy;

  return (
    <div
      className="absolute top-12 left-3 z-30 overflow-hidden border border-border/80 bg-background/90 shadow-lg backdrop-blur cursor-pointer"
      style={{ width: mmW, height: mmH }}
      onClick={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const normX = (e.clientX - rect.left) / rect.width;
        const normY = (e.clientY - rect.top) / rect.height;
        onNavigate(Math.max(0, Math.min(1, normX)), Math.max(0, Math.min(1, normY)));
      }}
    >
      <img
        src={imageUrl}
        alt="Minimap overview"
        draggable={false}
        className="h-full w-full object-fill pointer-events-none"
      />
      <div
        className="absolute border border-primary bg-primary/15 pointer-events-none"
        style={{
          left: `${vx * 100}%`,
          top: `${vy * 100}%`,
          width: `${vw * 100}%`,
          height: `${vh * 100}%`,
        }}
      />
      <span className="absolute bottom-0.5 right-1 font-mono text-[8px] uppercase tracking-[0.14em] text-primary/80 pointer-events-none">
        {zoom.toFixed(1)}×
      </span>
    </div>
  );
}

function ToolGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-muted-foreground font-bold uppercase tracking-[0.14em] text-[8.5px]">{label}</span>
      <div className="flex items-center gap-1">{children}</div>
    </div>
  );
}

function ToolButton({
  active,
  onClick,
  children,
}: {
  active?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`border px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-[0.12em] transition-all cursor-pointer ${
        active
          ? "border-primary bg-primary text-primary-foreground shadow-sm"
          : "border-border bg-slate-900/90 text-foreground hover:border-primary hover:bg-panel-raised hover:text-primary"
      }`}
    >
      {children}
    </button>
  );
}

function Readout({ label, value }: { label: string; value: string }) {
  return (
    <span className="flex items-baseline justify-between gap-1 truncate">
      <span className="uppercase tracking-[0.12em]">{label}</span>
      <span className="truncate text-foreground">{value}</span>
    </span>
  );
}

function AcquisitionTargetStage({
  renderedRect,
  transform,
  target,
}: {
  renderedRect: RenderedImageRect;
  transform: ViewportTransform;
  target: { geometry: NormalizedBox; label: string };
}) {
  const box = target.geometry;
  const leftPct = box.x * 100;
  const topPct = box.y * 100;
  const widthPct = box.w * 100;
  const heightPct = box.h * 100;

  return (
    <div
      className="pointer-events-none absolute z-30"
      style={{
        left: `${renderedRect.left}px`,
        top: `${renderedRect.top}px`,
        width: `${renderedRect.width}px`,
        height: `${renderedRect.height}px`,
        transform: `translate(${transform.panX}px, ${transform.panY}px) scale(${transform.zoom})`,
        transformOrigin: "center",
      }}
    >
      <div
        className="absolute border-2 border-amber-400 bg-amber-500/20 shadow-[0_0_14px_rgba(245,158,11,0.6)] animate-pulse"
        style={{
          left: `${leftPct}%`,
          top: `${topPct}%`,
          width: `${widthPct}%`,
          height: `${heightPct}%`,
        }}
      >
        <div className="absolute -top-1 -left-1 w-2.5 h-2.5 border-t-2 border-l-2 border-amber-300" />
        <div className="absolute -top-1 -right-1 w-2.5 h-2.5 border-t-2 border-r-2 border-amber-300" />
        <div className="absolute -bottom-1 -left-1 w-2.5 h-2.5 border-b-2 border-l-2 border-amber-300" />
        <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 border-b-2 border-r-2 border-amber-300" />
        <div className="absolute -top-5 left-0 whitespace-nowrap border border-amber-400 bg-slate-950/95 px-1.5 py-0.5 font-mono text-[8.5px] font-bold uppercase text-amber-300 shadow-md">
          🎯 ACQUISITION TARGET: {target.label}
        </div>
      </div>
    </div>
  );
}
