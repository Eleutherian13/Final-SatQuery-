/**
 * Frontend state machine for one SatQuery investigation.
 *
 * Drives the visible pipeline: upload → inspect → validate → ready →
 * understand → classify → plan evidence → route → preprocess → execute →
 * evidence → verify → compose → complete. Deterministic demo timings.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { DemoScenario } from "./mock-data";
import { PLANS } from "./workflow-data";

export type Phase =
  | "IDLE"
  | "UPLOADING"
  | "INSPECTING"
  | "VALIDATING"
  | "READY"
  | "QUERY_RECEIVED"
  | "QUERY_UNDERSTANDING"
  | "TASK_CLASSIFIED"
  | "EVIDENCE_PLANNING"
  | "ROUTING"
  | "ROUTING_BLOCKED"
  | "PREPROCESSING"
  | "EXECUTING"
  | "EVIDENCE_GENERATED"
  | "VERIFYING"
  | "COMPOSING"
  | "COMPLETE";

const ORDER: Phase[] = [
  "IDLE",
  "UPLOADING",
  "INSPECTING",
  "VALIDATING",
  "READY",
  "QUERY_RECEIVED",
  "QUERY_UNDERSTANDING",
  "TASK_CLASSIFIED",
  "EVIDENCE_PLANNING",
  "ROUTING",
  "PREPROCESSING",
  "EXECUTING",
  "EVIDENCE_GENERATED",
  "VERIFYING",
  "COMPOSING",
  "COMPLETE",
];

const LOAD_SEQUENCE: Array<[Phase, number]> = [
  ["UPLOADING", 320],
  ["INSPECTING", 780],
  ["VALIDATING", 950],
  ["READY", 0],
];

const RUN_SEQUENCE: Array<[Phase, number]> = [
  ["QUERY_RECEIVED", 220],
  ["QUERY_UNDERSTANDING", 900],
  ["TASK_CLASSIFIED", 560],
  ["EVIDENCE_PLANNING", 620],
  ["ROUTING", 620],
  ["PREPROCESSING", 700],
  ["EXECUTING", 1900],
  ["EVIDENCE_GENERATED", 520],
  ["VERIFYING", 800],
  ["COMPOSING", 560],
  ["COMPLETE", 0],
];

export function phaseRank(phase: Phase): number {
  if (phase === "ROUTING_BLOCKED") return ORDER.indexOf("ROUTING");
  return ORDER.indexOf(phase);
}

export function useInvestigation(scenario: DemoScenario) {
  const [phase, setPhase] = useState<Phase>("IDLE");
  const [file, setFile] = useState<{ name: string; sizeBytes: number | null } | null>(null);
  const [specialistStep, setSpecialistStep] = useState(0);
  const timers = useRef<number[]>([]);

  const plan = PLANS[scenario.id] ?? PLANS["golden"]!;
  const blocked = plan.preconditions === "blocked";

  const clear = useCallback(() => {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
  }, []);

  useEffect(() => clear, [clear]);

  const reset = useCallback(() => {
    clear();
    setPhase("IDLE");
    setFile(null);
    setSpecialistStep(0);
  }, [clear]);

  // Switching scenario resets the investigation.
  useEffect(() => {
    reset();
  }, [scenario.id, reset]);

  const runSequence = useCallback(
    (seq: Array<[Phase, number]>, startDelay = 0) => {
      let t = startDelay;
      seq.forEach(([p, dur]) => {
        const id = window.setTimeout(() => setPhase(p), t);
        timers.current.push(id);
        t += dur;
      });
      return t;
    },
    [],
  );

  const loadDataset = useCallback(
    (picked?: File) => {
      clear();
      setSpecialistStep(0);
      setFile({
        name: picked?.name ?? scenario.observations[0]?.filename ?? "demo.tif",
        sizeBytes: picked?.size ?? scenario.observations[0]?.sizeBytes ?? null,
      });
      runSequence(LOAD_SEQUENCE);
    },
    [clear, runSequence, scenario],
  );

  const run = useCallback(() => {
    clear();
    setSpecialistStep(0);
    if (blocked) {
      // Understanding and classification still happen; routing is refused.
      const seq: Array<[Phase, number]> = [
        ["QUERY_RECEIVED", 220],
        ["QUERY_UNDERSTANDING", 900],
        ["TASK_CLASSIFIED", 560],
        ["EVIDENCE_PLANNING", 620],
        ["ROUTING_BLOCKED", 0],
      ];
      runSequence(seq);
      return;
    }
    const execStart = RUN_SEQUENCE.slice(
      0,
      RUN_SEQUENCE.findIndex(([p]) => p === "EXECUTING"),
    ).reduce((acc, [, d]) => acc + d, 0);
    runSequence(RUN_SEQUENCE);
    plan.specialists.forEach((_, i) => {
      const id = window.setTimeout(
        () => setSpecialistStep(i + 1),
        execStart + 380 * (i + 1),
      );
      timers.current.push(id);
    });
  }, [blocked, clear, plan.specialists, runSequence]);

  const rank = phaseRank(phase);
  const reached = useCallback((p: Phase) => rank >= phaseRank(p), [rank]);

  const derived = useMemo(() => {
    const loaded = rank >= phaseRank("READY");
    const running =
      rank >= phaseRank("QUERY_RECEIVED") && phase !== "COMPLETE" && phase !== "ROUTING_BLOCKED";
    return {
      loaded,
      running,
      inspecting: rank >= phaseRank("INSPECTING"),
      validated: rank >= phaseRank("READY"),
      understandingVisible: rank >= phaseRank("QUERY_UNDERSTANDING"),
      classificationVisible: rank >= phaseRank("TASK_CLASSIFIED"),
      planVisible: rank >= phaseRank("EVIDENCE_PLANNING"),
      routingVisible: rank >= phaseRank("ROUTING") || phase === "ROUTING_BLOCKED",
      executionVisible: rank >= phaseRank("PREPROCESSING"),
      evidenceVisible: rank >= phaseRank("EVIDENCE_GENERATED"),
      verificationVisible: rank >= phaseRank("VERIFYING"),
      resultVisible: phase === "COMPLETE" || phase === "ROUTING_BLOCKED",
      traceVisible: phase === "COMPLETE" || phase === "ROUTING_BLOCKED",
      refused: phase === "ROUTING_BLOCKED",
    };
  }, [phase, rank]);

  return {
    phase,
    plan,
    file,
    specialistStep,
    reached,
    loadDataset,
    run,
    reset,
    ...derived,
  };
}
