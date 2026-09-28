# SatQuery AI — Evidence-Gated Remote Sensing Analysis Workspace

> **ISRO Problem Statement PS-26167 Implementation**  
> *Natural-Language Querying of High-Resolution Optical, SAR, Multispectral & Bi-Temporal Satellite Imagery with Deterministic Evidence Contracts, Adversarial Verification, and Cryptographic Audit Ledgers.*

---

## 🚀 Overview

**SatQuery AI** is an advanced, evidence-gated agentic workspace designed for interactive natural-language analysis of complex satellite imagery. Built to solve **ISRO PS-26167**, SatQuery AI bridges the gap between vision-language queries and satellite observation reality.

Unlike conventional AI assistants that output unverified text summaries, SatQuery AI enforces an **Evidence Contract Gate**—locking all visual claims to pixel-precise spatial bounding geometries (`RenderedImageRect`), multi-agent adversarial verification (**Proposer vs. Skeptic**), and an immutable **SHA-256 cryptographic provenance ledger**.

---

## ✨ Key Features & Capabilities

### 🛰️ Multimodal Remote-Sensing Intelligence
- **Single-Image VQA & Grounding:** Extract structural footprints, building counts, and scene captions with ground-truth pixel bounding boxes.
- **C-Band SAR Analysis:** Process all-weather synthetic aperture radar rasters with VV/VH backscatter metrics ($dB$) for nighttime and cloud-obscured target detection.
- **Optical + SAR Co-Registered Fusion:** Overlay cloud-penetrating SAR signals directly over optical RGB imagery in real-time.
- **Bi-Temporal Change Analysis:** Measure surface deltas (water body shrinkage, deforestation, disaster damage) across T1 vs. T2 temporal observations with interactive swipe & split sliders.
- **Spectral Index Extraction:** Calculate NDVI, NDBI, and NDWI indices to evaluate agricultural crop health and urban built-up density.

### 🛡️ Evidence-Gated Agentic Architecture
- **15-State Workflow Machine:** Deterministic lifecycle tracking from observation ingestion (`UPLOADING`, `INSPECTING`, `VALIDATING`) to query execution (`ROUTING`, `EXECUTING`, `VERIFYING`, `COMPLETE`).
- **Evidence Contract Gate:** Policy gate enforcing strict observation requirements before specialist model dispatch, preventing unbacked hallucinations.
- **Proposer vs. Skeptic Verification:** Dual-agent adversarial consensus engine evaluating claim hypotheses against counter-evidence.
- **Investigation Passport & Cryptographic Ledger:** Immutable SHA-256 hash-chained log of every state transition, tool call, and verified claim.
- **GeoMeasure Spatial Engine:** Real-time distance ($m$) and polygon area ($m^2$, $km^2$) calculations mapped via canonical viewport coordinates.
- **Refusal & Safety Paths:** Explicit failure modes (`ROUTING_BLOCKED`, `LOW_CONFIDENCE`, `VALIDATION_FAILED`) when observations fail quality gates.

---

## 🛠️ Technology Stack

- **Framework:** [React 19](https://react.dev/) + [Vite 8](https://vitejs.dev/) + [TypeScript 5](https://www.typescriptlang.org/)
- **Routing & SSR:** [TanStack Router](https://tanstack.com/router) & [TanStack Start](https://tanstack.com/start)
- **Styling & UI:** [TailwindCSS v4](https://tailwindcss.com/) + Custom HSL Glassmorphism Design System
- **State Engine:** Custom RxJS/Event-driven deterministic state machine (`src/lib/workflow/state-machine.ts`)
- **Icons & Visualization:** Lucide-React, Recharts, SVG Spatial Overlay Engine

---

## 🏁 Quick Start Guide

### Prerequisites
- Node.js 18+ or 20+ installed
- `npm` or `bun` package manager

### 1. Installation
Clone the repository and install dependencies:
```bash
git clone https://github.com/Eleutherian13/Final-SatQuery-.git
cd Final-SatQuery-/satquery-vision-hub
npm install
```

### 2. Run Development Server
Launch the interactive web application locally:
```bash
npm run dev
```
Open your browser and navigate to **[http://localhost:8080/](http://localhost:8080/)**.

### 3. Build for Production
Generate optimized production bundles:
```bash
npm run build
```

### 4. Run Test Suites
Execute automated state machine and spatial transformation unit tests:
```bash
npm run test
```

---

## 📂 Project Structure

```
satquery-vision-hub/
├── public/                       # Static web assets & favicon
├── src/
│   ├── assets/                   # High-resolution benchmark optical & SAR imagery
│   ├── components/               # UI components & architectural panels
│   │   ├── app-shell.tsx         # Main layout shell, header & scenario navigation
│   │   ├── geo-viewer.tsx        # 5-mode interactive spatial canvas engine
│   │   ├── evidence-contract-gate.tsx # Evidence contract modal
│   │   ├── verification-model.tsx# Proposer vs. Skeptic adversarial modal
│   │   ├── investigation-passport.tsx # Cryptographic SHA-256 audit ledger modal
│   │   ├── grounding-completeness.tsx # Spatial IOU & precision metrics drawer
│   │   ├── targeted-acquisition-panel.tsx # Active evidence sub-region tasker
│   │   ├── multimodal-panels.tsx # SAR VV/VH physics & spectral index drawer
│   │   ├── temporal-panels.tsx   # Bi-temporal change delta drawer & swipe controls
│   │   └── workflow-indicator.tsx# 15-state lifecycle progress bar
│   ├── lib/
│   │   ├── spatial-transform.ts  # Canonical pixel-to-screen coordinate math
│   │   ├── mock-data.ts          # 10 pre-staged analytical scenario graphs
│   │   └── workflow/
│   │       ├── state-machine.ts  # Core 15-state workflow machine logic
│   │       └── types.ts          # Workflow state & macro-stage definitions
│   └── routes/
│       ├── index.tsx             # Main workspace route (/)
│       ├── history.tsx           # Query investigation log route (/history)
│       └── registry.tsx          # Specialist model registry route (/registry)
├── SATQUERY_AI_COMPLETE_DEMO_MAP.md        # Master 19-column operational demo map
├── SATQUERY_MASTER_COMPLETENESS_AUDIT.md   # Forensic completeness & coverage audit
├── SATQUERY_AI_CURRENT_VERSION_OPERATING_GUIDE.md # User operating manual
└── SATQUERY_GEO_ASSET_TRUTH_REGISTRY.md    # Geospatial image provenance registry
```

---

## 🎯 Pre-Staged Analytical Scenarios (Demos)

SatQuery AI includes **10 built-in analytical scenarios** accessible via the top navigation dropdown:

1. **`golden`**: Optical + SAR Joint Inundation & Submerged Infrastructure Assessment.
2. **`demo-01`**: Urban Expansion & Building Footprint Grounding (Single Optical).
3. **`demo-02`**: Bi-Temporal Reservoir Water Level & Deforestation Delta.
4. **`demo-03`**: SAR All-Weather Dark Vessel Maritime Surveillance.
5. **`demo-04`**: Agricultural Crop Health & NDVI Spectral Index Extraction.
6. **`demo-05`**: **[Refusal Path]** Cloud Cover Obscuration (`ROUTING_BLOCKED`).
7. **`demo-06`**: **[Refusal Path]** Low Resolution SAR Ambiguity (`LOW_CONFIDENCE`).
8. **`demo-07`**: **[Refusal Path]** Corrupt GeoTIFF File Payload (`VALIDATION_FAILED`).
9. **`demo-08`**: Industrial Facility Expansion & Change Bounding Boxes.
10. **`demo-09`**: Wildfire Burn Scar & Vegetation Loss Analysis.

---

## 📑 Core Documentation Index

For complete operational, technical, and forensic details, refer to the included project documentation:

- **[Master Operational Demo Map (`SATQUERY_AI_COMPLETE_DEMO_MAP.md`)](SATQUERY_AI_COMPLETE_DEMO_MAP.md):** 19-column navigation matrix, step-by-step presentation scripts (3-min / 5-min), and evaluator safety boundaries ("Do Not Say" rules).
- **[Forensic Completeness Audit (`SATQUERY_MASTER_COMPLETENESS_AUDIT.md`)](SATQUERY_MASTER_COMPLETENESS_AUDIT.md):** Comprehensive item-by-item verification against PS-26167 and research dossiers.
- **[System Operating Guide (`SATQUERY_AI_CURRENT_VERSION_OPERATING_GUIDE.md`)](SATQUERY_AI_CURRENT_VERSION_OPERATING_GUIDE.md):** User manual for operating GeoViewer modes, technical panels, and audit exports.
- **[Geo Asset Truth Registry (`SATQUERY_GEO_ASSET_TRUTH_REGISTRY.md`)](SATQUERY_GEO_ASSET_TRUTH_REGISTRY.md):** Sensor, band, resolution, and coordinate system provenance audit for all visual assets.

---

## 📊 ISRO PS-26167 Compliance Summary

| PS-26167 Requirement | Implementation Surface | Operational Status |
| :--- | :--- | :--- |
| **Natural-Language Querying** | Main Workspace Query Bar | **FULLY OPERABLE** |
| **Single-Image VQA & Captioning** | Structured Answer Box & Claim Cards | **FULLY OPERABLE** |
| **Spatial Region Grounding** | SVG Bounding Box Engine & IOU Gauges | **FULLY OPERABLE** |
| **Bi-Temporal Change Analysis** | GeoViewer Swipe / Split Slider & Change Masks | **FULLY OPERABLE** |
| **Optical + SAR Joint Analysis** | Dual-Canvas Fused Mode & Consensus Matrix | **FULLY OPERABLE** |
| **Agentic Workflow Orchestration** | 15-State Lifecycle Progress Bar & Controls | **FULLY OPERABLE** |
| **Auditable Report Generation** | Export Panel & Downloadable JSON Reports | **FULLY OPERABLE** |

---

## 📜 License

This project is released under the **MIT License**. Created for Smart India Hackathon (SIH) Problem Statement PS-26167.
