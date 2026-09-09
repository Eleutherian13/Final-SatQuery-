import { useCallback, useMemo, useRef, useState } from "react";
import type { EvidenceObject, Observation } from "@/lib/types";

type CompareMode = "single" | "swipe" | "blink" | "difference";

const LAYER_BORDER: Record<string, string> = {
  optical: "border-optical",
  sar: "border-sar",
  change: "border-change",
  fused: "border-primary",
  before: "border-muted-foreground",
  after: "border-change",
};

interface Props {
  observations: Observation[];
  evidence: EvidenceObject[];
  activeEvidenceId: string | null;
  onSelectEvidence: (id: string) => void;
}

/**
 * Primary analytical canvas: zoom / pan, swipe + blink comparison, layer
 * toggles, coordinate readout and evidence overlays. All coordinates are
 * derived from the demo raster metadata and labelled DEMO.
 */
export function GeoViewer({ observations, evidence, activeEvidenceId, onSelectEvidence }: Props) {
  const primary = observations[0]!;
  const secondary = observations[1] ?? null;
  const isPair = Boolean(secondary);

  const [mode, setMode] = useState<CompareMode>(isPair ? "swipe" : "single");
  const [swipe, setSwipe] = useState(50);
  const [blinkSecond, setBlinkSecond] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [showEvidence, setShowEvidence] = useState(true);
  const [showGrid, setShowGrid] = useState(true);
  const [cursor, setCursor] = useState<{ x: number; y: number } | null>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ x: number; y: number } | null>(null);

  const activeMode: CompareMode = isPair ? mode : "single";
  const gsd = primary.metadata.resolutionM ?? 0.6;
  const rasterW = primary.metadata.width ?? 8192;
  const rasterH = primary.metadata.height ?? 8192;

  const readout = useMemo(() => {
    if (!cursor) return null;
    const lat = 23.2081 + (0.5 - cursor.y) * 0.045;
    const lon = 77.449 + (cursor.x - 0.5) * 0.045;
    return {
      lat: `${lat.toFixed(4)}° N`,
      lon: `${lon.toFixed(4)}° E`,
      px: Math.round(cursor.x * rasterW),
      py: Math.round(cursor.y * rasterH),
    };
  }, [cursor, rasterW, rasterH]);

  const onMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const rect = frameRef.current?.getBoundingClientRect();
      if (!rect) return;
      setCursor({
        x: Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width)),
        y: Math.min(1, Math.max(0, (e.clientY - rect.top) / rect.height)),
      });
      if (dragRef.current) {
        setOffset({
          x: offset.x + (e.clientX - dragRef.current.x),
          y: offset.y + (e.clientY - dragRef.current.y),
        });
        dragRef.current = { x: e.clientX, y: e.clientY };
      }
    },
    [offset],
  );

  const transform = `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`;
  const visibleEvidence = showEvidence ? evidence.filter((e) => e.geometry) : [];

  return (
    <div className="flex h-full min-h-0 flex-col">
      {/* toolbar */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-b border-border px-3 py-1.5">
        {isPair && (
          <ToolGroup label="compare">
            {(["swipe", "blink", "difference", "single"] as CompareMode[]).map((m) => (
              <ToolButton key={m} active={mode === m} onClick={() => setMode(m)}>
                {m}
              </ToolButton>
            ))}
          </ToolGroup>
        )}
        <ToolGroup label="layers">
          <ToolButton active={showEvidence} onClick={() => setShowEvidence((v) => !v)}>
            evidence
          </ToolButton>
          <ToolButton active={showGrid} onClick={() => setShowGrid((v) => !v)}>
            graticule
          </ToolButton>
        </ToolGroup>
        <ToolGroup label="view">
          <ToolButton onClick={() => setZoom((z) => Math.min(6, +(z * 1.4).toFixed(2)))}>
            zoom +
          </ToolButton>
          <ToolButton onClick={() => setZoom((z) => Math.max(1, +(z / 1.4).toFixed(2)))}>
            zoom −
          </ToolButton>
          <ToolButton
            onClick={() => {
              setZoom(1);
              setOffset({ x: 0, y: 0 });
            }}
          >
            fit
          </ToolButton>
        </ToolGroup>
        {activeMode === "blink" && (
          <ToolButton active onClick={() => setBlinkSecond((v) => !v)}>
            blink → {blinkSecond ? "after" : "before"}
          </ToolButton>
        )}
        <span className="ml-auto font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
          {zoom.toFixed(2)}× · gsd {gsd} m
        </span>
      </div>

      {/* canvas */}
      <div
        ref={frameRef}
        onPointerMove={onMove}
        onPointerDown={(e) => {
          dragRef.current = { x: e.clientX, y: e.clientY };
          e.currentTarget.setPointerCapture(e.pointerId);
        }}
        onPointerUp={() => {
          dragRef.current = null;
        }}
        onPointerLeave={() => {
          dragRef.current = null;
          setCursor(null);
        }}
        className="relative min-h-[340px] flex-1 cursor-crosshair select-none overflow-hidden bg-background"
      >
        <div className="absolute inset-0" style={{ transform, transformOrigin: "center" }}>
          <Layer
            src={
              activeMode === "blink" && blinkSecond && secondary
                ? secondary.previewUrl
                : primary.previewUrl
            }
            alt={primary.filename}
            className={activeMode === "difference" ? "opacity-70 contrast-125 saturate-0" : ""}
          />
          {secondary && (activeMode === "swipe" || activeMode === "difference") && (
            <div
              className="absolute inset-0 overflow-hidden"
              style={
                activeMode === "swipe"
                  ? { clipPath: `inset(0 0 0 ${swipe}%)` }
                  : { mixBlendMode: "difference", opacity: 0.95 }
              }
            >
              <Layer
                src={secondary.previewUrl}
                alt={secondary.filename}
                className={activeMode === "difference" ? "saturate-0 contrast-150" : ""}
              />
            </div>
          )}
        </div>

        {showGrid && (
          <div className="pointer-events-none absolute inset-0 grid-backdrop opacity-40" />
        )}

        {/* evidence overlays */}
        {visibleEvidence.map((e) => {
          const g = e.geometry!;
          const active = activeEvidenceId === e.id;
          return (
            <button
              key={e.id}
              type="button"
              onClick={() => onSelectEvidence(e.id)}
              style={{
                left: `${g.x * 100}%`,
                top: `${g.y * 100}%`,
                width: `${g.w * 100}%`,
                height: `${g.h * 100}%`,
                transform,
                transformOrigin: "center",
              }}
              className={`absolute border transition-colors ${
                LAYER_BORDER[e.layer ?? "fused"] ?? "border-primary"
              } ${active ? "border-2 bg-primary/10 ring-1 ring-primary" : "hover:bg-primary/5"}`}
            >
              <span className="absolute -top-[15px] left-0 bg-background/85 px-1 font-mono text-[9px] uppercase tracking-[0.12em] text-foreground">
                E{e.index}
                {active ? ` ${e.label}` : ""}
              </span>
            </button>
          );
        })}

        {/* swipe handle */}
        {secondary && activeMode === "swipe" && (
          <>
            <div
              className="pointer-events-none absolute inset-y-0 w-px bg-primary"
              style={{ left: `${swipe}%` }}
            />
            <input
              type="range"
              min={0}
              max={100}
              value={swipe}
              aria-label="Before / after comparison position"
              onChange={(ev) => setSwipe(Number(ev.target.value))}
              className="absolute inset-x-0 bottom-8 mx-auto h-1 w-[70%] cursor-ew-resize appearance-none bg-border accent-primary"
            />
            <span className="absolute left-2 top-2 bg-background/80 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
              {primary.role} · {primary.metadata.acquiredAt}
            </span>
            <span className="absolute right-2 top-2 bg-background/80 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
              {secondary.role} · {secondary.metadata.acquiredAt}
            </span>
          </>
        )}

        {/* north arrow + scale */}
        <div className="pointer-events-none absolute right-3 top-3 flex flex-col items-center font-mono text-[10px] text-muted-foreground">
          <span className="text-foreground">▲</span>
          <span>N</span>
        </div>
        <div className="pointer-events-none absolute bottom-3 right-3 flex items-center gap-1.5 font-mono text-[10px] text-muted-foreground">
          <span className="block h-1 w-16 border-x border-b border-muted-foreground" />
          <span>{Math.round((gsd * rasterW) / 10 / zoom)} m</span>
        </div>

        {/* crosshair */}
        {cursor && (
          <>
            <div
              className="pointer-events-none absolute inset-y-0 w-px bg-primary/30"
              style={{ left: `${cursor.x * 100}%` }}
            />
            <div
              className="pointer-events-none absolute inset-x-0 h-px bg-primary/30"
              style={{ top: `${cursor.y * 100}%` }}
            />
          </>
        )}
      </div>

      {/* coordinate readout */}
      <div className="grid shrink-0 grid-cols-2 gap-x-6 gap-y-0.5 border-t border-border px-3 py-1.5 font-mono text-[10px] text-muted-foreground sm:grid-cols-5">
        <Readout label="lat" value={readout?.lat ?? "—"} />
        <Readout label="lon" value={readout?.lon ?? "—"} />
        <Readout label="pixel" value={readout ? `${readout.px} / ${readout.py}` : "—"} />
        <Readout label="crs" value={primary.metadata.crs ?? "—"} />
        <Readout label="source" value="demo raster" />
      </div>
    </div>
  );
}

function Layer({ src, alt, className = "" }: { src: string; alt: string; className?: string }) {
  return (
    <img
      src={src}
      alt={alt}
      width={1024}
      height={1024}
      draggable={false}
      className={`absolute inset-0 h-full w-full object-cover ${className}`}
    />
  );
}

function ToolGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </span>
      <div className="flex items-center gap-px">{children}</div>
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
      className={`border px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.12em] transition-colors ${
        active
          ? "border-primary bg-primary/10 text-primary"
          : "border-border text-muted-foreground hover:bg-panel-raised hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}

function Readout({ label, value }: { label: string; value: string }) {
  return (
    <span className="flex items-baseline justify-between gap-2 truncate">
      <span className="uppercase tracking-[0.14em]">{label}</span>
      <span className="truncate text-foreground">{value}</span>
    </span>
  );
}
