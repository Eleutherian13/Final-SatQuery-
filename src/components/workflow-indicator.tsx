/**
 * SatQuery AI — Workflow Indicator
 *
 * Analytical Investigation Lifecycle indicator:
 * OBSERVATIONS > QUERY > ANALYSIS > EVIDENCE > RESULT
 *
 * Compact, persistent, terminal/instrument-grade aesthetic with
 * live stage highlighting, active micro-state detail, and playback controls.
 */

import {
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  ChevronRight,
} from "lucide-react";
import {
  DEFAULT_STATE_TIMINGS,
  FailureState,
  MACRO_STAGES,
  MacroStage,
} from "@/lib/workflow/types";
import type { UseWorkflowReturn } from "@/lib/workflow/use-workflow";

interface WorkflowIndicatorProps {
  workflow: UseWorkflowReturn;
}

export function WorkflowIndicator({ workflow }: WorkflowIndicatorProps) {
  const {
    state,
    macroStage,
    isRunning,
    isPaused,
    isComplete,
    isFailed,
    failureState,
    elapsedMs,
    start,
    pause,
    resume,
    stepNext,
    replay,
    reset,
    setFailureOverride,
    failureOverride,
  } = workflow;

  const currentTiming = DEFAULT_STATE_TIMINGS[state];

  // Helper to determine stage status
  const getStageStatus = (stageId: MacroStage) => {
    const stageOrder = MACRO_STAGES.find((s) => s.id === stageId)?.order ?? 0;
    const currentOrder = MACRO_STAGES.find((s) => s.id === macroStage)?.order ?? 0;

    if (stageId === macroStage) {
      if (isFailed) return "failed";
      return isRunning && !isPaused ? "active" : "current";
    }
    if (stageOrder < currentOrder) {
      return "completed";
    }
    return "pending";
  };

  return (
    <div className="border-b border-border bg-panel text-foreground">
      {/* Primary Lifecycle Indicator Bar */}
      <div className="flex flex-wrap items-stretch justify-between gap-y-1">
        {/* Left: 5 Macro Stages */}
        <div className="flex flex-wrap items-center divide-x divide-border">
          <div className="hidden items-center gap-1.5 px-3 py-1.5 font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground sm:flex">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            LIFECYCLE
          </div>

          <div className="flex flex-wrap items-center">
            {MACRO_STAGES.map((stage, idx) => {
              const status = getStageStatus(stage.id);
              const isActive = status === "active" || status === "current";
              const isPassed = status === "completed";
              const isStageFailed = status === "failed";

              return (
                <div key={stage.id} className="flex items-center">
                  <div
                    className={`flex items-center gap-2 px-3 py-1.5 transition-colors ${
                      isActive
                        ? isStageFailed
                          ? "bg-destructive/15 text-destructive"
                          : "bg-primary/10 text-primary shadow-[inset_0_-2px_0_0_var(--primary)]"
                        : isPassed
                          ? "text-foreground hover:bg-panel-raised"
                          : "text-muted-foreground/60"
                    }`}
                  >
                    {/* Stage icon / status indicator */}
                    <span className="flex items-center">
                      {isStageFailed ? (
                        <AlertCircle className="h-3 w-3 text-destructive" />
                      ) : isPassed ? (
                        <CheckCircle2 className="h-3 w-3 text-success" />
                      ) : isActive ? (
                        <span className="h-2 w-2 rounded-full bg-primary" />
                      ) : (
                        <span className="font-mono text-[9px] text-muted-foreground/50">
                          0{stage.order}
                        </span>
                      )}
                    </span>

                    {/* Stage Label */}
                    <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em]">
                      {stage.label}
                    </span>

                    {/* Micro-phase label if active */}
                    {isActive && (
                      <span className="hidden font-mono text-[9px] uppercase tracking-[0.14em] opacity-80 md:inline">
                        [{state}]
                      </span>
                    )}
                  </div>

                  {/* Separator chevron */}
                  {idx < MACRO_STAGES.length - 1 && (
                    <ChevronRight className="h-3 w-3 shrink-0 text-border" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Active state detail & analytical execution controls */}
        <div className="flex items-center gap-2 px-3 py-1 text-right sm:gap-3">
          {/* Active micro-phase tag & elapsed time */}
          <div className="flex items-center gap-2 font-mono text-[10px]">
            <span
              className={`border px-1.5 py-0.5 uppercase tracking-[0.14em] ${
                isFailed
                  ? "border-destructive/60 bg-destructive/10 text-destructive"
                  : isComplete
                    ? "border-success/60 bg-success/10 text-success"
                    : isRunning
                      ? "border-primary/60 bg-primary/10 text-primary"
                      : "border-border text-muted-foreground"
              }`}
            >
              {currentTiming.label}
            </span>
            <span className="text-muted-foreground">{(elapsedMs / 1000).toFixed(1)}s</span>
          </div>

          {/* Interactive Playback Controls */}
          <div className="flex items-center border border-border bg-slate-900/90 shadow-sm">
            {isRunning && !isPaused ? (
              <button
                type="button"
                onClick={pause}
                title="Pause investigation lifecycle"
                className="flex items-center gap-1 border-r border-border px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-warning bg-warning/20 transition-colors hover:bg-warning/30 cursor-pointer"
              >
                <Pause className="h-3 w-3 text-warning fill-warning" />
                <span className="hidden sm:inline">Pause</span>
              </button>
            ) : isPaused ? (
              <button
                type="button"
                onClick={resume}
                title="Resume automated execution"
                className="flex items-center gap-1 border-r border-border px-2.5 py-1 font-mono text-[10px] font-extrabold uppercase tracking-[0.12em] text-primary-foreground bg-primary transition-colors hover:bg-primary/90 cursor-pointer"
              >
                <Play className="h-3 w-3 text-primary-foreground fill-primary-foreground" />
                <span className="hidden sm:inline">Resume</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={start}
                title={isComplete || isFailed ? "Replay investigation" : "Run complete lifecycle"}
                className="flex items-center gap-1 border-r border-border px-2.5 py-1 font-mono text-[10px] font-extrabold uppercase tracking-[0.12em] text-primary-foreground bg-primary transition-colors hover:bg-primary/90 cursor-pointer shadow-sm"
              >
                <Play className="h-3 w-3 text-primary-foreground fill-primary-foreground" />
                <span className="hidden sm:inline">
                  {isComplete || isFailed ? "Replay" : "Execute"}
                </span>
              </button>
            )}

            {/* Single Step Advance */}
            <button
              type="button"
              onClick={stepNext}
              disabled={isComplete || isFailed}
              title="Single step to next lifecycle state"
              className="flex items-center gap-1 border-r border-border px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-foreground transition-colors hover:bg-panel-raised hover:text-primary disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <SkipForward className="h-3 w-3 text-foreground" />
              <span className="hidden sm:inline">Step</span>
            </button>

            {/* Replay */}
            <button
              type="button"
              onClick={replay}
              title="Restart from observations upload"
              className="flex items-center gap-1 border-r border-border px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-foreground transition-colors hover:bg-panel-raised hover:text-primary cursor-pointer"
            >
              <RotateCcw className="h-3 w-3 text-foreground" />
              <span className="hidden sm:inline">Replay</span>
            </button>

            {/* Reset */}
            <button
              type="button"
              onClick={reset}
              title="Reset state machine to IDLE"
              className="px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-foreground transition-colors hover:bg-panel-raised hover:text-primary cursor-pointer"
            >
              Reset
            </button>
          </div>

          {/* Failure State Tester Menu */}
          <div className="hidden items-center gap-1 xl:flex">
            <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-muted-foreground">
              test failure:
            </span>
            <select
              value={failureOverride ?? "none"}
              onChange={(e) => {
                const val = e.target.value;
                setFailureOverride(val === "none" ? null : (val as FailureState));
              }}
              className="border border-border bg-background px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.1em] text-foreground outline-none focus:border-primary"
            >
              <option value="none">Nominal (Auto)</option>
              <option value="VALIDATION_FAILED">Fail Validation</option>
              <option value="UNSUPPORTED_QUERY">Unsupported Query</option>
              <option value="ROUTING_BLOCKED">Block Routing</option>
              <option value="LOW_CONFIDENCE">Low Confidence</option>
            </select>
          </div>
        </div>
      </div>

      {/* Sub-bar: Analytical status breadcrumb & active state description */}
      <div className="flex items-center justify-between border-t border-border/70 px-3 py-1 text-[10px]">
        <div className="flex items-center gap-2 truncate font-mono">
          <span className="uppercase tracking-[0.16em] text-muted-foreground">STATE [{state}]</span>
          <span className="text-border">·</span>
          <span className="truncate text-foreground">{currentTiming.detail}</span>
        </div>

        <div className="hidden items-center gap-3 font-mono text-[9px] uppercase tracking-[0.14em] text-muted-foreground md:flex">
          {workflow.activeSpecialist && (
            <span className="flex items-center gap-1 text-primary">
              <span className="h-2 w-2 rounded-full bg-primary" />
              {workflow.activeSpecialist.label} ({workflow.activeSpecialist.tool})
            </span>
          )}
          <span>stage {macroStage}</span>
        </div>
      </div>
    </div>
  );
}
