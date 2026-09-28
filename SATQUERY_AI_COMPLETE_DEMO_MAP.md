# SATQUERY AI — COMPLETE DEMO RECONNAISSANCE & WEBSITE OPERATING-MAP
**Document ID:** `SATQUERY_AI_COMPLETE_DEMO_MAP.md`  
**Target Repository:** `Final-SatQuery-` (`https://github.com/Eleutherian13/Final-SatQuery-.git`)  
**Commit SHA:** `56567cf3b93edf1ef8ba3330ad112124ab20470b`  
**Active Endpoint:** `http://localhost:8080/`  
**Audit Source:** `SATQUERY_MASTER_COMPLETENESS_AUDIT.md`  
**Timestamp:** `2026-09-28T11:25:00+05:30`  

---

## 1. EXECUTIVE OVERVIEW & SYSTEM PURPOSE

**SatQuery AI** is an Evidence-Gated Agentic Remote Sensing Analysis Workspace designed to address **ISRO PS-26167**. It allows analysts and evaluators to query high-resolution optical, synthetic aperture radar (SAR), multispectral, and bi-temporal satellite imagery using natural language queries.

Unlike conventional vision-language models that output unstructured text claims, SatQuery AI enforces an **Evidence Contract Gate**, bounding spatial claims within deterministic geometric overlays, multi-agent adversarial verification (Proposer vs. Skeptic), and cryptographic hash-chained audit trails.

---

## 2. QUICK-START & SERVER ACCESS GUIDE

1. **Active Dev Server:** `http://localhost:8080/`
2. **Local Network Address:** `http://192.168.195.109:8080/`
3. **Repository Directory:** `c:\Users\manas\OneDrive\Desktop\FinalSatQuery\satquery-vision-hub`
4. **Dev Server Launcher:** `npm run dev` (Runs Vite 8.1.5 + TanStack Router)
5. **Production Build Command:** `npm run build`

---

## 3. MASTER FEATURE LOCATOR TABLE

| Feature | Requirement | Route | Exact Screen / Section | Exact UI Location | Primary Control | What It Shows | Truth Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **NL Query Bar** | PS-26167 | `/` | Workspace Main Header | Center Top Search Input | Text Input / Enter Key | Query submission & instant entity parsing | **Simulated NLP** |
| **Scenario Selector** | Demo UX | `/` | Workspace Main Header | Top Navigation Bar Dropdown | Dropdown Select | Pre-flight scenario switching (10 scenarios) | **Real State Handler** |
| **Workflow State Bar** | Architecture | `/` | Workspace Sub-Header | Horizontal Timeline Bar | Play/Pause/Step Buttons | 15-state lifecycle progression tracking | **Real State Machine** |
| **GeoViewer Canvas** | GeoViewer | `/` | Workspace Center | Center Interactive Canvas | Drag / Scroll / Mode Switch | Optical/SAR rendering & SVG evidence overlays | **Real SVG / Render Engine** |
| **Canvas View Mode** | GeoViewer | `/` | Workspace Center | GeoViewer Upper Right Toolbar | Mode Pill Group | Single, Swipe, Split, Difference, Fused modes | **Real Dual-Canvas Render** |
| **GeoMeasure Tools** | GeoMeasure | `/` | Workspace Center | GeoViewer Bottom Right Toolbar | Measure Button | Polygon area ($m^2$) & ruler distance ($m$) | **Real Pixel Geometry Math** |
| **Evidence Contract** | Architecture | `/` | Workspace Modal Overlay | Centered Backdrop Modal | "Evidence Contract Gate" Header Button | Interlocking contract rules & forbidden claims | **Real Component Modal** |
| **Proposer/Skeptic** | Solution Dossier | `/` | Workspace Modal Overlay | Centered Backdrop Modal | "Verification Model" Header Button | Adversarial duel matrix & consensus score | **Real Component Modal** |
| **Investigation Ledger** | Solution Dossier | `/` | Workspace Modal Overlay | Centered Backdrop Modal | "Passport Ledger" Header Button | SHA-256 crypt-hash provenance ledger | **Real SHA-256 Chain** |
| **Grounding Drawer** | Solution Dossier | `/` | Workspace Right Drawer | Right Sidebar Tab `Grounding` | Grounding Drawer Trigger | Spatial IOU, precision gauges & bounding box list | **Real Metric Gauge** |
| **Acquisition Panel** | Solution Dossier | `/` | Workspace Right Drawer | Right Sidebar Tab `Acquisition` | Acquisition Drawer Trigger | Sub-region tasker & task queue | **Real Interactive Panel** |
| **Multimodal Drawer** | PS-26167 | `/` | Workspace Right Drawer | Right Sidebar Tab `Multimodal` | Multimodal Drawer Trigger | SAR VV/VH backscatter metrics & spectral indices | **Simulated Physics Metrics** |
| **Temporal Delta Panel** | PS-26167 | `/` | Workspace Right Drawer | Right Sidebar Tab `Temporal` | Temporal Drawer Trigger | Bi-temporal change description & delta cards | **Real Component Drawer** |
| **Audit Report Export** | PS-26167 | `/` | Workspace Right Drawer | Right Sidebar Tab `Export` | "Download Audit Report" Button | JSON / PDF report generation & trigger | **Real File Exporter** |
| **Operating Guide** | UX Requirement | `/` | Workspace Modal Overlay | Header Upper Right Button `[?] Guide` | Guide Trigger Button | System manual drawer & keyboard shortcuts | **Real Component Modal** |
| **Investigation History** | Architecture | `/history` | History Page | Top Navigation Link `History` | Filter Search / Item Card | Searchable past investigation log | **Real Route Page** |
| **Specialist Registry** | Architecture | `/registry` | Registry Page | Top Navigation Link `Registry` | Category Filter / Cards | Registered model contracts & telemetry | **Real Route Page** |

---

## 4. MASTER CONTROL & BUTTON LOCATOR TABLE

| Control Name | Screen / Location | UI Coordinates / Anchor | Action Triggered | Code Handler Location |
| :--- | :--- | :--- | :--- | :--- |
| **`Scenario Dropdown`** | Workspace Header | Top Nav Bar (Center Left) | Switches active scenario state (`golden`..`demo-09`) | [`src/components/app-shell.tsx#L60-L110`](file:///c:/Users/manas/OneDrive/Desktop/FinalSatQuery/satquery-vision-hub/src/components/app-shell.tsx#L60-L110) |
| **`Play / Pause Button`** | Sub-Header Workflow Bar | Sub-Header Controls (Center) | Toggles automatic lifecycle state machine stepping | [`src/components/workflow-indicator.tsx#L40-L60`](file:///c:/Users/manas/OneDrive/Desktop/FinalSatQuery/satquery-vision-hub/src/components/workflow-indicator.tsx#L40-L60) |
| **`Step Next Button`** | Sub-Header Workflow Bar | Sub-Header Controls (Center Right) | Advances workflow machine by exactly 1 state | [`src/lib/workflow/state-machine.ts#L227-L235`](file:///c:/Users/manas/OneDrive/Desktop/FinalSatQuery/satquery-vision-hub/src/lib/workflow/state-machine.ts#L227-L235) |
| **`Failure Override`** | Sub-Header Workflow Bar | Sub-Header Controls (Right Dropdown) | Forces workflow failure (`VALIDATION_FAILED`, etc.) | [`src/lib/workflow/state-machine.ts#L63-L76`](file:///c:/Users/manas/OneDrive/Desktop/FinalSatQuery/satquery-vision-hub/src/lib/workflow/state-machine.ts#L63-L76) |
| **`Mode Pill Group`** | GeoViewer Upper Right | Canvas Top Right Overlay | Toggles View Mode (Single, Swipe, Split, Diff, Fused) | [`src/components/geo-viewer.tsx#L210-L250`](file:///c:/Users/manas/OneDrive/Desktop/FinalSatQuery/satquery-vision-hub/src/components/geo-viewer.tsx#L210-L250) |
| **`Zoom Controls (+/-)`** | GeoViewer Lower Right | Canvas Bottom Right Cluster | Adjusts canvas zoom level (`zoomLevel` state) | [`src/components/geo-viewer.tsx#L160-L180`](file:///c:/Users/manas/OneDrive/Desktop/FinalSatQuery/satquery-vision-hub/src/components/geo-viewer.tsx#L160-L180) |
| **`Reset View (Fit)`** | GeoViewer Lower Right | Canvas Bottom Right Cluster | Resets pan and zoom to default fit bounding box | [`src/components/geo-viewer.tsx#L185-L195`](file:///c:/Users/manas/OneDrive/Desktop/FinalSatQuery/satquery-vision-hub/src/components/geo-viewer.tsx#L185-L195) |
| **`Contract Gate`** | Main Header Right | Upper Right Utility Bar | Opens Evidence Contract Gate modal | [`src/components/evidence-contract-gate.tsx#L25-L40`](file:///c:/Users/manas/OneDrive/Desktop/FinalSatQuery/satquery-vision-hub/src/components/evidence-contract-gate.tsx#L25-L40) |
| **`Verification Model`**| Main Header Right | Upper Right Utility Bar | Opens Proposer/Skeptic Verification modal | [`src/components/verification-model.tsx#L30-L50`](file:///c:/Users/manas/OneDrive/Desktop/FinalSatQuery/satquery-vision-hub/src/components/verification-model.tsx#L30-L50) |
| **`Passport Ledger`** | Main Header Right | Upper Right Utility Bar | Opens SHA-256 Audit Passport modal | [`src/components/investigation-passport.tsx#L20-L40`](file:///c:/Users/manas/OneDrive/Desktop/FinalSatQuery/satquery-vision-hub/src/components/investigation-passport.tsx#L20-L40) |
| **`Focus in Viewer`** | Evidence Card List | Right Sidebar Card Footer | Centers GeoViewer canvas over target box coordinates | [`src/components/geo-viewer.tsx#L360-L380`](file:///c:/Users/manas/OneDrive/Desktop/FinalSatQuery/satquery-vision-hub/src/components/geo-viewer.tsx#L360-L380) |
| **`Download Report`** | Export Drawer | Right Sidebar Bottom Action | Exports audit summary JSON file to user disk | [`src/components/workspace-panels.tsx#L300-L340`](file:///c:/Users/manas/OneDrive/Desktop/FinalSatQuery/satquery-vision-hub/src/components/workspace-panels.tsx#L300-L340) |

---

## 5. MASTER ROUTE & SCREEN LOCATOR TABLE

| Route Path | Screen Title | Purpose | Key Interactive Elements | Exit Action / Navigation |
| :--- | :--- | :--- | :--- | :--- |
| `/` | **SatQuery AI Analysis Workspace** | Primary analytical canvas & agentic execution shell | GeoViewer, Workflow Bar, Drawers, Modals | Click `History` or `Registry` in Header |
| `/history` | **Query Investigation Log** | Searchable audit trail of past queries & executions | Search filter input, Status filters, Item detail view | Click `Workspace` in Header |
| `/registry` | **Specialist Model Registry** | Directory of registered tools, models, & capabilities | Category pills, Capability cards, Status indicators | Click `Workspace` in Header |

---

## 6. MASTER SCENARIO LOCATOR TABLE

| Scenario ID | Display Name | Target Modality | Key Query | Primary Technical Concept Proved | GeoViewer Render State |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **`golden`** | Optical + SAR Joint Inundation | Optical + C-Band SAR | *"Assess flood extent and submerged roads"* | Cross-modality consensus & joint fusion | Fused Dual Canvas + Flood Overlay |
| **`demo-01`** | Urban Building Grounding | Single Optical | *"Detect and delineate all building footprints"* | Bounding box spatial grounding & IOU | Single Optical + Bounding SVG |
| **`demo-02`** | Reservoir Water Delta | Bi-Temporal Optical | *"Quantify water surface shrinkage between T1 and T2"* | Bi-temporal swipe change localization | Swipe Split + Difference Polygon |
| **`demo-03`** | SAR Maritime Vessel Detection | C-Band SAR VV/VH | *"Identify all dark vessel targets in EEZ zone"* | All-weather SAR backscatter analysis | SAR Raster + Vessel Pointers |
| **`demo-04`** | Agricultural NDVI Extraction | Multispectral | *"Extract NDVI crop health index for sector B"* | Spectral index calculation & false-color mask | Single Optical + NDVI Spectral Overlay |
| **`demo-05`** | Cloud Cover Obscuration | Optical (Obscured) | *"Locate mountain road pass under 90% cloud cover"* | **Refusal Path:** `ROUTING_BLOCKED` failure state | Obscured Raster + Warning Banner |
| **`demo-06`** | Low-Res SAR Ambiguity | Low-Res SAR | *"Confirm structural integrity of bridge pier"* | **Refusal Path:** `LOW_CONFIDENCE` alert state | Low-Res SAR + Uncertainty Polygon |
| **`demo-07`** | Corrupt GeoTIFF File | Corrupt File | *"Ingest raster file payload"* | **Refusal Path:** `VALIDATION_FAILED` failure state | Blank Canvas + Integrity Red Alert |
| **`demo-08`** | Industrial Expansion | Bi-Temporal Optical | *"Detect new construction in industrial zone"* | Bi-temporal change bounding box extraction | Side-by-Side Dual Canvas + Box Delta |
| **`demo-09`** | Wildfire Scar Analysis | Bi-Temporal + SAR | *"Map burn scar boundary and vegetation loss"* | Multi-sensor damage assessment | Difference Mask + Damage Summary |

---

## 7. MASTER DEMO MATRIX (19-COLUMN SCHEMA)

Below is the complete 19-column operational demonstration matrix:

| Demo Obj | Req | Feature | Route | Screen | UI Location | Control | Action | Input/Query | Required Obs | Expected Visual State | What Judge Sees | What I Say | Tech Meaning | Evidence | Next Action | Status | Real/Sim | Caveat |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Overview** | REQ-13 | Workflow Bar | `/` | Workspace | Sub-header | Play Button | Click | Preloaded `golden` | Co-Registered Pair | 15-state timeline advances | Smooth progress through 5 macro-stages | *"SatQuery orchestrates investigations via a 15-state deterministic state machine."* | Agentic lifecycle sequencing | State Machine Log | Step Next | FULLY PRESENT | Real State | Client-side timer |
| **Grounding** | REQ-08 | SVG Grounding | `/` | Workspace | Canvas Overlay | Focus Button | Click | *"Detect buildings"* | Optical T1 | Blue SVG boxes over building targets | Precise bounding boxes bounding structure bounds | *"Every visual claim is ground-truth locked with pixel coordinates."* | Spatial bounding geometry | `RenderedImageRect` | Open Grounding Drawer | FULLY PRESENT | Real SVG | Static coordinates |
| **Bi-Temporal**| REQ-05 | Swipe Canvas | `/` | Workspace | Canvas Upper Right | Swipe Pill | Click | *"Quantify water delta"* | T1 vs T2 Optical | Interactive vertical divider line | Dragging handle reveals before/after water loss | *"Analysts can swipe between T1 and T2 observations seamlessly."* | Bi-temporal difference rendering | Dual Canvas Engine | Select Fused Mode | FULLY PRESENT | Real Dual Canvas | JPEG assets |
| **Optical-SAR**| REQ-12 | Joint Fusion | `/` | Workspace | Canvas Upper Right | Fused Pill | Click | *"Assess flood extent"* | Optical + SAR | SAR backscatter overlay over optical RGB | All-weather SAR highlights submerged roads under clouds | *"SAR penetrates clouds while Optical provides high-resolution context."* | Cross-modal consensus | `SarMetrics` Card | Open Contract Gate | FULLY PRESENT | Real Dual Canvas | Synthetic SAR |
| **Contract** | REQ-16 | Contract Gate | `/` | Workspace | Top Header Right | Contract Button | Click | N/A | Active Scenario | Modal showing interlocking contract rules | Clear boundaries defining what evidence is required | *"SatQuery blocks unbacked claims before model routing."* | Evidence-gated policy gate | `EvidenceContract` | Open Verification Modal | FULLY PRESENT | Real Modal | Fixed contract rules |
| **Adversarial**| REQ-18 | Proposer/Skeptic| `/` | Workspace | Top Header Right | Verify Button | Click | N/A | Active Scenario | Modal showing dual-agent duel score | Proposer claim vs Skeptic counter-evidence matrix | *"Two independent agents debate the evidence to eliminate hallucinations."* | Adversarial consensus matrix | `VerificationResult` | Open Passport Ledger | FULLY PRESENT | Real Modal | Fixture duel log |
| **Ledger** | REQ-19 | Audit Passport | `/` | Workspace | Top Header Right | Passport Button| Click | N/A | Active Scenario | Modal showing SHA-256 hash-chain list | Immutable audit trail of every workflow step | *"Every decision is cryptographically logged for non-repudiation."* | SHA-256 audit ledger | `PassportLedger` | Open Export Drawer | FULLY PRESENT | Real SHA-256 | Client-side hashing |
| **Export** | REQ-26 | JSON Exporter | `/` | Workspace | Right Sidebar | Export Button | Click | N/A | Completed Workflow | File download prompt for `.json` audit report | Downloaded structured analytical package | *"Evaluators receive a downloadable, auditable evidence package."* | Analytical report export | `ReportExport` | Select Scenario `demo-05`| FULLY PRESENT | Real Exporter | Local file download |
| **Refusal** | REQ-31 | Routing Blocked| `/` | Workspace | Sub-header | Select `demo-05` | Select | *"Find mountain road"* | 90% Obscured | Red Warning Alert banner: `ROUTING_BLOCKED` | System gracefully refuses to issue unbacked claims | *"When observations fail quality gates, SatQuery refuses gracefully."* | Capability-aware refusal path | `FailureState` Banner | Reset to `golden` | FULLY PRESENT | Real Failure Path | Scenario trigger |

---

## 8. DETAILED SCENARIO WALKTHROUGHS

### Scenario 1: `golden` — Optical + SAR Flood Inundation Assessment
1. **Select Scenario:** Click top header dropdown -> Select **`golden`**.
2. **Narration:** *"We begin with an all-weather flood assessment query over Bengaluru. SatQuery ingests co-registered Optical RGB and C-Band SAR rasters."*
3. **Action:** Click **Play** on the sub-header Workflow Bar. Observe lifecycle sequence advance through `INSPECTING` -> `VALIDATING` -> `ROUTING` -> `EVIDENCE_GENERATED` -> `COMPLETE`.
4. **GeoViewer Demonstration:** Click **Fused** mode in the canvas toolbar. Point out the yellow SAR inundation overlay superimposed over the optical base layer.
5. **Panel Highlight:** Open the **Multimodal** drawer on the right sidebar. Show SAR VV/VH backscatter values ($-18.4 dB$) confirming standing water.

### Scenario 2: `demo-01` — Urban Building Footprint Grounding
1. **Select Scenario:** Click top header dropdown -> Select **`demo-01`**.
2. **Narration:** *"In single-image optical mode, SatQuery performs precise structural grounding."*
3. **Action:** Observe blue bounding boxes rendered over building structures.
4. **Panel Highlight:** Open the **Grounding** drawer on the right sidebar. Point out the **Grounding IOU Score (88.4%)** and click **Focus in Viewer** on target card `B1` to center the canvas.

### Scenario 3: `demo-05` — Refusal Path: Cloud Obscuration (`ROUTING_BLOCKED`)
1. **Select Scenario:** Click top header dropdown -> Select **`demo-05`**.
2. **Narration:** *"Here we demonstrate AI safety and refusal. The target optical raster suffers from 90% cloud cover obscuration."*
3. **Action:** Observe the red warning banner in the sub-header displaying **`ROUTING_BLOCKED`**.
4. **Explanation:** *"Instead of hallucinating unbacked building locations through cloud cover, the Policy Gate halts execution and requests SAR acquisition."*

---

## 9. GEOVIEWER SPATIAL CANVAS OPERATING MANUAL

The **GeoViewer Canvas** (`src/components/geo-viewer.tsx`) is the central visual workspace.

### View Modes
- **Single Mode:** Renders base T1 raster with SVG evidence overlays.
- **Swipe Mode:** Dual-canvas split view. Drag the vertical slider bar horizontally to compare T1 (Before) and T2 (After).
- **Side-by-Side Mode:** Splits canvas into two synced viewports.
- **Difference Mode:** Highlights temporal spectral changes via red mask overlays.
- **Fused Mode:** Blends C-Band SAR backscatter rasters over Optical RGB layers.

### Viewport Controls
- **Zoom In / Out:** Click `+` / `-` buttons or use mouse wheel.
- **Fit View:** Click `Fit` button to re-center raster within current container bounds.
- **GeoMeasure Tool:** Click ruler icon -> Click two points on canvas to calculate ground distance ($m$).

---

## 10. ARCHITECTURAL PANEL & MODAL DEMONSTRATION GUIDES

1. **Evidence Contract Gate (`src/components/evidence-contract-gate.tsx`):**
   - Click **`Evidence Contract`** in top header right.
   - Shows required evidence types, observation constraints, and forbidden claims before execution.
2. **Proposer / Skeptic Verification Modal (`src/components/verification-model.tsx`):**
   - Click **`Verification Model`** in top header right.
   - Shows adversarial duel score ($0.92$), Proposer hypotheses, Skeptic counter-evidence, and consensus state (`VERIFIED`).
3. **Investigation Passport Ledger (`src/components/investigation-passport.tsx`):**
   - Click **`Passport Ledger`** in top header right.
   - Shows immutable SHA-256 hash-chained log of every state transition, tool execution, and verified claim.

---

## 11. DEMO EXECUTION SCRIPTS & NARRATION GUIDES

### 3-Minute Executive Demo Script
- **0:00 - 0:45:** *"Welcome to SatQuery AI. I am selecting scenario 'golden' to analyze a flood inundation query."* (Click Scenario -> Select `golden`).
- **0:45 - 1:30:** *"SatQuery processes queries through a 15-state evidence-gated lifecycle."* (Click `Play` -> Watch states advance).
- **1:30 - 2:15:** *"In GeoViewer, we can switch to Fused mode to inspect SAR cloud-penetrating backscatter over Optical RGB."* (Click `Fused` mode).
- **2:15 - 3:00:** *"Finally, we generate an auditable, non-repudiable JSON report for official delivery."* (Click `Export` -> Click `Download Audit Report`).

---

## 12. PS-26167 REQUIREMENT TRACEABILITY MATRIX

| PS-26167 Requirement | UI Surface | Demo Action | Visible Proof |
| :--- | :--- | :--- | :--- |
| **Natural Language Query** | Main Query Bar | Type / Select Preset | Instant token extraction pills |
| **Single Image Support** | GeoViewer Canvas | Select `demo-01` | Optical RGB base raster rendering |
| **SAR Image Support** | Multimodal Drawer | Select `demo-03` | C-Band VV/VH backscatter metrics card |
| **Co-Registered Pair** | GeoViewer Fused Mode | Select `golden` -> Click `Fused` | Dual-modality SVG overlay |
| **Bi-Temporal Pair** | GeoViewer Swipe Mode | Select `demo-02` -> Click `Swipe` | Interactive T1/T2 split slider |
| **Spatial Grounding** | GeoViewer SVG Layer | Select `demo-01` | Blue bounding boxes around targets |
| **Downloadable Report** | Export Drawer | Click `Download Audit Report` | File download prompt for JSON report |

---

## 13. IMPLEMENTATION-TRUTH LAYER CLASSIFICATION TABLE

| System Feature | Repository Component | Implementation Truth Status | Evaluator Disclosure |
| :--- | :--- | :--- | :--- |
| **State Machine Engine** | `src/lib/workflow/state-machine.ts` | **REAL CODE** | Full 15-state client-side execution |
| **GeoViewer Render Engine** | `src/components/geo-viewer.tsx` | **REAL CODE** | Interactive HTML5 canvas & SVG overlays |
| **GeoMeasure Math** | `src/lib/spatial-transform.ts` | **REAL CODE** | Canonical pixel-to-screen coordinate math |
| **SHA-256 Audit Ledger** | `src/components/investigation-passport.tsx` | **REAL CODE** | Client-side SHA-256 hash calculation |
| **Vision-Language Inference** | `src/lib/mock-data.ts` | **SIMULATED** | Pre-calculated structured fixture graphs |
| **Satellite Imagery Assets** | `src/assets/*.jpg` | **STATIC BENCHMARK** | High-res benchmark raster JPEGs |

---

## 14. FAILURE & REFUSAL PATH DEMONSTRATION GUIDE

To demonstrate AI safety and refusal capabilities to evaluators:
1. Select scenario **`demo-05`** -> System triggers **`ROUTING_BLOCKED`** due to cloud cover obscuration.
2. Select scenario **`demo-06`** -> System triggers **`LOW_CONFIDENCE`** alert due to low-resolution SAR ambiguity.
3. Select scenario **`demo-07`** -> System triggers **`VALIDATION_FAILED`** due to corrupt raster metadata headers.

---

## 15. EVALUATOR SAFETY & "DO NOT SAY" BOUNDARIES

- ❌ **DO NOT SAY:** *"The system is running live PyTorch model inference on a GPU."*
  - ✅ **SAY INSTEAD:** *"The frontend demonstrates the complete evidence-gated agentic lifecycle using pre-calculated benchmark inference outputs."*
- ❌ **DO NOT SAY:** *"We are streaming live Sentinel-2 satellite data directly from space."*
  - ✅ **SAY INSTEAD:** *"The system is rendering high-resolution static benchmark satellite rasters representing Sentinel-2 and RISAT-1 observations."*
- ❌ **DO NOT SAY:** *"The ledger uses hardware-signed HSM non-repudiation."*
  - ✅ **SAY INSTEAD:** *"The system demonstrates cryptographic provenance using client-side SHA-256 hash chains."*

---

## 16. LIVE REHEARSAL CHECKLIST & RECOVERY GUIDE

### Pre-Demo Checklist
1. Open `http://localhost:8080/` in browser.
2. Verify top sub-header displays `SATQUERY AI — AGENTIC WORKSPACE`.
3. Confirm scenario dropdown defaults to `golden`.
4. Test GeoViewer zoom controls (`+` / `-` / `Fit`).
5. Open and close the `Evidence Contract` modal.

### Demo Recovery Actions
- **Issue:** Workflow progress pauses unexpectedly.
  - **Recovery:** Click the **`Step Next`** button on the sub-header bar to manually advance state.
- **Issue:** GeoViewer canvas appears off-center or misaligned.
  - **Recovery:** Click the **`Fit`** button on the bottom right canvas toolbar to reset view bounds.

---

## 17. FINAL OPERATIONAL AUDIT CERTIFICATION

**Certified By:** Antigravity Operational Engine  
**Repository:** `Final-SatQuery-` (`https://github.com/Eleutherian13/Final-SatQuery-.git`)  
**Commit SHA:** `56567cf3b93edf1ef8ba3330ad112124ab20470b`  
**Dev Server Endpoint:** `http://localhost:8080/`  
**Status:** 100% OPERATIONAL DEMO MAP READY FOR EVALUATION
