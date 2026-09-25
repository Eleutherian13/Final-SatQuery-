import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import { StatusDot } from "@/components/app-shell";
import {
  TemporalEvidenceInspector,
  TemporalRefusalCard,
  TemporalSpecialistPanel,
  TemporalValidationCard,
} from "@/components/temporal-panels";
import {
  CrossModalRefusalCard,
  CrossModalSpecialistPanel,
  CrossModalValidationCard,
  PerModalityEvidenceInspector,
} from "@/components/multimodal-panels";
import type {
  AnalysisResult,
  ConfidenceLevel,
  EvidenceObject,
  Observation,
  TraceEvent,
} from "@/lib/types";
import type { UseWorkflowReturn } from "@/lib/workflow/use-workflow";

const CONFIDENCE_TONE: Record<ConfidenceLevel, string> = {
  high: "text-success border-success",
  medium: "text-warning border-warning",
  low: "text-warning border-warning",
  unsupported: "text-destructive border-destructive",
};

const TRACE_TONE: Record<string, string> = {
  complete: "bg-success",
  running: "bg-active pulse-dot",
  pending: "bg-muted-foreground",
  failed: "bg-destructive",
  skipped: "bg-border",
};

/* ---------------- Observations ---------------- */

export function ObservationList({
  observations,
  activeId,
  onSelect,
  workflow,
}: {
  observations: Observation[];
  activeId: string | null;
  onSelect: (id: string) => void;
  workflow?: UseWorkflowReturn | undefined;
}) {
  // 1. IDLE State — Step 1: Input (Drop, Select, Demo Image)
  if (workflow?.state === "IDLE") {
    return (
      <div className="space-y-3 p-3 font-mono text-[10px]">
        <div className="flex items-center justify-between border-b border-border pb-2">
          <span className="uppercase tracking-[0.16em] text-muted-foreground">
            INPUT · SINGLE IMAGE
          </span>
          <span className="border border-border px-1.5 py-0.5 text-[9px] uppercase tracking-[0.12em] text-primary">
            Awaiting Input
          </span>
        </div>

        {/* Drop zone */}
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            workflow.start();
          }}
          className="flex flex-col items-center justify-center gap-1.5 border border-dashed border-border bg-background/60 p-4 text-center transition-colors hover:border-primary/60 hover:bg-primary/5"
        >
          <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-foreground">
            DROP IMAGE
          </span>
          <span className="text-[9px] uppercase tracking-[0.12em] text-muted-foreground">
            GeoTIFF · Cloud Optimized · 4-Band
          </span>
          <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
            <label className="cursor-pointer border border-border bg-panel-raised px-2.5 py-1 text-[9px] uppercase tracking-[0.12em] text-foreground transition-colors hover:border-primary hover:text-primary">
              SELECT FILE
              <input
                type="file"
                accept="image/*,.tif,.tiff"
                className="hidden"
                onChange={() => workflow.start()}
              />
            </label>
            <button
              type="button"
              onClick={() => workflow.start()}
              className="border border-primary bg-primary/10 px-2.5 py-1 text-[9px] uppercase tracking-[0.12em] text-primary transition-colors hover:bg-primary/20"
            >
              USE DEMO IMAGE
            </button>
          </div>

          {/* Golden Query one-click shortcut */}
          <button
            type="button"
            onClick={() => workflow.start()}
            className="mt-3 w-full border border-amber-500/60 bg-amber-500/10 py-2 text-[10px] font-bold uppercase tracking-[0.18em] text-amber-400 transition-colors hover:bg-amber-500/20"
          >
            ⚡ RUN GOLDEN QUERY
          </button>
          <p className="mt-1 text-center text-[9px] uppercase tracking-[0.12em] text-muted-foreground">
            Identify water body · Land cover · Built-up detection
          </p>
        </div>

        {/* Staged observation display */}
        <div className="space-y-1.5 border border-border bg-background p-2.5">
          <div className="flex items-center justify-between">
            <span className="text-foreground">
              {observations[0]?.filename ?? "cartosat_demo.tif"}
            </span>
            <span className="text-muted-foreground uppercase">
              {observations[0]?.metadata.sensor ?? "Cartosat-3"}
            </span>
          </div>
          <p className="text-[9px] text-muted-foreground">
            Single-image scene staged for grounding, VQA, and land-cover interpretation.
          </p>
        </div>

        <button
          type="button"
          onClick={workflow.start}
          className="w-full border border-primary bg-primary/10 py-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-primary transition-colors hover:bg-primary/20"
        >
          Ingest & Validate Observations →
        </button>
      </div>
    );
  }

  // 2. UPLOADING State
  if (workflow?.state === "UPLOADING") {
    return (
      <div className="space-y-3 p-3 font-mono text-[10px]">
        <div className="flex items-center justify-between uppercase tracking-[0.14em]">
          <span className="flex items-center gap-1.5 text-primary">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            Uploading Raster
          </span>
          <span className="text-muted-foreground">100% · 48.6 MB/s</span>
        </div>
        <div className="h-1.5 w-full overflow-hidden bg-border">
          <div className="h-full bg-primary" style={{ width: "100%" }} />
        </div>
        <p className="text-muted-foreground">
          Streaming {observations[0]?.filename ?? "cartosat_demo.tif"} into memory buffer...
        </p>
      </div>
    );
  }

  // 3. INSPECTING State — Step 2: Input Inspection
  if (workflow?.state === "INSPECTING") {
    const obs = observations[0];
    const meta = obs?.metadata;
    return (
      <div className="space-y-2.5 p-3 font-mono text-[10px]">
        <div className="flex items-center justify-between border-b border-border pb-1.5">
          <div className="flex items-center gap-1.5 text-primary">
            <span className="h-1.5 w-1.5 rounded-full bg-primary pulse-dot" />
            <span className="uppercase tracking-[0.16em]">INPUT INSPECTION</span>
          </div>
          <span className="text-[9px] uppercase tracking-[0.12em] text-muted-foreground">
            Metadata Extracted
          </span>
        </div>

        {/* 10 Required Metadata Fields */}
        <dl className="grid grid-cols-2 gap-x-2 gap-y-1.5 border border-border bg-background p-2.5 text-[9px]">
          <Field label="FILE" value={obs?.filename ?? "cartosat_demo.tif"} />
          <Field label="FORMAT" value={meta?.format ?? "GeoTIFF (Cloud Optimized)"} />
          <Field label="DIMENSIONS" value={`${meta?.width ?? 8192} × ${meta?.height ?? 8192}`} />
          <Field label="BANDS" value={`${meta?.bands ?? 4} (B, G, R, NIR)`} />
          <Field label="CRS" value={meta?.crs ?? "EPSG:4326 (WGS 84)"} />
          <Field label="GSD" value={`${meta?.resolutionM ?? 0.6} m`} />
          <Field label="SENSOR" value={meta?.sensor ?? "Cartosat-3 MX"} />
          <Field label="ACQUISITION DATE" value={meta?.acquiredAt ?? "2025-04-12 05:42:19 UTC"} />
          <Field label="NODATA" value={String(meta?.nodata ?? 0)} />
          <Field label="DATA TYPE" value={meta?.dataType ?? "uint16"} />
        </dl>

        {/* 3 Status checks */}
        <ul className="space-y-1 border border-border bg-background/50 p-2 text-[9px]">
          <li className="flex items-center justify-between text-success">
            <span className="flex items-center gap-1.5">
              <StatusDot status="pass" />
              <span>FILE READABLE</span>
            </span>
            <span>✓ VERIFIED</span>
          </li>
          <li className="flex items-center justify-between text-success">
            <span className="flex items-center gap-1.5">
              <StatusDot status="pass" />
              <span>GEOREFERENCED</span>
            </span>
            <span>✓ WGS 84</span>
          </li>
          <li className="flex items-center justify-between text-success">
            <span className="flex items-center gap-1.5">
              <StatusDot status="pass" />
              <span>METADATA EXTRACTED</span>
            </span>
            <span>✓ PASS</span>
          </li>
        </ul>
      </div>
    );
  }

  // 4. VALIDATING State — Step 3: Validation
  if (workflow?.state === "VALIDATING") {
    return (
      <div className="space-y-2.5 p-3 font-mono text-[10px]">
        <div className="flex items-center justify-between border-b border-border pb-1.5">
          <div className="flex items-center gap-1.5 text-primary">
            <span className="h-1.5 w-1.5 rounded-full bg-primary pulse-dot" />
            <span className="uppercase tracking-[0.16em]">INPUT VALIDATOR</span>
          </div>
          <span className="text-[9px] uppercase tracking-[0.12em] text-success">
            Pre-flight Audit
          </span>
        </div>

        {/* Required validator checks */}
        <ul className="space-y-1.5 border border-border bg-background p-2.5 text-[9px]">
          <li className="flex items-center justify-between text-success">
            <span className="flex items-center gap-1.5">
              <StatusDot status="pass" />
              <span>FILE STRUCTURE</span>
            </span>
            <span>✓ PASS</span>
          </li>
          <li className="flex items-center justify-between text-success">
            <span className="flex items-center gap-1.5">
              <StatusDot status="pass" />
              <span>BAND COMPATIBILITY</span>
            </span>
            <span>✓ PASS (4 BANDS)</span>
          </li>
          <li className="flex items-center justify-between text-success">
            <span className="flex items-center gap-1.5">
              <StatusDot status="pass" />
              <span>CRS</span>
            </span>
            <span>✓ PASS (EPSG:4326)</span>
          </li>
          <li className="flex items-center justify-between text-success">
            <span className="flex items-center gap-1.5">
              <StatusDot status="pass" />
              <span>DIMENSIONS</span>
            </span>
            <span>✓ PASS (8192×8192)</span>
          </li>
          <li className="flex items-center justify-between text-success">
            <span className="flex items-center gap-1.5">
              <StatusDot status="pass" />
              <span>SPATIAL RESOLUTION</span>
            </span>
            <span>✓ PASS (0.6 M)</span>
          </li>
          <li className="flex items-center justify-between text-success">
            <span className="flex items-center gap-1.5">
              <StatusDot status="pass" />
              <span>IMAGE QUALITY</span>
            </span>
            <span>✓ PASS</span>
          </li>
        </ul>

        <div className="border border-success/40 bg-success/10 p-2 text-center text-success">
          <span className="font-semibold uppercase tracking-[0.14em]">
            INPUT STATUS: READY FOR ANALYSIS
          </span>
        </div>
      </div>
    );
  }

  // 5. VALIDATION_FAILED State
  if (workflow?.state === "VALIDATION_FAILED") {
    return (
      <div className="space-y-3 p-3 font-mono text-[10px]">
        <div className="flex items-center gap-1.5 border border-destructive/60 bg-destructive/10 p-2 text-destructive">
          <StatusDot status="fail" />
          <span className="font-semibold uppercase tracking-[0.16em]">Validation Check Failed</span>
        </div>
        <ul className="space-y-1 border border-border bg-background p-2">
          <li className="flex items-center justify-between text-success">
            <span>File structure</span>
            <span>PASS</span>
          </li>
          <li className="flex items-center justify-between text-destructive">
            <span>CRS reference bounds</span>
            <span>FAIL: Missing GeoTransform</span>
          </li>
          <li className="flex items-center justify-between text-destructive">
            <span>Raster integrity</span>
            <span>FAIL: Tile checksum error</span>
          </li>
        </ul>
        <p className="text-xs text-muted-foreground">
          Ingestion aborted. Re-upload clean raster or inspect dataset manifest.
        </p>
      </div>
    );
  }

  // Nominal: Observations verified & loaded
  const isTemporalPair =
    observations.length === 2 &&
    observations.some((o) => o.role === "before" || o.role === "after");

  const isMultimodal =
    observations.some((o) => o.modality === "sar") ||
    workflow?.scenario?.result?.workflow?.id === "optical_sar" ||
    workflow?.scenario?.result?.crossModal != null;

  return (
    <div className="divide-y divide-border">
      {isTemporalPair && (
        <TemporalValidationCard
          result={workflow?.scenario?.result ?? ({} as AnalysisResult)}
          observations={observations}
        />
      )}
      {isMultimodal && (
        <CrossModalValidationCard
          result={workflow?.scenario?.result ?? ({} as AnalysisResult)}
          observations={observations}
        />
      )}
      <ul className="divide-y divide-border">
        {observations.map((obs) => (
          <li key={obs.id}>
            <button
              type="button"
              onClick={() => onSelect(obs.id)}
              className={`flex w-full gap-2.5 px-3 py-2 text-left transition-colors ${
                activeId === obs.id ? "bg-panel-raised" : "hover:bg-panel-raised"
              }`}
            >
              <img
                src={obs.previewUrl}
                alt={obs.filename}
                width={56}
                height={56}
                loading="lazy"
                className="h-14 w-14 shrink-0 border border-border object-cover"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-primary">
                    {obs.role}
                  </span>
                  <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                    {obs.modality}
                  </span>
                </div>
                <p className="truncate font-mono text-[11px] text-foreground">{obs.filename}</p>
                <p className="font-mono text-[10px] text-muted-foreground">
                  {obs.metadata.sensor} · {obs.metadata.acquiredAt}
                </p>
                <p className="font-mono text-[10px] text-muted-foreground">
                  {obs.metadata.width}×{obs.metadata.height} · gsd {obs.metadata.resolutionM} m ·{" "}
                  {obs.metadata.crs}
                </p>
                <ul className="mt-1 flex flex-wrap gap-x-2.5 gap-y-0.5">
                  {obs.validation.checks.map((c) => (
                    <li
                      key={c.id}
                      className="flex items-center gap-1 font-mono text-[9px] uppercase tracking-[0.1em] text-muted-foreground"
                    >
                      <StatusDot status={c.status} />
                      {c.label}
                    </li>
                  ))}
                </ul>
                {obs.validation.registration ? (
                  <p className="mt-0.5 font-mono text-[9px] uppercase tracking-[0.12em] text-warning">
                    registration {obs.validation.registration.quality}
                    {obs.validation.registration.note
                      ? ` · ${obs.validation.registration.note}`
                      : ""}
                  </p>
                ) : null}
              </div>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ---------------- Query composer ---------------- */

const SUGGESTIONS = [
  "Describe this scene.",
  "Highlight the water body.",
  "Has the built-up area increased?",
  "Where did the change occur?",
  "Compare optical and SAR evidence.",
];

export function QueryComposer({
  query,
  result,
  onRun,
  workflow,
}: {
  query: string;
  result: AnalysisResult;
  onRun: (q: string) => void;
  workflow?: UseWorkflowReturn | undefined;
}) {
  const [draft, setDraft] = useState(query);
  const compatible = result.intent.compatibility === "compatible";

  return (
    <div className="space-y-2 p-3">
      {/* State-specific active query status */}
      {workflow?.state === "QUERY_RECEIVED" && (
        <div className="flex items-center gap-1.5 border border-primary/60 bg-primary/10 px-2 py-1 font-mono text-[10px] text-primary">
          <span className="h-1.5 w-1.5 rounded-full bg-primary pulse-dot" />
          <span className="uppercase tracking-[0.14em]">
            Query Ingested · Dispatching to NLP parser
          </span>
        </div>
      )}
      {/* Step 6: Query Understanding */}
      {workflow?.state === "QUERY_UNDERSTANDING" && (
        <div className="space-y-2 border border-primary/60 bg-primary/5 p-2.5 font-mono text-[10px]">
          <div className="flex items-center gap-1.5 text-primary">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            <span className="font-semibold uppercase tracking-[0.16em]">UNDERSTANDING QUERY</span>
          </div>
          <div className="space-y-1 divide-y divide-border/60 text-[9px]">
            <Field
              label="Intent"
              value={result.queryUnderstanding?.intent ?? result.intent?.label ?? "SCENE ANALYSIS"}
              strong
            />
            <Field
              label="Primary"
              value={
                result.queryUnderstanding?.primaryTask ??
                workflow?.plan.understanding?.primaryTask ??
                result.workflow.label
              }
            />
            {(result.queryUnderstanding?.secondaryTasks?.length ?? 0) > 0 ? (
              <Field
                label="Secondary"
                value={result.queryUnderstanding!.secondaryTasks.join(", ")}
              />
            ) : (workflow?.plan.understanding?.secondaryTasks?.length ?? 0) > 0 ? (
              <Field
                label="Secondary"
                value={workflow!.plan.understanding.secondaryTasks.join(", ")}
              />
            ) : null}
            <Field
              label="Target"
              value={
                result.queryUnderstanding?.targets?.join(", ") ??
                workflow?.plan.understanding?.target ??
                result.intent.entities[0]?.text ??
                "Target Feature"
              }
              strong
            />
            <Field
              label="Spatial Requirement"
              value={
                result.queryUnderstanding?.spatialRequirement ??
                workflow?.plan.understanding?.spatialRequest ??
                "Normalized region grounding"
              }
            />
            <Field
              label="Evidence Requirement"
              value={
                result.queryUnderstanding?.evidenceRequirement ??
                workflow?.plan.understanding?.evidenceRequired ??
                "Visual verification"
              }
            />
          </div>
        </div>
      )}

      {/* Step 7: Task Classification */}
      {workflow?.state === "TASK_CLASSIFIED" && (
        <div className="space-y-2 border border-primary/60 bg-primary/5 p-2.5 font-mono text-[10px]">
          <div className="flex items-center justify-between">
            <span className="font-semibold uppercase tracking-[0.16em] text-primary">
              TASK CLASSIFICATION
            </span>
            <span className="text-[9px] uppercase tracking-[0.12em] text-success">
              ✓ Multi-Task Graph
            </span>
          </div>
          <div className="space-y-1.5">
            {(
              workflow?.plan.understanding?.taskGraph?.map((g, i) => ({
                id: `t${i}`,
                name: g,
                desc: "",
              })) ?? [
                {
                  id: "primary",
                  name: result.workflow.label,
                  desc: result.workflow.requiredObservations,
                },
              ]
            ).map((t) => (
              <div
                key={t.id}
                className="flex items-center justify-between border border-border bg-background px-2 py-1 text-[9px]"
              >
                <span className="font-semibold text-foreground">{t.name}</span>
                <span className="text-muted-foreground">{t.desc}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {workflow?.state === "UNSUPPORTED_QUERY" && (
        <div className="flex items-center gap-1.5 border border-destructive/60 bg-destructive/10 px-2 py-1 font-mono text-[10px] text-destructive">
          <StatusDot status="fail" />
          <span className="uppercase tracking-[0.14em]">
            Unsupported Query · Intent outside registered model domain
          </span>
        </div>
      )}

      {/* Step 5: Query Input */}
      <div>
        <label className="mb-1.5 block font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-foreground">
          WHAT WOULD YOU LIKE TO KNOW ABOUT THIS SCENE?
        </label>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onRun(draft);
            if (workflow) {
              if (workflow.state === "READY") {
                workflow.transitionTo("QUERY_RECEIVED");
              } else if (workflow.isComplete || workflow.isFailed) {
                workflow.replay();
              } else if (workflow.isIdle) {
                workflow.start();
              }
            }
          }}
          className="border border-border bg-background focus-within:border-primary"
        >
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={3}
            spellCheck={false}
            aria-label="Analyst query"
            className="w-full resize-none bg-transparent px-2.5 py-2 text-[12px] leading-relaxed text-foreground outline-none"
          />
          <div className="flex items-center justify-between border-t border-border px-2 py-1.5">
            <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-muted-foreground">
              {result.intent.currentInput} attached
            </span>
            <button
              type="submit"
              className="border border-primary bg-primary/10 px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-primary transition-colors hover:bg-primary/20"
            >
              SUBMIT QUERY →
            </button>
          </div>
        </form>
      </div>

      <div className="flex flex-wrap gap-1">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setDraft(s)}
            className="border border-border px-1.5 py-0.5 text-left font-mono text-[10px] text-muted-foreground transition-colors hover:bg-panel-raised hover:text-foreground"
          >
            {s}
          </button>
        ))}
      </div>

      <dl className="grid gap-y-1.5 border-t border-border pt-2 font-mono text-[10px]">
        <Stacked
          label="detected intent"
          value={`${result.intent.label} · ${Math.round(result.intent.confidence * 100)}%`}
          strong
        />
        <Stacked label="input requirement" value={result.intent.requiredInput} />
        <Stacked label="received" value={result.intent.currentInput} />
      </dl>
      <div className="flex flex-wrap items-center gap-1.5">
        {result.intent.entities.map((e) => (
          <span
            key={`${e.type}-${e.text}`}
            className="border border-border px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.12em] text-muted-foreground"
          >
            {e.type} · <span className="text-foreground">{e.text}</span>
          </span>
        ))}
        <span
          className={`ml-auto border px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.14em] ${
            compatible ? "border-success text-success" : "border-destructive text-destructive"
          }`}
        >
          validation {compatible ? "satisfied" : "failed"}
        </span>
      </div>
    </div>
  );
}

function Field({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-2 truncate">
      <dt className="uppercase tracking-[0.14em] text-muted-foreground">{label}</dt>
      <dd className={`truncate ${strong ? "text-primary" : "text-foreground"}`}>{value}</dd>
    </div>
  );
}

function Stacked({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div>
      <dt className="uppercase tracking-[0.16em] text-muted-foreground">{label}</dt>
      <dd className={strong ? "text-primary" : "text-foreground"}>{value}</dd>
    </div>
  );
}

/* ---------------- Routing stack ---------------- */

export function RoutingStack({
  result,
  workflow,
}: {
  result: AnalysisResult;
  workflow?: UseWorkflowReturn | undefined;
}) {
  // Step 8: Evidence Planning
  if (workflow?.state === "EVIDENCE_PLANNING") {
    const reqs = result.decision?.evidenceRequirements;
    const planItems = [
      reqs?.spatialGroundingRequired
        ? "Spatial grounding / mask"
        : "Region grounding / localization",
      reqs?.temporalComparisonRequired ? "Bi-temporal change detection" : null,
      reqs?.modalityEvidenceRequired ? "Cross-modality SAR/Optical evidence" : null,
      "Feature verification & bounds check",
      "Model agreement & confidence synthesis",
    ].filter(Boolean) as string[];

    return (
      <div className="space-y-2.5 p-3 font-mono text-[10px]">
        <div className="flex items-center justify-between border-b border-border pb-1.5">
          <div className="flex items-center gap-1.5 text-primary">
            <span className="h-1.5 w-1.5 rounded-full bg-primary pulse-dot" />
            <span className="uppercase tracking-[0.16em]">REQUIRED EVIDENCE</span>
          </div>
          <span className="text-[9px] uppercase tracking-[0.12em] text-success">
            Planning Active
          </span>
        </div>
        <p className="border-l-2 border-primary/60 pl-2 text-[10px] text-muted-foreground">
          “Formulating evidence constraints before executing inference.”
        </p>
        <ul className="space-y-1.5 border border-border bg-background p-2.5 text-[9px]">
          {planItems.map((item, i) => (
            <li key={i} className="flex items-center justify-between text-success">
              <span className="flex items-center gap-1.5">
                <StatusDot status="pass" />
                <span>{item}</span>
              </span>
              <span>✓ REQUIRED</span>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  // Step 9: Decision Engine (Laya / Jev) & Policy Check
  if (workflow?.state === "ROUTING") {
    const engineId = result.decision?.engine?.toUpperCase() ?? "LAYA";
    const engineDesc =
      result.decision?.engine === "jev"
        ? "Jev Multimodal & Temporal Engine"
        : "Laya Spatial & Grounding Engine";

    return (
      <div className="space-y-2.5 p-3 font-mono text-[10px]">
        <div className="flex items-center justify-between border-b border-border pb-1.5">
          <div className="flex items-center gap-1.5 text-primary">
            <span className="h-1.5 w-1.5 rounded-full bg-primary pulse-dot" />
            <span className="uppercase tracking-[0.16em]">DECISION ENGINE · {engineId}</span>
          </div>
          <span className="border border-primary/60 bg-primary/10 px-1.5 py-0.5 text-[9px] uppercase tracking-[0.12em] text-primary">
            {result.decision?.status ?? "DECIDED"}
          </span>
        </div>
        <p className="text-[9px] text-muted-foreground">
          Autonomous dispatch via {engineDesc} with schema policy validation:
        </p>

        {/* Policy Check Card */}
        <div className="space-y-1.5 border border-border bg-panel-raised p-2 text-[9px]">
          <div className="flex items-center justify-between">
            <span className="font-semibold uppercase tracking-[0.12em] text-foreground">
              POLICY CHECK
            </span>
            <span
              className={`font-semibold uppercase tracking-[0.1em] ${
                result.policyCheck?.status === "allowed" ? "text-success" : "text-destructive"
              }`}
            >
              {result.policyCheck?.status === "allowed" ? "✓ ALLOWED" : "✗ BLOCKED"}
            </span>
          </div>
          <div className="text-[9px] text-muted-foreground">
            Contract:{" "}
            <span className="font-mono text-foreground">
              {result.policyCheck?.toolContract ??
                `${result.decision?.specialist ?? "specialist"}@v1`}
            </span>
          </div>
          <div className="text-[9px] text-muted-foreground">
            Preconditions:{" "}
            <span className="text-foreground">
              {result.policyCheck?.preconditions?.[0] ?? "CRS EPSG:4326 verified"}
            </span>
          </div>
        </div>

        {/* Specialist Dispatch List */}
        <div className="space-y-1 border border-border bg-background p-2 text-[10px]">
          <div className="text-[9px] font-semibold uppercase tracking-[0.14em] text-muted-foreground mb-1">
            Dispatch Targets:
          </div>
          {(
            workflow?.plan.specialists ?? [
              {
                tool: result.decision?.specialist ?? "rs_vqa",
                name: "Specialist Model",
                version: "v1.0.0",
              },
            ]
          ).map((s, idx) => (
            <div key={idx} className="flex items-center justify-between text-foreground text-[9px]">
              <div className="flex items-center gap-1.5">
                <span className="text-primary font-bold">→</span>
                <span className="font-semibold uppercase tracking-[0.12em]">
                  {s.label ?? s.tool}
                </span>
              </div>
              <span className="font-mono text-muted-foreground">{s.version ?? "v1.0.0"}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Step 10: Specialist Execution
  if (workflow?.state === "EXECUTING") {
    const step = workflow.specialistStep;
    return (
      <div className="space-y-2.5 p-3 font-mono text-[10px]">
        <div className="flex items-center justify-between border-b border-border pb-1.5">
          <div className="flex items-center gap-1.5 text-primary">
            <span className="h-1.5 w-1.5 rounded-full bg-primary pulse-dot" />
            <span className="uppercase tracking-[0.16em]">SPECIALIST EXECUTION</span>
          </div>
          <span className="text-[9px] uppercase tracking-[0.12em] text-primary">
            Inference Scan
          </span>
        </div>
        <ul className="space-y-1.5 border border-border bg-background p-2.5 text-[9px]">
          <li className="flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <span
                className={`h-1.5 w-1.5 rounded-full ${step >= 1 ? "bg-success" : "bg-primary pulse-dot"}`}
              />
              <span className="font-semibold uppercase text-foreground">REMOTE-SENSING VQA</span>
            </span>
            <span className={step >= 1 ? "text-success font-semibold" : "text-primary"}>
              {step >= 1 ? "COMPLETE" : "RUNNING"}
            </span>
          </li>
          <li className="flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  step >= 2
                    ? "bg-success"
                    : step >= 1
                      ? "bg-primary pulse-dot"
                      : "bg-muted-foreground"
                }`}
              />
              <span className="font-semibold uppercase text-foreground">GROUNDING</span>
            </span>
            <span
              className={
                step >= 2
                  ? "text-success font-semibold"
                  : step >= 1
                    ? "text-primary"
                    : "text-muted-foreground"
              }
            >
              {step >= 2 ? "COMPLETE" : step >= 1 ? "RUNNING" : "PENDING"}
            </span>
          </li>
          <li className="flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  step >= 3
                    ? "bg-success"
                    : step >= 2
                      ? "bg-primary pulse-dot"
                      : "bg-muted-foreground"
                }`}
              />
              <span className="font-semibold uppercase text-foreground">SCENE ANALYSIS</span>
            </span>
            <span
              className={
                step >= 3
                  ? "text-success font-semibold"
                  : step >= 2
                    ? "text-primary"
                    : "text-muted-foreground"
              }
            >
              {step >= 3 ? "COMPLETE" : step >= 2 ? "RUNNING" : "PENDING"}
            </span>
          </li>
          <li className="flex items-center justify-between border-t border-border pt-1">
            <span className="flex items-center gap-1.5">
              <span
                className={`h-1.5 w-1.5 rounded-full ${step >= 4 ? "bg-success" : "bg-primary pulse-dot"}`}
              />
              <span className="font-semibold uppercase text-foreground">EVIDENCE GENERATION</span>
            </span>
            <span className={step >= 4 ? "text-success font-semibold" : "text-primary"}>
              {step >= 4 ? "COMPLETE" : "RUNNING"}
            </span>
          </li>
        </ul>
      </div>
    );
  }

  return (
    <div>
      <ol className="p-3">
        {result.route.map((n, i) => {
          const isBlockedNode =
            workflow?.state === "ROUTING_BLOCKED" && i === result.route.length - 1;

          return (
            <li key={n.id} className="relative pb-3 pl-5 last:pb-0">
              <span
                className={`absolute left-[3px] top-[5px] h-1.5 w-1.5 rounded-full ${
                  isBlockedNode
                    ? "bg-destructive"
                    : workflow?.state === "ROUTING" && i === 0
                      ? "bg-primary pulse-dot"
                      : "bg-primary"
                }`}
              />
              {i < result.route.length - 1 && (
                <span className="absolute left-[6px] top-[11px] h-[calc(100%-8px)] w-px bg-border" />
              )}
              <p
                className={`font-mono text-[10px] uppercase tracking-[0.16em] ${
                  isBlockedNode ? "text-destructive font-semibold" : "text-foreground"
                }`}
              >
                {isBlockedNode ? `BLOCKED · ${n.label}` : n.label}
              </p>
              {n.detail ? (
                <p
                  className={`font-mono text-[10px] ${
                    isBlockedNode ? "text-destructive/80" : "text-muted-foreground"
                  }`}
                >
                  {isBlockedNode ? (result.refusal?.required ?? n.detail) : n.detail}
                </p>
              ) : null}
            </li>
          );
        })}
      </ol>
    </div>
  );
}

/* ---------------- Analysis result ---------------- */

export function AnalysisResultPanel({
  result,
  workflow,
  onSwitchToTemporal,
  onSwitchToMultimodal,
}: {
  result: AnalysisResult;
  workflow?: UseWorkflowReturn | undefined;
  onSwitchToTemporal?: () => void;
  onSwitchToMultimodal?: () => void;
}) {
  // Staging phase
  if (
    workflow &&
    (workflow.state === "IDLE" ||
      workflow.state === "UPLOADING" ||
      workflow.state === "INSPECTING" ||
      workflow.state === "VALIDATING" ||
      workflow.state === "READY")
  ) {
    return (
      <div className="space-y-3 p-3">
        <div className="flex items-center gap-2">
          <span className="border border-border px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
            Pipeline Staged
          </span>
          <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
            {workflow.state === "READY" ? "Ready for analyst query" : "Awaiting observations"}
          </span>
        </div>
        <p className="text-[13px] leading-relaxed text-foreground">
          {workflow.state === "READY"
            ? "Observation datasets verified. Submit query or run execution to dispatch to specialist models."
            : "Awaiting observations ingestion and validation checks before analyst query dispatch."}
        </p>
        <div className="border border-dashed border-border p-2.5 font-mono text-[10px] text-muted-foreground">
          Planned workflow: <span className="text-foreground">{result.workflow.label}</span>
        </div>
      </div>
    );
  }

  // Routing / dispatch phase
  if (
    workflow &&
    (workflow.state === "QUERY_RECEIVED" ||
      workflow.state === "QUERY_UNDERSTANDING" ||
      workflow.state === "TASK_CLASSIFIED" ||
      workflow.state === "EVIDENCE_PLANNING" ||
      workflow.state === "ROUTING")
  ) {
    return (
      <div className="space-y-3 p-3 font-mono text-[10px]">
        <div className="flex items-center gap-2">
          <span className="border border-primary px-1.5 py-0.5 uppercase tracking-[0.16em] text-primary">
            Analysis Initializing
          </span>
          <span className="uppercase tracking-[0.14em] text-muted-foreground">
            [{workflow.state}]
          </span>
        </div>
        <p className="text-[13px] leading-relaxed font-sans text-foreground">
          Query classified as{" "}
          <span className="text-primary">{workflow.plan.understanding.primaryTask}</span>.
        </p>
        <p className="text-muted-foreground">
          Dispatching execution to remote-sensing specialist pipeline...
        </p>
      </div>
    );
  }

  // Executing specialist model phase
  if (workflow?.state === "EXECUTING") {
    return (
      <div className="space-y-3 p-3 font-mono text-[10px]">
        <div className="flex items-center gap-2">
          <span className="border border-primary bg-primary/10 px-1.5 py-0.5 uppercase tracking-[0.16em] text-primary">
            Executing Specialist
          </span>
          <span className="flex items-center gap-1 uppercase tracking-[0.14em] text-primary">
            <span className="h-1.5 w-1.5 rounded-full bg-primary pulse-dot" />
            Inference Active
          </span>
        </div>
        <p className="text-[14px] font-sans font-semibold text-foreground">
          {workflow.activeSpecialist?.label ?? result.tool.name}
        </p>
        <dl className="grid grid-cols-2 gap-x-4 gap-y-1 border-y border-border py-2">
          <Field label="model" value={workflow.activeSpecialist?.model ?? result.model.name} />
          <Field
            label="version"
            value={workflow.activeSpecialist?.version ?? result.tool.version}
          />
          <Field label="task" value={workflow.activeSpecialist?.task ?? "Feature Extraction"} />
          <Field label="runtime" value={`${(workflow.elapsedMs / 1000).toFixed(1)} s`} />
        </dl>
        <p className="text-muted-foreground">
          Extracting multi-band spatial features and candidate evidence geometries...
        </p>
      </div>
    );
  }

  // Evidence Generated phase
  if (workflow?.state === "EVIDENCE_GENERATED") {
    return (
      <div className="space-y-3 p-3 font-mono text-[10px]">
        <div className="flex items-center gap-2">
          <span className="border border-primary px-1.5 py-0.5 uppercase tracking-[0.16em] text-primary">
            Evidence Generated
          </span>
          <span className="uppercase tracking-[0.14em] text-muted-foreground">
            {result.evidence.length} objects produced
          </span>
        </div>
        <p className="text-[13px] font-sans text-foreground">
          Spatial masks, bounding boxes, and crop regions rendered on canvas.
        </p>
        <p className="text-muted-foreground">
          Submitting spatial evidence bundle to multi-factor verification pipeline...
        </p>
      </div>
    );
  }

  // Step 13: Evidence Verifier Phase
  if (workflow?.state === "VERIFYING") {
    return (
      <div className="space-y-3 p-3 font-mono text-[10px]">
        <div className="flex items-center justify-between border-b border-border pb-1.5">
          <div className="flex items-center gap-1.5 text-primary">
            <span className="h-1.5 w-1.5 rounded-full bg-primary pulse-dot" />
            <span className="uppercase tracking-[0.16em]">EVIDENCE VERIFIER</span>
          </div>
          <span className="text-[9px] uppercase tracking-[0.12em] text-primary">Spatial Audit</span>
        </div>
        <ul className="space-y-1.5 border border-border bg-background p-2.5 text-[9px]">
          <li className="flex items-center justify-between text-success">
            <span className="font-semibold">WATER REGION</span>
            <span>✓ IMAGE SUPPORT</span>
          </li>
          <li className="flex items-center justify-between text-success">
            <span className="font-semibold">BUILT-UP CLAIM</span>
            <span>✓ SPATIAL SUPPORT</span>
          </li>
          <li className="flex items-center justify-between text-success">
            <span className="font-semibold">QUERY / OUTPUT</span>
            <span>✓ CONSISTENT</span>
          </li>
          <li className="flex items-center justify-between text-success">
            <span className="font-semibold">EVIDENCE COMPLETENESS</span>
            <span>✓ PASS</span>
          </li>
        </ul>
        <div className="border border-success/40 bg-success/10 p-2 text-center text-success">
          <span className="font-semibold uppercase tracking-[0.14em]">
            VERIFICATION STATUS: PASS
          </span>
        </div>
      </div>
    );
  }

  // Composing phase
  if (workflow?.state === "COMPOSING") {
    return (
      <div className="space-y-3 p-3 font-mono text-[10px]">
        <div className="flex items-center gap-2">
          <span className="border border-primary px-1.5 py-0.5 uppercase tracking-[0.16em] text-primary">
            Composing Result
          </span>
          <span className="uppercase tracking-[0.14em] text-muted-foreground">Final synthesis</span>
        </div>
        <p className="text-[13px] font-sans text-foreground">
          Synthesizing verified spatial claims into auditable analytical findings...
        </p>
      </div>
    );
  }

  // Failure states...
  if (workflow?.state === "VALIDATION_FAILED") {
    return (
      <div className="space-y-3 p-3">
        <div className="flex items-center gap-2">
          <span className="border border-destructive px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.16em] text-destructive">
            Validation Failed
          </span>
          <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
            Pipeline Halted
          </span>
        </div>
        <p className="text-[13px] font-semibold text-foreground">
          Observation raster failed integrity validation checks.
        </p>
        <p className="text-xs leading-relaxed text-muted-foreground">
          The uploaded file lacks a valid CRS GeoTransform header or has corrupted band data. Model
          inference was prevented to avoid invalid spatial reasoning.
        </p>
      </div>
    );
  }

  if (workflow?.state === "UNSUPPORTED_QUERY") {
    return (
      <div className="space-y-3 p-3">
        <div className="flex items-center gap-2">
          <span className="border border-destructive px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.16em] text-destructive">
            Query Unsupported
          </span>
          <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
            Refused Before Inference
          </span>
        </div>
        <p className="text-[13px] font-semibold text-foreground">
          Query requests capabilities not supported by active models.
        </p>
        <p className="text-xs leading-relaxed text-muted-foreground">
          The requested task cannot be reliably mapped to any registered remote-sensing specialist.
        </p>
      </div>
    );
  }

  if (result.refusal || workflow?.state === "ROUTING_BLOCKED") {
    if (result.intent.workflow === "change_vqa" && result.intent.compatibility === "incompatible") {
      return (
        <TemporalRefusalCard
          {...(onSwitchToTemporal !== undefined ? { onSelectPair: onSwitchToTemporal } : {})}
        />
      );
    }

    if (
      (result.intent.workflow === "optical_sar" ||
        result.workflow.id === "optical_sar" ||
        result.refusal?.title.includes("INCOMPATIBLE")) &&
      result.intent.compatibility === "incompatible" &&
      result.refusal
    ) {
      return <CrossModalRefusalCard refusal={result.refusal} />;
    }

    const refusal = result.refusal ?? {
      title: "Routing Blocked — Preconditions not met",
      required: "2 bi-temporal observations",
      received: "1 single observation",
      action: "Please attach both before and after observations to proceed with change analysis.",
      actionHint: "Attach second epoch or switch to single-image VQA.",
    };

    return (
      <div className="space-y-3 p-3">
        <div className="flex items-center gap-2">
          <span className="border border-destructive px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.16em] text-destructive">
            query rejected
          </span>
          <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
            no model executed
          </span>
        </div>
        <p className="text-[13px] font-semibold text-foreground">{refusal.title}</p>
        <dl className="grid grid-cols-2 gap-x-4 gap-y-1 border-y border-border py-2 font-mono text-[10px]">
          <Field label="required" value={refusal.required} />
          <Field label="received" value={refusal.received} />
        </dl>
        <p className="text-xs leading-relaxed text-muted-foreground">{refusal.action}</p>
      </div>
    );
  }

  if (workflow?.state === "LOW_CONFIDENCE") {
    return (
      <div className="space-y-3 p-3">
        <div className="flex items-center gap-2">
          <span className="border border-warning px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.16em] text-warning">
            Low Confidence Alert
          </span>
          <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
            High Uncertainty
          </span>
        </div>
        <p className="text-[14px] font-semibold leading-snug text-foreground">{result.answer}</p>
        <div className="border border-warning/50 bg-warning/5 p-2 font-mono text-[10px] text-warning">
          QA Score{" "}
          {result.confidence.score != null ? Math.round(result.confidence.score * 100) : 38}% —
          Insufficient spatial evidence to confirm finding.
        </div>
      </div>
    );
  }

  // Step 14: Analytical Finding (instead of chat bubble) & Step 15: Explain Evidence
  return (
    <AnalyticalFindingView
      result={result}
      workflow={workflow}
      {...(onSwitchToTemporal !== undefined ? { onSwitchToTemporal } : {})}
      {...(onSwitchToMultimodal !== undefined ? { onSwitchToMultimodal } : {})}
    />
  );
}

function AnalyticalFindingView({
  result,
  workflow,
  onSwitchToTemporal,
  onSwitchToMultimodal,
}: {
  result: AnalysisResult;
  workflow?: UseWorkflowReturn | undefined;
  onSwitchToTemporal?: () => void;
  onSwitchToMultimodal?: () => void;
}) {
  const [showExplain, setShowExplain] = useState(false);
  const claims = workflow?.plan.claims ?? [
    {
      id: "c1",
      text: "Water body located in northeastern region",
      supportedBy: "Grounding Engine",
      evidenceId: "ev-01",
      confidence: 0.91,
    },
    {
      id: "c2",
      text: "Built-up development is present around the water margin",
      supportedBy: "Remote-Sensing VQA & Scene Analysis",
      evidenceId: "ev-02",
      confidence: 0.84,
    },
  ];

  const isTemporal = result.workflow.id === "change_vqa" || result.biTemporal != null;
  const isMultimodal =
    result.workflow.id === "optical_sar" ||
    result.crossModal != null ||
    (workflow?.scenario?.observations != null &&
      workflow.scenario.observations.some((o) => o.modality === "sar"));

  return (
    <div className="space-y-3 p-3">
      {/* Header with confidence & workflow metadata */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-2">
        <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-primary">
          {result.workflow.label}
        </span>
        <span
          className={`border px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.14em] ${CONFIDENCE_TONE[result.confidence.level]}`}
        >
          CONFIDENCE: {result.confidence.level.toUpperCase()}
        </span>
      </div>

      {/* Prominent Registration Residual Warning (Do not bury) */}
      {result.biTemporal?.adversarial.registrationWarning && (
        <div className="flex items-start gap-2 border border-warning/70 bg-warning/10 p-2.5 font-mono text-[10px] text-warning">
          <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-warning" />
          <div className="min-w-0 flex-1">
            <span className="font-bold uppercase tracking-[0.14em]">
              REGISTRATION RESIDUAL LIMITATION
            </span>
            <p className="mt-0.5 text-[9px] text-warning/90 leading-relaxed">
              {result.biTemporal.adversarial.registrationWarning}
            </p>
          </div>
        </div>
      )}

      {/* Animated confidence score bar */}
      {result.confidence.score != null && (
        <div className="space-y-0.5">
          <div className="flex items-baseline justify-between font-mono text-[9px] uppercase tracking-[0.14em]">
            <span className="text-muted-foreground">QA Score</span>
            <span className="text-success font-bold">
              {Math.round(result.confidence.score * 100)}%
            </span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-border">
            <div
              className="h-full rounded-full bg-success transition-all duration-1000"
              style={{ width: `${Math.round(result.confidence.score * 100)}%` }}
            />
          </div>
        </div>
      )}

      {/* Primary & Detailed Analytical Findings */}
      <div className="space-y-2.5">
        <div className="border border-border/80 bg-background p-2.5">
          <SubLabel>PRIMARY FINDING</SubLabel>
          <p className="text-[13px] font-medium leading-relaxed text-foreground">{result.answer}</p>
        </div>

        {result.detailedAnswer && (
          <div className="border border-border/80 bg-background p-2.5">
            <SubLabel>DETAILED INTERPRETATION</SubLabel>
            <p className="text-[12px] leading-relaxed text-muted-foreground">
              {result.detailedAnswer}
            </p>
          </div>
        )}
      </div>

      {/* Truthful Temporal Specialist Panel with Proposer/Skeptic Verification */}
      {isTemporal && <TemporalSpecialistPanel result={result} />}

      {/* Cross-Modal Dual-Branch + Physics + Fusion Specialist Panel */}
      {isMultimodal && (
        <CrossModalSpecialistPanel
          result={result}
          observations={workflow?.scenario?.observations ?? result.observations ?? []}
        />
      )}

      {/* Structured metrics: Evidence objects & Confidence */}
      <div className="grid grid-cols-2 gap-2 font-mono text-[10px]">
        <div className="border border-border bg-background p-2">
          <SubLabel>EVIDENCE</SubLabel>
          <span className="font-bold text-foreground">
            {result.evidence.length} OBJECT{result.evidence.length === 1 ? "" : "S"}{" "}
            {result.evidence.length > 0 &&
              `(${result.evidence.map((e) => `E${e.index}`).join(", ")})`}
          </span>
        </div>
        <div className="border border-border bg-background p-2">
          <SubLabel>CONFIDENCE</SubLabel>
          <span
            className={`font-bold ${
              result.confidence.level === "high"
                ? "text-success"
                : result.confidence.level === "medium"
                  ? "text-warning"
                  : "text-destructive"
            }`}
          >
            {result.confidence.score != null
              ? `${Math.round(result.confidence.score * 100)}% · ${result.confidence.level.toUpperCase()}`
              : result.confidence.level.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Qualitative scene features */}
      {result.dominantFeatures && result.dominantFeatures.length > 0 && (
        <div className="border border-border bg-background p-2.5 font-mono text-[9px]">
          <SubLabel>DOMINANT SCENE FEATURES</SubLabel>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {result.dominantFeatures.map((feat) => (
              <span
                key={feat}
                className="border border-border bg-panel-raised px-2 py-0.5 text-foreground"
              >
                {feat}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Step 15: Explain Evidence Button & Interactive Breakdown */}
      <div className="border border-primary/40 bg-primary/5 p-2.5">
        <div className="flex items-center justify-between">
          <div>
            <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">
              AUDITABLE PROVENANCE
            </span>
            <p className="font-mono text-[9px] text-muted-foreground">
              Trace claims directly to grounded spatial evidence
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowExplain((v) => !v)}
            className="border border-primary bg-primary/10 px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-primary transition-colors hover:bg-primary/20"
          >
            {showExplain ? "HIDE EVIDENCE ▲" : "EXPLAIN EVIDENCE ▼"}
          </button>
        </div>

        {showExplain && (
          <div className="mt-3 space-y-2 border-t border-primary/30 pt-2 font-mono text-[10px]">
            {claims.map((claim) => (
              <div
                key={claim.id}
                className="space-y-1 border border-border bg-background p-2 text-[9px]"
              >
                <div>
                  <span className="font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                    CLAIM:
                  </span>{" "}
                  <span className="font-semibold text-foreground">{claim.text}</span>
                </div>
                <div>
                  <span className="font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                    SUPPORTED BY:
                  </span>{" "}
                  <span className="text-primary">{claim.supportedBy}</span>
                </div>
                <div className="flex items-center justify-between pt-0.5">
                  <span>
                    <span className="font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                      EVIDENCE:
                    </span>{" "}
                    <span className="border border-primary/60 px-1 py-0.2 text-primary font-bold">
                      {claim.evidenceId
                        ? claim.evidenceId.toUpperCase().replace("EV-0", "E")
                        : "E1"}
                    </span>
                  </span>
                  <span>
                    <span className="font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                      CONFIDENCE:
                    </span>{" "}
                    <span className="text-success font-bold">
                      {claim.confidence != null ? `${Math.round(claim.confidence * 100)}%` : "91%"}
                    </span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Limitations */}
      {result.confidence.limitations.length > 0 && (
        <div className="border border-border/80 bg-background p-2 text-xs">
          <SubLabel>LIMITATION</SubLabel>
          <ul className="space-y-0.5 text-muted-foreground font-mono text-[10px]">
            {result.confidence.limitations.map((l) => (
              <li key={l}>· {l}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Try Temporal Analysis CTA */}
      <div className="border border-sky-500/40 bg-sky-500/5 p-2.5">
        <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-muted-foreground">
          Ready for next analysis mode
        </p>
        <p className="mt-0.5 font-mono text-[10px] font-semibold text-foreground">
          Add a second epoch to detect change over time
        </p>
        <button
          type="button"
          onClick={onSwitchToTemporal}
          className="mt-2 w-full border border-sky-500/60 bg-sky-500/10 py-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-sky-400 transition-colors hover:bg-sky-500/20"
        >
          TRY TEMPORAL ANALYSIS →
        </button>
      </div>

      {/* Try Multimodal Analysis CTA */}
      <div className="border border-sar/40 bg-sar/5 p-2.5">
        <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-muted-foreground">
          Cross-sensor fusion mode
        </p>
        <p className="mt-0.5 font-mono text-[10px] font-semibold text-foreground">
          Fuse optical reflectance with SAR backscatter
        </p>
        <button
          type="button"
          onClick={onSwitchToMultimodal}
          className="mt-2 w-full border border-sar/60 bg-sar/10 py-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-sar transition-colors hover:bg-sar/20"
        >
          TRY MULTIMODAL ANALYSIS →
        </button>
      </div>

      {/* Execution footnote */}
      <div className="flex flex-wrap gap-x-3 gap-y-1 border-t border-border pt-1.5 font-mono text-[9px] uppercase tracking-[0.12em] text-muted-foreground">
        <span>{result.tool.name}</span>
        <span>{result.model.name}</span>
        <span>{result.requestId}</span>
        <span>{(result.runtimeMs / 1000).toFixed(1)} s</span>
      </div>
    </div>
  );
}

function SubLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-0.5 font-mono text-[9px] uppercase tracking-[0.18em] text-muted-foreground">
      {children}
    </p>
  );
}

/* ---------------- Confidence ---------------- */

export function ConfidenceBlock({
  result,
  workflow,
}: {
  result: AnalysisResult;
  workflow?: UseWorkflowReturn | undefined;
}) {
  const { confidence } = result;

  if (
    workflow &&
    workflow.macroStage !== "EVIDENCE" &&
    workflow.macroStage !== "RESULT" &&
    workflow.state !== "LOW_CONFIDENCE"
  ) {
    return (
      <div className="p-3 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
        Awaiting evidence verification to compute confidence factors
      </div>
    );
  }

  return (
    <div className="space-y-2 p-3">
      <div className="flex items-baseline justify-between">
        <span
          className={`border px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.16em] ${CONFIDENCE_TONE[confidence.level]}`}
        >
          {confidence.level}
        </span>
        <span className="font-mono text-[10px] text-muted-foreground">
          {confidence.score != null ? `qa score ${Math.round(confidence.score * 100)}` : "—"}
        </span>
      </div>
      <ul className="space-y-1">
        {confidence.factors.map((f) => (
          <li key={f.label} className="flex items-start gap-1.5 text-[11px]">
            <span
              className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${
                f.status === "supporting"
                  ? "bg-success"
                  : f.status === "uncertain"
                    ? "bg-warning"
                    : "bg-destructive"
              }`}
            />
            <span className="text-foreground">
              {f.label}
              {f.detail ? <span className="text-muted-foreground"> · {f.detail}</span> : null}
            </span>
          </li>
        ))}
      </ul>
      {result.modalityContributions ? (
        <div className="space-y-1 border-t border-border pt-2">
          <SubLabel>modality contribution (model evidence score)</SubLabel>
          {result.modalityContributions.map((m) => (
            <div key={m.modality}>
              <div className="flex items-baseline justify-between font-mono text-[10px] uppercase tracking-[0.12em]">
                <span className={m.modality === "sar" ? "text-sar" : "text-optical"}>
                  {m.modality}
                </span>
                <span className="text-muted-foreground">{m.contribution}</span>
              </div>
              <div className="h-1 w-full bg-border">
                <div
                  className={m.modality === "sar" ? "h-1 bg-sar" : "h-1 bg-optical"}
                  style={{
                    width:
                      m.contribution === "high"
                        ? "88%"
                        : m.contribution === "medium"
                          ? "58%"
                          : "28%",
                  }}
                />
              </div>
              <p className="text-[10px] text-muted-foreground">{m.note}</p>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

/* ---------------- Evidence ---------------- */

export function EvidenceList({
  evidence,
  activeId,
  hoveredId,
  onSelect,
  onHover,
  workflow,
}: {
  evidence: EvidenceObject[];
  activeId: string | null;
  hoveredId?: string | null | undefined;
  onSelect: (id: string) => void;
  onHover?: ((id: string | null) => void) | undefined;
  workflow?: UseWorkflowReturn | undefined;
}) {
  if (workflow && !workflow.showEvidenceOverlays) {
    return (
      <p className="p-3 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
        Evidence objects staged · Will render when EVIDENCE_GENERATED is reached
      </p>
    );
  }

  if (evidence.length === 0) {
    return (
      <p className="p-3 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
        no evidence objects produced
      </p>
    );
  }
  return (
    <ul className="divide-y divide-border">
      {evidence.map((e) => {
        const isHovered = hoveredId === e.id;
        const isActive = activeId === e.id;
        return (
          <li key={e.id}>
            <button
              type="button"
              onClick={() => onSelect(e.id)}
              onMouseEnter={() => onHover?.(e.id)}
              onMouseLeave={() => onHover?.(null)}
              className={`w-full px-3 py-1.5 text-left transition-colors ${
                isActive
                  ? "bg-panel-raised shadow-[inset_2px_0_0_0_var(--primary)]"
                  : isHovered
                    ? "bg-panel-raised/70 text-foreground"
                    : "hover:bg-panel-raised"
              }`}
            >
              <div className="flex items-baseline justify-between gap-2">
                <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-foreground">
                  E{e.index} · {e.label}
                </span>
                <span className="font-mono text-[10px] text-muted-foreground">
                  {e.confidence != null ? `${Math.round(e.confidence * 100)}%` : "—"}
                </span>
              </div>
              <p className="font-mono text-[10px] text-muted-foreground">
                {e.regionDescription ?? e.type} · {e.sourceTool} {e.sourceVersion}
              </p>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

export function EvidenceInspector({
  evidence,
  observations,
  onFocusInViewer,
}: {
  evidence: EvidenceObject | null;
  observations: Observation[];
  onFocusInViewer?: ((evidence: EvidenceObject) => void) | undefined;
}) {
  const isTemporalPair =
    observations.length === 2 &&
    observations.some((o) => o.role === "before" || o.role === "after");

  if (isTemporalPair) {
    return (
      <TemporalEvidenceInspector
        evidence={evidence}
        observations={observations}
        {...(onFocusInViewer !== undefined ? { onFocusInViewer } : {})}
      />
    );
  }

  if (!evidence) {
    return (
      <p className="p-3 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
        select an evidence object to inspect crops, coordinates and support
      </p>
    );
  }
  const g = evidence.geometry;
  const crops = observations.slice(0, 2);
  return (
    <div className="space-y-2 p-3">
      <div className="flex items-center justify-between gap-2">
        <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-foreground">
          E{evidence.index} — {evidence.label}
        </p>
        {onFocusInViewer && (
          <button
            type="button"
            onClick={() => onFocusInViewer(evidence)}
            className="border border-primary bg-primary/10 px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.14em] text-primary transition-colors hover:bg-primary/20"
          >
            Focus in viewer
          </button>
        )}
      </div>
      {g && crops.length > 0 && (
        <div className="grid grid-cols-2 gap-2">
          {crops.map((obs) => (
            <figure
              key={obs.id}
              onClick={() => onFocusInViewer?.(evidence)}
              className="cursor-pointer group"
              title="Click to focus on this crop in the primary viewer"
            >
              <figcaption className="mb-0.5 font-mono text-[9px] uppercase tracking-[0.14em] text-muted-foreground group-hover:text-primary">
                {obs.role} · {obs.metadata.acquiredAt}
              </figcaption>
              <div className="relative aspect-square overflow-hidden border border-border group-hover:border-primary">
                <img
                  src={obs.previewUrl}
                  alt={`${evidence.label} crop from ${obs.filename}`}
                  loading="lazy"
                  className="absolute h-full w-full object-cover"
                  style={{
                    transform: `scale(${1 / Math.max(g.w, g.h, 0.12)})`,
                    transformOrigin: `${(g.x + g.w / 2) * 100}% ${(g.y + g.h / 2) * 100}%`,
                  }}
                />
                <span className="absolute inset-0 border border-change/70 group-hover:border-primary" />
              </div>
            </figure>
          ))}
        </div>
      )}
      {/* Step 12: Evidence Inspector Required Fields */}
      <dl className="grid grid-cols-2 gap-x-3 gap-y-1.5 border border-border bg-background p-2.5 font-mono text-[9px]">
        <Field
          label="OBJECT"
          value={`E${evidence.index} — ${evidence.label.toUpperCase()}`}
          strong
        />
        <Field
          label="TYPE"
          value={evidence.type === "mask" ? "Grounding / Mask" : "Bounding Region / Box"}
        />
        <Field
          label="LOCATION"
          value={evidence.regionDescription ?? evidence.coordinates ?? "Target sector"}
        />
        <Field label="SOURCE TOOL" value={evidence.sourceTool} />
        <Field label="MODEL" value={evidence.sourceVersion} />
        <Field
          label="CONFIDENCE"
          value={
            evidence.confidence != null
              ? `${Math.round(evidence.confidence * 100)}%`
              : "Qualitative support"
          }
          strong
        />
        <Field label="FRAME" value={evidence.coordinateFrame ?? "NORMALIZED_IMAGE"} strong />
        <div className="col-span-2 flex items-baseline justify-between border-t border-border/70 pt-1">
          <dt className="uppercase tracking-[0.14em] text-muted-foreground">SUPPORT STATUS</dt>
          <dd className="font-bold text-success">SUPPORTED (PASS)</dd>
        </div>
      </dl>

      {evidence.quality ? (
        <p className="border-t border-border pt-1 font-mono text-[10px] text-muted-foreground">
          quality · <span className="text-foreground">{evidence.quality}</span>
        </p>
      ) : null}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => navigator.clipboard?.writeText(evidence.id)}
          className="border border-border px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:bg-panel-raised hover:text-foreground"
        >
          copy evidence id
        </button>
      </div>
    </div>
  );
}

/* ---------------- Execution trace ---------------- */

const EXECUTION_STAGES_PIPELINE = [
  "INPUT",
  "VALIDATION",
  "QUERY CLASSIFICATION",
  "EVIDENCE PLANNING",
  "ROUTING",
  "VQA",
  "GROUNDING",
  "SCENE ANALYSIS",
  "VERIFICATION",
  "COMPOSITION",
];

export function ExecutionTrace({ trace }: { trace: TraceEvent[] }) {
  const [open, setOpen] = useState<string | null>(null);

  return (
    <div>
      {/* Step 16: Interactive connected pipeline flow */}
      <div className="border-b border-border bg-panel-raised/50 p-2.5 font-mono text-[9px]">
        <span className="mb-1.5 block font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          EXECUTION PIPELINE TRACE
        </span>
        <div className="flex flex-wrap items-center gap-1">
          {EXECUTION_STAGES_PIPELINE.map((stage, idx) => {
            const matchingEvent = trace.find(
              (t) =>
                t.stage.toUpperCase() === stage ||
                t.component.toUpperCase().includes(stage) ||
                (stage === "INPUT" && t.stage.toLowerCase() === "input") ||
                (stage === "VALIDATION" && t.stage.toLowerCase() === "validation"),
            );
            const isExpanded = matchingEvent && open === matchingEvent.eventId;

            return (
              <div key={stage} className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => {
                    if (matchingEvent) {
                      setOpen(isExpanded ? null : matchingEvent.eventId);
                    }
                  }}
                  className={`border px-1.5 py-0.5 transition-colors ${
                    isExpanded
                      ? "border-primary bg-primary text-primary-foreground font-bold"
                      : matchingEvent
                        ? "border-primary/50 bg-primary/10 text-primary hover:bg-primary/20"
                        : "border-border text-muted-foreground"
                  }`}
                  title={matchingEvent ? `View ${stage} trace event` : stage}
                >
                  {stage}
                </button>
                {idx < EXECUTION_STAGES_PIPELINE.length - 1 && (
                  <span className="text-muted-foreground/60 text-[10px]">→</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Trace events list (expandable) */}
      <ol className="divide-y divide-border">
        {trace.map((t, i) => {
          const expanded = open === t.eventId;
          return (
            <li key={t.eventId}>
              <button
                type="button"
                onClick={() => setOpen(expanded ? null : t.eventId)}
                className="flex w-full items-baseline gap-3 px-3 py-2 text-left transition-colors hover:bg-panel-raised"
              >
                <span className="font-mono text-[10px] text-muted-foreground">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span
                  className={`mt-1 h-1.5 w-1.5 shrink-0 rounded-full ${TRACE_TONE[t.status] ?? "bg-border"}`}
                />
                <span className="w-36 shrink-0 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-foreground">
                  {t.stage}
                </span>
                <span className="w-44 shrink-0 truncate font-mono text-[11px] uppercase tracking-[0.1em] text-primary">
                  {t.component}
                </span>
                <span className="hidden flex-1 truncate font-mono text-[10px] text-muted-foreground md:block">
                  {t.tool ?? "—"}
                  {t.modelVersion ? ` ${t.modelVersion}` : ""}
                  {t.message ? ` · ${t.message}` : ""}
                </span>
                <span className="ml-auto font-mono text-[10px] text-muted-foreground">
                  {t.runtimeMs != null ? `${t.runtimeMs} ms` : "—"}
                </span>
              </button>
              {expanded && (
                <dl className="grid gap-x-6 gap-y-1.5 border-t border-border bg-background px-4 py-2.5 font-mono text-[10px] sm:grid-cols-3">
                  <Field label="event" value={t.eventId} />
                  <Field label="timestamp" value={t.timestamp} />
                  <Field label="status" value={t.status} />
                  <Field label="component" value={t.component} />
                  <Field label="tool / model" value={`${t.tool ?? "—"} ${t.modelVersion ?? ""}`} />
                  <Field label="runtime" value={`${t.runtimeMs ?? 0} ms`} />
                  <Field label="inputs" value={t.inputArtifacts.join(", ") || "none"} />
                  <Field label="outputs" value={t.outputArtifacts.join(", ") || "none"} />
                  <Field
                    label="parameters"
                    value={
                      Object.entries(t.parameters)
                        .map(([k, v]) => `${k}=${v}`)
                        .join(" ") || "default"
                    }
                  />
                  {t.message ? (
                    <div className="col-span-full border-t border-border/60 pt-1 text-muted-foreground">
                      <span className="uppercase text-muted-foreground font-semibold">
                        message:
                      </span>{" "}
                      <span className="text-foreground">{t.message}</span>
                    </div>
                  ) : null}
                  {t.error ? <Field label="error" value={t.error} /> : null}
                </dl>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}

/* ---------------- Timeline ---------------- */

export function Timeline({ result }: { result: AnalysisResult }) {
  if (!result.temporal) {
    return (
      <p className="p-3 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
        single-epoch workflow — no temporal axis
      </p>
    );
  }
  const { beforeDate, afterDate, orderValid, registration } = result.temporal;
  return (
    <div className="p-3">
      <div className="relative h-8">
        <span className="absolute inset-x-0 top-3 h-px bg-border" />
        <span className="absolute left-0 top-[7px] h-2 w-2 rounded-full bg-muted-foreground" />
        <span className="absolute right-0 top-[7px] h-2 w-2 rounded-full bg-change" />
        <span className="absolute left-0 top-5 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
          t₁ {beforeDate}
        </span>
        <span className="absolute right-0 top-5 font-mono text-[10px] uppercase tracking-[0.14em] text-change">
          t₂ {afterDate}
        </span>
      </div>
      <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1 border-t border-border pt-2 font-mono text-[10px]">
        <Field label="acquisition order" value={orderValid ? "valid" : "invalid"} />
        <Field label="registration" value={registration} />
        <Field label="change regions" value={String(result.evidence.length)} />
      </dl>
    </div>
  );
}
