/**
 * Automated Test Suite for SatQuery AI Workflow State Machine
 */

import { WorkflowStateMachine, resolveNextState } from "./state-machine";
import { LifecycleState, NOMINAL_ORDER, STATE_TO_MACRO_STAGE, MACRO_STAGES } from "./types";

function assert(condition: boolean, msg: string) {
  if (!condition) {
    console.error(`❌ ASSERTION FAILED: ${msg}`);
    process.exit(1);
  }
  console.log(`✓ ${msg}`);
}

console.log("\n=========================================");
console.log("TEST 1: Nominal Order & Macro Stage Mapping");
console.log("=========================================");

assert(NOMINAL_ORDER.length === 15, "NOMINAL_ORDER must have exactly 15 states");
assert(NOMINAL_ORDER[0] === "IDLE", "First state must be IDLE");
assert(NOMINAL_ORDER[14] === "COMPLETE", "Final state must be COMPLETE");

const expectedOrder: LifecycleState[] = [
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
  "EXECUTING",
  "EVIDENCE_GENERATED",
  "VERIFYING",
  "COMPOSING",
  "COMPLETE",
];

expectedOrder.forEach((st, i) => {
  assert(NOMINAL_ORDER[i] === st, `State ${i} is ${st}`);
});

// Verify 5 macro stages
assert(MACRO_STAGES.length === 5, "Exactly 5 macro stages exist");
assert(STATE_TO_MACRO_STAGE["IDLE"] === "OBSERVATIONS", "IDLE maps to OBSERVATIONS");
assert(STATE_TO_MACRO_STAGE["UPLOADING"] === "OBSERVATIONS", "UPLOADING maps to OBSERVATIONS");
assert(STATE_TO_MACRO_STAGE["INSPECTING"] === "OBSERVATIONS", "INSPECTING maps to OBSERVATIONS");
assert(STATE_TO_MACRO_STAGE["VALIDATING"] === "OBSERVATIONS", "VALIDATING maps to OBSERVATIONS");
assert(
  STATE_TO_MACRO_STAGE["VALIDATION_FAILED"] === "OBSERVATIONS",
  "VALIDATION_FAILED maps to OBSERVATIONS",
);
assert(STATE_TO_MACRO_STAGE["READY"] === "OBSERVATIONS", "READY maps to OBSERVATIONS");

assert(STATE_TO_MACRO_STAGE["QUERY_RECEIVED"] === "QUERY", "QUERY_RECEIVED maps to QUERY");
assert(
  STATE_TO_MACRO_STAGE["QUERY_UNDERSTANDING"] === "QUERY",
  "QUERY_UNDERSTANDING maps to QUERY",
);
assert(STATE_TO_MACRO_STAGE["TASK_CLASSIFIED"] === "QUERY", "TASK_CLASSIFIED maps to QUERY");
assert(STATE_TO_MACRO_STAGE["UNSUPPORTED_QUERY"] === "QUERY", "UNSUPPORTED_QUERY maps to QUERY");

assert(
  STATE_TO_MACRO_STAGE["EVIDENCE_PLANNING"] === "ANALYSIS",
  "EVIDENCE_PLANNING maps to ANALYSIS",
);
assert(STATE_TO_MACRO_STAGE["ROUTING"] === "ANALYSIS", "ROUTING maps to ANALYSIS");
assert(STATE_TO_MACRO_STAGE["ROUTING_BLOCKED"] === "ANALYSIS", "ROUTING_BLOCKED maps to ANALYSIS");
assert(STATE_TO_MACRO_STAGE["EXECUTING"] === "ANALYSIS", "EXECUTING maps to ANALYSIS");

assert(
  STATE_TO_MACRO_STAGE["EVIDENCE_GENERATED"] === "EVIDENCE",
  "EVIDENCE_GENERATED maps to EVIDENCE",
);
assert(STATE_TO_MACRO_STAGE["VERIFYING"] === "EVIDENCE", "VERIFYING maps to EVIDENCE");
assert(STATE_TO_MACRO_STAGE["LOW_CONFIDENCE"] === "EVIDENCE", "LOW_CONFIDENCE maps to EVIDENCE");

assert(STATE_TO_MACRO_STAGE["COMPOSING"] === "RESULT", "COMPOSING maps to RESULT");
assert(STATE_TO_MACRO_STAGE["COMPLETE"] === "RESULT", "COMPLETE maps to RESULT");

console.log("\n=========================================");
console.log("TEST 2: Manual Step Transitions & Controls");
console.log("=========================================");

const machine = new WorkflowStateMachine({ initialState: "IDLE", scenarioId: "demo-01" });
assert(machine.state === "IDLE", "Initial machine state is IDLE");

// Step through all 14 transitions manually
const currentState: LifecycleState = "IDLE";
for (let i = 0; i < expectedOrder.length - 1; i++) {
  machine.stepNext();
  assert(
    machine.state === expectedOrder[i + 1],
    `Stepped from ${expectedOrder[i]} to ${machine.state}`,
  );
}
assert(machine.state === "COMPLETE", "Final step reaches COMPLETE");
assert(machine.isTerminal === true, "Machine is terminal at COMPLETE");

// Test Reset
machine.reset();
assert(machine.state === "IDLE", "Machine reset successfully to IDLE");

// Test Immediate Complete
machine.completeImmediately();
assert(machine.state === "COMPLETE", "Machine completed immediately");

console.log("\n=========================================");
console.log("TEST 3: Failure State Transitions");
console.log("=========================================");

// 1. Test VALIDATION_FAILED override
assert(
  resolveNextState("VALIDATING", "VALIDATION_FAILED") === "VALIDATION_FAILED",
  "VALIDATING -> VALIDATION_FAILED when override is set",
);

// 2. Test UNSUPPORTED_QUERY override
assert(
  resolveNextState("QUERY_UNDERSTANDING", "UNSUPPORTED_QUERY") === "UNSUPPORTED_QUERY",
  "QUERY_UNDERSTANDING -> UNSUPPORTED_QUERY when override is set",
);

// 3. Test ROUTING_BLOCKED scenario (demo-05)
assert(
  resolveNextState("ROUTING", null, "demo-05") === "ROUTING_BLOCKED",
  "ROUTING -> ROUTING_BLOCKED automatically for demo-05 (Single-image change query)",
);

// 4. Test LOW_CONFIDENCE scenario (demo-06)
assert(
  resolveNextState("VERIFYING", null, "demo-06") === "LOW_CONFIDENCE",
  "VERIFYING -> LOW_CONFIDENCE automatically for demo-06 (Insufficient evidence)",
);

console.log("\n=========================================");
console.log("TEST 4: State Machine Lifecycle History");
console.log("=========================================");

const failMachine = new WorkflowStateMachine({
  initialState: "IDLE",
  scenarioId: "demo-05",
});

// Step until terminal
while (!failMachine.isTerminal) {
  failMachine.stepNext();
}

assert(failMachine.state === "ROUTING_BLOCKED", "demo-05 terminated at ROUTING_BLOCKED");
assert(failMachine.history.length === 10, "History recorded exactly 10 transition events");
assert(
  failMachine.history[failMachine.history.length - 1]?.to === "ROUTING_BLOCKED",
  "Last event reached ROUTING_BLOCKED",
);

console.log("\n=========================================");
console.log("ALL 4 TEST SUITES PASSED CLEANLY!");
console.log("=========================================\n");
