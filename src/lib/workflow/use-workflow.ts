/**
 * SatQuery AI — useWorkflow React Hook
 *
 * Exposes a reactive state machine instance with playback controls,
 * stage visibility helpers, and active specialist execution status.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { DemoScenario } from "@/lib/mock-data";
import { PLANS } from "@/lib/workflow-data";
import { WorkflowStateMachine, getNextNominalState, getPrevNominalState } from "./state-machine";
import {
  FailureState,
  isFailureState,
  LifecycleState,
  MacroStage,
  NOMINAL_ORDER,
  STATE_TO_MACRO_STAGE,
} from "./types";

export interface UseWorkflowReturn {
  // Current state properties
  state: LifecycleState;
  macroStage: MacroStage;
  isIdle: boolean;
  isRunning: boolean;
  isPaused: boolean;
  isComplete: boolean;
  isFailed: boolean;
  failureState: FailureState | null;
  progressPercent: number;
  elapsedMs: number;

  // Active scenario & plan
  scenario: DemoScenario;
  plan: (typeof PLANS)[string];
  failureOverride: FailureState | null;

  // Visible stage guards (determines what sections of UI are revealed)
  showObservations: boolean;
  showUploadProgress: boolean;
  showInspection: boolean;
  showValidation: boolean;
  showQueryUnderstanding: boolean;
  showTaskClassification: boolean;
  showEvidencePlanning: boolean;
  showRouting: boolean;
  showSpecialistExecution: boolean;
  showEvidenceOverlays: boolean;
  showVerification: boolean;
  showComposition: boolean;
  showFinalResult: boolean;

  // Specialist execution step (0 = not started, 1 = first tool, etc.)
  specialistStep: number;
  activeSpecialist: {
    tool: string;
    model: string;
    version: string;
    label: string;
    task?: string;
  } | null;

  // Playback & lifecycle controls
  start: () => void;
  pause: () => void;
  resume: () => void;
  stepNext: () => void;
  complete: () => void;
  reset: () => void;
  replay: () => void;
  transitionTo: (state: LifecycleState) => void;
  setFailureOverride: (failure: FailureState | null) => void;
  setScenarioId: (id: string) => void;
}

export function useWorkflow(
  initialScenario: DemoScenario,
  allScenarios: DemoScenario[],
): UseWorkflowReturn {
  const [scenarioId, setScenarioIdState] = useState(initialScenario.id);
  const [failureOverride, setFailureOverrideState] = useState<FailureState | null>(null);
  const [state, setState] = useState<LifecycleState>("COMPLETE");
  const [isPaused, setIsPaused] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [specialistStep, setSpecialistStep] = useState(0);

  const scenario = useMemo(
    () => allScenarios.find((s) => s.id === scenarioId) ?? initialScenario,
    [allScenarios, scenarioId, initialScenario],
  );

  const plan = useMemo(
    () => PLANS[scenario.id] ?? PLANS["golden"] ?? PLANS["demo-01"]!,
    [scenario.id],
  );

  // Maintain singleton instance of WorkflowStateMachine in ref
  const machineRef = useRef<WorkflowStateMachine | null>(null);

  if (!machineRef.current) {
    machineRef.current = new WorkflowStateMachine({
      initialState: "COMPLETE",
      scenarioId: scenario.id,
      failureOverride,
    });
  }

  const machine = machineRef.current;

  // Subscribe to state machine updates
  useEffect(() => {
    const unsub = machine.subscribe((newState) => {
      setState(newState);
      setIsPaused(machine.isPaused);
    });
    return unsub;
  }, [machine]);

  // Keep machine synced with scenario & failure override
  useEffect(() => {
    machine.setScenario(scenario.id);
    setSpecialistStep(0);
  }, [machine, scenario.id]);

  useEffect(() => {
    machine.setFailureOverride(failureOverride);
  }, [machine, failureOverride]);

  // Specialist tool animation during EXECUTING state
  useEffect(() => {
    if (state === "EXECUTING") {
      setSpecialistStep(1);
      const totalTools = plan.specialists.length || 1;
      const interval = Math.floor(1200 / (totalTools + 1));
      const timers: number[] = [];

      for (let i = 1; i <= totalTools; i++) {
        const tid = window.setTimeout(() => {
          setSpecialistStep(i);
        }, i * interval);
        timers.push(tid);
      }

      return () => {
        timers.forEach((t) => window.clearTimeout(t));
      };
    } else if (
      state === "EVIDENCE_GENERATED" ||
      state === "VERIFYING" ||
      state === "COMPOSING" ||
      state === "COMPLETE"
    ) {
      setSpecialistStep(plan.specialists.length);
    } else if (state === "IDLE" || state === "UPLOADING") {
      setSpecialistStep(0);
    }
    return undefined;
  }, [state, plan.specialists.length]);

  // Elapsed time ticker when running
  useEffect(() => {
    let timer: number | null = null;
    if (machine.isRunning && !machine.isPaused) {
      timer = window.setInterval(() => {
        setElapsedMs(machine.elapsedTimeMs);
      }, 80);
    } else {
      setElapsedMs(machine.elapsedTimeMs);
    }
    return () => {
      if (timer) window.clearInterval(timer);
    };
  }, [machine, machine.isRunning, machine.isPaused, state]);

  // Rank / progress calculation
  const nominalIndex = NOMINAL_ORDER.indexOf(state);
  const progressPercent = useMemo(() => {
    if (state === "COMPLETE") return 100;
    if (isFailureState(state)) {
      if (state === "VALIDATION_FAILED") return 25;
      if (state === "UNSUPPORTED_QUERY") return 45;
      if (state === "ROUTING_BLOCKED") return 65;
      if (state === "LOW_CONFIDENCE") return 85;
      return 50;
    }
    if (nominalIndex < 0) return 0;
    return Math.round((nominalIndex / (NOMINAL_ORDER.length - 1)) * 100);
  }, [state, nominalIndex]);

  // Macro stage
  const macroStage = STATE_TO_MACRO_STAGE[state];

  // Helper rank for visible stage reveals
  const rank = nominalIndex >= 0 ? nominalIndex : 999;
  const rankOf = (s: LifecycleState) => NOMINAL_ORDER.indexOf(s);

  const showObservations = state !== "IDLE";
  const showUploadProgress = state === "UPLOADING";
  const showInspection = rank >= rankOf("INSPECTING");
  const showValidation = rank >= rankOf("VALIDATING") || state === "VALIDATION_FAILED";
  const showQueryUnderstanding =
    rank >= rankOf("QUERY_UNDERSTANDING") || state === "UNSUPPORTED_QUERY";
  const showTaskClassification = rank >= rankOf("TASK_CLASSIFIED");
  const showEvidencePlanning = rank >= rankOf("EVIDENCE_PLANNING");
  const showRouting = rank >= rankOf("ROUTING") || state === "ROUTING_BLOCKED";
  const showSpecialistExecution = rank >= rankOf("EXECUTING") && state !== "ROUTING_BLOCKED";
  const showEvidenceOverlays =
    (rank >= rankOf("EVIDENCE_GENERATED") || state === "LOW_CONFIDENCE") &&
    state !== "ROUTING_BLOCKED" &&
    state !== "VALIDATION_FAILED" &&
    state !== "UNSUPPORTED_QUERY";
  const showVerification =
    (rank >= rankOf("VERIFYING") || state === "LOW_CONFIDENCE") && state !== "ROUTING_BLOCKED";
  const showComposition = rank >= rankOf("COMPOSING") && !isFailureState(state);
  const showFinalResult = state === "COMPLETE" || isFailureState(state);

  const activeSpecialist = useMemo(() => {
    if (!plan.specialists || plan.specialists.length === 0) return null;
    const idx = Math.max(0, Math.min(specialistStep - 1, plan.specialists.length - 1));
    return plan.specialists[idx] ?? null;
  }, [plan.specialists, specialistStep]);

  // Playback control callbacks
  const start = useCallback(() => {
    machine.start();
    setState(machine.state);
    setIsPaused(machine.isPaused);
  }, [machine]);

  const pause = useCallback(() => {
    machine.pause();
    setIsPaused(true);
  }, [machine]);

  const resume = useCallback(() => {
    machine.resume();
    setIsPaused(false);
  }, [machine]);

  const stepNext = useCallback(() => {
    machine.stepNext();
    setState(machine.state);
    setIsPaused(true);
  }, [machine]);

  const complete = useCallback(() => {
    machine.completeImmediately();
    setState(machine.state);
    setIsPaused(false);
  }, [machine]);

  const reset = useCallback(() => {
    machine.reset();
    setState("IDLE");
    setIsPaused(false);
    setSpecialistStep(0);
    setElapsedMs(0);
  }, [machine]);

  const replay = useCallback(() => {
    machine.replay();
    setState(machine.state);
    setIsPaused(false);
  }, [machine]);

  const transitionTo = useCallback(
    (targetState: LifecycleState) => {
      machine.transitionTo(targetState, "Direct user navigation");
      setState(targetState);
    },
    [machine],
  );

  const setScenarioId = useCallback((id: string) => {
    setScenarioIdState(id);
  }, []);

  const setFailureOverride = useCallback((fail: FailureState | null) => {
    setFailureOverrideState(fail);
  }, []);

  return {
    state,
    macroStage,
    isIdle: state === "IDLE",
    isRunning: machine.isRunning,
    isPaused,
    isComplete: state === "COMPLETE",
    isFailed: isFailureState(state),
    failureState: isFailureState(state) ? state : null,
    progressPercent,
    elapsedMs,

    scenario,
    plan,
    failureOverride,

    showObservations,
    showUploadProgress,
    showInspection,
    showValidation,
    showQueryUnderstanding,
    showTaskClassification,
    showEvidencePlanning,
    showRouting,
    showSpecialistExecution,
    showEvidenceOverlays,
    showVerification,
    showComposition,
    showFinalResult,

    specialistStep,
    activeSpecialist,

    start,
    pause,
    resume,
    stepNext,
    complete,
    reset,
    replay,
    transitionTo,
    setFailureOverride,
    setScenarioId,
  };
}
