# SatQuery Workspace

You are building the frontend application for an existing monorepo called satquery-ai.

IMPORTANT:

Do not redesign the repository.

Do not create a new project structure.

Do not invent a separate backend architecture.

The repository already has the following architecture:

satquery-ai/
├── apps/
│ ├── web/
│ └── api/
├── satquery/
│ ├── core/
│ ├── schemas/
│ ├── ingestion/
│ ├── preprocessing/
│ ├── agent/
│ ├── registry/
│ ├── tools/
│ ├── models/
│ ├── adaptation/
│ ├── evidence/
│ ├── verification/
│ ├── confidence/
│ ├── response/
│ ├── trace/
│ ├── reports/
│ └── storage/
├── datasets/
├── training/
├── evaluation/
├── tests/
├── configs/
├── contracts/
├── docs/
├── scripts/
├── notebooks/
├── reports/
└── artifacts/

Your responsibility is primarily to build and refine:

apps/web/

The frontend must map cleanly to the existing Python API and domain architecture.

============================================================

CORE PRODUCT
============================================================

SatQuery AI is an evidence-grounded multimodal remote-sensing analysis system.

It accepts natural-language questions about satellite imagery and routes those questions to specialist remote-sensing workflows.

The system supports:

Single-image analysis

Single-image VQA

Captioning / scene description

Region grounding

Bi-temporal change analysis

Change-based VQA

Optical-SAR multimodal analysis

Evidence visualization

Confidence estimation

Execution trace

Auditable reports

The frontend must make this architecture visible.

The product should NOT look like a generic chatbot.

The central conceptual pipeline is:

USER QUERY
↓
INPUT VALIDATION
↓
QUERY CLASSIFICATION
↓
WORKFLOW ROUTING
↓
SPECIALIST TOOL EXECUTION
↓
EVIDENCE GENERATION
↓
VERIFICATION
↓
CONFIDENCE
↓
ANSWER COMPOSITION
↓
EXECUTION TRACE
↓
REPORT

This is the product.

============================================================
2. EXISTING BACKEND ARCHITECTURE

The frontend must conceptually map to these backend modules.

INPUT:

satquery/ingestion/

loader.py

validator.py

metadata.py

modality.py

raster.py

manifest.py

compatibility.py

PREPROCESSING:

satquery/preprocessing/

optical/

sar/

spatial/

AGENT:

satquery/agent/

controller.py

planner.py

router.py

classifier.py

entity_extractor.py

constraints.py

policy.py

executor.py

state.py

recovery.py

TOOLS:

satquery/tools/

vqa/

captioning/

grounding/

change/

optical_sar/

EVIDENCE:

satquery/evidence/

VERIFICATION:

satquery/verification/

CONFIDENCE:

satquery/confidence/

RESPONSE:

satquery/response/

TRACE:

satquery/trace/

REPORT:

satquery/reports/

The frontend should expose these concepts through visual components but should NOT attempt to reimplement their logic.

============================================================
3. FRONTEND REPOSITORY MAPPING

Respect the existing frontend structure:

apps/web/
├── app/
│ ├── page.tsx
│ ├── workspace/
│ ├── upload/
│ ├── analysis/
│ ├── evidence/
│ └── reports/
│
├── components/
│ ├── upload/
│ ├── query/
│ ├── image-viewer/
│ ├── evidence/
│ ├── change-map/
│ ├── confidence/
│ ├── execution-trace/
│ └── reports/
│
└── lib/
├── api.ts
├── types.ts
└── mapping.ts

Do not scatter functionality randomly across the application.

Keep domain-specific components in their corresponding directories.

============================================================
4. TECH STACK

Use:

Next.js / React
TypeScript
Tailwind CSS
shadcn/ui
Lucide icons

Use client components only where interactivity requires them.

Prefer server components for static layout where appropriate.

Do not introduce unnecessary libraries.

For maps/image analysis, use a component abstraction so the implementation can later be replaced by a proper geospatial renderer.

============================================================
5. GLOBAL VISUAL LANGUAGE

Create a premium scientific/geospatial intelligence interface.

Overall visual character:

dark

precise

dense

technical

restrained

analytical

modern

credible

Think:

scientific mission-control interface
+
geospatial intelligence workstation
+
AI observability platform

NOT:

consumer chatbot
gaming dashboard
cyberpunk UI
generic SaaS dashboard

Use a very dark navy/black base.

Use cool gray typography.

Use restrained cyan/blue analytical accents.

Use:

green for validated/success

amber for warnings

red for failures

cyan for active analysis

Do not use excessive gradients.

Do not use excessive glow.

Do not use giant rounded cards.

Use thin borders and compact panels.

Use monospace text for:

request IDs
trace IDs
coordinates
model versions
tool versions
timestamps
runtime
technical metadata

============================================================
6. APPLICATION SHELL

Create a persistent application shell.

LEFT SIDEBAR

Brand:

SATQUERY
AI

Small status:
"REMOTE SENSING INTELLIGENCE"

Navigation:

WORKSPACE

New Analysis

Analysis History

ANALYSIS

Evidence

Execution Trace

Reports

SYSTEM

Models

Tools

Benchmarks

Settings

Bottom:

SYSTEM STATUS
● API ONLINE

INFERENCE
● READY

TOOLS
5 / 5 ONLINE

The sidebar should be compact.

Do not consume excessive screen width.

============================================================
7. TOP NAVIGATION

Top bar should display:

Current analysis name

Example:

ANALYSIS / TEMPORAL-0042

Right side:

API status
Inference status
GPU status
Settings
User menu

Show request/session ID where useful.

============================================================
8. HOME PAGE

apps/web/app/page.tsx

Create a sophisticated product entry screen.

Hero:

SATQUERY AI

"Ask the Earth. See the Evidence."

Description:

"An evidence-grounded vision-language workspace for multimodal satellite image analysis."

Primary CTA:

START ANALYSIS

Secondary:

LOAD DEMO

Below show:

SINGLE IMAGE
VQA · CAPTIONING · GROUNDING

BI-TEMPORAL
CHANGE DETECTION · CHANGE VQA

OPTICAL + SAR
MULTIMODAL FUSION

Then show:

WHY SATQUERY

Evidence-first
Capability-aware
Auditable execution

Also show a miniature system architecture:

QUERY
→ ROUTER
→ SPECIALIST TOOLS
→ EVIDENCE
→ VERIFICATION
→ ANSWER

============================================================
9. WORKSPACE

apps/web/app/workspace/

This is the flagship application.

The workspace should occupy almost the entire browser viewport.

Use a 3-column analytical layout:

LEFT:
Input + query

CENTER:
Image / map / comparison canvas

RIGHT:
Result + evidence + confidence

BOTTOM:
Execution trace drawer

Desktop-first.

============================================================
10. INPUT PANEL

Create:

components/upload/

Primary component:

ObservationUploader

Support:

GeoTIFF
TIFF
PNG
JPEG

The UI must distinguish between:

Single image

Bi-temporal pair

Optical-SAR pair

Do not assume the user's files are compatible.

After upload, display an ObservationCard.

Each observation displays:

filename
file size
dimensions
detected modality
bands
CRS
acquisition date
resolution
validation status

Example:

OBSERVATION 01

cartosat_before.tif

OPTICAL
8192 × 8192
4 BANDS
EPSG:4326
12 APR 2025

● VALIDATED

For paired imagery:

BEFORE
AFTER

or:

OPTICAL
SAR

Make image roles editable.

============================================================
11. VALIDATION EXPERIENCE

Validation is not a hidden backend operation.

Expose it visibly.

After upload:

INPUT VALIDATION

✓ File readable
✓ Raster structure valid
✓ Metadata extracted
✓ Modality detected
✓ CRS detected
✓ Pair compatibility checked

If registration is relevant:

REGISTRATION
✓ ACCEPTABLE

or:

⚠ REGISTRATION QUALITY LOW

"Temporal conclusions may be affected by spatial misalignment."

Use data returned by the API.

Never hardcode "validated" once real API integration exists.

============================================================
12. QUERY COMPONENT

components/query/

Create:

QueryComposer

Input:

"Ask a question about your imagery..."

Suggested prompts:

Describe this scene

Where is the water body?

What changed between these dates?

Has built-up area increased?

Compare optical and SAR evidence

Button:

ANALYZE

Also support:

Enter → submit

Shift+Enter → newline

============================================================
13. QUERY CLASSIFICATION

After submission, display the classification.

Example:

QUERY INTENT

BI-TEMPORAL CHANGE VQA

Confidence:
96%

Entities:
built-up area
increase

Required input:
2 temporal observations

Current input:
2 observations

STATUS:
COMPATIBLE

This maps conceptually to:

satquery/agent/classifier.py
satquery/agent/entity_extractor.py
satquery/agent/router.py

Do not expose internal reasoning.

Only expose structured classification results.

============================================================
14. WORKFLOW ROUTING

Show a compact route visualization.

Example:

INPUT
2 images
↓
VALIDATOR
Temporal pair
↓
ROUTER
Change VQA
↓
CHANGE DETECTOR
↓
CHANGE CLASSIFIER
↓
EVIDENCE VERIFIER
↓
ANSWER COMPOSER

This maps to:

agent/controller.py
agent/planner.py
agent/router.py
agent/executor.py

The frontend should visualize events returned from the API.

============================================================
15. IMAGE VIEWER

components/image-viewer/

Build a reusable:

ImageViewer

Capabilities:

zoom
pan
fit
reset
fullscreen
layer visibility
opacity
coordinates

Toolbar:

−
FIT
LAYERS
COMPARE
FULLSCREEN

Bottom:

coordinates
scale

Top:

observation name
modality
timestamp

For now the renderer may use normal image assets / canvas.

Architect it so it can later consume:

raster tiles

GeoTIFF-derived tiles

masks

bounding boxes

polygons

change maps

============================================================
16. EVIDENCE LAYER

components/evidence/

Create:

EvidencePanel

Evidence objects should correspond to:

satquery/evidence/

Possible types:

MASK
BOUNDING BOX
CROP
CHANGE REGION
OPTICAL EVIDENCE
SAR EVIDENCE
FUSED EVIDENCE

Example:

EVIDENCE #03

Type:
CHANGE MASK

Source:
change_detector v0.4.2

Confidence:
87%

Region:
Eastern sector

Clicking the evidence should:

select it

focus the map

show its geometry

show metadata

============================================================
17. EVIDENCE-FIRST UX

Spatial claims must be visually grounded.

For:

"Where is the water body?"

show a mask or bounding region.

For:

"What changed?"

show a change mask.

For:

"Which areas are built-up?"

show grounded regions.

If no reliable evidence exists:

NO SPATIAL EVIDENCE

"The system could not produce reliable spatial grounding for this claim."

Do NOT generate fake evidence.

============================================================
18. SINGLE IMAGE VQA

Workflow:

Single Image
→ Query
→ VQA Tool
→ Evidence
→ Answer

Example:

QUESTION

"What is the dominant land cover?"

RESULT

"Built-up and vegetated regions dominate the scene."

Confidence:

MEDIUM

Evidence:

Image crop
Candidate regions

Show:

Workflow:
single_image_vqa

Tool:
rs_vqa

Model:
remote-sensing VLM

Version:
0.1.0

============================================================
19. CAPTIONING

For:

"Describe this image."

Show:

SCENE DESCRIPTION

Then:

DOMINANT FEATURES

Built-up area
Vegetation
Water
Road network

Keep the answer evidence-oriented.

============================================================
20. GROUNDING

Workflow:

Query:

"Highlight the water body."

Show:

GROUNDING

Target:
Water body

Confidence:
91%

Evidence:
MASK #01

Controls:

Focus
Crop
Coordinates
Export

If grounding fails:

GROUNDING UNAVAILABLE

Do not fabricate a box.

============================================================
21. BI-TEMPORAL CHANGE MODE

components/change-map/

Create:

ChangeMapViewer

Three synchronized views:

BEFORE
AFTER
CHANGE

Controls:

SIDE BY SIDE
SWIPE
BLINK
CHANGE ONLY

Display:

BEFORE
12 APR 2025

AFTER
28 OCT 2025

REGISTRATION
GOOD

Change categories:

BUILT-UP EXPANSION
VEGETATION CHANGE
WATER CHANGE
INFRASTRUCTURE
UNKNOWN

Each change region:

REGION 01

Built-up expansion

Confidence:
89%

Click → zoom to region.

============================================================
22. CHANGE ANSWER

Right panel:

TEMPORAL RESULT

"Built-up area appears to have increased, primarily in the eastern portion of the scene."

Then:

3 detected change regions

Show thumbnails/crops.

Also show:

Temporal order:
VALID

Registration:
ACCEPTABLE

Evidence:
AVAILABLE

Limitation:

"Small objects below the validated resolution threshold may be missed."

============================================================
23. OPTICAL + SAR MODE

Create a dedicated multimodal viewer.

Tabs:

OPTICAL
SAR
FUSED

Show all three synchronously.

OPTICAL EVIDENCE

Spectral / visual context

SAR EVIDENCE

Structural / scattering response

FUSED INTERPRETATION

Joint model result

Example:

BUILT-UP CANDIDATE

Optical contribution:
HIGH

SAR contribution:
HIGH

Fusion confidence:
92%

Use visual contribution indicators.

Do not claim these percentages are scientific certainty.

============================================================
24. CONFIDENCE COMPONENT

components/confidence/

Create:

ConfidenceCard

Levels:

HIGH
MEDIUM
LOW
UNSUPPORTED

Display:

CONFIDENCE
HIGH

Supporting factors:

✓ Evidence completeness
✓ Registration quality
✓ Model agreement
✓ Input quality

Uncertainty:

△ Small-object sensitivity

The frontend should consume confidence information from:

satquery/confidence/

Do not calculate scientific confidence inside the frontend.

============================================================
25. ANSWER PANEL

Right-side result panel:

ANALYSIS RESULT

Confidence badge

Answer

Evidence

Supporting signals

Limitations

Workflow

Model

Timestamp

Allow modes:

CONCISE
DETAILED
EVIDENCE

============================================================
26. CAPABILITY-AWARE REFUSALS

This is a core feature.

If a user asks:

"What changed?"

with only one image:

show:

CANNOT EXECUTE

Required:
2 temporally corresponding observations

Received:
1 image

Action:

UPLOAD SECOND OBSERVATION

If user asks optical-SAR with:

OPTICAL + OPTICAL

show:

INCOMPATIBLE INPUT

Required:
Optical + SAR

Received:
Optical + Optical

Do not silently run another workflow.

This corresponds to:

agent/constraints.py
agent/policy.py
agent/recovery.py
verification/refusal.py

============================================================
27. LOW CONFIDENCE STATE

If confidence is low:

LOW CONFIDENCE

"The available evidence is insufficient for a high-confidence conclusion."

Show:

Evidence:
partial

Model agreement:
low

Image quality:
moderate

Action:

Review Evidence

Do not hide uncertainty.

============================================================
28. EXECUTION TRACE

components/execution-trace/

Create:

ExecutionTrace

The trace should represent observable system events.

Example:

01
INPUT VALIDATOR
✓ COMPLETE
1.2s

02
QUERY CLASSIFIER
✓ COMPLETE
0.4s

03
WORKFLOW ROUTER
✓ COMPLETE
0.2s

04
CHANGE DETECTOR
✓ COMPLETE
2.8s

05
CHANGE CLASSIFIER
✓ COMPLETE
1.4s

06
EVIDENCE VERIFIER
✓ COMPLETE
0.6s

07
ANSWER COMPOSER
✓ COMPLETE
0.5s

Expandable details:

tool
version
parameters
status
runtime
artifact IDs

Do NOT expose hidden chain-of-thought.

The trace is an execution audit, not private reasoning.

============================================================
29. TRACE DATA MODEL

Frontend TypeScript should support trace events corresponding to:

request_id
event_id
timestamp
stage
component
tool
model_version
status
runtime_ms
parameters
input_artifacts
output_artifacts
error
message

Map this to:

satquery/trace/

recorder.py

events.py

context.py

serializers.py

store.py

============================================================
30. REPORTS

apps/web/app/reports/

components/reports/

Create:

ReportViewer

Report content:

SATQUERY AI
ANALYSIS REPORT

Request ID

Timestamp

QUERY

INPUT OBSERVATIONS

METADATA

WORKFLOW

TOOLS

MODELS

RESULT

EVIDENCE

CONFIDENCE

LIMITATIONS

EXECUTION TRACE

Buttons:

DOWNLOAD MARKDOWN
DOWNLOAD PDF
EXPORT EVIDENCE

The backend report generator already exists conceptually under:

satquery/reports/

Frontend should consume report data rather than regenerate authoritative report content.

============================================================
31. ANALYSIS HISTORY

Create:

apps/web/app/analysis/

History page.

Columns:

TIME
QUERY
WORKFLOW
INPUT
CONFIDENCE
STATUS
RUNTIME

Example:

12:41
Has built-up area increased?
Bi-temporal Change
2 images
HIGH
COMPLETED
6.4s

Clicking opens the original analysis.

============================================================
32. EVIDENCE PAGE

apps/web/app/evidence/

Create a dedicated evidence explorer.

Left:

Evidence list

Center:

Large viewer

Right:

Evidence metadata

Filters:

All
Masks
Boxes
Change
Optical
SAR
Fused

Evidence details:

ID
type
source tool
model
confidence
geometry
coordinates
quality
created at

============================================================
33. API LAYER

apps/web/lib/api.ts

Create a centralized API client.

Do not put fetch calls throughout components.

Conceptual methods:

uploadObservation()
validateObservation()
createAnalysis()
getAnalysis()
getAnalysisTrace()
getEvidence()
generateReport()
getAnalysisHistory()
getModels()
getTools()

Use a configurable base URL.

Environment variable:

NEXT_PUBLIC_API_URL

Do not hardcode localhost in production components.

============================================================
34. API ENDPOINT CONTRACT

Design the frontend around these conceptual endpoints:

POST /health

POST /uploads

POST /analysis

GET /analysis/{id}

GET /analysis/{id}/trace

GET /analysis/{id}/evidence

POST /analysis/{id}/report

GET /analysis/history

GET /models

GET /tools

If the exact backend endpoint differs, keep the frontend API abstraction flexible.

Do not tightly couple UI components to URL strings.

============================================================
35. FRONTEND TYPES

apps/web/lib/types.ts

Create explicit TypeScript types.

At minimum:

Observation

RasterMetadata

ValidationResult

QueryIntent

QueryEntity

Workflow

AnalysisRequest

AnalysisResult

EvidenceObject

Confidence

ToolExecution

TraceEvent

Report

ModelInfo

ToolInfo

AnalysisSession

Use discriminated unions for workflow/input types where useful.

Example conceptual workflow types:

"single_image_vqa"

"captioning"

"grounding"

"bi_temporal_change"

"change_vqa"

"optical_sar"

============================================================
36. MAPPING LAYER

apps/web/lib/mapping.ts

Use this file to transform backend schemas into UI-friendly structures.

Examples:

backend confidence object
→ ConfidenceCard props

backend evidence schema
→ EvidenceObject

backend trace events
→ ExecutionTrace nodes

backend tool metadata
→ ToolRegistry rows

Do not duplicate mapping logic across components.

============================================================
37. MOCK MODE

The application MUST work before the Python inference backend is fully connected.

Create a development/demo mode.

Use:

NEXT_PUBLIC_DEMO_MODE=true

When enabled, the UI should use deterministic mock services.

Create realistic demo scenarios:

DEMO 01
Single-image VQA

DEMO 02
Grounding

DEMO 03
Bi-temporal change

DEMO 04
Optical-SAR fusion

DEMO 05
Invalid input

DEMO 06
Low confidence

The UI must clearly indicate:

DEMO MODE

Do not pretend demo results are real inference.

============================================================
38. DEMO 03 — BI-TEMPORAL

Provide a complete preloaded scenario.

Inputs:

BEFORE_OPTICAL.tif
AFTER_OPTICAL.tif

Query:

"Has the built-up area increased between these two dates, and where?"

Route:

bi_temporal_change_vqa

Trace:

Validator
→ Temporal Compatibility
→ Registration
→ Change Detector
→ Change Classifier
→ Evidence Verifier
→ Answer Composer

Result:

"Built-up area appears to have increased, concentrated primarily in the eastern and southeastern portions of the scene."

Evidence:
3 regions

Confidence:
HIGH

Limitation:
small objects may be missed.

============================================================
39. DEMO 04 — OPTICAL + SAR

Inputs:

OPTICAL.tif
SAR.tif

Query:

"Use the optical and SAR images together to identify built-up and water-covered regions."

Route:

optical_sar

Trace:

Validator
→ Optical Preprocessor
→ SAR Preprocessor
→ Optical Encoder
→ SAR Encoder
→ Fusion
→ Evidence
→ Verification
→ Answer

Show:

OPTICAL
SAR
FUSED

and modality contribution.

============================================================
40. DEMO 05 — FAILURE

Input:

one optical image

Query:

"What changed?"

Result:

CANNOT EXECUTE

Required:
bi-temporal pair

Current:
single image

Action:

Upload second observation.

The execution trace must show:

Input Validator
✓

Query Classifier
✓

Compatibility Check
✕

Specialist tools
NOT EXECUTED

This is important.

The UI must demonstrate that invalid workflows are prevented before inference.

============================================================
41. MODEL REGISTRY

Although the backend registry exists under:

satquery/registry/
satquery/models/

Create a frontend technical registry page.

Show:

MODEL

ROLE

VERSION

STATUS

INPUT

OUTPUT

Example:

Remote-Sensing VLM

VQA
Captioning
Grounding

v0.1.0

READY

Another:

Bi-Temporal Change Detector

Change Detection

v0.4.2

READY

Another:

Optical-SAR Fusion

Multimodal Analysis

v0.2.0

READY

============================================================
42. TOOL REGISTRY

Show tools:

metadata_validator

query_router

rs_vqa

captioning

grounding

change_detector

change_vqa

optical_sar_fusion

evidence_verifier

answer_composer

report_generator

Each tool should show:

accepted inputs
required metadata
outputs
version
status

This reflects:

satquery/registry/tools.py

and:

satquery/tools/base/contract.py

============================================================
43. BENCHMARK UI

Create a technical benchmark page.

Show separate metrics:

VQA

Captioning

Grounding

Change Detection

Change VQA

Optical-SAR

Agent

Calibration

Do not imply these are the official ISRO scoring weights.

Display:

"Development metrics. Official evaluation criteria may differ."

Also show agent-specific metrics:

Tool-selection accuracy
Invalid tool-call rate
Execution success
Evidence consistency

============================================================
44. SETTINGS

Settings:

API URL

Demo Mode

Inference Environment

Model Profile

Confidence Threshold

Default Evidence Opacity

Coordinate Display

Report Preferences

Theme

Compact Mode

Do not allow frontend settings to override backend safety policies.

============================================================
45. RESPONSIVE BEHAVIOR

Desktop is primary.

At ≥1440px:

3-column analytical workspace.

At 1280px:

slightly narrower right panel.

At tablet:

left input panel becomes drawer.

right result panel becomes drawer.

At mobile:

stack:

Query
Input
Image
Result
Evidence
Trace

Do not attempt to retain the desktop three-column layout on mobile.

============================================================
46. ACCESSIBILITY

Implement:

keyboard navigation

visible focus states

semantic buttons

ARIA labels

tooltips

high contrast

do not rely exclusively on color

Keyboard shortcuts:

A
Analyze

E
Evidence

T
Trace

F
Fullscreen

Esc
Close panel

============================================================
47. LOADING STATES

Do not use generic:

"Loading..."

Instead show the analytical state.

Example:

ANALYSIS RUNNING

01 INPUT VALIDATION ✓

02 QUERY CLASSIFICATION ✓

03 WORKFLOW ROUTING ✓

04 SPECIALIST ANALYSIS ●

05 EVIDENCE VERIFICATION ○

06 ANSWER COMPOSITION ○

This creates the perception of an observable AI system.

============================================================
48. ERROR HANDLING

Never use:

"Oops!"

Instead:

ANALYSIS FAILED

Reason:
Unsupported raster structure.

File:
example.tif

Recommended action:
Upload a valid GeoTIFF/TIFF.

Another:

BACKEND UNAVAILABLE

"SatQuery API could not be reached."

Buttons:

Retry
Demo Mode

============================================================
49. DATA TRUST PRINCIPLES

The UI must visually distinguish:

OBSERVED EVIDENCE

MODEL OUTPUT

INTERPRETATION

UNCERTAINTY

LIMITATION

For example:

OBSERVED:
Change mask detected.

INTERPRETATION:
Built-up expansion likely.

LIMITATION:
Small structures may be missed.

Do not present inference as ground truth.

============================================================
50. GEO-SPATIAL METADATA

When available, display:

CRS

resolution

dimensions

band count

nodata

acquisition date

sensor/modality

coordinates

registration quality

Do not invent missing metadata.

If unavailable:

NOT PROVIDED

rather than fabricated values.

============================================================
51. IMAGE / EVIDENCE INTERACTION

Clicking an evidence object must update:

map focus

evidence panel

confidence panel

metadata

corresponding trace event if available

For example:

User clicks:

REGION 02

The map zooms to Region 02.

Right panel changes to:

REGION 02

Vegetation loss

Confidence:
73%

Source:
Change Detector

Then user can:

View crop

View before

View after

View change

============================================================
52. REPORT WORKFLOW

From any completed analysis:

GENERATE REPORT

Then show report generation progress:

Collecting metadata
Collecting evidence
Collecting trace
Building report
Ready

Report preview.

Do not regenerate or mutate model results in the frontend.

============================================================
53. SECURITY

Do not expose:

API secrets
model credentials
private backend configuration

Never place API keys in NEXT_PUBLIC_ environment variables.

Frontend should communicate with the backend through configured endpoints.

============================================================
54. PERFORMANCE

Avoid loading huge satellite rasters directly.

Use:

thumbnails

lazy loading

canvas

tile abstractions

object URLs

progressive loading

The UI must remain responsive while inference executes.

============================================================
55. COMPONENT ORGANIZATION

Respect this structure:

components/upload/
ObservationUploader
ObservationCard
ValidationStatus

components/query/
QueryComposer
QuerySuggestions
QueryIntentBadge

components/image-viewer/
ImageViewer
ViewerToolbar
LayerControl
CoordinateReadout

components/evidence/
EvidencePanel
EvidenceCard
EvidenceDetails
EvidenceLayer

components/change-map/
ChangeMapViewer
TemporalComparison
ChangeRegionCard

components/confidence/
ConfidenceCard
ConfidenceFactors

components/execution-trace/
ExecutionTrace
TraceEvent
TraceDetails

components/reports/
ReportViewer
ReportMetadata
ReportActions

Do not create a giant 2000-line page component.

============================================================
56. STATE MANAGEMENT

Keep analysis state centralized.

Conceptual state:

currentSession

observations

validation

query

queryIntent

workflow

analysisStatus

result

evidence

confidence

trace

report

Use React context or a lightweight state mechanism if required.

Do not duplicate the same state independently in multiple components.

============================================================
57. ANALYSIS STATE MACHINE

Model the frontend analysis lifecycle explicitly:

IDLE

UPLOADING

VALIDATING

READY

CLASSIFYING

ROUTING

EXECUTING

VERIFYING

COMPOSING

COMPLETED

REFUSED

FAILED

Do not use arbitrary boolean combinations such as:

isLoading
isDone
isError
isValid
isExecuting

that can produce contradictory states.

============================================================
58. ROUTING TYPES

The frontend should understand these workflow categories:

SINGLE_IMAGE_VQA

CAPTIONING

GROUNDING

BI_TEMPORAL_CHANGE

CHANGE_VQA

OPTICAL_SAR

UNSUPPORTED

Each workflow should map to an appropriate visual mode.

============================================================
59. VISUAL MODE MAPPING

SINGLE_IMAGE_VQA
→ single ImageViewer

CAPTIONING
→ image + description

GROUNDING
→ image + evidence overlay

BI_TEMPORAL_CHANGE
→ Before / After / Change

CHANGE_VQA
→ Before / After / Change + answer

OPTICAL_SAR
→ Optical / SAR / Fused

UNSUPPORTED
→ validation/refusal panel

============================================================
60. JURY DEMONSTRATION MODE

Create a visible:

DEMO SCENARIOS

menu.

The demonstration should allow the user to perform the entire sequence quickly.

Scenario 1:

Upload single image
→ ask scene question
→ VQA
→ answer

Scenario 2:

Ask:
"Highlight the water body."
→ grounding
→ mask

Scenario 3:

Load temporal pair
→ ask:
"What changed?"
→ change map

Scenario 4:

Load optical + SAR
→ ask:
"Identify built-up and water-covered regions."
→ fused result

Scenario 5:

Give invalid input
→ refusal

Scenario 6:

Show execution trace
→ show tools/models/evidence

Scenario 7:

Generate report

The complete demonstration should take only a few minutes.

============================================================
61. IMPORTANT: DO NOT FAKE BACKEND COMPLETENESS

When running in demo mode, explicitly label:

DEMO DATA

DEMO INFERENCE

When running against the actual API:

LIVE API

Do not present mock outputs as actual model inference.

============================================================
62. README / DEVELOPMENT INFORMATION

Add concise frontend documentation explaining:

How to run the web application.

Required environment variables.

How to enable demo mode.

How to configure API URL.

How to connect the frontend to:

apps/api

Do not rewrite the entire repository README.

Only add frontend-specific documentation where appropriate.

============================================================
63. FINAL PRODUCT EXPERIENCE

When a user opens SatQuery AI, the experience should communicate:

"I have satellite observations."

"I can ask a natural-language question."

"SatQuery validates whether my request is possible."

"It identifies the task."

"It chooses a specialist workflow."

"It generates evidence."

"It verifies that evidence."

"It produces a confidence-aware answer."

"I can inspect what tools were executed."

"I can inspect the evidence."

"I can export an auditable report."

This should be obvious from the interface without reading documentation.

============================================================
64. FINAL QUALITY BAR

The application must feel like:

A real remote-sensing intelligence workstation.

Not a mockup.

Not a chatbot skin.

Not a generic dashboard.

Not a collection of disconnected pages.

The Analysis Workspace is the centerpiece.

The strongest visual elements should be:

Satellite imagery

Query

Evidence

Answer

Confidence

Workflow

Execution trace

Maintain visual consistency across all screens.

Use real interaction states.

Use realistic demo data.

Make all navigation functional.

Make all major buttons functional.

Avoid placeholder lorem ipsum.

Avoid generic stock imagery.

Avoid unnecessary decorative UI.

Do not invent scientific claims.

Do not expose hidden model reasoning.

Do not fabricate evidence.

Do not silently execute an incompatible workflow.

Build the frontend so that the existing Python architecture can be connected progressively without restructuring the UI.

============================================================
65. IMPLEMENTATION ORDER

Implement in this order:

PHASE 1

App shell
Landing page
Workspace
Uploader
Query composer
Mock analysis lifecycle

PHASE 2

Image viewer
Evidence overlays
Confidence
Answer panel

PHASE 3

Bi-temporal comparison
Change map
Optical-SAR viewer

PHASE 4

Execution trace
Analysis history
Reports

PHASE 5

Model registry
Tool registry
Benchmark dashboard
Settings

PHASE 6

API integration abstraction
Error handling
Loading states
Responsive behavior
Accessibility
Final visual polish

Do not attempt to implement every backend capability in the frontend.

The frontend's job is to provide a coherent, high-quality interface over the existing SatQuery AI architecture.

Start by inspecting the existing repository structure and existing files.

Reuse existing components, types, API contracts, and naming conventions where they already exist.

Do not overwrite working backend code.

Do not restructure the monorepo.

Build the frontend incrementally while preserving compatibility with the existing architecture.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://satquery-vision-hub.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/da055c30-019f-4fd0-b256-c6ef99cfaa05).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
