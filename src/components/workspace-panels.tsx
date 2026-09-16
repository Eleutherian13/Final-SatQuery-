import { useState } from "react";
import { StatusDot } from "@/components/app-shell";
import type {
  AnalysisResult,
  ConfidenceLevel,
  EvidenceObject,
  Observation,
  TraceEvent,
} from "@/lib/types";

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
}: {
  observations: Observation[];
  activeId: string | null;
  onSelect: (id: string) => void;
}) {
  return (
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
                  {obs.validation.registration.note ? ` · ${obs.validation.registration.note}` : ""}
                </p>
              ) : null}
            </div>
          </button>
        </li>
      ))}
    </ul>
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
}: {
  query: string;
  result: AnalysisResult;
  onRun: (q: string) => void;
}) {
  const [draft, setDraft] = useState(query);
  const compatible = result.intent.compatibility === "compatible";

  return (
    <div className="space-y-2 p-3">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onRun(draft);
        }}
        className="border border-border bg-background focus-within:border-primary"
      >
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          rows={2}
          spellCheck={false}
          aria-label="Analyst query"
          className="w-full resize-none bg-transparent px-2.5 py-2 text-[13px] leading-relaxed text-foreground outline-none"
        />
        <div className="flex items-center justify-between border-t border-border px-2 py-1">
          <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
            ⌘↵ run · {result.observed.length} observation(s) attached
          </span>
          <button
            type="submit"
            className="border border-primary bg-primary/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.16em] text-primary transition-colors hover:bg-primary/20"
          >
            analyze →
          </button>
        </div>
      </form>

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

export function RoutingStack({ result }: { result: AnalysisResult }) {
  return (
    <ol className="p-3">
      {result.route.map((n, i) => (
        <li key={n.id} className="relative pb-3 pl-5 last:pb-0">
          <span className="absolute left-[3px] top-[5px] h-1.5 w-1.5 rounded-full bg-primary" />
          {i < result.route.length - 1 && (
            <span className="absolute left-[6px] top-[11px] h-[calc(100%-8px)] w-px bg-border" />
          )}
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-foreground">
            {n.label}
          </p>
          {n.detail ? (
            <p className="font-mono text-[10px] text-muted-foreground">{n.detail}</p>
          ) : null}
        </li>
      ))}
    </ol>
  );
}

/* ---------------- Analysis result ---------------- */

export function AnalysisResultPanel({ result }: { result: AnalysisResult }) {
  if (result.refusal) {
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
        <p className="text-[13px] font-semibold text-foreground">{result.refusal.title}</p>
        <dl className="grid grid-cols-2 gap-x-4 gap-y-1 border-y border-border py-2 font-mono text-[10px]">
          <Field label="required" value={result.refusal.required} />
          <Field label="received" value={result.refusal.received} />
        </dl>
        <p className="text-xs leading-relaxed text-muted-foreground">{result.refusal.action}</p>
        {result.refusal.actionHint ? (
          <p className="border-l-2 border-primary pl-2 font-mono text-[11px] text-foreground">
            {result.refusal.actionHint}
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <div className="space-y-3 p-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-primary">
          {result.workflow.label}
        </span>
        <span
          className={`border px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.14em] ${CONFIDENCE_TONE[result.confidence.level]}`}
        >
          {result.confidence.level} confidence
        </span>
      </div>
      <p className="text-[15px] font-semibold leading-snug tracking-tight text-foreground">
        {result.answer}
      </p>
      <div>
        <SubLabel>primary finding</SubLabel>
        <p className="text-[13px] leading-relaxed text-foreground">{result.detailedAnswer}</p>
      </div>
      {result.temporal ? (
        <dl className="grid grid-cols-2 gap-x-4 gap-y-1 border-y border-border py-2 font-mono text-[10px]">
          <Field
            label="temporal window"
            value={`${result.temporal.beforeDate} → ${result.temporal.afterDate}`}
          />
          <Field label="registration" value={result.temporal.registration} />
        </dl>
      ) : null}
      <div>
        <SubLabel>interpretation</SubLabel>
        <p className="text-xs leading-relaxed text-muted-foreground">{result.interpretation}</p>
      </div>
      {result.confidence.limitations.length > 0 && (
        <div>
          <SubLabel>limitations</SubLabel>
          <ul className="space-y-0.5 text-xs text-muted-foreground">
            {result.confidence.limitations.map((l) => (
              <li key={l}>· {l}</li>
            ))}
          </ul>
        </div>
      )}
      <div className="flex flex-wrap gap-x-4 gap-y-1 border-t border-border pt-2 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
        <span>{result.tool.name} {result.tool.version}</span>
        <span>{result.model.name} {result.model.version}</span>
        <span>{result.requestId}</span>
        <span>{(result.runtimeMs / 1000).toFixed(1)} s</span>
        <span className="text-warning">source {result.source}</span>
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

export function ConfidenceBlock({ result }: { result: AnalysisResult }) {
  const { confidence } = result;
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
                      m.contribution === "high" ? "88%" : m.contribution === "medium" ? "58%" : "28%",
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
  onSelect,
}: {
  evidence: EvidenceObject[];
  activeId: string | null;
  onSelect: (id: string) => void;
}) {
  if (evidence.length === 0) {
    return (
      <p className="p-3 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
        no evidence objects produced
      </p>
    );
  }
  return (
    <ul className="divide-y divide-border">
      {evidence.map((e) => (
        <li key={e.id}>
          <button
            type="button"
            onClick={() => onSelect(e.id)}
            className={`w-full px-3 py-1.5 text-left transition-colors ${
              activeId === e.id
                ? "bg-panel-raised shadow-[inset_2px_0_0_0_var(--primary)]"
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
      ))}
    </ul>
  );
}

export function EvidenceInspector({
  evidence,
  observations,
}: {
  evidence: EvidenceObject | null;
  observations: Observation[];
}) {
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
      <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-foreground">
        E{evidence.index} — {evidence.label}
      </p>
      {g && crops.length > 0 && (
        <div className="grid grid-cols-2 gap-2">
          {crops.map((obs) => (
            <figure key={obs.id}>
              <figcaption className="mb-0.5 font-mono text-[9px] uppercase tracking-[0.14em] text-muted-foreground">
                {obs.role} · {obs.metadata.acquiredAt}
              </figcaption>
              <div className="relative aspect-square overflow-hidden border border-border">
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
                <span className="absolute inset-0 border border-change/70" />
              </div>
            </figure>
          ))}
        </div>
      )}
      <dl className="grid grid-cols-2 gap-x-4 gap-y-1 font-mono text-[10px]">
        <Field label="type" value={evidence.type} />
        <Field label="layer" value={evidence.layer ?? "—"} />
        <Field label="location" value={evidence.coordinates ?? "demo extent"} />
        <Field
          label="confidence"
          value={evidence.confidence != null ? `${Math.round(evidence.confidence * 100)}%` : "—"}
        />
        <Field label="source" value={`${evidence.sourceTool} ${evidence.sourceVersion}`} />
        <Field label="created" value={evidence.createdAt} />
      </dl>
      {evidence.quality ? (
        <p className="border-t border-border pt-2 font-mono text-[10px] text-muted-foreground">
          quality · <span className="text-foreground">{evidence.quality}</span>
        </p>
      ) : null}
      <button
        type="button"
        onClick={() => navigator.clipboard?.writeText(evidence.id)}
        className="border border-border px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:bg-panel-raised hover:text-foreground"
      >
        copy evidence id
      </button>
    </div>
  );
}

/* ---------------- Execution trace ---------------- */

export function ExecutionTrace({ trace }: { trace: TraceEvent[] }) {
  const [open, setOpen] = useState<string | null>(null);
  return (
    <ol className="divide-y divide-border">
      {trace.map((t, i) => {
        const expanded = open === t.eventId;
        return (
          <li key={t.eventId}>
            <button
              type="button"
              onClick={() => setOpen(expanded ? null : t.eventId)}
              className="flex w-full items-baseline gap-3 px-3 py-1.5 text-left transition-colors hover:bg-panel-raised"
            >
              <span className="font-mono text-[10px] text-muted-foreground">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span
                className={`mt-1 h-1.5 w-1.5 shrink-0 rounded-full ${TRACE_TONE[t.status] ?? "bg-border"}`}
              />
              <span className="w-28 shrink-0 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                {t.stage}
              </span>
              <span className="w-44 shrink-0 truncate font-mono text-[11px] uppercase tracking-[0.1em] text-foreground">
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
              <dl className="grid gap-x-6 gap-y-1 border-t border-border bg-background px-3 py-2 font-mono text-[10px] sm:grid-cols-3">
                <Field label="event" value={t.eventId} />
                <Field label="timestamp" value={t.timestamp} />
                <Field label="status" value={t.status} />
                <Field label="inputs" value={t.inputArtifacts.join(", ") || "—"} />
                <Field label="outputs" value={t.outputArtifacts.join(", ") || "—"} />
                <Field
                  label="parameters"
                  value={
                    Object.entries(t.parameters)
                      .map(([k, v]) => `${k}=${v}`)
                      .join(" ") || "—"
                  }
                />
                {t.error ? <Field label="error" value={t.error} /> : null}
              </dl>
            )}
          </li>
        );
      })}
    </ol>
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
