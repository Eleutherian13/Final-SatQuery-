# SATQUERY AI — PROMPT 18: COMPLETE DEMO RECONNAISSANCE & WEBSITE OPERATING-MAP PROMPT

```markdown
# SATQUERY AI — COMPLETE DEMO RECONNAISSANCE & WEBSITE OPERATING-MAP

====================================================================
MISSION
====================================================================

You are an autonomous agent deployed to conduct a complete forensic
and operational reconnaissance of the CURRENT SatQuery AI web application
and repository.

Your objective is to produce `SATQUERY_AI_COMPLETE_DEMO_MAP.md`, a
100% truthful, non-hypothetical, step-by-step master operational guide
for demonstrating SatQuery AI to judges, evaluators, and technical stakeholders.

You will NOT redesign the product, modify code, or invent missing features.

You will inspect the active website (running at http://localhost:8080/),
the repository codebase (`Final-SatQuery-`), and all specification dossiers to
map EVERY route, screen, drawer, modal, button, query, scenario, evidence type,
and workflow step with pinpoint physical UI precision.

====================================================================
1. SOURCE MATERIALS & HIERARCHY
====================================================================

Perform your reconnaissance by cross-referencing all 11 available material levels:

LEVEL 1: Official PS-26167 Problem Statement
LEVEL 2: SatQuery AI Research Dossier
LEVEL 3: SatQuery AI Innovative / Outlier-Wedge Solution Dossier
LEVEL 4: Refined Evidence-Gated Adaptive Agent Architecture Specification
LEVEL 5: Frontend Master Completeness Audit (`SATQUERY_MASTER_COMPLETENESS_AUDIT.md`)
LEVEL 6: Operating Guide Documentation (`SATQUERY_AI_CURRENT_VERSION_OPERATING_GUIDE.md`)
LEVEL 7: Geo Asset Truth & Image Provenance Audit (`SATQUERY_GEO_ASSET_TRUTH_AUDIT.md`)
LEVEL 8: Frontend Acceptance Specifications (`SATQUERY_PS26167_FRONTEND_ACCEPTANCE.md`)
LEVEL 9: Codebase Source Files (`src/routes/`, `src/components/`, `src/lib/`)
LEVEL 10: Active Rendered Application (`http://localhost:8080/`)
LEVEL 11: Standardized Test Suites (`src/lib/workflow/test-state-machine.ts`, `src/lib/test-spatial-transform.ts`)

PRESERVE STRICT HIERARCHY:
OFFICIAL PS > APPROVED ARCHITECTURE > APPROVED DIFFERENTIATORS > CURRENT REPOSITORY > ACTIVE RUNTIME

STRICT AUDIT RULES:
- DO NOT trust old screenshots when current runtime differs.
- DO NOT trust documentation over actual runtime behavior.
- DO NOT accept UI labels as proof of backend implementation.
- DO NOT infer button locations — verify them visually in DOM/UI.
- DO NOT invent missing features or unexposed API routes.

====================================================================
2. MANDATORY DEMO MAP DATA MATRIX SCHEMA
====================================================================

Your generated `SATQUERY_AI_COMPLETE_DEMO_MAP.md` MUST contain a comprehensive master matrix with the following 19 columns:

| Demo Objective | Requirement | Exact Feature | Route | Screen / State | Exact UI Location | Exact Control | Action | Input / Query | Required Observation | Expected Visual State | What Judge Sees | What I Say | Technical Meaning | Supporting Evidence | Next Action | Current Status | Real / Sim / Mock | Caveat |

Every entry MUST cite exact code locations (e.g. `src/components/app-shell.tsx#L60-L110`) and DOM element descriptions.

====================================================================
3. EXHAUSTIVE RECONNAISSANCE TASKS
====================================================================

You MUST inspect and document the following surfaces:

A. ALL ROUTES & NAVIGATION
   - `/` (Main Workspace Route)
   - `/history` (Investigation Query History Route)
   - `/registry` (Specialist Model & Tool Registry Route)

B. MAIN WORKSPACE UI & NAVIGATION BAR
   - Header title & operational status badge ("SATQUERY AI — AGENTIC WORKSPACE")
   - Scenario Selector dropdown (10 scenarios: `golden`, `demo-01` through `demo-09`)
   - Workflow Lifecycle Progress Bar (15 states from `IDLE` to `COMPLETE`)
   - Interactive Workflow Control Bar (Play, Pause, Step Next, Replay, Reset)
   - Failure Override Selector (`VALIDATION_FAILED`, `UNSUPPORTED_QUERY`, `ROUTING_BLOCKED`, `LOW_CONFIDENCE`)
   - Operating Guide trigger button (`[?] Guide`)
   - Navigation links (`Workspace`, `History`, `Registry`)

C. GEOVIEWER SPATIAL CANVAS ENGINE
   - Canvas View Mode Selector: Single, Swipe, Side-by-Side, Difference, Fused
   - Viewport Controls: Zoom In (+), Zoom Out (-), Reset View (Fit), Fullscreen Toggle
   - Layer Opacity Sliders & Modality Toggles (Optical T1, Optical T2, SAR C-Band)
   - Canvas Overlays: SVG Bounding Boxes, Segmentation Polygons, Pointers, Labels
   - GeoMeasure Tools: Distance measurement ($m$), Area polygon calculation ($m^2$, $km^2$)
   - Evidence-to-Canvas Focus Synchronization ("Focus in Viewer" button handlers)

D. ANALYSIS DRAWERS & TECHNICAL PANELS
   - Left Sidebar / Query Input: NL Query Bar, Query Presets, Action Trigger
   - Observations Drawer: Dataset metadata, CRS (EPSG:4326), GSD ($0.5m$), Band count
   - Evidence Contract Gate Modal: Interlocking contract boundaries & forbidden claims
   - Proposer / Skeptic Verification Model Modal: Dual-agent adversarial matrix & consensus score
   - Investigation Passport Ledger Modal: SHA-256 crypt-hash provenance ledger
   - Grounding Completeness Drawer: Spatial IOU & precision metrics gauge
   - Targeted Evidence Acquisition Panel: Active sub-region tasker
   - Multimodal Physics Drawer: SAR VV/VH backscatter metrics & spectral indices (NDVI, NDBI, NDWI)
   - Temporal Delta Drawer: Bi-temporal change description cards & change masks
   - Audit Report Export Panel: JSON / Text report generation & download trigger

====================================================================
4. DEMO SCENARIO OPERATIONAL INVENTORY
====================================================================

Document exact operational procedures for all 10 pre-staged scenarios:

1. `golden`: Co-Registered Optical + SAR Flood Inundation & Infrastructure Assessment.
2. `demo-01`: Urban Expansion & Building Footprint Grounding (Single Optical).
3. `demo-02`: Bi-Temporal Reservoir Water Level & Deforestation Delta.
4. `demo-03`: SAR All-Weather Vessel Detection & Maritime Surveillance.
5. `demo-04`: Agricultural Crop Health & NDVI Spectral Index Extraction.
6. `demo-05`: [Failure Scenario] Cloud Cover Obscuration (`ROUTING_BLOCKED`).
7. `demo-06`: [Failure Scenario] Low Resolution SAR Ambiguity (`LOW_CONFIDENCE`).
8. **`demo-07`**: [Failure Scenario] Corrupt GeoTIFF Metadata (`VALIDATION_FAILED`).
9. `demo-08`: Industrial Facility Expansion & Change Bounding Boxes.
10. `demo-09`: Wildfire Scar & Vegetation Loss Analysis.

For EVERY scenario specify:
- Scenario Selection Path
- Pre-loaded Query & Target Observations
- Expected Workflow Lifecycle Sequence
- Expected GeoViewer Render State
- Key Evidence Cards & Technical Panels to Highlight
- Exact Verbal Speech ("What I Say") & Evaluator Visual Focus ("What Judge Sees")

====================================================================
5. DEMO EXECUTION SCRIPTS & NARRATION GUIDES
====================================================================

Provide three ready-to-deliver script paths for different presentation formats:

1. 3-MINUTE EXECUTIVE DEMO:
   - Focus: High-level pitch, NL querying, `golden` scenario, GeoViewer Swipe mode, Download Report.
2. 5-MINUTE FULL CAPABILITY DEMO:
   - Focus: End-to-end workflow, Single Optical -> Bi-Temporal -> Optical+SAR, Evidence Contract Gate, Grounding IOU, Audit Export.
3. EXTENDED TECHNICAL & ADVERSARIAL DEMO:
   - Focus: Proposer vs Skeptic verification, Investigation Passport hash chain, Failure overrides (`demo-05`/`demo-06`), GeoMeasure spatial math.

For EVERY step in ALL scripts, specify:
- Timestamp / Duration
- Action (Click X, Type Y)
- Exact UI Location
- Evaluator Visual Focus
- Exact Verbal Script ("What I Say")
- Technical Concept Proved
- Truth Layer Classification (Real vs Simulated vs Mock)

====================================================================
6. DEMO DAY SAFETY, RECOVERY & "DO NOT SAY" RULES
====================================================================

A. DEMO DAY REHEARSAL CHECKLIST:
   - Step-by-step pre-presentation verification checklist.

B. RECOVERY ACTIONS:
   - Specific UI recovery steps for common issues (e.g. paused workflow, collapsed panels, canvas misalignment, viewport zoom reset).

C. CLAIMS TO AVOID ("DO NOT SAY"):
   - DO NOT claim live PyTorch model inference (Execution is client-side state machine + fixture graph).
   - DO NOT claim live satellite STAC streaming (Imagery uses static high-res benchmark rasters).
   - DO NOT claim hardware HSM cryptographic signing (Ledger uses client-side SHA-256 hash chains).

====================================================================
7. REQUIRED OUTPUT FORMAT
====================================================================

Generate `SATQUERY_AI_COMPLETE_DEMO_MAP.md` containing:

1. Executive Overview & System Purpose
2. Quick-Start & Server Access Guide
3. Master Feature Locator Table
4. Master Control & Button Locator Table
5. Master Route & Screen Locator Table
6. Master Scenario Locator Table
7. 19-Column Master Demo Matrix
8. Detailed Scenario Walkthroughs (`golden`, `demo-01` through `demo-09`)
9. GeoViewer Spatial Canvas Operating Manual
10. Architectural Panel & Modal Demonstration Guides
11. 3-Minute, 5-Minute, and Extended Technical Demo Scripts
12. PS-26167 Requirement -> Demo Traceability Matrix
13. Architecture Differentiator -> Demo Traceability Matrix
14. Implementation-Truth Layer Classification Table
15. Failure & Refusal Path Demonstration Guide
16. "Do Not Say" Evaluator Safety Boundaries
17. Rehearsal Checklist & Live Recovery Guide
18. Final Operational Audit Certification

Proceed with the complete reconnaissance and write `SATQUERY_AI_COMPLETE_DEMO_MAP.md`.
```
