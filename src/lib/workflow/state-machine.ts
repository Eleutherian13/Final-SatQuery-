/**
 * SatQuery AI — Reusable Core Workflow State Machine
 *
 * Implements deterministic transition graph, lifecycle sequencing,
 * step execution, pause/resume, and failure state handling.
 */

import {
  DEFAULT_STATE_TIMINGS,
  FailureState,
  isFailureState,
  LifecycleState,
  NOMINAL_ORDER,
  STATE_TO_MACRO_STAGE,
} from "./types";

export interface WorkflowTransitionEvent {
  from: LifecycleState;
  to: LifecycleState;
  timestamp: number;
  reason?: string | undefined;
}

export type StateListener = (state: LifecycleState, event?: WorkflowTransitionEvent) => void;

export interface WorkflowMachineOptions {
  initialState?: LifecycleState;
  failureOverride?: FailureState | null;
  scenarioId?: string;
  onTransition?: StateListener;
}

/**
 * Returns the next nominal state in the analytical progression, or null if terminal.
 */
export function getNextNominalState(current: LifecycleState): LifecycleState | null {
  const idx = NOMINAL_ORDER.indexOf(current);
  if (idx === -1 || idx === NOMINAL_ORDER.length - 1) {
    return null;
  }
  return NOMINAL_ORDER[idx + 1]!;
}

/**
 * Returns the previous state in nominal order, or null if at IDLE.
 */
export function getPrevNominalState(current: LifecycleState): LifecycleState | null {
  const idx = NOMINAL_ORDER.indexOf(current);
  if (idx <= 0) {
    return null;
  }
  return NOMINAL_ORDER[idx - 1]!;
}

/**
 * Resolves the next state considering any scenario constraints or forced failure overrides.
 */
export function resolveNextState(
  current: LifecycleState,
  failureOverride?: FailureState | null,
  scenarioId?: string,
): LifecycleState | null {
  // Check failure branches
  if (failureOverride === "VALIDATION_FAILED" && current === "VALIDATING") {
    return "VALIDATION_FAILED";
  }
  if (failureOverride === "UNSUPPORTED_QUERY" && current === "QUERY_UNDERSTANDING") {
    return "UNSUPPORTED_QUERY";
  }
  if (failureOverride === "ROUTING_BLOCKED" && current === "ROUTING") {
    return "ROUTING_BLOCKED";
  }
  if (failureOverride === "LOW_CONFIDENCE" && current === "VERIFYING") {
    return "LOW_CONFIDENCE";
  }

  // Built-in scenario logic
  if (scenarioId === "demo-05" && current === "ROUTING") {
    return "ROUTING_BLOCKED";
  }
  if (scenarioId === "demo-06" && current === "VERIFYING") {
    return "LOW_CONFIDENCE";
  }

  // Otherwise follow nominal path
  return getNextNominalState(current);
}

export class WorkflowStateMachine {
  private _state: LifecycleState = "IDLE";
  private _failureOverride: FailureState | null = null;
  private _scenarioId: string = "demo-01";
  private _listeners: Set<StateListener> = new Set();
  private _history: WorkflowTransitionEvent[] = [];
  private _timerId: number | null = null;
  private _isPaused: boolean = false;
  private _startTime: number | null = null;
  private _endTime: number | null = null;

  constructor(options: WorkflowMachineOptions = {}) {
    const defaultState: LifecycleState =
      options.scenarioId === "demo-05" || options.scenarioId === "demo-07"
        ? "ROUTING_BLOCKED"
        : options.scenarioId === "demo-06"
          ? "LOW_CONFIDENCE"
          : "COMPLETE";
    this._state = options.initialState ?? defaultState;
    this._failureOverride = options.failureOverride ?? null;
    this._scenarioId = options.scenarioId ?? "demo-01";
    if (options.onTransition) {
      this._listeners.add(options.onTransition);
    }
  }

  public get state(): LifecycleState {
    return this._state;
  }

  public get macroStage() {
    return STATE_TO_MACRO_STAGE[this._state];
  }

  public get isPaused(): boolean {
    return this._isPaused;
  }

  public get isRunning(): boolean {
    return this._timerId !== null || (this._isPaused && !this.isTerminal);
  }

  public get isTerminal(): boolean {
    return this._state === "COMPLETE" || isFailureState(this._state);
  }

  public get failureOverride(): FailureState | null {
    return this._failureOverride;
  }

  public get history(): ReadonlyArray<WorkflowTransitionEvent> {
    return this._history;
  }

  public get elapsedTimeMs(): number {
    if (!this._startTime) return 0;
    if (this._endTime) return this._endTime - this._startTime;
    return Date.now() - this._startTime;
  }

  public subscribe(listener: StateListener): () => void {
    this._listeners.add(listener);
    return () => {
      this._listeners.delete(listener);
    };
  }

  public setScenario(scenarioId: string) {
    this._scenarioId = scenarioId;
    this.clearTimer();
    this._isPaused = false;
    if (scenarioId === "demo-05" || scenarioId === "demo-07") {
      this.transitionTo("ROUTING_BLOCKED", "Scenario pre-flight constraint");
    } else if (scenarioId === "demo-06") {
      this.transitionTo("LOW_CONFIDENCE", "Scenario uncertainty threshold");
    } else {
      this.transitionTo("COMPLETE", "Scenario initial result view");
    }
  }

  public setFailureOverride(override: FailureState | null) {
    this._failureOverride = override;
  }

  public transitionTo(nextState: LifecycleState, reason?: string) {
    const prev = this._state;
    if (prev === nextState) return;

    this._state = nextState;
    const evt: WorkflowTransitionEvent = {
      from: prev,
      to: nextState,
      timestamp: Date.now(),
      reason,
    };
    this._history.push(evt);

    if (this.isTerminal) {
      this._endTime = Date.now();
      this.clearTimer();
    }

    this._listeners.forEach((fn) => fn(nextState, evt));
  }

  public start() {
    this.clearTimer();
    this._isPaused = false;
    this._startTime = Date.now();
    this._endTime = null;

    if (this._state === "IDLE") {
      this.transitionTo("UPLOADING", "User initiated investigation");
      this.scheduleNext();
    } else if (this._state === "READY") {
      this.transitionTo("QUERY_RECEIVED", "Analyst submitted query");
      this.scheduleNext();
    } else if (this.isTerminal) {
      this.replay();
    } else {
      this.scheduleNext();
    }
  }

  public pause() {
    if (!this.isRunning || this.isTerminal) return;
    this._isPaused = true;
    this.clearTimer();
    this.notify();
  }

  public resume() {
    if (!this._isPaused || this.isTerminal) return;
    this._isPaused = false;
    this.scheduleNext();
    this.notify();
  }

  public stepNext() {
    this.clearTimer();
    this._isPaused = true;
    const next = resolveNextState(this._state, this._failureOverride, this._scenarioId);
    if (next) {
      this.transitionTo(next, "Manual single-step advance");
    }
  }

  public completeImmediately() {
    this.clearTimer();
    this._isPaused = false;
    this.transitionTo("COMPLETE", "Immediate completion requested");
  }

  public reset() {
    this.clearTimer();
    this._isPaused = false;
    this._startTime = null;
    this._endTime = null;
    this._history = [];
    this.transitionTo("IDLE", "Reset to initial state");
  }

  public replay() {
    this.reset();
    this.start();
  }

  private scheduleNext() {
    this.clearTimer();
    if (this._isPaused || this.isTerminal) return;

    const currentTiming = DEFAULT_STATE_TIMINGS[this._state];
    const delay = currentTiming.durationMs;

    if (delay <= 0) {
      // States like READY need user action to trigger query, unless in continuous demo mode
      return;
    }

    this._timerId = window.setTimeout(() => {
      this._timerId = null;
      const next = resolveNextState(this._state, this._failureOverride, this._scenarioId);
      if (next) {
        this.transitionTo(next, `Automated transition after ${delay}ms`);
        this.scheduleNext();
      }
    }, delay);
  }

  private clearTimer() {
    if (this._timerId !== null) {
      window.clearTimeout(this._timerId);
      this._timerId = null;
    }
  }

  private notify() {
    this._listeners.forEach((fn) => fn(this._state));
  }
}
