import React, { useState } from "react";
import { Crosshair, AlertCircle, RefreshCw, ZoomIn, Layers, Clock, ArrowRight, ShieldCheck, CheckCircle2 } from "lucide-react";
import type { EvidenceObject, Investigation, NormalisedBox, Observation } from "@/lib/types";

export type AcquisitionMode = "GROUNDING" | "TEMPORAL" | "OPTICAL-SAR";

export interface TargetedAcquisitionItem {
  id: string;
  mode: AcquisitionMode;
  gapDescription: string;
  targetRegion: NormalisedBox;
  targetLabel: string;
  reason: string;
  specificAction: string;
  simulatedResultLabel: string;
  newEvidenceGeometry?: NormalisedBox;
  status: "gap_detected" | "target_focused" | "acquiring" | "new_evidence" | "rechecked";
}

export interface TargetedAcquisitionPanelProps {
  result: Investigation;
  observations: Observation[];
  onSelectTargetRegion?: (target: { geometry: NormalisedBox; label: string } | null) => void;
  onAddSimulatedEvidence?: (ev: EvidenceObject) => void;
}

export function TargetedAcquisitionPanel({
  result,
  observations,
  onSelectTargetRegion,
  onAddSimulatedEvidence,
}: TargetedAcquisitionPanelProps) {
  const [selectedMode, setSelectedMode] = useState<AcquisitionMode>("GROUNDING");
  const [stepIndex, setStepIndex] = useState<number>(0);
  const [isAcquiring, setIsAcquiring] = useState(false);
  const [acquiredSuccess, setAcquiredSuccess] = useState(false);

  // Pre-configured selective acquisition tasks for demo scenarios
  const acquisitionTasks: Record<AcquisitionMode, TargetedAcquisitionItem> = {
    GROUNDING: {
      id: "acq-grounding-01",
      mode: "GROUNDING",
      gapDescription: "Uncertain built-up edge boundary on southern perimeter",
      targetRegion: { x: 0.52, y: 0.48, w: 0.22, h: 0.24 },
      targetLabel: "PERIMETER ROI #2",
      reason: "Low contrast ratio under shadow requires high-GSD crop refocus",
      specificAction: "Sub-pixel raster crop + SAM v2 re-grounding",
      simulatedResultLabel: "Refined built-up expansion polygon (+0.14 km²)",
      status: stepIndex === 0 ? "gap_detected" : stepIndex === 1 ? "target_focused" : stepIndex === 2 ? "acquiring" : "rechecked",
    },
    TEMPORAL: {
      id: "acq-temporal-01",
      mode: "TEMPORAL",
      gapDescription: "Temporal change ambiguity between T1 & T2 passes",
      targetRegion: { x: 0.35, y: 0.30, w: 0.28, h: 0.30 },
      targetLabel: "CHANGE BOUNDARY ROI #1",
      reason: "Sub-pixel displacement residual near tolerance threshold (1.2px)",
      specificAction: "Inspect suspect boundary → local affine re-registration → stability check",
      simulatedResultLabel: "Verified change polygon (Order valid, registration residual 0.3px)",
      status: stepIndex === 0 ? "gap_detected" : stepIndex === 1 ? "target_focused" : stepIndex === 2 ? "acquiring" : "rechecked",
    },
    "OPTICAL-SAR": {
      id: "acq-optical-sar-01",
      mode: "OPTICAL-SAR",
      gapDescription: "Modality conflict: Optical cloud shadow vs SAR double-bounce",
      targetRegion: { x: 0.15, y: 0.20, w: 0.30, h: 0.32 },
      targetLabel: "SAR/OPTICAL INTERSECTION",
      reason: "Optical reflectance suppressed by clouds; SAR double-bounce high (14.2 dB)",
      specificAction: "Modality-specific inspection → SAR speckle filter → fused feature qualification",
      simulatedResultLabel: "Fused high-confidence structure evidence",
      status: stepIndex === 0 ? "gap_detected" : stepIndex === 1 ? "target_focused" : stepIndex === 2 ? "acquiring" : "rechecked",
    },
  };

  const activeTask = acquisitionTasks[selectedMode];

  const handleStepClick = (idx: number) => {
    setStepIndex(idx);
    if (idx >= 1 && onSelectTargetRegion) {
      onSelectTargetRegion({
        geometry: activeTask.targetRegion,
        label: `${activeTask.targetLabel} [${activeTask.mode}]`,
      });
    } else if (idx === 0 && onSelectTargetRegion) {
      onSelectTargetRegion(null);
    }
  };

  const handleTriggerAcquisition = () => {
    setIsAcquiring(true);
    setTimeout(() => {
      setIsAcquiring(false);
      setStepIndex(3);
      setAcquiredSuccess(true);
    }, 1200);
  };

  return (
    <div className="border border-border bg-panel p-3 font-mono text-[10px] space-y-3">
      {/* Header & Mode Selector */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-2">
        <div className="flex items-center gap-2">
          <Crosshair className="h-4 w-4 text-amber-400" />
          <span className="font-bold uppercase tracking-[0.18em] text-foreground">
            TARGETED EVIDENCE ACQUISITION
          </span>
          <span className="border border-amber-500/40 bg-amber-500/10 px-1.5 py-0.5 text-[8px] uppercase tracking-[0.12em] text-amber-300">
            DEMO SIMULATION
          </span>
        </div>
        <span className="text-[8.5px] text-muted-foreground italic">
          Selective GAP-Driven Recheck
        </span>
      </div>

      {/* Mode Selector Tabs */}
      <div className="grid grid-cols-3 gap-1.5">
        {(["GROUNDING", "TEMPORAL", "OPTICAL-SAR"] as AcquisitionMode[]).map((mode) => (
          <button
            key={mode}
            type="button"
            onClick={() => {
              setSelectedMode(mode);
              setStepIndex(0);
              setAcquiredSuccess(false);
              if (onSelectTargetRegion) onSelectTargetRegion(null);
            }}
            className={`border px-2 py-1.5 text-center text-[9px] uppercase tracking-[0.14em] font-semibold transition-all ${
              selectedMode === mode
                ? "border-amber-400 bg-amber-500/20 text-amber-300 shadow-[0_0_8px_rgba(245,158,11,0.2)]"
                : "border-border text-muted-foreground hover:bg-panel-raised hover:text-foreground"
            }`}
          >
            {mode === "GROUNDING" && <ZoomIn className="h-3 w-3 inline mr-1" />}
            {mode === "TEMPORAL" && <Clock className="h-3 w-3 inline mr-1" />}
            {mode === "OPTICAL-SAR" && <Layers className="h-3 w-3 inline mr-1" />}
            {mode}
          </button>
        ))}
      </div>

      {/* Acquisition Lifecycle Motion Stepper */}
      <div className="space-y-2 border border-border bg-background p-2.5">
        <div className="flex items-center justify-between text-[8.5px] text-muted-foreground uppercase tracking-[0.14em] border-b border-border/60 pb-1">
          <span>ACQUISITION PROGRESSION:</span>
          <span>MODE: <strong className="text-foreground">{selectedMode}</strong></span>
        </div>

        <div className="grid grid-cols-4 gap-1 pt-1">
          {[
            { stage: "GAP DETECTED", icon: AlertCircle },
            { stage: "TARGET FOCUSED", icon: Crosshair },
            { stage: "ACQUIRING", icon: RefreshCw },
            { stage: "VERIFIED", icon: ShieldCheck },
          ].map((s, idx) => {
            const Icon = s.icon;
            const isActive = stepIndex === idx;
            const isDone = stepIndex > idx;
            return (
              <button
                key={s.stage}
                type="button"
                onClick={() => handleStepClick(idx)}
                className={`border p-1.5 flex flex-col items-center justify-center text-center transition-all ${
                  isActive
                    ? "border-amber-400 bg-amber-500/20 text-amber-300 font-bold shadow-[0_0_6px_rgba(245,158,11,0.25)]"
                    : isDone
                      ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-300"
                      : "border-border/60 text-muted-foreground opacity-70 hover:opacity-100"
                }`}
              >
                <Icon className={`h-3.5 w-3.5 mb-1 ${isActive && isAcquiring ? "animate-spin text-amber-300" : ""}`} />
                <span className="text-[7.5px] uppercase tracking-[0.1em]">{s.stage}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selective Action Payload Card */}
      <div className="border border-border/80 bg-background/80 p-3 space-y-2 text-[9px]">
        {/* GAP & REASON */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 border-b border-border/60 pb-2">
          <div>
            <span className="text-amber-400 uppercase tracking-[0.14em] text-[8px] font-bold block mb-0.5">
              EVIDENCE GAP IDENTIFIED:
            </span>
            <p className="text-foreground font-semibold">{activeTask.gapDescription}</p>
          </div>
          <div>
            <span className="text-muted-foreground uppercase tracking-[0.14em] text-[8px] font-bold block mb-0.5">
              ACQUISITION RATIONALE:
            </span>
            <p className="text-muted-foreground">{activeTask.reason}</p>
          </div>
        </div>

        {/* TARGET & ACTION */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-0.5">
          <div>
            <span className="text-primary uppercase tracking-[0.14em] text-[8px] font-bold block mb-0.5">
              SPATIAL TARGET BOUNDS:
            </span>
            <p className="font-mono text-foreground">
              {activeTask.targetLabel} · [{activeTask.targetRegion.x.toFixed(2)}, {activeTask.targetRegion.y.toFixed(2)}, {activeTask.targetRegion.w.toFixed(2)}, {activeTask.targetRegion.h.toFixed(2)}]
            </p>
          </div>
          <div>
            <span className="text-emerald-400 uppercase tracking-[0.14em] text-[8px] font-bold block mb-0.5">
              SPECIFIC ACQUISITION ACTION:
            </span>
            <p className="text-emerald-300 font-semibold">{activeTask.specificAction}</p>
          </div>
        </div>

        {/* TRIGGER BUTTON */}
        <div className="pt-2 border-t border-border/60 flex items-center justify-between">
          <div className="text-[8.5px] text-muted-foreground">
            {acquiredSuccess ? (
              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5" /> NEW EVIDENCE ACQUIRED & RECHECKED
              </span>
            ) : (
              <span>Execute selective targeted evidence acquisition flow</span>
            )}
          </div>
          <button
            type="button"
            onClick={handleTriggerAcquisition}
            disabled={isAcquiring}
            className="border border-amber-400 bg-amber-500/20 px-3 py-1.5 text-[9px] uppercase tracking-[0.16em] font-bold text-amber-300 hover:bg-amber-500/30 transition-all flex items-center gap-1.5"
          >
            {isAcquiring ? (
              <>
                <RefreshCw className="h-3 w-3 animate-spin" /> ACQUIRING...
              </>
            ) : (
              <>
                <span>ACQUIRE & RECHECK</span> <ArrowRight className="h-3 w-3" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
